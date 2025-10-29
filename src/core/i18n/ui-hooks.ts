/**
 * PATCH 572 - i18n UI Hooks
 * Hook React para internacionalização com fallback AI
 */

import { useState, useEffect, useCallback } from "react";
import { aiTranslator, SupportedLanguage, TranslationResult } from "./translator";
import { logger } from "@/lib/logger";

interface UseTranslationConfig {
  defaultLanguage?: SupportedLanguage;
  detectBrowserLanguage?: boolean;
  persistLanguage?: boolean;
}

interface TranslationFunction {
  (key: string, context?: string): string;
}

interface UseTranslationReturn {
  t: TranslationFunction;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: SupportedLanguage[];
  isLoading: boolean;
}

const STORAGE_KEY = "user-preferred-language";

/**
 * Hook principal para tradução
 */
export function useTranslation(
  config: UseTranslationConfig = {}
): UseTranslationReturn {
  const {
    defaultLanguage = "en",
    detectBrowserLanguage = true,
    persistLanguage = true,
  } = config;

  // Determinar idioma inicial
  const getInitialLanguage = (): SupportedLanguage => {
    // 1. Verificar localStorage
    if (persistLanguage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidLanguage(stored)) {
        return stored as SupportedLanguage;
      }
    }

    // 2. Detectar idioma do navegador
    if (detectBrowserLanguage) {
      return aiTranslator.detectBrowserLanguage();
    }

    // 3. Usar default
    return defaultLanguage;
  };

  const [language, setLanguageState] = useState<SupportedLanguage>(
    getInitialLanguage()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [translationCache] = useState<Map<string, string>>(new Map());

  // Inicializar tradutor
  useEffect(() => {
    const init = async () => {
      try {
        await aiTranslator.initialize();
        setIsLoading(false);
      } catch (error) {
        logger.error("[useTranslation] Failed to initialize translator", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Salvar idioma preferido
  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguageState(lang);

      if (persistLanguage) {
        localStorage.setItem(STORAGE_KEY, lang);
      }

      // Limpar cache de traduções
      translationCache.clear();

      logger.info(`[useTranslation] Language changed to ${lang}`);
    },
    [persistLanguage, translationCache]
  );

  // Função de tradução
  const t: TranslationFunction = useCallback(
    (key: string, context?: string): string => {
      // Verificar cache local da sessão
      const cacheKey = `${key}:${language}:${context || ""}`;
      const cached = translationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Estado de loading - retornar chave
      if (isLoading) {
        return key;
      }

      // Traduzir de forma assíncrona
      aiTranslator
        .translate({ key, targetLang: language, context })
        .then((result: TranslationResult) => {
          translationCache.set(cacheKey, result.translation);
          
          // Force re-render apenas se a tradução for diferente da chave
          if (result.translation !== key) {
            setLanguageState((prev) => prev);
          }
        })
        .catch((error) => {
          logger.error(`[useTranslation] Translation failed for ${key}`, error);
          translationCache.set(cacheKey, key);
        });

      // Retornar chave enquanto traduz (evita flickering)
      return cached || key;
    },
    [language, isLoading, translationCache]
  );

  return {
    t,
    language,
    setLanguage,
    availableLanguages: ["pt", "en", "es", "fr", "de"],
    isLoading,
  };
}

/**
 * Hook para tradução de textos estáticos (não re-renderiza)
 */
export function useStaticTranslation(
  keys: string[],
  language?: SupportedLanguage
): Record<string, string> {
  const { language: currentLang } = useTranslation();
  const targetLang = language || currentLang;
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      const results = await aiTranslator.translateBatch(keys, targetLang);
      
      const newTranslations: Record<string, string> = {};
      for (const [key, result] of Object.entries(results)) {
        newTranslations[key] = result.translation;
      }
      
      setTranslations(newTranslations);
    };

    loadTranslations();
  }, [keys, targetLang]);

  return translations;
}

/**
 * Hook para mudança de idioma global
 */
export function useLanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useTranslation();

  const switchLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguage(lang);
      
      // Disparar evento customizado para outros componentes
      window.dispatchEvent(
        new CustomEvent("language-changed", { detail: { language: lang } })
      );
    },
    [setLanguage]
  );

  return {
    currentLanguage: language,
    availableLanguages,
    switchLanguage,
  };
}

/**
 * Provider de contexto para tradução (opcional)
 */
import { createContext, useContext, ReactNode } from "react";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationFunction;
  availableLanguages: SupportedLanguage[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: UseTranslationConfig;
}) {
  const translation = useTranslation(config);

  return (
    <I18nContext.Provider value={translation}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

// Helper functions
function isValidLanguage(lang: string): boolean {
  const valid: SupportedLanguage[] = ["pt", "en", "es", "fr", "de"];
  return valid.includes(lang as SupportedLanguage);
}

/**
 * Hook para formatação de datas com i18n
 */
export function useDateFormatter() {
  const { language } = useTranslation();

  const formatDate = useCallback(
    (date: Date | string, format: "short" | "long" | "full" = "short") => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      
      const locales: Record<SupportedLanguage, string> = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
      };

      const formats: Record<string, Intl.DateTimeFormatOptions> = {
        short: { year: "numeric", month: "2-digit", day: "2-digit" },
        long: { year: "numeric", month: "long", day: "numeric" },
        full: {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      };

      return new Intl.DateTimeFormat(locales[language], formats[format]).format(
        dateObj
      );
    },
    [language]
  );

  return { formatDate };
}

/**
 * Hook para formatação de números com i18n
 */
export function useNumberFormatter() {
  const { language } = useTranslation();

  const formatNumber = useCallback(
    (
      number: number,
      options?: Intl.NumberFormatOptions
    ) => {
      const locales: Record<SupportedLanguage, string> = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
      };

      return new Intl.NumberFormat(locales[language], options).format(number);
    },
    [language]
  );

  const formatCurrency = useCallback(
    (amount: number, currency = "USD") => {
      return formatNumber(amount, {
        style: "currency",
        currency,
      });
    },
    [formatNumber]
  );

  return { formatNumber, formatCurrency };
}
