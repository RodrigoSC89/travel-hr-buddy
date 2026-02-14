/**
 * Operational IndexedDB via Dexie
 * For critical data that shouldn't be in localStorage (vessel context, offline cache)
 */

import Dexie, { type Table } from 'dexie';

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

class OperationalDatabase extends Dexie {
  vesselContexts!: Table<VesselContext>;
  offlineCache!: Table<OfflineCacheEntry>;

  constructor() {
    super('nauti-operational');
    this.version(1).stores({
      vesselContexts: 'id, vesselId',
      offlineCache: 'id, key, expiresAt',
    });
  }

  async getCache(key: string): Promise<unknown | null> {
    const entry = await this.offlineCache.get(`cache_${key}`);
    if (!entry) return null;
    if (new Date(entry.expiresAt) < new Date()) {
      await this.offlineCache.delete(`cache_${key}`);
      return null;
    }
    return entry.value;
  }

  async setCache(key: string, value: unknown, ttlMs: number): Promise<void> {
    await this.offlineCache.put({
      id: `cache_${key}`,
      key,
      value,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    });
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date().toISOString();
    await this.offlineCache.where('expiresAt').below(now).delete();
  }
}

export const operationalDb = new OperationalDatabase();
