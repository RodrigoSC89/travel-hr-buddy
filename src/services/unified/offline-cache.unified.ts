/**
 * UNIFIED OFFLINE CACHE SERVICE
 * Fusão de: offline-cache.ts + offlineCache.ts
 * 
 * Combina:
 * - IndexedDB cache (offline-cache.ts) para dados estruturados
 * - LocalStorage cache (offlineCache.ts) para cache rápido de Supabase
 */

import { logger } from "@/lib/logger";
import type { CachedRoute, CachedCrewMember, CachedVessel, PendingAction, OfflineStatus } from "@/types/offline";

// ============================================
// PART 1: LocalStorage Cache (from offlineCache.ts)
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_PREFIX = "supabase_cache_";
const DEFAULT_TTL = 3600000; // 1 hour

/**
 * LocalStorage-based cache for quick Supabase fallback
 */
export const localStorageCache = {
  get<T>(key: string): T | null {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (Date.now() > entry.expiresAt) {
        this.remove(key);
        return null;
      }

      logger.debug("Retrieved from localStorage cache", { key, age: Math.floor((Date.now() - entry.timestamp) / 1000) });
      return entry.data;
    } catch (error) {
      logger.error("Error reading from localStorage cache", error as Error, { key });
      return null;
    }
  },

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      logger.debug("Stored in localStorage cache", { key, ttl: ttl / 1000 });
    } catch (error) {
      logger.error("Error writing to localStorage cache", error as Error, { key });
      if (error instanceof Error && error.name === "QuotaExceededError") {
        this.clearExpired();
        try {
          const cacheKey = CACHE_PREFIX + key;
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
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      logger.error("Error removing from localStorage cache", error as Error, { key });
    }
  },

  clearExpired(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<unknown> = JSON.parse(cached);
              if (now > entry.expiresAt) {
                localStorage.removeItem(key);
                logger.debug("Cleared expired entry", { key });
              }
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      logger.error("Error clearing expired entries", error as Error);
    }
  },

  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
      logger.info("Cleared all localStorage cache");
    } catch (error) {
      logger.error("Error clearing all localStorage cache", error as Error);
    }
  },

  getStats(): { count: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      let totalSize = 0;

      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          count++;
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        }
      }

      return { count, totalSize };
    } catch (error) {
      logger.error("Error getting localStorage cache stats", error as Error);
      return { count: 0, totalSize: 0 };
    }
  }
};

// ============================================
// PART 2: IndexedDB Cache (from offline-cache.ts)
// ============================================

const DB_NAME = "maritime_offline_db";
const DB_VERSION = 1;

const STORES = {
  ROUTES: "routes",
  CREW: "crew",
  VESSELS: "vessels",
  PENDING_ACTIONS: "pending_actions",
  CONFIG: "config",
};

class IndexedDBCacheService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.ROUTES)) {
          db.createObjectStore(STORES.ROUTES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.CREW)) {
          db.createObjectStore(STORES.CREW, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.VESSELS)) {
          db.createObjectStore(STORES.VESSELS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
          const actionStore = db.createObjectStore(STORES.PENDING_ACTIONS, { 
            keyPath: "id", 
            autoIncrement: true 
          });
          actionStore.createIndex("synced", "synced", { unique: false });
          actionStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.CONFIG)) {
          db.createObjectStore(STORES.CONFIG, { keyPath: "key" });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.initialize();
    }
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Routes
  async cacheRoutes(routes: CachedRoute[]): Promise<void> {
    const store = await this.getStore(STORES.ROUTES, "readwrite");
    const timestamp = new Date().toISOString();
    
    for (const route of routes) {
      store.put({ ...route, cached_at: timestamp });
    }
  }

  async getRoutes(): Promise<CachedRoute[]> {
    const store = await this.getStore(STORES.ROUTES);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Crew
  async cacheCrew(crew: CachedCrewMember[]): Promise<void> {
    const store = await this.getStore(STORES.CREW, "readwrite");
    const timestamp = new Date().toISOString();
    
    for (const member of crew) {
      store.put({ ...member, cached_at: timestamp });
    }
  }

  async getCrew(): Promise<CachedCrewMember[]> {
    const store = await this.getStore(STORES.CREW);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Vessels
  async cacheVessels(vessels: CachedVessel[]): Promise<void> {
    const store = await this.getStore(STORES.VESSELS, "readwrite");
    const timestamp = new Date().toISOString();
    
    for (const vessel of vessels) {
      store.put({ ...vessel, cached_at: timestamp });
    }
  }

  async getVessels(): Promise<CachedVessel[]> {
    const store = await this.getStore(STORES.VESSELS);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Pending Actions
  async addPendingAction(action: Omit<PendingAction, "id">): Promise<void> {
    const store = await this.getStore(STORES.PENDING_ACTIONS, "readwrite");
    store.add({
      ...action,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  }

  async getPendingActions(): Promise<PendingAction[]> {
    const store = await this.getStore(STORES.PENDING_ACTIONS);
    return new Promise((resolve, reject) => {
      const index = store.index("synced");
      const request = index.getAll(false as any);
      request.onsuccess = () => resolve(request.result as PendingAction[]);
      request.onerror = () => reject(request.error);
    });
  }

  async markActionSynced(id: string | number): Promise<void> {
    const store = await this.getStore(STORES.PENDING_ACTIONS, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.synced = true;
          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingActions(): Promise<void> {
    const store = await this.getStore(STORES.PENDING_ACTIONS, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Status
  async getOfflineStatus(): Promise<OfflineStatus> {
    const store = await this.getStore(STORES.CONFIG);
    const pendingActions = await this.getPendingActions();
    
    return new Promise((resolve, reject) => {
      const request = store.get("last_sync");
      request.onsuccess = () => {
        resolve({
          is_offline: !navigator.onLine,
          last_sync: request.result?.value || null,
          pending_actions: pendingActions.length,
          cached_data_size: 0,
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateLastSync(): Promise<void> {
    const store = await this.getStore(STORES.CONFIG, "readwrite");
    store.put({ key: "last_sync", value: new Date().toISOString() });
  }

  async clearAll(): Promise<void> {
    if (!this.db) return;
    
    for (const storeName of Object.values(STORES)) {
      const store = await this.getStore(storeName, "readwrite");
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// ============================================
// UNIFIED EXPORTS
// ============================================

export const indexedDBCache = new IndexedDBCacheService();

// Unified cache interface that uses both strategies
export const unifiedOfflineCache = {
  // Quick cache (LocalStorage) - for small, frequently accessed data
  quick: localStorageCache,
  
  // Persistent cache (IndexedDB) - for large, structured data
  persistent: indexedDBCache,
  
  // Clear all caches
  async clearAll(): Promise<void> {
    localStorageCache.clearAll();
    await indexedDBCache.clearAll();
    logger.info("All offline caches cleared");
  },
  
  // Get combined status
  async getStatus(): Promise<{ localStorage: { count: number; totalSize: number }; indexedDB: OfflineStatus }> {
    return {
      localStorage: localStorageCache.getStats(),
      indexedDB: await indexedDBCache.getOfflineStatus()
    };
  }
};

// Backward compatibility exports
export const offlineCacheService = indexedDBCache;
export const offlineCache = localStorageCache;

export default unifiedOfflineCache;
