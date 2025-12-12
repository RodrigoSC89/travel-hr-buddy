/**
 * PATCH 571 - AI Translator Core
 * TODO PATCH 659: TypeScript fixes deferred (translation_cache table schema missing)
 * Sistema de tradução multilíngue em tempo real com fallback para IA
 * Suporte: pt, en, es, fr, de
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export type SupportedLanguage = "pt" | "en" | "es" | "fr" | "de";

export interface TranslationCache {
  key: string;
  lang: SupportedLanguage;
  value: string;
  source: "json" | "ai" | "fallback";
  timestamp: number;
}

export interface TranslationRequest {
  key: string;
  targetLang: SupportedLanguage;
  sourceLang?: SupportedLanguage;
  context?: string;
}

export interface TranslationResult {
  translation: string;
  source: "json" | "ai" | "fallback";
  cached: boolean;
  confidence?: number;
}

class AITranslator {
  private static instance: AITranslator;
  private cache: Map<string, TranslationCache> = new Map();
  private dbName = "i18n-translation-cache";
  private storeName = "translations";
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // Singleton pattern
  static getInstance(): AITranslator {
    if (!AITranslator.instance) {
      AITranslator.instance = new AITranslator();
    }
    return AITranslator.instance;
  }

  /**
   * Inicializa o sistema de tradução com cache IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Inicializar IndexedDB
      await this.initIndexedDB();
      
      // Carregar cache inicial do IndexedDB
      await this.loadCacheFromIndexedDB();
      
      this.isInitialized = true;
      logger.info("[AITranslator] Initialized successfully");
    } catch (error) {
      logger.error("[AITranslator] Initialization failed", error);
      throw error;
    }
  }

  /**
   * Inicializa o IndexedDB para cache local
   */
  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      });

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      });

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: "key",
          });
          objectStore.createIndex("lang", "lang", { unique: false });
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      });
    });
  }

  /**
   * Carrega cache do IndexedDB para memória
   */
  private async loadCacheFromIndexedDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const results = request.result as TranslationCache[];
        results.forEach((item) => {
          const cacheKey = `${item.key}:${item.lang}`;
          this.cache.set(cacheKey, item);
        });
        logger.info(`[AITranslator] Loaded ${results.length} translations from cache`);
        resolve();
      });

      request.onerror = () => {
        reject(new Error("Failed to load cache from IndexedDB"));
      });
    });
  }

  /**
   * Salva tradução no cache (memória + IndexedDB + Supabase)
   */
  private async saveToCache(cache: TranslationCache): Promise<void> {
    const cacheKey = `${cache.key}:${cache.lang}`;
    
    // Salvar em memória
    this.cache.set(cacheKey, cache);

    // Salvar no IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const objectStore = transaction.objectStore(this.storeName);
        objectStore.put(cache);
      } catch (error) {
        logger.error("[AITranslator] Failed to save to IndexedDB", error);
      }
    }

    // Salvar no Supabase para auditoria
    try {
      await supabase.from("translation_cache").upsert({
        key: cache.key,
        lang: cache.lang,
        value: cache.value,
        source: cache.source,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[AITranslator] Failed to save to Supabase", error);
    }
  }

  /**
   * Busca tradução no cache
   */
  private getCachedTranslation(
    key: string,
    lang: SupportedLanguage
  ): TranslationCache | null {
    const cacheKey = `${key}:${lang}`;
    const cached = this.cache.get(cacheKey);

    // Verificar se cache está expirado (7 dias)
    if (cached && Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached || null;
  }

  /**
   * Detecta idioma do navegador
   */
  detectBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    const supported: SupportedLanguage[] = ["pt", "en", "es", "fr", "de"];
    
    if (supported.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }
    
    return "en"; // Default fallback
  }

  /**
   * Carrega traduções do JSON
   */
  private async loadTranslationsFromJSON(
    lang: SupportedLanguage
  ): Promise<Record<string, any>> {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      return await response.json();
    } catch (error) {
      logger.error(`[AITranslator] Failed to load JSON for ${lang}`, error);
      return {};
    }
  }

  /**
   * Busca tradução no JSON
   */
  private getTranslationFromJSON(
    translations: Record<string, any>,
    key: string
  ): string | null {
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

  /**
   * Traduz usando IA (GPT/LLM) como fallback
   */
  private async translateWithAI(
    key: string,
    targetLang: SupportedLanguage,
    context?: string
  ): Promise<string> {
    try {
      // Usar o AI Engine existente para tradução
      const { data, error } = await supabase.functions.invoke("ai-translate", {
        body: {
          key,
          targetLang,
          context,
        },
      });

      if (error) throw error;

      return data.translation || key;
    } catch (error) {
      logger.error("[AITranslator] AI translation failed", error);
      // Fallback para a chave original
      return key;
    }
  }

  /**
   * Traduz uma chave para o idioma alvo
   */
  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const { key, targetLang, context } = request;

    try {
      // 1. Verificar cache
      const cached = this.getCachedTranslation(key, targetLang);
      if (cached) {
        return {
          translation: cached.value,
          source: cached.source,
          cached: true,
          confidence: 1.0,
        });
      }

      // 2. Buscar no JSON
      const translations = await this.loadTranslationsFromJSON(targetLang);
      const jsonTranslation = this.getTranslationFromJSON(translations, key);

      if (jsonTranslation) {
        // Salvar no cache
        await this.saveToCache({
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

      // 3. Fallback para IA
      const aiTranslation = await this.translateWithAI(key, targetLang, context);

      // Salvar no cache
      await this.saveToCache({
        key,
        lang: targetLang,
        value: aiTranslation,
        source: "ai",
        timestamp: Date.now(),
      });

      return {
        translation: aiTranslation,
        source: "ai",
        cached: false,
        confidence: 0.85,
      });
    } catch (error) {
      logger.error("[AITranslator] Translation failed", error);
      
      // Último fallback
      return {
        translation: key,
        source: "fallback",
        cached: false,
        confidence: 0.0,
      });
    }
  }

  /**
   * Traduz múltiplas chaves em batch
   */
  async translateBatch(
    keys: string[],
    targetLang: SupportedLanguage
  ): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.translate({ key, targetLang });
      })
    );

    return results;
  }

  /**
   * Limpa cache expirado
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    const expiration = 7 * 24 * 60 * 60 * 1000; // 7 dias

    for (const [cacheKey, cache] of this.cache.entries()) {
      if (now - cache.timestamp > expiration) {
        this.cache.delete(cacheKey);

        // Remover do IndexedDB
        if (this.db) {
          const transaction = this.db.transaction([this.storeName], "readwrite");
          const objectStore = transaction.objectStore(this.storeName);
          objectStore.delete(cache.key);
        }
      }
    }

    logger.info("[AITranslator] Cleared expired cache");
  }

  /**
   * Exporta estatísticas de tradução
   */
  getStatistics() {
    const stats = {
      totalTranslations: this.cache.size,
      byLanguage: {} as Record<SupportedLanguage, number>,
      bySource: {
        json: 0,
        ai: 0,
        fallback: 0,
      },
    });

    for (const cache of this.cache.values()) {
      stats.byLanguage[cache.lang] = (stats.byLanguage[cache.lang] || 0) + 1;
      stats.bySource[cache.source]++;
    }

    return stats;
  }
}

// Export singleton instance
export const aiTranslator = AITranslator.getInstance();

// Export class for testing
export { AITranslator };
