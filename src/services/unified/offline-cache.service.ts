/**
 * PATCH 178.0 - Unified Offline Cache Service
 * Fusão de: offline-cache.ts, offlineCache.ts
 * 
 * Provides comprehensive offline caching with:
 * - IndexedDB for large structured data (routes, crew, vessels)
 * - LocalStorage for simple key-value caching
 * - Pending actions queue for offline mutations
 */

import { logger } from "@/lib/logger";
import type { CachedRoute, CachedCrewMember, CachedVessel, PendingAction, OfflineStatus } from "@/types/offline";

// =============================================================================
// TYPES
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// =============================================================================
// INDEXEDDB CACHE (for large structured data)
// =============================================================================

const DB_NAME = "nautilus_offline_db";
const DB_VERSION = 2;

const STORES = {
  ROUTES: "routes",
  CREW: "crew",
  VESSELS: "vessels",
  PENDING_ACTIONS: "pending_actions",
  CONFIG: "config",
  GENERIC_CACHE: "generic_cache",
};

class IndexedDBCache {
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

        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            if (storeName === STORES.PENDING_ACTIONS) {
              const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
              store.createIndex("synced", "synced", { unique: false });
              store.createIndex("timestamp", "timestamp", { unique: false });
            } else if (storeName === STORES.GENERIC_CACHE) {
              db.createObjectStore(storeName, { keyPath: "key" });
            } else {
              db.createObjectStore(storeName, { keyPath: "id" });
            }
          }
        });
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

  // Generic cache methods
  async set<T>(key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    const store = await this.getStore(STORES.GENERIC_CACHE, "readwrite");
    const entry: CacheEntry<T> & { key: string } = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    store.put(entry);
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await this.getStore(STORES.GENERIC_CACHE);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> & { key: string } | undefined;
        if (!entry) {
          resolve(null);
          return;
        }
        if (Date.now() > entry.expiresAt) {
          this.remove(key);
          resolve(null);
          return;
        }
        resolve(entry.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore(STORES.GENERIC_CACHE, "readwrite");
    store.delete(key);
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
          store.put(action);
        }
        resolve();
      });
      request.onerror = () => reject(request.error);
    });
  }

  // Status
  async getOfflineStatus(): Promise<OfflineStatus> {
    const pendingActions = await this.getPendingActions();
    const store = await this.getStore(STORES.CONFIG);
    
    return new Promise((resolve, reject) => {
      const request = store.get("last_sync");
      request.onsuccess = () => {
        resolve({
          is_offline: !navigator.onLine,
          last_sync: request.result?.value || null,
          pending_actions: pendingActions.length,
          cached_data_size: 0,
        });
      });
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

// =============================================================================
// LOCALSTORAGE CACHE (for simple key-value data)
// =============================================================================

class LocalStorageCache {
  private readonly PREFIX = "cache_";
  private readonly DEFAULT_TTL = 3600000; // 1 hour

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
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

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      localStorage.setItem(this.PREFIX + key, JSON.stringify(entry));
      logger.debug("Stored in cache", { key, ttl: ttl / 1000 });
    } catch (error) {
      logger.error("Error writing to cache", error as Error, { key });
      if (error instanceof Error && error.name === "QuotaExceededError") {
        this.clearExpired();
        try {
          localStorage.setItem(this.PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
          }));
        } catch (retryError) {
          logger.error("Failed to store after clearing", retryError as Error, { key });
        }
      }
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  clearExpired(): void {
    const now = Date.now();
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            if (now > entry.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
  }

  clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
    logger.info("Cleared all cache");
  }

  getStats(): { count: number; totalSize: number } {
    let count = 0;
    let totalSize = 0;

    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => {
        count++;
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      });

    return { count, totalSize };
  }
}

// =============================================================================
// UNIFIED EXPORTS
// =============================================================================

// IndexedDB instance for structured data
export const indexedDBCache = new IndexedDBCache();

// LocalStorage instance for simple caching
export const localStorageCache = new LocalStorageCache();

// Backward compatibility exports
export const offlineCacheService = indexedDBCache;
export const offlineCache = localStorageCache;

export default {
  indexedDB: indexedDBCache,
  localStorage: localStorageCache,
});
