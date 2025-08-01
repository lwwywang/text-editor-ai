import { en } from './locales/en';
import { zh } from './locales/zh';

export type Language = 'en' | 'zh';

export const locales = {
  en,
  zh,
};

export type LocaleKeys = keyof typeof en;

export const t = (key: LocaleKeys, language: Language, params?: Record<string, string | number>): string => {
  const translation = locales[language][key];
  
  if (!translation) {
    console.warn(`Translation key "${key}" not found for language "${language}"`);
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((result, [param, value]) => {
      return result.replace(new RegExp(`{${param}}`, 'g'), String(value));
    }, translation);
  }

  return translation;
}; 