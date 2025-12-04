/**
 * PATCH 800: Offline Sync Queue
 * Queues actions when offline and syncs when back online
 */
import { openDB, IDBPDatabase } from "idb";
import { logger } from "@/lib/logger";

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

const DB_NAME = "nautilus-offline";
const STORE_NAME = "sync-queue";
const CACHE_STORE = "data-cache";

let db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;
  
  db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      // Sync queue store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("type", "type");
      }
      
      // Data cache store
      if (!database.objectStoreNames.contains(CACHE_STORE)) {
        const cache = database.createObjectStore(CACHE_STORE, { keyPath: "key" });
        cache.createIndex("expiry", "expiry");
      }
    },
  });
  
  return db;
}

/**
 * Add an action to the sync queue
 */
export async function queueAction(
  type: string,
  payload: any,
  maxRetries: number = 3
): Promise<string> {
  const database = await getDB();
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const action: QueuedAction = {
    id,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
    maxRetries,
  };
  
  await database.put(STORE_NAME, action);
  logger.info(`[SyncQueue] Queued action: ${type}`, { id });
  
  return id;
}

/**
 * Get all pending actions
 */
export async function getPendingActions(): Promise<QueuedAction[]> {
  const database = await getDB();
  return database.getAllFromIndex(STORE_NAME, "timestamp");
}

/**
 * Remove an action from the queue
 */
export async function removeAction(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORE_NAME, id);
  logger.info(`[SyncQueue] Removed action: ${id}`);
}

/**
 * Update retry count for an action
 */
export async function incrementRetry(id: string): Promise<boolean> {
  const database = await getDB();
  const action = await database.get(STORE_NAME, id);
  
  if (!action) return false;
  
  action.retries += 1;
  
  if (action.retries >= action.maxRetries) {
    await database.delete(STORE_NAME, id);
    logger.warn(`[SyncQueue] Action failed after max retries: ${id}`);
    return false;
  }
  
  await database.put(STORE_NAME, action);
  return true;
}

/**
 * Cache data locally
 */
export async function cacheData(
  key: string,
  data: any,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<void> {
  const database = await getDB();
  
  await database.put(CACHE_STORE, {
    key,
    data,
    expiry: Date.now() + ttlMs,
    timestamp: Date.now(),
  });
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const database = await getDB();
  const cached = await database.get(CACHE_STORE, key);
  
  if (!cached) return null;
  
  if (cached.expiry < Date.now()) {
    await database.delete(CACHE_STORE, key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  const database = await getDB();
  const tx = database.transaction(CACHE_STORE, "readwrite");
  const store = tx.objectStore(CACHE_STORE);
  const index = store.index("expiry");
  
  let cleared = 0;
  const now = Date.now();
  
  let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
  
  while (cursor) {
    await cursor.delete();
    cleared++;
    cursor = await cursor.continue();
  }
  
  await tx.done;
  
  if (cleared > 0) {
    logger.info(`[SyncQueue] Cleared ${cleared} expired cache entries`);
  }
  
  return cleared;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pendingCount: number;
  cacheSize: number;
}> {
  const database = await getDB();
  
  const pendingCount = await database.count(STORE_NAME);
  const cacheSize = await database.count(CACHE_STORE);
  
  return { pendingCount, cacheSize };
}
