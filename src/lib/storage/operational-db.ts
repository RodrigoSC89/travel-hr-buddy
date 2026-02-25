/**
 * Operational IndexedDB via idb
 * For critical data that shouldn't be in localStorage (vessel context, offline cache)
 * Migrated from Dexie to idb to resolve TS1540 build errors
 */

import { openDB, type IDBPDatabase } from 'idb';

interface VesselContext {
  id: string;
  vesselId: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

interface OfflineCacheEntry {
  id: string;
  key: string;
  value: unknown;
  expiresAt: string;
}

const DB_NAME = 'nauti-operational';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('vesselContexts')) {
        const store = db.createObjectStore('vesselContexts', { keyPath: 'id' });
        store.createIndex('vesselId', 'vesselId');
      }
      if (!db.objectStoreNames.contains('offlineCache')) {
        const store = db.createObjectStore('offlineCache', { keyPath: 'id' });
        store.createIndex('key', 'key');
        store.createIndex('expiresAt', 'expiresAt');
      }
    },
  });
  return dbInstance;
}

class OperationalDatabase {
  async getCache(key: string): Promise<unknown | null> {
    const db = await getDB();
    const entry = await db.get('offlineCache', `cache_${key}`) as OfflineCacheEntry | undefined;
    if (!entry) return null;
    if (new Date(entry.expiresAt) < new Date()) {
      await db.delete('offlineCache', `cache_${key}`);
      return null;
    }
    return entry.value;
  }

  async setCache(key: string, value: unknown, ttlMs: number): Promise<void> {
    const db = await getDB();
    await db.put('offlineCache', {
      id: `cache_${key}`,
      key,
      value,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    });
  }

  async clearExpiredCache(): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    const all = await db.getAll('offlineCache') as OfflineCacheEntry[];
    const tx = db.transaction('offlineCache', 'readwrite');
    for (const entry of all) {
      if (entry.expiresAt < now) {
        await tx.store.delete(entry.id);
      }
    }
    await tx.done;
  }
}

export const operationalDb = new OperationalDatabase();
