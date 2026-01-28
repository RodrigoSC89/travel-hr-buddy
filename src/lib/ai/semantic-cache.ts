/**
 * Semantic Cache for AI Responses
 * Phase 2: Advanced AI - Intelligent response caching with similarity matching
 */

import { logger } from "@/lib/logger";

export interface CacheEntry {
  id: string;
  query: string;
  queryTokens: string[];
  response: string;
  metadata: {
    model: string;
    module: string;
    confidence: number;
    tokens_used: number;
  };
  createdAt: number;
  expiresAt: number;
  hitCount: number;
  lastAccessedAt: number;
}

export interface CacheConfig {
  maxEntries: number;
  defaultTTL: number; // in milliseconds
  similarityThreshold: number; // 0-1
  enablePersistence: boolean;
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRatio: number;
  averageResponseTime: number;
  memorySizeBytes: number;
}

/**
 * Semantic Cache Engine
 * Uses token-based similarity for intelligent cache matching
 */
export class SemanticCacheEngine {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: { hits: number; misses: number; responseTimes: number[] } = {
    hits: 0,
    misses: 0,
    responseTimes: [],
  };
  private config: CacheConfig;
  private readonly STORAGE_KEY = "nauti_ai_semantic_cache";

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxEntries: config?.maxEntries ?? 500,
      defaultTTL: config?.defaultTTL ?? 30 * 60 * 1000, // 30 minutes
      similarityThreshold: config?.similarityThreshold ?? 0.75,
      enablePersistence: config?.enablePersistence ?? true,
    };

    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Tokenize a query for similarity comparison
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .sort();
  }

  /**
   * Calculate Jaccard similarity between two token sets
   */
  private calculateSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Generate a unique cache key
   */
  private generateKey(query: string, module: string): string {
    const normalized = query.toLowerCase().trim();
    return `${module}:${this.hashString(normalized)}`;
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached response for a query
   */
  get(
    query: string,
    module: string = "general"
  ): { entry: CacheEntry; similarity: number } | null {
    const startTime = performance.now();
    const queryTokens = this.tokenize(query);
    const exactKey = this.generateKey(query, module);

    // Check for exact match first
    const exactMatch = this.cache.get(exactKey);
    if (exactMatch && exactMatch.expiresAt > Date.now()) {
      exactMatch.hitCount++;
      exactMatch.lastAccessedAt = Date.now();
      this.stats.hits++;
      this.stats.responseTimes.push(performance.now() - startTime);
      logger.debug("[SemanticCache] Exact hit", { key: exactKey });
      return { entry: exactMatch, similarity: 1.0 };
    }

    // Semantic search through cache
    let bestMatch: CacheEntry | null = null;
    let bestSimilarity = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt < Date.now()) continue;
      if (entry.metadata.module !== module) continue;

      const similarity = this.calculateSimilarity(queryTokens, entry.queryTokens);
      if (similarity > bestSimilarity && similarity >= this.config.similarityThreshold) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      bestMatch.hitCount++;
      bestMatch.lastAccessedAt = Date.now();
      this.stats.hits++;
      this.stats.responseTimes.push(performance.now() - startTime);
      logger.debug("[SemanticCache] Semantic hit", {
        similarity: bestSimilarity,
        originalQuery: bestMatch.query.substring(0, 50),
      });
      return { entry: bestMatch, similarity: bestSimilarity };
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Store a response in cache
   */
  set(
    query: string,
    response: string,
    options: {
      module?: string;
      model?: string;
      confidence?: number;
      tokens_used?: number;
      ttl?: number;
    } = {}
  ): void {
    const module = options.module ?? "general";
    const key = this.generateKey(query, module);

    // Evict if at capacity
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      id: key,
      query,
      queryTokens: this.tokenize(query),
      response,
      metadata: {
        model: options.model ?? "unknown",
        module,
        confidence: options.confidence ?? 1.0,
        tokens_used: options.tokens_used ?? 0,
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + (options.ttl ?? this.config.defaultTTL),
      hitCount: 0,
      lastAccessedAt: Date.now(),
    };

    this.cache.set(key, entry);
    logger.debug("[SemanticCache] Entry stored", { key, queryLength: query.length });

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidate(pattern?: string, module?: string): number {
    let invalidated = 0;

    for (const [key, entry] of this.cache.entries()) {
      const matchesPattern = !pattern || entry.query.includes(pattern);
      const matchesModule = !module || entry.metadata.module === module;

      if (matchesPattern && matchesModule) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    logger.info("[SemanticCache] Invalidated entries", { count: invalidated });
    return invalidated;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, responseTimes: [] };

    if (this.config.enablePersistence) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }

    logger.info("[SemanticCache] Cache cleared");
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const avgResponseTime =
      this.stats.responseTimes.length > 0
        ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
        : 0;

    // Estimate memory size
    let memorySize = 0;
    for (const entry of this.cache.values()) {
      memorySize += entry.query.length * 2;
      memorySize += entry.response.length * 2;
      memorySize += JSON.stringify(entry.metadata).length * 2;
    }

    return {
      totalEntries: this.cache.size,
      hitCount: this.stats.hits,
      missCount: this.stats.misses,
      hitRatio: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      averageResponseTime: avgResponseTime,
      memorySizeBytes: memorySize,
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    let oldest: { key: string; time: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessedAt < oldest.time) {
        oldest = { key, time: entry.lastAccessedAt };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
      logger.debug("[SemanticCache] Evicted LRU entry", { key: oldest.key });
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug("[SemanticCache] Cleaned expired entries", { count: cleaned });
      if (this.config.enablePersistence) {
        this.saveToStorage();
      }
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const entries = Array.from(this.cache.entries());
      const data = JSON.stringify({
        entries,
        stats: this.stats,
        savedAt: Date.now(),
      });
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch {
      logger.warn("[SemanticCache] Failed to persist cache");
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return;

      const parsed = JSON.parse(data);
      const now = Date.now();

      // Only load non-expired entries
      for (const [key, entry] of parsed.entries) {
        if ((entry as CacheEntry).expiresAt > now) {
          this.cache.set(key, entry);
        }
      }

      logger.info("[SemanticCache] Loaded from storage", { entries: this.cache.size });
    } catch {
      logger.warn("[SemanticCache] Failed to load cache");
    }
  }

  /**
   * Get top cached queries by hit count
   */
  getTopQueries(limit: number = 10): Array<{ query: string; hits: number; module: string }> {
    return Array.from(this.cache.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, limit)
      .map((entry) => ({
        query: entry.query.substring(0, 100),
        hits: entry.hitCount,
        module: entry.metadata.module,
      }));
  }

  /**
   * Warm up cache with common queries
   */
  async warmup(
    queries: Array<{ query: string; response: string; module: string }>
  ): Promise<void> {
    for (const item of queries) {
      this.set(item.query, item.response, {
        module: item.module,
        ttl: 24 * 60 * 60 * 1000, // 24 hours for warmup queries
      });
    }
    logger.info("[SemanticCache] Cache warmed up", { entries: queries.length });
  }
}

// Singleton instance with maritime-optimized config
export const semanticCache = new SemanticCacheEngine({
  maxEntries: 1000,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  similarityThreshold: 0.7,
  enablePersistence: true,
});

/**
 * Cache decorator for AI functions
 */
export function withCache<T extends (...args: unknown[]) => Promise<string>>(
  fn: T,
  module: string,
  ttl?: number
): T {
  return (async (...args: unknown[]) => {
    const query = JSON.stringify(args);
    const cached = semanticCache.get(query, module);

    if (cached) {
      return cached.entry.response;
    }

    const response = await fn(...args);
    semanticCache.set(query, response, { module, ttl });

    return response;
  }) as T;
}
