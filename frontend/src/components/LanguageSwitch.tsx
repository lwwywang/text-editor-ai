import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

export const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Box className="flex justify-end mb-4">
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => setLanguage('en')}
          variant={language === 'en' ? 'contained' : 'outlined'}
          className="min-w-[60px]"
        >
          {t('english', language)}
        </Button>
        <Button
          onClick={() => setLanguage('zh')}
          variant={language === 'zh' ? 'contained' : 'outlined'}
          className="min-w-[60px]"
        >
          {t('chinese', language)}
        </Button>
      </ButtonGroup>
    </Box>
  );
}; 