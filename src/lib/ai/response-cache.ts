/**
 * AI Response Cache - PATCH v26
 * LRU cache for AI responses to reduce costs and improve latency
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  cost: number;
}

interface CacheConfig {
  maxSize: number;
  ttlMs: number;
  costAwareEviction: boolean;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 500,
  ttlMs: 60 * 60 * 1000, // 1 hour
  costAwareEviction: true,
};

class AIResponseCache<T = string> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    costSaved: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    
    // Periodic cleanup
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate cache key from prompt/messages
   */
  static generateKey(input: string | object, options?: object): string {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const optionsStr = options ? JSON.stringify(options) : '';
    
    // Simple hash function
    let hash = 0;
    const str = inputStr + optionsStr;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `ai_cache_${hash.toString(16)}`;
  }

  /**
   * Get cached response
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;
    this.stats.costSaved += entry.cost;

    return entry.value;
  }

  /**
   * Set cached response
   */
  set(key: string, value: T, cost: number = 0): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
      cost,
    });
  }

  /**
   * Get or compute value
   */
  async getOrCompute(
    key: string,
    computeFn: () => Promise<T>,
    costEstimate: number = 0
  ): Promise<{ value: T; fromCache: boolean; latencyMs: number }> {
    const startTime = Date.now();
    
    const cached = this.get(key);
    if (cached !== null) {
      return {
        value: cached,
        fromCache: true,
        latencyMs: Date.now() - startTime,
      };
    }

    const value = await computeFn();
    this.set(key, value, costEstimate);

    return {
      value,
      fromCache: false,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Evict entries based on LRU or cost-aware strategy
   */
  private evict(): void {
    if (this.config.costAwareEviction) {
      this.evictCostAware();
    } else {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let oldest: { key: string; timestamp: number } | null = null;

    for (const [key, entry] of this.cache) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = { key, timestamp: entry.timestamp };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
      this.stats.evictions++;
    }
  }

  private evictCostAware(): void {
    // Evict entry with lowest (hits * cost) / age ratio
    let lowestScore = Infinity;
    let keyToEvict: string | null = null;

    const now = Date.now();

    for (const [key, entry] of this.cache) {
      const age = now - entry.timestamp;
      const score = (entry.hits * entry.cost + 1) / (age / 1000 + 1);
      
      if (score < lowestScore) {
        lowestScore = score;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.stats.evictions++;
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.config.ttlMs) {
        expired.push(key);
      }
    }

    for (const key of expired) {
      this.cache.delete(key);
      this.stats.evictions++;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    costSaved: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      costSaved: this.stats.costSaved,
    };
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, costSaved: 0 };
  }

  /**
   * Get cache keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Warm cache with precomputed values
   */
  warmUp(entries: Array<{ key: string; value: T; cost?: number }>): void {
    for (const { key, value, cost = 0 } of entries) {
      this.set(key, value, cost);
    }
  }
}

// Singleton for general AI responses
export const aiResponseCache = new AIResponseCache<string>();

// Specialized cache for structured data (e.g., JSON responses)
export const structuredDataCache = new AIResponseCache<Record<string, unknown>>({
  maxSize: 200,
  ttlMs: 30 * 60 * 1000, // 30 minutes for structured data
});

// React hook
import { useCallback } from 'react';

export function useAICache(cacheKey: string) {
  const get = useCallback((): string | null => {
    return aiResponseCache.get(cacheKey);
  }, [cacheKey]);

  const set = useCallback((value: string, cost: number = 0) => {
    aiResponseCache.set(cacheKey, value, cost);
  }, [cacheKey]);

  const getOrCompute = useCallback(async (
    computeFn: () => Promise<string>,
    costEstimate: number = 0
  ) => {
    return aiResponseCache.getOrCompute(cacheKey, computeFn, costEstimate);
  }, [cacheKey]);

  return { get, set, getOrCompute };
}

export { AIResponseCache };
export type { CacheConfig };
