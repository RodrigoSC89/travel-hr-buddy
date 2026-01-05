/**
 * i18n Configuration for Nautilus One
 * Supports: English, Portuguese, Spanish, Chinese
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  zh: { translation: zh }
};

// Get saved language or detect from browser
const getDefaultLanguage = (): string => {
  const saved = localStorage.getItem('nautilus_language');
  if (saved && ['en', 'pt', 'es', 'zh'].includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'pt', 'es', 'zh'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Save language preference
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('nautilus_language', lng);
  document.documentElement.lang = lng;
});

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

export const changeLanguage = (code: string) => {
  i18n.changeLanguage(code);
};
