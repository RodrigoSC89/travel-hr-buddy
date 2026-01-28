/**
 * PWA Offline Manager - PROMPT 5
 * Comprehensive offline-first functionality
 */

import { logger } from "@/lib/logger";

interface CachedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
  priority: "high" | "medium" | "low";
}

interface SyncState {
  pendingRequests: number;
  lastSync: number;
  isOnline: boolean;
  syncInProgress: boolean;
}

class OfflineManager {
  private dbName = "nautilus-offline-db";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncState: SyncState = {
    pendingRequests: 0,
    lastSync: 0,
    isOnline: navigator.onLine,
    syncInProgress: false,
  };
  private listeners: Set<(state: SyncState) => void> = new Set();

  /**
   * Initialize the offline manager
   */
  async init(): Promise<void> {
    await this.initDB();
    this.setupNetworkListeners();
    await this.updatePendingCount();
    logger.info("Offline Manager initialized");
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Pending requests store
        if (!db.objectStoreNames.contains("pendingRequests")) {
          const store = db.createObjectStore("pendingRequests", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("priority", "priority");
        }

        // Cached data store
        if (!db.objectStoreNames.contains("cachedData")) {
          const store = db.createObjectStore("cachedData", { keyPath: "key" });
          store.createIndex("expiry", "expiry");
        }

        // Offline actions store
        if (!db.objectStoreNames.contains("offlineActions")) {
          const store = db.createObjectStore("offlineActions", { keyPath: "id" });
          store.createIndex("module", "module");
          store.createIndex("timestamp", "timestamp");
        }
      };
    });
  }

  /**
   * Setup network listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.syncState.isOnline = true;
      this.notifyListeners();
      this.syncPendingRequests();
    });

    window.addEventListener("offline", () => {
      this.syncState.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Queue a request for offline sync
   */
  async queueRequest(
    url: string,
    method: string,
    body?: unknown,
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<string> {
    const request: CachedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
      timestamp: Date.now(),
      retries: 0,
      priority,
    };

    await this.saveToStore("pendingRequests", request);
    await this.updatePendingCount();
    
    // Try to sync immediately if online
    if (this.syncState.isOnline) {
      this.syncPendingRequests();
    }

    return request.id;
  }

  /**
   * Cache data for offline access
   */
  async cacheData(
    key: string,
    data: unknown,
    ttl: number = 3600000 // 1 hour default
  ): Promise<void> {
    const entry = {
      key,
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now(),
    };

    await this.saveToStore("cachedData", entry);
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    const entry = await this.getFromStore<{ key: string; data: T; expiry: number }>(
      "cachedData",
      key
    );

    if (!entry) return null;
    if (entry.expiry < Date.now()) {
      await this.deleteFromStore("cachedData", key);
      return null;
    }

    return entry.data;
  }

  /**
   * Sync pending requests
   */
  async syncPendingRequests(): Promise<void> {
    if (this.syncState.syncInProgress || !this.syncState.isOnline) return;

    this.syncState.syncInProgress = true;
    this.notifyListeners();

    try {
      const requests = await this.getAllFromStore<CachedRequest>("pendingRequests");
      
      // Sort by priority and timestamp
      requests.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });

      for (const request of requests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });

          if (response.ok) {
            await this.deleteFromStore("pendingRequests", request.id);
          } else if (response.status >= 500) {
            // Server error, retry later
            await this.incrementRetry(request);
          } else {
            // Client error, remove from queue
            await this.deleteFromStore("pendingRequests", request.id);
            logger.warn(`Request failed with ${response.status}`, { url: request.url });
          }
        } catch (error) {
          // Network error, keep in queue
          await this.incrementRetry(request);
        }
      }

      this.syncState.lastSync = Date.now();
    } finally {
      this.syncState.syncInProgress = false;
      await this.updatePendingCount();
      this.notifyListeners();
    }
  }

  /**
   * Get sync state
   */
  getState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: SyncState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    await this.clearStore("pendingRequests");
    await this.clearStore("cachedData");
    await this.clearStore("offlineActions");
    await this.updatePendingCount();
  }

  // IndexedDB helpers
  private async saveToStore(storeName: string, data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async incrementRetry(request: CachedRequest): Promise<void> {
    request.retries++;
    if (request.retries > 5) {
      await this.deleteFromStore("pendingRequests", request.id);
      logger.error(`Request permanently failed after 5 retries`, { url: request.url });
    } else {
      await this.saveToStore("pendingRequests", request);
    }
  }

  private async updatePendingCount(): Promise<void> {
    const requests = await this.getAllFromStore("pendingRequests");
    this.syncState.pendingRequests = requests.length;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getState()));
  }
}

export const offlineManager = new OfflineManager();
