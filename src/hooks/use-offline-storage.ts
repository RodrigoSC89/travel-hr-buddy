import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";

interface OfflineData {
  id: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

interface UseOfflineStorageReturn {
  isOnline: boolean;
  saveToCache: (key: string, data: unknown) => Promise<void>;
  getFromCache: (key: string) => Promise<unknown>;
  addPendingChange: (action: string, data: Record<string, unknown>) => Promise<void>;
  getPendingChanges: () => Promise<OfflineData[]>;
  syncPendingChanges: () => Promise<void>;
  clearCache: () => Promise<void>;
  cacheSize: number;
}

const DB_NAME = "NautilusOfflineDB";
const DB_VERSION = 1;
const CACHE_STORE = "cache";
const OFFLINE_STORE = "offline_actions";

export const useOfflineStorage = (): UseOfflineStorageReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheSize, setCacheSize] = useState(0);

  // Initialize IndexedDB
  const initDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create cache store
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: "key" });
          cacheStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        
        // Create offline actions store
        if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
          const offlineStore = db.createObjectStore(OFFLINE_STORE, { keyPath: "id" });
          offlineStore.createIndex("timestamp", "timestamp", { unique: false });
          offlineStore.createIndex("synced", "synced", { unique: false });
        }
      };
    });
  }, []);

  // Save data to cache
  const saveToCache = useCallback(async (key: string, data: unknown) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([CACHE_STORE], "readwrite");
      const store = transaction.objectStore(CACHE_STORE);
      
      await store.put({
        key,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.logCaughtError("Failed to save to cache", error, { key });
    }
  }, [initDB]);

  // Get data from cache
  const getFromCache = useCallback(async (key: string) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([CACHE_STORE], "readonly");
      const store = transaction.objectStore(CACHE_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      return null;
    }
  }, [initDB]);

  // Add pending change for offline sync
  const addPendingChange = useCallback(async (action: string, data: Record<string, unknown>) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([OFFLINE_STORE], "readwrite");
      const store = transaction.objectStore(OFFLINE_STORE);
      
      const offlineData: OfflineData = {
        id: `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        data,
        timestamp: Date.now(),
        synced: false
      };
      
      await store.add(offlineData);
    } catch (error) {
      logger.logCaughtError("Failed to save offline action", error, { action });
    }
  }, [initDB]);

  // Get pending changes
  const getPendingChanges = useCallback(async (): Promise<OfflineData[]> => {
    try {
      const db = await initDB();
      const transaction = db.transaction([OFFLINE_STORE], "readonly");
      const store = transaction.objectStore(OFFLINE_STORE);
      const index = store.index("synced");
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(false));
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      return [];
    }
  }, [initDB]);

  // Sync pending changes when online
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const pendingChanges = await getPendingChanges();
      
      const db = await initDB();
      const transaction = db.transaction([OFFLINE_STORE], "readwrite");
      const store = transaction.objectStore(OFFLINE_STORE);
      
      for (const change of pendingChanges) {
        try {
          // Simulate API sync - replace with actual API calls
          
          // Mark as synced
          change.synced = true;
          await store.put(change);
          
          // In a real app, you would make actual API calls here
          // await syncToAPI(change.action, change.data);
          
        } catch (error) {
          logger.logCaughtError("Failed to sync change", error, { 
            changeId: change.id, 
            action: change.action 
          });
        }
      }
      
    } catch (error) {
      logger.logCaughtError("Failed to sync pending changes", error);
    }
  }, [isOnline, getPendingChanges, initDB]);

  // Update cache size
  const updateCacheSize = useCallback(async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction([CACHE_STORE, OFFLINE_STORE], "readonly");
      
      const cacheCount = await new Promise<number>((resolve) => {
        const request = transaction.objectStore(CACHE_STORE).count();
        request.onsuccess = () => resolve(request.result);
      });
      
      const offlineCount = await new Promise<number>((resolve) => {
        const request = transaction.objectStore(OFFLINE_STORE).count();
        request.onsuccess = () => resolve(request.result);
      });
      
      setCacheSize(cacheCount + offlineCount);
    } catch (error) {
      logger.logCaughtError("Failed to update cache size", error);
    }
  }, [initDB]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      const db = await initDB();
      
      // Clear cache store
      const cacheTransaction = db.transaction([CACHE_STORE], "readwrite");
      await cacheTransaction.objectStore(CACHE_STORE).clear();
      
      // Clear synced offline actions
      const offlineTransaction = db.transaction([OFFLINE_STORE], "readwrite");
      const offlineStore = offlineTransaction.objectStore(OFFLINE_STORE);
      const index = offlineStore.index("synced");
      
      const request = index.openCursor(IDBKeyRange.only(true));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      updateCacheSize();
    } catch (error) {
      logger.logCaughtError("Failed to clear cache", error);
    }
  }, [initDB, updateCacheSize]);


  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      setTimeout(() => {
        syncPendingChanges();
      }, 1000);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial cache size calculation
    updateCacheSize();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingChanges, updateCacheSize]);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "OFFLINE_SYNC_COMPLETE") {
        updateCacheSize();
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [updateCacheSize]);

  return {
    isOnline,
    saveToCache,
    getFromCache,
    addPendingChange,
    getPendingChanges,
    syncPendingChanges,
    clearCache,
    cacheSize
  };
};