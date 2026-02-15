/**
 * i18next Configuration — EN / PT-BR / ES / FR
 * Loads JSON files from /locales/ and detects browser language
 */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../locales/en.json';
import pt from '../../locales/pt.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';

const STORAGE_KEY = 'nautilus-language';

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function detectLanguage(): string {
  const saved = getSavedLanguage();
  if (saved) return saved;
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('fr')) return 'fr';
  return 'en';
}

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// Persist language changes
i18next.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch { /* ignore */ }
});

export default i18next;
