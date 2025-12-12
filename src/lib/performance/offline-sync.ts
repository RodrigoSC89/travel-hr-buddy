/**
 * Offline-First Sync Manager - PATCH 831
 * Handles data synchronization with offline support
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Define IndexedDB schema
interface OfflineSyncDB extends DBSchema {
  pendingOperations: {
    key: string;
    value: PendingOperation;
    indexes: {
      "by-timestamp": number;
      "by-table": string;
      "by-status": OperationStatus;
    };
  };
  cachedData: {
    key: string;
    value: CachedItem;
    indexes: {
      "by-table": string;
      "by-expiry": number;
    };
  };
  syncMetadata: {
    key: string;
    value: SyncMetadata;
  };
}

type OperationStatus = "pending" | "syncing" | "failed" | "completed";
type OperationType = "create" | "update" | "delete";

interface PendingOperation {
  id: string;
  table: string;
  type: OperationType;
  data: Record<string, unknown>;
  timestamp: number;
  status: OperationStatus;
  retryCount: number;
  error?: string;
}

interface CachedItem {
  key: string;
  table: string;
  data: unknown;
  timestamp: number;
  expiry: number;
  version: number;
}

interface SyncMetadata {
  table: string;
  lastSyncTimestamp: number;
  lastSyncVersion: number;
}

interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  cacheExpiry: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 50,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
};

class OfflineSyncManager {
  private db: IDBPDatabase<OfflineSyncDB> | null = null;
  private config: SyncConfig;
  private syncInProgress = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.init();
  }

  private async init() {
    try {
      this.db = await openDB<OfflineSyncDB>("offline-sync-db", 1, {
        upgrade(db) {
          // Pending operations store
          const pendingStore = db.createObjectStore("pendingOperations", { keyPath: "id" });
          pendingStore.createIndex("by-timestamp", "timestamp");
          pendingStore.createIndex("by-table", "table");
          pendingStore.createIndex("by-status", "status");

          // Cached data store
          const cacheStore = db.createObjectStore("cachedData", { keyPath: "key" });
          cacheStore.createIndex("by-table", "table");
          cacheStore.createIndex("by-expiry", "expiry");

          // Sync metadata store
          db.createObjectStore("syncMetadata", { keyPath: "table" });
        },
      });

      // Start periodic sync when online
      this.setupNetworkListeners();
    } catch (error) {
      console.error("Failed to initialize offline sync DB:", error);
    }
  }

  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.notifyListeners({ isOnline: true, pendingCount: 0, lastSync: null });
      this.processPendingOperations();
    });

    window.addEventListener("offline", async () => {
      const pendingCount = await this.getPendingCount();
      this.notifyListeners({ isOnline: false, pendingCount, lastSync: null });
    });
  }

  // Queue an operation for sync
  async queueOperation(
    table: string,
    type: OperationType,
    data: Record<string, unknown>
  ): Promise<string> {
    if (!this.db) throw new Error("DB not initialized");

    const operation: PendingOperation = {
      id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      table,
      type,
      data,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };

    await this.db.put("pendingOperations", operation);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processPendingOperations();
    }

    return operation.id;
  }

  // Process pending operations
  async processPendingOperations(): Promise<void> {
    if (!this.db || this.syncInProgress || !navigator.onLine) return;

    this.syncInProgress = true;
    this.notifyListeners({ isOnline: true, pendingCount: 0, lastSync: null, syncing: true });

    try {
      const tx = this.db.transaction("pendingOperations", "readwrite");
      const index = tx.store.index("by-status");
      const pending = await index.getAll("pending");

      // Process in batches
      for (let i = 0; i < pending.length; i += this.config.batchSize) {
        const batch = pending.slice(i, i + this.config.batchSize);
        await this.processBatch(batch);
      }

      const remainingCount = await this.getPendingCount();
      this.notifyListeners({
        isOnline: true,
        pendingCount: remainingCount,
        lastSync: new Date(),
        syncing: false,
      });
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processBatch(operations: PendingOperation[]): Promise<void> {
    if (!this.db) return;

    for (const op of operations) {
      try {
        // Mark as syncing
        op.status = "syncing";
        await this.db.put("pendingOperations", op);

        // Execute the operation (implement your sync logic here)
        await this.executeOperation(op);

        // Mark as completed and remove
        await this.db.delete("pendingOperations", op.id);
      } catch (error) {
        op.retryCount++;
        op.error = error instanceof Error ? error.message : "Unknown error";

        if (op.retryCount >= this.config.maxRetries) {
          op.status = "failed";
        } else {
          op.status = "pending";
        }

        await this.db.put("pendingOperations", op);
      }
    }
  }

  private async executeOperation(op: PendingOperation): Promise<void> {
    // This should be overridden or configured with actual sync logic
    // For now, we'll emit an event that can be handled externally
    const event = new CustomEvent("offline-sync-operation", {
      detail: op,
    });
    window.dispatchEvent(event);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Cache data locally
  async cacheData(
    table: string,
    key: string,
    data: unknown,
    expiry?: number
  ): Promise<void> {
    if (!this.db) return;

    const item: CachedItem = {
      key: `${table}:${key}`,
      table,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (expiry || this.config.cacheExpiry),
      version: 1,
    });

    await this.db.put("cachedData", item);
  }

  // Get cached data
  async getCachedData<T>(table: string, key: string): Promise<T | null> {
    if (!this.db) return null;

    const item = await this.db.get("cachedData", `${table}:${key}`);
    
    if (!item) return null;
    
    // Check expiry
    if (item.expiry < Date.now()) {
      await this.db.delete("cachedData", `${table}:${key}`);
      return null;
    }

    return item.data as T;
  }

  // Get all cached data for a table
  async getCachedTable<T>(table: string): Promise<T[]> {
    if (!this.db) return [];

    const index = this.db.transaction("cachedData").store.index("by-table");
    const items = await index.getAll(table);
    
    const now = Date.now();
    return items
      .filter((item) => item.expiry > now)
      .map((item) => item.data as T);
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction("cachedData", "readwrite");
    const index = tx.store.index("by-expiry");
    const now = Date.now();
    
    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }

  // Get pending operations count
  async getPendingCount(): Promise<number> {
    if (!this.db) return 0;
    
    const index = this.db.transaction("pendingOperations").store.index("by-status");
    return await index.count("pending");
  }

  // Get failed operations
  async getFailedOperations(): Promise<PendingOperation[]> {
    if (!this.db) return [];
    
    const index = this.db.transaction("pendingOperations").store.index("by-status");
    return await index.getAll("failed");
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction("pendingOperations", "readwrite");
    const index = tx.store.index("by-status");
    const failed = await index.getAll("failed");

    for (const op of failed) {
      op.status = "pending";
      op.retryCount = 0;
      op.error = undefined;
      await tx.store.put(op);
    }

    await tx.done;
    this.processPendingOperations();
  }

  // Subscribe to sync status changes
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach((callback) => callback(status));
  }
}

interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSync: Date | null;
  syncing?: boolean;
}

// Singleton instance
export const offlineSync = new OfflineSyncManager();

// React hook for offline sync
export function useOfflineSync() {
  const [status, setStatus] = React.useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSync: null,
  });

  React.useEffect(() => {
    const unsubscribe = offlineSync.subscribe(setStatus);
    
    // Get initial pending count
    offlineSync.getPendingCount().then((count) => {
      setStatus((prev) => ({ ...prev, pendingCount: count }));
    });

    return unsubscribe;
  }, []);

  return {
    ...status,
    queueOperation: offlineSync.queueOperation.bind(offlineSync),
    cacheData: offlineSync.cacheData.bind(offlineSync),
    getCachedData: offlineSync.getCachedData.bind(offlineSync),
    retryFailed: offlineSync.retryFailedOperations.bind(offlineSync),
  };
}

// Need React import for the hook
import React from "react";
