/**
 * PATCH 548 - Translator Service
 * Refactored multilingual translation service
 */

import { logger } from "@/lib/logger";

export type SupportedLanguage = "pt" | "en" | "es" | "fr" | "de";

export interface TranslationCache {
  key: string;
  lang: SupportedLanguage;
  value: string;
  source: "json" | "ai" | "fallback";
  timestamp: number;
}

export interface TranslationResult {
  translation: string;
  source: "json" | "ai" | "fallback";
  cached: boolean;
  confidence?: number;
}

export class TranslatorService {
  private static cache = new Map<string, TranslationCache>();
  private static readonly CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Detect browser language
   */
  static detectBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    const supported: SupportedLanguage[] = ["pt", "en", "es", "fr", "de"];
    
    return supported.includes(browserLang as SupportedLanguage) 
      ? (browserLang as SupportedLanguage)
      : "en";
  }

  /**
   * Translate a key to target language
   */
  static async translate(key: string, targetLang: SupportedLanguage, context?: string): Promise<TranslationResult> {
    try {
      // Check cache first
      const cached = this.getCachedTranslation(key, targetLang);
      if (cached) {
        return {
          translation: cached.value,
          source: cached.source,
          cached: true,
          confidence: 1.0,
        };
      }

      // Load from JSON
      const translations = await this.loadTranslationsFromJSON(targetLang);
      const jsonTranslation = this.getTranslationFromJSON(translations, key);

      if (jsonTranslation) {
        this.saveToCache({
          key,
          lang: targetLang,
          value: jsonTranslation,
          source: "json",
          timestamp: Date.now(),
        });

        return {
          translation: jsonTranslation,
          source: "json",
          cached: false,
          confidence: 1.0,
        });
      }

      // Fallback to key
      return {
        translation: key,
        source: "fallback",
        cached: false,
        confidence: 0.0,
      };
    } catch (error) {
      logger.error("[Translator] Translation failed", error as Error, { key, targetLang });
      return {
        translation: key,
        source: "fallback",
        cached: false,
        confidence: 0.0,
      };
    }
  }

  /**
   * Translate multiple keys in batch
   */
  static async translateBatch(
    keys: string[],
    targetLang: SupportedLanguage
  ): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.translate(key, targetLang);
      })
    );

    return results;
  }

  /**
   * Get statistics
   */
  static getStatistics() {
    const stats = {
      totalTranslations: this.cache.size,
      byLanguage: {} as Record<SupportedLanguage, number>,
      bySource: {
        json: 0,
        ai: 0,
        fallback: 0,
      },
    };

    for (const cache of this.cache.values()) {
      stats.byLanguage[cache.lang] = (stats.byLanguage[cache.lang] || 0) + 1;
      stats.bySource[cache.source]++;
    }

    return stats;
  }

  /**
   * Clear expired cache
   */
  static clearExpiredCache(): void {
    const now = Date.now();

    for (const [cacheKey, cache] of this.cache.entries()) {
      if (now - cache.timestamp > this.CACHE_EXPIRATION_MS) {
        this.cache.delete(cacheKey);
      }
    }

    logger.info("[Translator] Cleared expired cache", { cacheSize: this.cache.size });
  }

  // Private helper methods

  private static getCachedTranslation(key: string, lang: SupportedLanguage): TranslationCache | null {
    const cacheKey = `${key}:${lang}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp > this.CACHE_EXPIRATION_MS) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached || null;
  }

  private static saveToCache(cache: TranslationCache): void {
    const cacheKey = `${cache.key}:${cache.lang}`;
    this.cache.set(cacheKey, cache);
  }

  private static async loadTranslationsFromJSON(lang: SupportedLanguage): Promise<Record<string, any>> {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      return await response.json();
    } catch (error) {
      logger.error("[Translator] Failed to load translation JSON", error as Error, { lang });
      return {};
    }
  }

  private static getTranslationFromJSON(translations: Record<string, any>, key: string): string | null {
    const parts = key.split(".");
    let current = translations;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    return typeof current === "string" ? current : null;
  }
}

export const translatorService = TranslatorService;
