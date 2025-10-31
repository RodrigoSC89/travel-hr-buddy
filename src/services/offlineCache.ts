/**
 * Supabase Offline Cache Service
 * PATCH 624 - Fallback for Supabase offline/error scenarios
 */

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

      console.log(`[Cache] Retrieved ${key} from cache (age: ${Math.floor((Date.now() - entry.timestamp) / 1000)}s)`);
      return entry.data;
    } catch (error) {
      console.error("[Cache] Error reading from cache:", error);
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
      console.log(`[Cache] Stored ${key} in cache (TTL: ${ttl / 1000}s)`);
    } catch (error) {
      console.error("[Cache] Error writing to cache:", error);
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
          console.error("[Cache] Failed to store after clearing:", retryError);
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
      console.error("[Cache] Error removing from cache:", error);
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
                console.log(`[Cache] Cleared expired entry: ${key}`);
              }
            }
          } catch (error) {
            // If we can't parse the entry, remove it
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("[Cache] Error clearing expired entries:", error);
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
      console.log("[Cache] Cleared all cache");
    } catch (error) {
      console.error("[Cache] Error clearing all cache:", error);
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
      console.error("[Cache] Error getting stats:", error);
      return { count: 0, totalSize: 0 };
    }
  }
}

export const offlineCache = new SupabaseOfflineCache();
