/**
 * Hybrid LLM Engine - PATCH 850
 * Offline-first LLM with cloud fallback optimized for 2Mbps
 */

import { openDB, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

const DB_NAME = 'nautilus-llm-cache';
const STORE_NAME = 'responses';
const DB_VERSION = 1;

interface CachedResponse {
  key: string;
  prompt: string;
  response: string;
  confidence: number;
  timestamp: number;
  source: 'cloud' | 'local' | 'fallback';
  expiresAt: number;
}

interface HybridLLMConfig {
  maxCacheSize: number;
  cacheTTL: number;
  offlineFallbackEnabled: boolean;
  compressionEnabled: boolean;
  minConfidence: number;
}

const DEFAULT_CONFIG: HybridLLMConfig = {
  maxCacheSize: 100,
  cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  offlineFallbackEnabled: true,
  compressionEnabled: true,
  minConfidence: 0.6,
};

// Predefined offline responses for common queries
const OFFLINE_RESPONSES: Record<string, { response: string; confidence: number }> = {
  'greeting': {
    response: 'Olá! Sou o assistente Nautilus. Como posso ajudar?',
    confidence: 1.0
  },
  'help': {
    response: 'Posso ajudar com: navegação, documentos, compliance, manutenção e operações marítimas.',
    confidence: 1.0
  },
  'compliance': {
    response: 'Para questões de compliance, verifique os checklists de auditoria ISM no módulo de Compliance.',
    confidence: 0.85
  },
  'maintenance': {
    response: 'O sistema de manutenção preventiva está disponível no módulo de Manutenção.',
    confidence: 0.85
  },
  'error': {
    response: 'Desculpe, não consegui processar sua solicitação no momento. Tente novamente quando estiver online.',
    confidence: 0.5
  }
};

class HybridLLMEngine {
  private db: IDBPDatabase | null = null;
  private config: HybridLLMConfig = DEFAULT_CONFIG;
  private isOnline: boolean = navigator.onLine;
  private pendingRequests: Map<string, Promise<string>> = new Map();

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('[HybridLLM] Online mode activated');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('[HybridLLM] Offline mode activated');
    });
  }

  private async getDB(): Promise<IDBPDatabase> {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiresAt', 'expiresAt');
        }
      },
    });

    return this.db;
  }

  private generateCacheKey(prompt: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `llm-${Math.abs(hash).toString(36)}`;
  }

  private async getCachedResponse(prompt: string): Promise<CachedResponse | null> {
    try {
      const db = await this.getDB();
      const key = this.generateCacheKey(prompt);
      const cached = await db.get(STORE_NAME, key);

      if (!cached) return null;

      // Check if expired
      if (cached.expiresAt < Date.now()) {
        await db.delete(STORE_NAME, key);
        return null;
      }

      return cached;
    } catch (error) {
      logger.warn('[HybridLLM] Cache read error:', { error });
      return null;
    }
  }

  private async cacheResponse(prompt: string, response: string, confidence: number, source: 'cloud' | 'local' | 'fallback'): Promise<void> {
    try {
      const db = await this.getDB();
      const key = this.generateCacheKey(prompt);

      const cached: CachedResponse = {
        key,
        prompt,
        response,
        confidence,
        timestamp: Date.now(),
        source,
        expiresAt: Date.now() + this.config.cacheTTL,
      };

      await db.put(STORE_NAME, cached);

      // Cleanup old entries if cache is full
      await this.cleanupCache();
    } catch (error) {
      logger.warn('[HybridLLM] Cache write error:', { error });
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');

      // Get all entries sorted by timestamp
      const entries = await index.getAll();

      if (entries.length > this.config.maxCacheSize) {
        // Delete oldest entries
        const toDelete = entries.slice(0, entries.length - this.config.maxCacheSize);
        for (const entry of toDelete) {
          await store.delete(entry.key);
        }
        logger.info(`[HybridLLM] Cleaned up ${toDelete.length} old cache entries`);
      }

      await tx.done;
    } catch (error) {
      logger.warn('[HybridLLM] Cache cleanup error:', { error });
    }
  }

  private matchOfflinePattern(prompt: string): { response: string; confidence: number } | null {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('olá') || lowerPrompt.includes('oi') || lowerPrompt.includes('bom dia')) {
      return OFFLINE_RESPONSES['greeting'];
    }
    if (lowerPrompt.includes('ajuda') || lowerPrompt.includes('help')) {
      return OFFLINE_RESPONSES['help'];
    }
    if (lowerPrompt.includes('compliance') || lowerPrompt.includes('auditoria') || lowerPrompt.includes('ism')) {
      return OFFLINE_RESPONSES['compliance'];
    }
    if (lowerPrompt.includes('manutenção') || lowerPrompt.includes('maintenance')) {
      return OFFLINE_RESPONSES['maintenance'];
    }

    return null;
  }

  /**
   * Query the LLM with offline-first strategy
   */
  async query(prompt: string, options?: { forceOnline?: boolean; context?: string }): Promise<{
    response: string;
    confidence: number;
    source: 'cache' | 'cloud' | 'local' | 'fallback';
    latency: number;
  }> {
    const startTime = performance.now();

    // 1. Check cache first
    if (!options?.forceOnline) {
      const cached = await this.getCachedResponse(prompt);
      if (cached && cached.confidence >= this.config.minConfidence) {
        logger.info('[HybridLLM] Cache hit');
        return {
          response: cached.response,
          confidence: cached.confidence,
          source: 'cache',
          latency: performance.now() - startTime,
        };
      }
    }

    // 2. Try cloud if online
    if (this.isOnline) {
      try {
        // Deduplicate concurrent requests
        const cacheKey = this.generateCacheKey(prompt);
        if (this.pendingRequests.has(cacheKey)) {
          const response = await this.pendingRequests.get(cacheKey)!;
          return {
            response,
            confidence: 0.9,
            source: 'cloud',
            latency: performance.now() - startTime,
          };
        }

        const requestPromise = this.fetchFromCloud(prompt, options?.context);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
          const response = await requestPromise;
          await this.cacheResponse(prompt, response, 0.95, 'cloud');

          return {
            response,
            confidence: 0.95,
            source: 'cloud',
            latency: performance.now() - startTime,
          };
        } finally {
          this.pendingRequests.delete(cacheKey);
        }
      } catch (error) {
        logger.warn('[HybridLLM] Cloud request failed, falling back to local', { error });
      }
    }

    // 3. Try offline pattern matching
    if (this.config.offlineFallbackEnabled) {
      const offlineMatch = this.matchOfflinePattern(prompt);
      if (offlineMatch) {
        return {
          response: offlineMatch.response,
          confidence: offlineMatch.confidence,
          source: 'local',
          latency: performance.now() - startTime,
        };
      }
    }

    // 4. Return generic fallback
    return {
      response: OFFLINE_RESPONSES['error'].response,
      confidence: OFFLINE_RESPONSES['error'].confidence,
      source: 'fallback',
      latency: performance.now() - startTime,
    };
  }

  private async fetchFromCloud(prompt: string, context?: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('nautilus-llm', {
      body: {
        prompt,
        context,
        mode: 'safe',
      },
    });

    if (error) throw error;
    return data?.response || 'Não foi possível obter resposta.';
  }

  /**
   * Get engine statistics
   */
  async getStats(): Promise<{
    cacheSize: number;
    isOnline: boolean;
    config: HybridLLMConfig;
  }> {
    const db = await this.getDB();
    const cacheSize = await db.count(STORE_NAME);

    return {
      cacheSize,
      isOnline: this.isOnline,
      config: this.config,
    };
  }

  /**
   * Clear all cached responses
   */
  async clearCache(): Promise<void> {
    const db = await this.getDB();
    await db.clear(STORE_NAME);
    logger.info('[HybridLLM] Cache cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HybridLLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('[HybridLLM] Config updated', this.config);
  }
}

// Singleton instance
export const hybridLLMEngine = new HybridLLMEngine();

// React hook for hybrid LLM
export function useHybridLLM() {
  return {
    query: (prompt: string, options?: { forceOnline?: boolean; context?: string }) =>
      hybridLLMEngine.query(prompt, options),
    getStats: () => hybridLLMEngine.getStats(),
    clearCache: () => hybridLLMEngine.clearCache(),
    updateConfig: (config: Partial<HybridLLMConfig>) => hybridLLMEngine.updateConfig(config),
  };
}
