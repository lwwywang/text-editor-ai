import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
    }
  };

  const handleAIClick = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (!selectedText.trim()) {
      setError('请先选中要改写的文本');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用后端 AI API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const rewrittenText = data.result || data.rewritten_text || selectedText;

      // 替换选中的文本
      const newText = text.substring(0, start) + rewrittenText + text.substring(end);
      setText(newText);

      // 重新设置光标位置
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(start, start + rewrittenText.length);
        }
      }, 0);

    } catch (error) {
      console.error('AI 改写失败:', error);
      setError('AI 改写失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedText = () => {
    return text.substring(selection.start, selection.end);
  };

  const selectedText = getSelectedText();
  const hasSelection = selectedText.trim().length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" className="min-h-screen py-8">
        <Box className="text-center mb-8">
          <Typography
            variant="h4"
            component="h1"
            className="mb-2 text-gray-800"
            gutterBottom
          >
            AI 文本编辑器
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            className="text-gray-600"
          >
            选中文本，让 AI 帮你改写内容
          </Typography>
        </Box>

        <Paper
          elevation={3}
          className="p-6 mb-6"
        >
          <Box className="mb-4">
            <TextField
              inputRef={textareaRef}
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={text}
              onChange={handleTextChange}
              onSelect={handleSelect}
              placeholder="在这里输入或粘贴文本，选中要改写的部分后点击 AI 按钮..."
              className="font-mono"
              InputProps={{
                className: 'text-sm leading-relaxed',
              }}
            />
          </Box>

          <Box className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Box className="flex items-center gap-2">
              {hasSelection && (
                <Chip
                  label={`已选中 ${selectedText.length} 个字符`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleAIClick}
              disabled={isLoading || !hasSelection}
              startIcon={isLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
              className="min-w-[140px]"
            >
              {isLoading ? 'AI 处理中...' : 'AI 改写'}
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert
            severity="error"
            className="mb-4"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={1}
          className="p-6 bg-blue-50 border-l-4 border-blue-500"
        >
          <Typography
            variant="h6"
            component="h2"
            className="mb-3 text-blue-800"
          >
            使用说明
          </Typography>
          <Stack spacing={1}>
            <Box className="flex items-start gap-2">
              <Chip label="1" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                在文本框中输入或粘贴文本
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="2" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                选中要改写的文本段落
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="3" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                点击"AI 改写"按钮
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="4" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                AI 将自动改写选中的文本
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App; 