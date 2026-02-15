/**
 * DEPRECATED: This file is kept for backward compatibility.
 * The single i18n config is now in src/i18n/index.ts
 * Re-exports types and helpers only.
 */
import i18n from '@/i18n';

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  no: { name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_NS = 'translation';

export const NAMESPACES = ['translation'] as const;

export default i18n;

export function getLanguageDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
  return SUPPORTED_LANGUAGES[lang]?.dir || 'ltr';
}

export function isRTL(lang: SupportedLanguage): boolean {
  return getLanguageDirection(lang) === 'rtl';
}

export function getBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang in SUPPORTED_LANGUAGES) 
    ? browserLang as SupportedLanguage 
    : 'en';
}
