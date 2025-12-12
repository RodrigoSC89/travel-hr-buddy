/**
 * Offline Queue Manager
 * Stores actions when offline and syncs when back online
 */

import { openDB, IDBPDatabase } from "idb";

interface QueuedAction {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

const DB_NAME = "offline-queue";
const STORE_NAME = "actions";
const DB_VERSION = 1;

class OfflineQueueManager {
  private db: IDBPDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: Array<(count: number) => void> = [];

  constructor() {
    this.initDB();
    this.setupNetworkListeners();
  }

  private async initDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
        }
      }
    });
  }

  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  /**
   * Add action to queue
   */
  async enqueue(
    url: string,
    method: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<string> {
    if (!this.db) await this.initDB();

    const action: QueuedAction = {
      id: crypto.randomUUID(),
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    await this.db!.put(STORE_NAME, action);
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    }

    return action.id;
  }

  /**
   * Get pending actions count
   */
  async getPendingCount(): Promise<number> {
    if (!this.db) await this.initDB();
    return this.db!.count(STORE_NAME);
  }

  /**
   * Get all pending actions
   */
  async getPendingActions(): Promise<QueuedAction[]> {
    if (!this.db) await this.initDB();
    return this.db!.getAllFromIndex(STORE_NAME, "timestamp");
  }

  /**
   * Sync all queued actions
   */
  async syncQueue(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
      const actions = await this.getPendingActions();

      for (const action of actions) {
        try {
          const response = await fetch(action.url, {
            method: action.method,
            headers: {
              "Content-Type": "application/json",
              ...action.headers
            },
            body: action.body
          });

          if (response.ok) {
            await this.db!.delete(STORE_NAME, action.id);
            success++;
          } else if (action.retryCount < action.maxRetries) {
            // Increment retry count
            await this.db!.put(STORE_NAME, {
              ...action,
              retryCount: action.retryCount + 1
            });
            failed++;
          } else {
            // Max retries reached, remove from queue
            await this.db!.delete(STORE_NAME, action.id);
            failed++;
          }
        } catch {
          if (action.retryCount < action.maxRetries) {
            await this.db!.put(STORE_NAME, {
              ...action,
              retryCount: action.retryCount + 1
            });
          }
          failed++;
        }
      }

      this.notifyListeners();
    } finally {
      this.syncInProgress = false;
    }

    return { success, failed };
  }

  /**
   * Clear all queued actions
   */
  async clearQueue(): Promise<void> {
    if (!this.db) await this.initDB();
    await this.db!.clear(STORE_NAME);
    this.notifyListeners();
  }

  /**
   * Subscribe to queue changes
   */
  onQueueChange(callback: (count: number) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private async notifyListeners() {
    const count = await this.getPendingCount();
    this.listeners.forEach(l => l(count));
  }

  /**
   * Register for background sync
   */
  async registerBackgroundSync(): Promise<boolean> {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register("sync-data");
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const offlineQueue = new OfflineQueueManager();

/**
 * Wrapper for fetch that queues failed requests
 */
export async function fetchWithOfflineSupport(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // If offline and method allows queuing
    if (!navigator.onLine && options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
      await offlineQueue.enqueue(
        url,
        options.method,
        options.body,
        options.headers as Record<string, string>
      );
      
      // Return a fake successful response
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw error;
  }
}
