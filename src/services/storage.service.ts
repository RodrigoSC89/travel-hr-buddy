/**
 * Storage Service - PATCH 870
 * Smart caching with TTL for offline-first strategy
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
}

export const STORAGE_KEYS = {
  AUTH: 'nauti_auth',
  SHIPS: 'nauti_ships',
  CREW: 'nauti_crew',
  VESSELS: 'nauti_vessels',
  DOCUMENTS: 'nauti_documents',
  PEOTRAM: 'nauti_peotram',
  SETTINGS: 'nauti_settings',
  CACHE_VERSION: 'nauti_cache_version',
  USER_PREFERENCES: 'nauti_user_prefs',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// TTL presets in milliseconds
export const TTL = {
  MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

const CURRENT_CACHE_VERSION = 'v1.0.0';

export class StorageService {
  private static memoryCache: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * Save data with TTL
   */
  static saveData<T>(key: string, data: T, ttl: number = TTL.HOUR): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CURRENT_CACHE_VERSION,
    };
    
    // Save to memory cache
    this.memoryCache.set(key, entry);
    
    // Save to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('[Storage] Error saving to localStorage:', error);
      // If localStorage is full, clear old entries
      this.clearExpired();
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        console.error('[Storage] Failed to save after cleanup');
      }
    }
  }
  
  /**
   * Get data with TTL check
   */
  static getData<T>(key: string): T | null {
    // Check memory cache first (faster)
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data;
    }
    
    // Check localStorage
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      if (this.isExpired(entry)) {
        localStorage.removeItem(key);
        this.memoryCache.delete(key);
        return null;
      }
      
      // Check version
      if (entry.version !== CURRENT_CACHE_VERSION) {
        localStorage.removeItem(key);
        this.memoryCache.delete(key);
        return null;
      }
      
      // Update memory cache
      this.memoryCache.set(key, entry);
      
      return entry.data;
    } catch (error) {
      console.warn('[Storage] Error reading from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Check if entry is expired
   */
  private static isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  /**
   * Remove specific key
   */
  static removeData(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[Storage] Error removing from localStorage:', error);
    }
  }
  
  /**
   * Clear all expired entries
   */
  static clearExpired(): void {
    const keysToRemove: string[] = [];
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;
        
        const entry: CacheEntry<any> = JSON.parse(item);
        if (this.isExpired(entry) || entry.version !== CURRENT_CACHE_VERSION) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      this.memoryCache.delete(key);
    });
    
    console.log(`[Storage] Cleared ${keysToRemove.length} expired entries`);
  }
  
  /**
   * Clear all cache
   */
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
    this.memoryCache.clear();
    console.log('[Storage] All cache cleared');
  }
  
  /**
   * Get cache size info
   */
  static getCacheInfo(): { count: number; size: string } {
    let totalSize = 0;
    let count = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // UTF-16
          count++;
        }
      } catch {}
    });
    
    const sizeInKB = (totalSize / 1024).toFixed(2);
    return { count, size: `${sizeInKB} KB` };
  }
  
  /**
   * Wrapper for caching async data fetches
   */
  static async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = TTL.TEN_MINUTES
  ): Promise<T> {
    // Try cache first
    const cached = this.getData<T>(key);
    if (cached !== null) {
      console.log(`[Storage] Cache hit for ${key}`);
      return cached;
    }
    
    // Fetch from network
    console.log(`[Storage] Cache miss for ${key}, fetching...`);
    const data = await fetchFn();
    
    // Save to cache
    this.saveData(key, data, ttl);
    
    return data;
  }
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  // Clear expired entries on page load
  setTimeout(() => StorageService.clearExpired(), 5000);
  
  // Periodic cleanup every 5 minutes
  setInterval(() => StorageService.clearExpired(), 5 * 60 * 1000);
}
