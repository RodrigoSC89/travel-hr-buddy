/**
 * Offline Sync Manager
 * PATCH 850: PWA & Offline - Background sync and queue management
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface OfflineSyncDB extends DBSchema {
  pendingMutations: {
    key: string;
    value: PendingMutation;
    indexes: { "by-timestamp": number; "by-type": string };
  };
  cachedData: {
    key: string;
    value: CachedDataEntry;
    indexes: { "by-expiry": number };
  };
}

interface PendingMutation {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  priority: "high" | "medium" | "low";
}

interface CachedDataEntry {
  key: string;
  data: unknown;
  timestamp: number;
  expiry: number;
  version: string;
}

class OfflineSyncManager {
  private db: IDBPDatabase<OfflineSyncDB> | null = null;
  private syncInProgress = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineSyncDB>("maritime-offline-db", 1, {
      upgrade(db) {
        // Pending mutations store
        const mutationsStore = db.createObjectStore("pendingMutations", {
          keyPath: "id",
        });
        mutationsStore.createIndex("by-timestamp", "timestamp");
        mutationsStore.createIndex("by-type", "type");

        // Cached data store
        const cacheStore = db.createObjectStore("cachedData", {
          keyPath: "key",
        });
        cacheStore.createIndex("by-expiry", "expiry");
      },
    });

    // Setup online/offline listeners
    window.addEventListener("online", () => this.onOnline());
    window.addEventListener("offline", () => this.onOffline());

    // Register for background sync if supported
    this.registerBackgroundSync();
  }

  private async registerBackgroundSync(): Promise<void> {
    try {
      // Only register if we have a valid service worker with sync support
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && "sync" in registration) {
          // Use a short tag name to avoid "tag too long" error
          await (registration as any).sync.register("sync");
        }
      }
    } catch (error) {
      // Silently handle - background sync is an enhancement, not required
      if (error instanceof Error && !error.message.includes("without a window")) {
        console.warn("[OfflineSync] Background sync not available");
        console.warn("[OfflineSync] Background sync not available");
      }
    }
  }

  async queueMutation(mutation: Omit<PendingMutation, "id" | "timestamp" | "retryCount">): Promise<string> {
    await this.initialize();

    const id = `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entry: PendingMutation = {
      ...mutation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db!.put("pendingMutations", entry);
    this.notifyListeners({ pendingCount: await this.getPendingCount() });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingMutations();
    }

    return id;
  }

  async syncPendingMutations(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.notifyListeners({ syncing: true });

    let synced = 0;
    let failed = 0;

    try {
      const mutations = await this.db!.getAllFromIndex(
        "pendingMutations",
        "by-timestamp"
      );

      // Sort by priority
      mutations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      for (const mutation of mutations) {
        try {
          await this.executeMutation(mutation);
          await this.db!.delete("pendingMutations", mutation.id);
          synced++;
        } catch (error) {
          mutation.retryCount++;
          
          if (mutation.retryCount >= 5) {
            // Move to dead letter queue or notify user
            console.error("[OfflineSync] Mutation failed after max retries:", mutation);
            console.error("[OfflineSync] Mutation failed after max retries:", mutation);
            await this.db!.delete("pendingMutations", mutation.id);
            failed++;
          } else {
            await this.db!.put("pendingMutations", mutation);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
      this.notifyListeners({ 
        syncing: false, 
        pendingCount: await this.getPendingCount() 
      });
    }

    return { success: failed === 0, synced, failed };
  }

  private async executeMutation(mutation: PendingMutation): Promise<void> {
    const response = await fetch(mutation.endpoint, {
      method: mutation.type === "delete" ? "DELETE" : mutation.type === "create" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mutation.payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async cacheData(key: string, data: unknown, ttlSeconds = 300): Promise<void> {
    await this.initialize();

    const entry: CachedDataEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlSeconds * 1000,
      version: "1.0",
    };

    await this.db!.put("cachedData", entry);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    await this.initialize();

    const entry = await this.db!.get("cachedData", key);
    
    if (!entry) return null;
    
    if (entry.expiry < Date.now()) {
      await this.db!.delete("cachedData", key);
      return null;
    }

    return entry.data as T;
  }

  async clearExpiredCache(): Promise<number> {
    await this.initialize();

    const now = Date.now();
    const allEntries = await this.db!.getAllFromIndex("cachedData", "by-expiry");
    let cleared = 0;

    for (const entry of allEntries) {
      if (entry.expiry < now) {
        await this.db!.delete("cachedData", entry.key);
        cleared++;
      }
    }

    return cleared;
  }

  async getPendingCount(): Promise<number> {
    await this.initialize();
    return (await this.db!.count("pendingMutations"));
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(status: Partial<SyncStatus>): void {
    this.listeners.forEach(listener => listener(status as SyncStatus));
  }

  private onOnline(): void {
    this.syncPendingMutations();
  }

  private onOffline(): void {
    this.notifyListeners({ offline: true });
  }
}

interface SyncStatus {
  syncing?: boolean;
  offline?: boolean;
  pendingCount?: number;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
}

// Extend Window for service worker sync
declare global {
  interface Window {
    registration?: ServiceWorkerRegistration & {
      sync: {
        register: (tag: string) => Promise<void>;
      };
    };
  }
}

export const offlineSyncManager = new OfflineSyncManager();
