/**
 * API Cache Layer - PATCH 832
 * Intelligent caching for API responses with stale-while-revalidate
 */

import { logger } from '@/lib/monitoring/structured-logging';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  maxAge: number;
  staleWhileRevalidate: number;
}

interface CacheConfig {
  defaultMaxAge: number;
  defaultStaleWhileRevalidate: number;
  maxEntries: number;
  storage: 'memory' | 'localStorage' | 'sessionStorage';
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultMaxAge: 5 * 60 * 1000, // 5 minutes
  defaultStaleWhileRevalidate: 60 * 1000, // 1 minute
  maxEntries: 100,
  storage: 'memory',
};

class APICacheLayer {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private revalidating: Set<string> = new Set();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (this.config.storage === 'memory') return;

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      const keys = Object.keys(storage).filter((k) => k.startsWith('api-cache:'));

      keys.forEach((key) => {
        const value = storage.getItem(key);
        if (value) {
          const entry = JSON.parse(value) as CacheEntry<unknown>;
          this.memoryCache.set(key.replace('api-cache:', ''), entry);
        }
      });
    } catch (error) {
      logger.warn('Failed to load API cache from storage', { error });
    }
  }

  private saveToStorage(key: string, entry: CacheEntry<unknown>) {
    if (this.config.storage === 'memory') return;

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      storage.setItem(`api-cache:${key}`, JSON.stringify(entry));
    } catch (error) {
      logger.warn('Failed to save to API cache storage', { error });
    }
  }

  private removeFromStorage(key: string) {
    if (this.config.storage === 'memory') return;

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      storage.removeItem(`api-cache:${key}`);
    } catch {
      // Ignore
    }
  }

  // Generate cache key from URL and options
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 200);
  }

  // Check if entry is fresh
  private isFresh(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp < entry.maxAge;
  }

  // Check if entry is stale but usable
  private isStaleButUsable(entry: CacheEntry<unknown>): boolean {
    const age = Date.now() - entry.timestamp;
    return age >= entry.maxAge && age < entry.maxAge + entry.staleWhileRevalidate;
  }

  // Get from cache
  get<T>(key: string): { data: T; fresh: boolean } | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (this.isFresh(entry)) {
      return { data: entry.data, fresh: true };
    }

    if (this.isStaleButUsable(entry)) {
      return { data: entry.data, fresh: false };
    }

    // Entry is too old, remove it
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
    return null;
  }

  // Set cache entry
  set<T>(
    key: string,
    data: T,
    options: {
      maxAge?: number;
      staleWhileRevalidate?: number;
      etag?: string;
    } = {}
  ): void {
    // Enforce max entries
    if (this.memoryCache.size >= this.config.maxEntries) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.removeFromStorage(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      maxAge: options.maxAge || this.config.defaultMaxAge,
      staleWhileRevalidate: options.staleWhileRevalidate || this.config.defaultStaleWhileRevalidate,
      etag: options.etag,
    };

    this.memoryCache.set(key, entry);
    this.saveToStorage(key, entry);
  }

  // Invalidate cache entry
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
  }

  // Invalidate by pattern
  invalidateByPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        this.removeFromStorage(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();

    if (this.config.storage !== 'memory') {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      Object.keys(storage)
        .filter((k) => k.startsWith('api-cache:'))
        .forEach((k) => storage.removeItem(k));
    }
  }

  // Fetch with cache (stale-while-revalidate)
  async fetch<T>(
    url: string,
    options: RequestInit & {
      cacheOptions?: {
        maxAge?: number;
        staleWhileRevalidate?: number;
        forceRefresh?: boolean;
      };
    } = {}
  ): Promise<T> {
    const { cacheOptions, ...fetchOptions } = options;
    const key = this.generateKey(url, fetchOptions);

    // Check cache first (unless force refresh)
    if (!cacheOptions?.forceRefresh) {
      const cached = this.get<T>(key);

      if (cached) {
        // Return fresh data immediately
        if (cached.fresh) {
          return cached.data;
        }

        // Return stale data and revalidate in background
        if (!this.revalidating.has(key)) {
          this.revalidating.add(key);
          this.revalidateInBackground(url, fetchOptions, key, cacheOptions).finally(() => {
            this.revalidating.delete(key);
          });
        }

        return cached.data;
      }
    }

    // Fetch fresh data
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    const etag = response.headers.get('etag') || undefined;

    this.set(key, data, {
      maxAge: cacheOptions?.maxAge,
      staleWhileRevalidate: cacheOptions?.staleWhileRevalidate,
      etag,
    });

    return data;
  }

  private async revalidateInBackground(
    url: string,
    options: RequestInit,
    key: string,
    cacheOptions?: { maxAge?: number; staleWhileRevalidate?: number }
  ): Promise<void> {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        const data = await response.json();
        const etag = response.headers.get('etag') || undefined;

        this.set(key, data, {
          maxAge: cacheOptions?.maxAge,
          staleWhileRevalidate: cacheOptions?.staleWhileRevalidate,
          etag,
        });

        logger.debug('Cache revalidated', { key });
      }
    } catch (error) {
      logger.warn('Background revalidation failed', { key, error });
    }
  }

  // Get cache stats
  getStats() {
    const entries = Array.from(this.memoryCache.entries());
    const now = Date.now();

    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(([, e]) => this.isFresh(e)).length,
      staleEntries: entries.filter(([, e]) => this.isStaleButUsable(e)).length,
      memorySize: JSON.stringify(Array.from(this.memoryCache.values())).length,
    };
  }
}

// Singleton instance
export const apiCache = new APICacheLayer();

// Create a cached fetch function
export function createCachedFetch(baseConfig: Partial<CacheConfig> = {}) {
  const cache = new APICacheLayer(baseConfig);

  return async function cachedFetch<T>(
    url: string,
    options?: RequestInit & {
      cacheOptions?: {
        maxAge?: number;
        staleWhileRevalidate?: number;
        forceRefresh?: boolean;
      };
    }
  ): Promise<T> {
    return cache.fetch<T>(url, options);
  };
}

// React hook for cached API calls
import { useState, useCallback, useEffect } from 'react';

export function useCachedFetch<T>(
  url: string | null,
  options: RequestInit & {
    cacheOptions?: {
      maxAge?: number;
      staleWhileRevalidate?: number;
      enabled?: boolean;
    };
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const { cacheOptions, ...fetchOptions } = options;
  const enabled = cacheOptions?.enabled !== false;

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const key = `${fetchOptions.method || 'GET'}:${url}`;
      const cached = apiCache.get<T>(key);

      if (cached) {
        setData(cached.data);
        setIsStale(!cached.fresh);

        if (cached.fresh) {
          setIsLoading(false);
          return;
        }
      }

      const result = await apiCache.fetch<T>(url, options);
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled, JSON.stringify(fetchOptions)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return apiCache.fetch<T>(url!, { ...options, cacheOptions: { ...cacheOptions, forceRefresh: true } })
      .then((result) => {
        setData(result);
        setIsStale(false);
        return result;
      });
  }, [url, options, cacheOptions]);

  const invalidate = useCallback(() => {
    if (url) {
      const key = `${fetchOptions.method || 'GET'}:${url}`;
      apiCache.invalidate(key);
    }
  }, [url, fetchOptions.method]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate,
  };
}
