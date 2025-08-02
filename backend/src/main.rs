use actix_cors::Cors;
use actix_web::{web, App, HttpServer, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Deserialize)]
struct RewriteRequest {
    text: String,
}

#[derive(Serialize)]
struct RewriteResponse {
    rewritten: String,
}

async fn rewrite_text(req: web::Json<RewriteRequest>) -> Result<HttpResponse> {
    // 按照 Google 官方文档的方式获取 API Key
    let api_key = match env::var("GEMINI_API_KEY") {
        Ok(key) if !key.trim().is_empty() => key.trim().to_string(),
        _ => {
            println!("Error: GEMINI_API_KEY environment variable is not set or is empty");
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "GEMINI_API_KEY environment variable is not configured. Please set your Google Gemini API key."
            })));
        }
    };
    
    // Validate API key format (basic check)
    if api_key.len() < 10 {
        println!("Error: API key appears to be too short or invalid");
        return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Invalid API key format. Please check your GEMINI_API_KEY environment variable."
        })));
    }
    
    println!("Received rewrite request for text: '{}'", req.text);
    println!("API Key configured: YES (length: {})", api_key.len());
    
    // 构建 Gemini API 请求
    let client = reqwest::Client::new();
    let request_body = serde_json::json!({
        "contents": [
            {
                "parts": [
                    {
                        "text": format!(
                            "Rewrite the following text in a more polished and professional way. Provide only ONE improved version, not multiple options. Return only the rewritten text without any explanations or alternatives: {}",
                            req.text
                        )
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 500,
            "topP": 0.9,
            "topK": 40
        }
    });
    
    println!("Sending request to Gemini API...");
    
    let response = client
        .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
        .header("x-goog-api-key", api_key)
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let response_text = resp.text().await.unwrap_or_else(|_| "Failed to get response text".to_string());
            
            println!("Gemini API Response Status: {}", status);
            
            if !status.is_success() {
                println!("Gemini API returned error status: {}", status);
                println!("Error response: {}", response_text);
                
                // Parse error response for better error messages
                if let Ok(error_json) = serde_json::from_str::<serde_json::Value>(&response_text) {
                    if let Some(error_obj) = error_json["error"].as_object() {
                        if let Some(message) = error_obj["message"].as_str() {
                            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                                "error": format!("Gemini API error: {} - {}", status, message)
                            })));
                        }
                    }
                }
                
                return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Gemini API error: {} - {}", status, response_text)
                })));
            }
            
            match serde_json::from_str::<serde_json::Value>(&response_text) {
                Ok(json) => {
                    println!("Successfully parsed JSON response");
                    
                    if let Some(candidates) = json["candidates"].as_array() {
                        if let Some(first_candidate) = candidates.first() {
                            if let Some(content) = first_candidate["content"]["parts"].as_array() {
                                if let Some(first_part) = content.first() {
                                    if let Some(text) = first_part["text"].as_str() {
                                        let rewritten = if text.trim().is_empty() {
                                            println!("Gemini returned empty text, using original text as fallback");
                                            req.text.clone() // 兜底：返回原文
                                        } else {
                                            println!("Gemini returned text: '{}'", text);
                                            // 去除首尾空白字符，避免多余的换行
                                            text.trim().to_string()
                                        };
                                        return Ok(HttpResponse::Ok().json(RewriteResponse {
                                            rewritten,
                                        }));
                                    } else {
                                        println!("No text field found in first part");
                                    }
                                } else {
                                    println!("No parts array found in content");
                                }
                            } else {
                                println!("No content field found in first candidate");
                            }
                        } else {
                            println!("No candidates found in response");
                        }
                    } else {
                        println!("No candidates array found in response");
                    }
                    
                    println!("Failed to extract text from response structure");
                    Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": format!("Failed to parse Gemini response: {}", response_text)
                    })))
                }
                Err(e) => {
                    println!("Failed to parse JSON response: {}", e);
                    Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": format!("Failed to parse Gemini response JSON: {} - {}", e, response_text)
                    })))
                }
            }
        }
        Err(e) => {
            println!("Failed to call Gemini API: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to call Gemini API: {}", e)
            })))
        }
    }
}

async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "message": "AI Text Editor Backend is running"
    })))
}

async fn check_api_key() -> Result<HttpResponse> {
    let api_key = match env::var("GEMINI_API_KEY") {
        Ok(key) if !key.trim().is_empty() => key.trim().to_string(),
        _ => {
            return Ok(HttpResponse::Ok().json(serde_json::json!({
                "status": "error",
                "message": "GEMINI_API_KEY environment variable is not set or is empty",
                "api_key_configured": false
            })));
        }
    };
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "message": "API key is configured",
        "api_key_configured": true,
        "api_key_length": api_key.len(),
        "api_key_preview": format!("{}...", &api_key[..api_key.len().min(8)])
    })))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    
    println!("Starting server at http://{}:{}", host, port);

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .route("/health", web::get().to(health_check))
            .route("/check-api-key", web::get().to(check_api_key))
            .route("/rewrite", web::post().to(rewrite_text))
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
} 