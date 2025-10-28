/**
 * PATCH 203.0 - Globalization Engine (Internacionalização)
 * 
 * Complete i18n system with automatic locale detection,
 * translation loading, and React integration.
 */

import { logger } from "@/lib/logger";

type Locale = "en" | "pt" | "es";

interface Translations {
  [key: string]: any;
}

class I18nSystem {
  private currentLocale: Locale = "en";
  private translations: Record<Locale, Translations> = {
    en: {},
    pt: {},
    es: {},
  };
  private loadedLocales: Set<Locale> = new Set();
  private listeners: Set<() => void> = new Set();

  /**
   * Initialize i18n system with browser locale detection
   */
  async initialize(): Promise<void> {
    try {
      const detectedLocale = this.detectBrowserLocale();
      await this.setLocale(detectedLocale);
      logger.info("i18n system initialized", { locale: detectedLocale });
    } catch (error) {
      logger.error("Failed to initialize i18n:", error);
      // Fallback to English
      await this.loadLocale("en");
      this.currentLocale = "en";
    }
  }

  /**
   * Detect browser locale
   */
  private detectBrowserLocale(): Locale {
    if (typeof window === "undefined") return "en";

    const browserLang = navigator.language.toLowerCase();
    
    // Match exact locale or language code
    if (browserLang.startsWith("pt")) return "pt";
    if (browserLang.startsWith("es")) return "es";
    return "en";
  }

  /**
   * Load translations for a specific locale
   */
  private async loadLocale(locale: Locale): Promise<void> {
    if (this.loadedLocales.has(locale)) {
      return; // Already loaded
    }

    try {
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load locale ${locale}`);
      }

      const translations = await response.json();
      this.translations[locale] = translations;
      this.loadedLocales.add(locale);
      
      logger.info(`Loaded locale: ${locale}`);
    } catch (error) {
      logger.error(`Failed to load locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Set current locale and load translations
   */
  async setLocale(locale: Locale): Promise<void> {
    try {
      await this.loadLocale(locale);
      this.currentLocale = locale;
      this.notifyListeners();
      logger.info("Locale changed", { locale });
    } catch (error) {
      logger.error("Failed to set locale:", error);
      throw error;
    }
  }

  /**
   * Get current locale
   */
  getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Get translation for a key (supports nested keys with dot notation)
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: any = this.translations[this.currentLocale];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        logger.warn(`Translation key not found: ${key} in locale ${this.currentLocale}`);
        value = this.getFromLocale("en", key);
        break;
      }
    }

    // If still not found, return the key itself
    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = value.replace(new RegExp(`{${param}}`, "g"), String(val));
      });
    }

    return value;
  }

  /**
   * Get translation from specific locale
   */
  private getFromLocale(locale: Locale, key: string): string {
    const keys = key.split(".");
    let value: any = this.translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  }

  /**
   * Get all available locales
   */
  getAvailableLocales(): Locale[] {
    return ["en", "pt", "es"];
  }

  /**
   * Subscribe to locale changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of locale change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Check if a locale is loaded
   */
  isLocaleLoaded(locale: Locale): boolean {
    return this.loadedLocales.has(locale);
  }

  /**
   * Preload a locale without switching to it
   */
  async preloadLocale(locale: Locale): Promise<void> {
    await this.loadLocale(locale);
  }
}

// Export singleton instance
export const i18n = new I18nSystem();

// Helper function for translations
export const t = (key: string, params?: Record<string, string | number>): string => 
  i18n.translate(key, params);

// Initialize on module load
if (typeof window !== "undefined") {
  i18n.initialize().catch(err => {
    logger.error("Failed to auto-initialize i18n:", err);
  });
}

export type { Locale, Translations };
export default i18n;
