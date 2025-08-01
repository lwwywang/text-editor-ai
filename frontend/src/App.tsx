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
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitch } from './components/LanguageSwitch';
import { t } from './i18n';

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

function AppContent() {
  const { language } = useLanguage();
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
      setError(t('errorNoSelection', language));
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
      const rewrittenText = data.rewritten || data.result || data.rewritten_text || selectedText;

      // 替换选中的文本，确保不会产生多余的换行
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      
      // 检查前后文本是否以换行符结尾/开头，避免重复换行
      const beforeEndsWithNewline = beforeText.endsWith('\n');
      const afterStartsWithNewline = afterText.startsWith('\n');
      const rewrittenTrimmed = rewrittenText.trim();
      
      let newText = beforeText;
      if (!beforeEndsWithNewline && !afterStartsWithNewline && rewrittenTrimmed) {
        // 如果前后都没有换行符，且重写文本不为空，直接添加
        newText += rewrittenTrimmed;
      } else if (beforeEndsWithNewline && afterStartsWithNewline) {
        // 如果前后都有换行符，只添加重写文本，不添加额外换行
        newText += rewrittenTrimmed;
      } else {
        // 其他情况，添加重写文本
        newText += rewrittenTrimmed;
      }
      newText += afterText;
      
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
      setError(t('errorAIFailed', language));
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
        <LanguageSwitch />
        
        <Box className="text-center mb-8">
          <Typography
            variant="h4"
            component="h1"
            className="mb-2 text-gray-800"
            gutterBottom
          >
            {t('title', language)}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            className="text-gray-600"
          >
            {t('subtitle', language)}
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
              placeholder={t('placeholder', language)}
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
                  label={t('selectedChars', language, { count: selectedText.length })}
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
              {isLoading ? t('aiProcessing', language) : t('aiRewrite', language)}
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
            {t('instructions', language)}
          </Typography>
          <Stack spacing={1}>
            <Box className="flex items-start gap-2">
              <Chip label="1" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                {t('step1', language)}
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="2" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                {t('step2', language)}
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="3" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                {t('step3', language)}
              </Typography>
            </Box>
            <Box className="flex items-start gap-2">
              <Chip label="4" size="small" color="primary" />
              <Typography variant="body2" className="text-gray-700">
                {t('step4', language)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App; 