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
      // 使用 GitHub API 触发 repository_dispatch
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('GitHub token not configured');
      }

      const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER || 'lwwywang';
      const repoName = import.meta.env.VITE_GITHUB_REPO_NAME || 'text-editor-ai';

      // 触发 GitHub Actions workflow
      const dispatchResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
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

      if (!dispatchResponse.ok) {
        throw new Error(`GitHub API request failed: ${dispatchResponse.status}`);
      }

      // 等待一段时间让 Actions 处理完成
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 获取最新的 API response issue
      const issuesResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues?labels=api-response&state=open&per_page=1`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!issuesResponse.ok) {
        throw new Error(`Failed to fetch API response: ${issuesResponse.status}`);
      }

      const issues = await issuesResponse.json();
      if (issues.length === 0) {
        throw new Error('No API response found');
      }

      const latestIssue = issues[0];
      const issueBody = latestIssue.body || '';
      
      // 从 issue body 中提取改写后的文本
      const rewrittenMatch = issueBody.match(/\*\*Rewritten Text:\*\*\n([\s\S]*?)(?:\n\n|$)/);
      const rewrittenText = rewrittenMatch ? rewrittenMatch[1].trim() : selectedText;

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