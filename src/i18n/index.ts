/**
 * i18n Configuration for Nauti One
 * SINGLE SOURCE OF TRUTH — all other i18n configs are deprecated
 * Supports: EN, PT-BR, ES, FR, ZH, NO, NL, EL, JA, AR
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations from src/i18n/locales/
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

const STORAGE_KEY = 'nautilus_language';

const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'zh', 'fr', 'no', 'nl', 'el', 'ja', 'ar'];

const getDefaultLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {
    // localStorage not available
  }
  
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
  }
  
  return 'en';
};

// Only init if not already initialized
if (!i18n.isInitialized) {
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
}

// Save language preference on change
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch { /* ignore */ }
  document.documentElement.lang = lng;
  // Set RTL direction for Arabic
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'zh', name: '中文', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', locale: 'no-NO' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', locale: 'ar-SA', rtl: true }
];

export const changeLanguage = (code: string) => {
  i18n.changeLanguage(code);
};

export const getCurrentLanguage = () => {
  const code = i18n.language || 'en';
  return languages.find(l => l.code === code) || languages[0];
};
