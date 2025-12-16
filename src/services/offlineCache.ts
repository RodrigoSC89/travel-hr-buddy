/**
 * Supabase Offline Cache Service
 * PATCH 624 - Fallback for Supabase offline/error scenarios
 */

import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SupabaseOfflineCache {
  private readonly CACHE_PREFIX = "supabase_cache_";
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > entry.expiresAt) {
        this.remove(key);
        return null;
      }

      logger.debug("Retrieved from cache", { key, age: Math.floor((Date.now() - entry.timestamp) / 1000) });
      return entry.data;
    } catch (error) {
      logger.error("Error reading from cache", error as Error, { key });
      return null;
    }
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      logger.debug("Stored in cache", { key, ttl: ttl / 1000 });
    } catch (error) {
      logger.error("Error writing to cache", error as Error, { key });
      // If localStorage is full, clear old entries
      if (error instanceof Error && error.name === "QuotaExceededError") {
        this.clearExpired();
        // Try again
        try {
          const cacheKey = this.CACHE_PREFIX + key;
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
          }));
        } catch (retryError) {
          logger.error("Failed to store after clearing", retryError as Error, { key });
        }
      }
    }
  }

  /**
   * Remove specific key from cache
   */
  remove(key: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      logger.error("Error removing from cache", error as Error, { key });
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<unknown> = JSON.parse(cached);
              if (now > entry.expiresAt) {
                localStorage.removeItem(key);
                logger.debug("Cleared expired entry", { key });
              }
            }
          } catch (error) {
            // If we can't parse the entry, remove it
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      logger.error("Error clearing expired entries", error as Error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
      logger.info("Cleared all cache");
    } catch (error) {
      logger.error("Error clearing all cache", error as Error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      let totalSize = 0;

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          count++;
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        }
      }

      return { count, totalSize };
    } catch (error) {
      logger.error("Error getting cache stats", error as Error);
      return { count: 0, totalSize: 0 };
    }
  }
}

export const offlineCache = new SupabaseOfflineCache();
