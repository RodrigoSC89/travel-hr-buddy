/**
 * IndexedDB Sync Queue - PATCH 950
 * Robust offline queue using IndexedDB with worker support
 */

import { logger } from "@/lib/logger";
import { compressPayload, decompressPayload } from "./payload-compression";

const DB_NAME = "nautilus_offline_db";
const DB_VERSION = 2;
const STORES = {
  SYNC_QUEUE: "sync_queue",
  CACHE: "data_cache",
  PRIORITY_QUEUE: "priority_queue",
} as const;

interface SyncItem {
  id: string;
  operation: "insert" | "update" | "delete";
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: "critical" | "high" | "normal" | "low";
  status: "pending" | "syncing" | "completed" | "failed";
  compressed: boolean;
  chunkId?: string;
  totalChunks?: number;
  chunkIndex?: number;
}

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  compressed: boolean;
}

class IndexedDBSync {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error("[IndexedDBSync] Failed to open database", { error: request.error });
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        logger.info("[IndexedDBSync] Database initialized");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sync Queue Store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
          syncStore.createIndex("status", "status", { unique: false });
          syncStore.createIndex("priority", "priority", { unique: false });
          syncStore.createIndex("timestamp", "timestamp", { unique: false });
          syncStore.createIndex("table", "table", { unique: false });
        }

        // Cache Store
        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: "key" });
          cacheStore.createIndex("timestamp", "timestamp", { unique: false });
          cacheStore.createIndex("ttl", "ttl", { unique: false });
        }

        // Priority Queue
        if (!db.objectStoreNames.contains(STORES.PRIORITY_QUEUE)) {
          const priorityStore = db.createObjectStore(STORES.PRIORITY_QUEUE, { keyPath: "id" });
          priorityStore.createIndex("priority", "priority", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");
    
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // ============ SYNC QUEUE OPERATIONS ============

  async queueOperation(
    operation: "insert" | "update" | "delete",
    table: string,
    data: any,
    priority: "critical" | "high" | "normal" | "low" = "normal"
  ): Promise<string> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    
    const item: SyncItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      operation,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      status: "pending",
      compressed: false,
    };

    // Compress large payloads
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 1000) {
      const compressed = compressPayload(data);
      item.data = compressed;
      item.compressed = true;
    }

    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => {
        logger.debug("[IndexedDBSync] Queued operation", { id: item.id, table, operation });
        resolve(item.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(limit = 50): Promise<SyncItem[]> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readonly");
    const index = store.index("status");
    
    return new Promise((resolve, reject) => {
      const items: SyncItem[] = [];
      const request = index.openCursor(IDBKeyRange.only("pending"));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && items.length < limit) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          // Sort by priority and timestamp
          items.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
          });
          resolve(items);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateOperationStatus(id: string, status: SyncItem["status"], incrementRetry = false): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          resolve();
          return;
        }
        
        item.status = status;
        if (incrementRetry) item.retryCount++;
        
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearCompletedOperations(): Promise<number> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readwrite");
    const index = store.index("status");
    
    return new Promise((resolve, reject) => {
      let cleared = 0;
      const request = index.openCursor(IDBKeyRange.only("completed"));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cleared++;
          cursor.continue();
        } else {
          logger.info("[IndexedDBSync] Cleared completed operations", { count: cleared });
          resolve(cleared);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getQueueStats(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
    byCritical: number;
    byHigh: number;
    byNormal: number;
    byLow: number;
  }> {
    const store = await this.getStore(STORES.SYNC_QUEUE, "readonly");
    
    return new Promise((resolve, reject) => {
      const stats = {
        total: 0,
        pending: 0,
        syncing: 0,
        completed: 0,
        failed: 0,
        byCritical: 0,
        byHigh: 0,
        byNormal: 0,
        byLow: 0,
      };
      
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as SyncItem;
          stats.total++;
          stats[item.status as keyof typeof stats]++;
          
          if (item.priority === "critical") stats.byCritical++;
          else if (item.priority === "high") stats.byHigh++;
          else if (item.priority === "normal") stats.byNormal++;
          else if (item.priority === "low") stats.byLow++;
          
          cursor.continue();
        } else {
          resolve(stats);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============ CACHE OPERATIONS ============

  async cacheData(key: string, data: any, ttl = 3600000): Promise<void> {
    const store = await this.getStore(STORES.CACHE, "readwrite");
    
    let compressed = false;
    let storedData = data;
    
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 500) {
      storedData = compressPayload(data);
      compressed = true;
    }
    
    const item: CacheItem = {
      key,
      data: storedData,
      timestamp: Date.now(),
      ttl,
      compressed,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const store = await this.getStore(STORES.CACHE, "readonly");
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const item = request.result as CacheItem | undefined;
        
        if (!item) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (Date.now() > item.timestamp + item.ttl) {
          // Async cleanup
          this.removeCachedData(key).catch(() => {});
          resolve(null);
          return;
        }
        
        // Decompress if needed
        let data = item.data;
        if (item.compressed) {
          data = decompressPayload(item.data);
        }
        
        resolve(data as T);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeCachedData(key: string): Promise<void> {
    const store = await this.getStore(STORES.CACHE, "readwrite");
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<number> {
    const store = await this.getStore(STORES.CACHE, "readwrite");
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      let cleared = 0;
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as CacheItem;
          if (now > item.timestamp + item.ttl) {
            cursor.delete();
            cleared++;
          }
          cursor.continue();
        } else {
          resolve(cleared);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============ UTILITY ============

  async getStorageUsage(): Promise<{ syncQueue: number; cache: number; total: number }> {
    if (!navigator.storage?.estimate) {
      return { syncQueue: 0, cache: 0, total: 0 };
    }
    
    const estimate = await navigator.storage.estimate();
    return {
      syncQueue: 0, // Would need to iterate
      cache: 0,
      total: estimate.usage || 0,
    };
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;
    
    const transaction = this.db.transaction(Object.values(STORES), "readwrite");
    
    for (const storeName of Object.values(STORES)) {
      transaction.objectStore(storeName).clear();
    }
    
    logger.info("[IndexedDBSync] All stores cleared");
  }
}

export const indexedDBSync = new IndexedDBSync();

// Initialize on module load
if (typeof window !== "undefined") {
  indexedDBSync.init().catch(console.error);
}
