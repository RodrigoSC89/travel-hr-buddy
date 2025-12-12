// PATCH 110.0: Offline Cache Service using IndexedDB
import type { CachedRoute, CachedCrewMember, CachedVessel, PendingAction, OfflineStatus } from "@/types/offline";

const DB_NAME = "maritime_offline_db";
const DB_VERSION = 1;

// Store names
const STORES = {
  ROUTES: "routes",
  CREW: "crew",
  VESSELS: "vessels",
  PENDING_ACTIONS: "pending_actions",
  CONFIG: "config",
};

class OfflineCacheService {
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

        // Create object stores
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
      const cachedRoute = { ...route, cached_at: timestamp };
      store.put(cachedRoute);
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
      const cachedMember = { ...member, cached_at: timestamp };
      store.put(cachedMember);
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
      const cachedVessel = { ...vessel, cached_at: timestamp };
      store.put(cachedVessel);
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
    const pendingAction = {
      ...action,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    store.add(pendingAction);
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
        const lastSync = request.result?.value || null;
        resolve({
          is_offline: !navigator.onLine,
          last_sync: lastSync,
          pending_actions: pendingActions.length,
          cached_data_size: 0, // TODO: Implement actual cache size calculation using navigator.storage.estimate()
        });
      });
      request.onerror = () => reject(request.error);
    });
  }

  async updateLastSync(): Promise<void> {
    const store = await this.getStore(STORES.CONFIG, "readwrite");
    const timestamp = new Date().toISOString();
    store.put({ key: "last_sync", value: timestamp });
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    if (!this.db) return;
    
    const stores = [
      STORES.ROUTES,
      STORES.CREW,
      STORES.VESSELS,
      STORES.PENDING_ACTIONS,
      STORES.CONFIG,
    ];

    for (const storeName of stores) {
      const store = await this.getStore(storeName, "readwrite");
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
export const offlineCacheService = new OfflineCacheService();
