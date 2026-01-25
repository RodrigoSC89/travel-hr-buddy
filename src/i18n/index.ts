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
import fr from './locales/fr.json';
import no from './locales/no.json';
import nl from './locales/nl.json';
import el from './locales/el.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  zh: { translation: zh },
  fr: { translation: fr },
  no: { translation: no },
  nl: { translation: nl },
  el: { translation: el },
  ja: { translation: ja },
  ar: { translation: ar }
};

// Get saved language or detect from browser
const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'zh', 'fr', 'no', 'nl', 'el', 'ja', 'ar'];

const getDefaultLanguage = (): string => {
  const saved = localStorage.getItem('nautilus_language');
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
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
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'zh', name: '中文', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', locale: 'no-NO' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', locale: 'ar-SA', rtl: true }
];

export const changeLanguage = (code: string) => {
  i18n.changeLanguage(code);
};

// Helper to get current language info
export const getCurrentLanguage = () => {
  const code = i18n.language || 'en';
  return languages.find(l => l.code === code) || languages[0];
};
