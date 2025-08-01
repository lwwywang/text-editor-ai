# AI 文本编辑器

一个基于 React + Rust 的 AI 文本编辑器，支持选中文本进行 AI 改写。

## 功能特性

- 🎯 选中文本进行 AI 改写
- 🚀 基于 Gemini API 的智能文本处理
- 💻 现代化的 Web 界面
- 🆓 完全免费的 GitHub 部署

## 快速开始

### 1. 环境配置

#### 后端配置
在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件，配置 Gemini API Key：

```env
# Google Gemini API 配置
# 获取 API Key 的步骤：
# 1. 访问 https://aistudio.google.com/app/apikey
# 2. 登录你的 Google 账户
# 3. 点击 "Create API Key" 创建新的 API Key
# 4. 复制生成的 API Key 并替换下面的值
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 服务器配置
HOST=127.0.0.1
PORT=8080
```

**重要**: 请确保将 `your_actual_gemini_api_key_here` 替换为你的真实 Gemini API Key。

### 2. 本地开发

**后端**:
```bash
cd backend
cargo run
```

**前端**:
```bash
cd frontend
npm install
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:5173

## 🚀 部署到 GitHub

### 完全免费的部署方案

本项目支持完全免费的 GitHub 部署：

- **后端**: GitHub Actions + Google Cloud Run（免费层）
- **前端**: GitHub Pages（完全免费）
- **CI/CD**: GitHub Actions（完全免费）

### 部署步骤

1. **设置 GitHub Secrets**
   - 按照 [GitHub 设置指南](./GITHUB_SETUP.md) 设置必要的 Secrets
   - 需要设置：`GCP_SA_KEY`、`GCP_PROJECT_ID`、`GEMINI_API_KEY`

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`

3. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

### 部署结果

部署完成后，你将获得：
- 🌐 前端 URL: `https://your-username.github.io/your-repo`
- 🔗 后端 URL: `https://text-editor-ai-backend-xxxxx-uc.a.run.app`
- 📊 完全免费的部署方案

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 故障排除

### 本地开发问题

#### 问题：请求和响应一致，总是走到后端兜底逻辑

**原因分析**:
1. **API Key 未配置**: 如果 `GEMINI_API_KEY` 未设置或为空，系统会返回错误
2. **API Key 无效**: 如果 API Key 无效，Gemini API 会返回错误
3. **网络问题**: 无法连接到 Gemini API

**解决方案**:

1. **检查 API Key 配置**:
   ```bash
   # 检查后端日志
   cd backend && cargo run
   ```
   
   如果看到 `Error: GEMINI_API_KEY environment variable is not set or is empty`，说明 API Key 未正确配置。

2. **获取 Gemini API Key**:
   - 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
   - 登录你的 Google 账户
   - 点击 "Create API Key" 创建新的 API Key
   - 将 API Key 添加到 `.env` 文件中

3. **测试 API**:
   ```bash
   # 使用 curl 测试 API
   curl -X POST http://localhost:8080/rewrite \
     -H "Content-Type: application/json" \
     -d '{"text": "测试文本"}'
   ```

### 部署问题

#### 常见部署错误

1. **部署失败**
   - 检查 GitHub Secrets 设置
   - 查看 Actions 日志
   - 验证服务账户权限

2. **前端无法访问后端**
   - 检查 CORS 配置
   - 验证 API URL 设置
   - 确认后端服务正常运行

3. **GitHub Pages 不工作**
   - 检查 `gh-pages` 分支
   - 验证 Pages 设置
   - 等待几分钟让部署生效

## 开发

### 项目结构

```
text-editor-ai/
├── backend/          # Rust 后端
│   ├── src/
│   │   └── main.rs   # 主程序
│   ├── Cargo.toml    # Rust 依赖
│   └── env.example   # 环境变量示例
├── frontend/         # React 前端
│   ├── src/
│   │   └── App.tsx   # 主组件
│   └── package.json  # Node.js 依赖
├── .github/          # GitHub Actions
│   └── workflows/
│       └── deploy.yml # 部署工作流
├── DEPLOYMENT.md     # 部署指南
├── GITHUB_SETUP.md   # GitHub 设置指南
└── README.md
```

### API 接口

#### POST /rewrite
改写文本接口

**请求**:
```json
{
  "text": "要改写的文本"
}
```

**响应**:
```json
{
  "rewritten": "改写后的文本"
}
```

#### GET /health
健康检查接口

**响应**:
```json
{
  "status": "ok",
  "message": "AI Text Editor Backend is running"
}
```

## 技术栈

- **前端**: React + TypeScript + Material-UI + Tailwind CSS
- **后端**: Rust + Actix Web + reqwest
- **AI**: Google Gemini API
- **部署**: GitHub Actions + GitHub Pages + Google Cloud Run

## 许可证

MIT License