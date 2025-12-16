/**
 * PATCH 190.0 - SQLite Storage Service (Enhanced)
 * 
 * Unified storage layer for offline-first architecture
 * Uses IndexedDB on web, can be replaced with SQLite on native
 * 
 * Features:
 * - Sync queue with priority
 * - Local cache with TTL
 * - Metadata storage
 * - Automatic cleanup
 */

interface StorageRecord {
  id: string;
  table: string;
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
  synced: boolean;
  priority: "high" | "medium" | "low";
  retryCount: number;
}

interface CacheRecord {
  id: string;
  table: string;
  data: any;
  cachedAt: number;
  expiresAt: number;
}

// TTL configuration by data type (in milliseconds)
const TTL_CONFIG: Record<string, number> = {
  missions: 24 * 60 * 60 * 1000,       // 24 hours
  checklists: 7 * 24 * 60 * 60 * 1000, // 7 days
  crew_members: 7 * 24 * 60 * 60 * 1000,
  vessels: 30 * 24 * 60 * 60 * 1000,   // 30 days
  default: 24 * 60 * 60 * 1000,
};

class SQLiteStorage {
  private dbName = "NautilusMobileDB";
  private dbVersion = 2;
  private isInitialized = false;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.startCleanupJob();
        console.log("SQLite storage initialized");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Sync queue store
        if (!db.objectStoreNames.contains("sync_queue")) {
          const syncStore = db.createObjectStore("sync_queue", { keyPath: "id" });
          syncStore.createIndex("by-synced", "synced");
          syncStore.createIndex("by-priority", "priority");
          syncStore.createIndex("by-table", "table");
        }

        // Local cache store
        if (!db.objectStoreNames.contains("local_cache")) {
          const cacheStore = db.createObjectStore("local_cache", { keyPath: "id" });
          cacheStore.createIndex("by-table", "table");
          cacheStore.createIndex("by-expires", "expiresAt");
        }

        // Metadata store
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }

        // Legacy store migration
        if (!db.objectStoreNames.contains("offline_queue")) {
          db.createObjectStore("offline_queue", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * Ensure database is ready
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  // ============================================
  // SYNC QUEUE OPERATIONS
  // ============================================

  /**
   * Save data to sync queue
   */
  async save(
    table: string,
    data: any,
    action: "create" | "update" | "delete" = "create",
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<string> {
    const db = await this.ensureDB();

    const record: StorageRecord = {
      id: `${table}_${data.id || Date.now()}_${Date.now()}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      synced: false,
      priority,
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      
      const request = store.put(record);
      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all unsynced records
   */
  async getUnsyncedRecords(): Promise<StorageRecord[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readonly");
      const store = transaction.objectStore("sync_queue");
      const index = store.index("by-synced");
      
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = () => {
        const records = request.result || [];
        // Sort by priority then timestamp
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        records.sort((a: StorageRecord, b: StorageRecord) => {
          const aPriority = priorityOrder[a.priority] ?? 1;
          const bPriority = priorityOrder[b.priority] ?? 1;
          const priorityDiff = aPriority - bPriority;
          if (priorityDiff !== 0) return priorityDiff;
          return a.timestamp - b.timestamp;
        });
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark record as synced
   */
  async markAsSynced(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.synced = true;
          store.put(record);
        }
        resolve();
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get queue count
   */
  async getQueueCount(): Promise<number> {
    const records = await this.getUnsyncedRecords();
    return records.length;
  }

  /**
   * Delete synced record
   */
  async deleteSyncedRecord(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all synced records
   */
  async clearSyncedRecords(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      const index = store.index("by-synced");
      
      const request = index.openCursor(IDBKeyRange.only(true));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // LOCAL CACHE OPERATIONS
  // ============================================

  /**
   * Upsert local record (for sync engine)
   */
  async upsertLocal(table: string, data: any): Promise<void> {
    const db = await this.ensureDB();
    
    const ttl = TTL_CONFIG[table] || TTL_CONFIG.default;
    const now = Date.now();
    
    const record: CacheRecord = {
      id: `${table}_${data.id}`,
      table,
      data,
      cachedAt: now,
      expiresAt: now + ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readwrite");
      const store = transaction.objectStore("local_cache");
      
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete local record
   */
  async deleteLocal(table: string, id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readwrite");
      const store = transaction.objectStore("local_cache");
      
      const request = store.delete(`${table}_${id}`);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data by ID
   */
  async getCached(table: string, id: string): Promise<any | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readonly");
      const store = transaction.objectStore("local_cache");
      
      const request = store.get(`${table}_${id}`);
      
      request.onsuccess = () => {
        const record = request.result;
        if (!record) {
          resolve(null);
          return;
        }
        
        // Check expiration
        if (record.expiresAt < Date.now()) {
          this.deleteLocal(table, id);
          resolve(null);
          return;
        }
        
        resolve(record.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached records for a table
   */
  async getAllCached(table: string): Promise<any[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readonly");
      const store = transaction.objectStore("local_cache");
      const index = store.index("by-table");
      
      const request = index.getAll(IDBKeyRange.only(table));
      
      request.onsuccess = () => {
        const now = Date.now();
        const records = (request.result || [])
          .filter((r: CacheRecord) => r.expiresAt > now)
          .map((r: CacheRecord) => r.data);
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache multiple records
   */
  async cacheBulk(table: string, records: any[]): Promise<void> {
    const db = await this.ensureDB();
    
    const ttl = TTL_CONFIG[table] || TTL_CONFIG.default;
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readwrite");
      const store = transaction.objectStore("local_cache");
      
      for (const data of records) {
        const record: CacheRecord = {
          id: `${table}_${data.id}`,
          table,
          data,
          cachedAt: now,
          expiresAt: now + ttl,
        };
        store.put(record);
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ============================================
  // METADATA OPERATIONS
  // ============================================

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["metadata"], "readwrite");
      const store = transaction.objectStore("metadata");
      
      const request = store.put({ key, value, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metadata value
   */
  async getMetadata<T = any>(key: string): Promise<T | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["metadata"], "readonly");
      const store = transaction.objectStore("metadata");
      
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // MAINTENANCE
  // ============================================

  /**
   * Start periodic cleanup job
   */
  private startCleanupJob(): void {
    setInterval(() => this.cleanupExpired(), 60000); // Every minute
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpired(): Promise<number> {
    const db = await this.ensureDB();
    const now = Date.now();
    let deleted = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["local_cache"], "readwrite");
      const store = transaction.objectStore("local_cache");
      const index = store.index("by-expires");
      
      const request = index.openCursor(IDBKeyRange.upperBound(now));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    syncQueueSize: number;
    cacheSize: number;
    pendingSync: number;
  }> {
    const db = await this.ensureDB();

    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const [syncQueueSize, cacheSize, pendingSync] = await Promise.all([
      getCount("sync_queue"),
      getCount("local_cache"),
      this.getQueueCount(),
    ]);

    return { syncQueueSize, cacheSize, pendingSync };
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        ["sync_queue", "local_cache", "metadata"],
        "readwrite"
      );
      
      transaction.objectStore("sync_queue").clear();
      transaction.objectStore("local_cache").clear();
      transaction.objectStore("metadata").clear();
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const sqliteStorage = new SQLiteStorage();
