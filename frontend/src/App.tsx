import { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';

function App() {
  const [selectedText, setSelectedText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleRewrite = async () => {
    if (!selectedText.trim()) {
      setError('请先选择要改写的文本');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 调用 GitHub API 触发 workflow
      const response = await fetch(`https://api.github.com/repos/lwwywang/text-editor-ai/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'api_request',
          client_payload: {
            text: selectedText
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger GitHub Action');
      }

      // 等待一段时间让 workflow 完成
      setTimeout(async () => {
        try {
          // 获取最新的 issue（包含结果）
          const issuesResponse = await fetch(
            `https://api.github.com/repos/lwwywang/text-editor-ai/issues?labels=api-response&state=open&per_page=1`,
            {
              headers: {
                'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              }
            }
          );

          if (issuesResponse.ok) {
            const issues = await issuesResponse.json();
            if (issues.length > 0) {
              const latestIssue = issues[0];
              const body = latestIssue.body;
              
              // 提取改写后的文本
              const rewrittenMatch = body.match(/\*\*Rewritten Text:\*\*\n([\s\S]*?)(?=\n\n|$)/);
              if (rewrittenMatch) {
                setRewrittenText(rewrittenMatch[1].trim());
              } else {
                setError('无法解析响应结果');
              }
            } else {
              setError('未找到处理结果');
            }
          } else {
            setError('无法获取处理结果');
          }
        } catch (err) {
          setError('获取结果时出错');
        } finally {
          setLoading(false);
        }
      }, 10000); // 等待 10 秒

    } catch (err) {
      setError('请求失败，请稍后重试');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedText('');
    setRewrittenText('');
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        AI 文本编辑器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        选中文本，点击改写按钮，AI 将为你重新表达
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          编辑区域
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="在这里输入或粘贴文本，然后选中要改写的部分..."
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)}
          onSelect={handleTextSelection}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleRewrite}
            disabled={loading || !selectedText.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '处理中...' : 'AI 改写'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading}
          >
            清空
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {rewrittenText && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            改写结果
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={rewrittenText}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(rewrittenText)}
          >
            复制结果
          </Button>
        </Paper>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💡 提示：选中文本后点击"AI 改写"按钮，系统将调用 GitHub Actions 处理你的请求
        </Typography>
      </Box>
    </Container>
  );
}

export default App; 