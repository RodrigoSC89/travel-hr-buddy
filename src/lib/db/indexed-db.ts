/**
 * IndexedDB Unified Wrapper - PATCH 1000
 * Consolidated IndexedDB access layer for the entire application
 * 
 * This is a facade that unifies:
 * - src/lib/offline/indexeddb-sync.ts (sync queue)
 * - src/services/unified/offline-cache.service.ts (entity cache)
 * 
 * Provides a simple API for offline-first data operations
 */

import { indexedDBSync } from '@/lib/offline/indexeddb-sync';
import { indexedDBCache } from '@/services/unified/offline-cache.service';
import { logger } from '@/lib/logger';
import type {
  CachedRoute, 
  CachedCrewMember, 
  CachedVessel, 
  PendingAction,
  OfflineStatus 
} from '@/types/offline';

/**
 * Unified Offline Database Interface
 * Provides consistent API for all offline operations
 */
export const offlineDB = {
  // ============ INITIALIZATION ============
  async init(): Promise<void> {
    await Promise.all([
      indexedDBSync.init(),
      indexedDBCache.initialize(),
    ]);
    logger.debug('✅ Offline DB initialized');
  },

  // ============ GENERIC CRUD ============
  async save<T extends Record<string, any>>(
    store: string,
    data: T
  ): Promise<T> {
    const enriched = {
      ...data,
      id: data.id || `${store}-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      synced: false,
      lastModified: Date.now(),
    };
    
    // Cache locally
    await indexedDBCache.set(
      `${store}:${enriched.id}`,
      enriched,
      24 * 60 * 60 * 1000 // 24 hours TTL
    );
    
    // Queue for sync
    await indexedDBSync.queueOperation(
      'insert',
      store,
      enriched,
      'normal'
    );
    
    return enriched as T;
  },

  async get<T>(store: string, id: string): Promise<T | null> {
    return indexedDBCache.get<T>(`${store}:${id}`);
  },

  async update<T extends Record<string, any>>(
    store: string,
    id: string,
    data: Partial<T>
  ): Promise<T | null> {
    const existing = await this.get<T>(store, id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      id,
      synced: false,
      lastModified: Date.now(),
    };

    await indexedDBCache.set(
      `${store}:${id}`,
      updated,
      24 * 60 * 60 * 1000
    );

    await indexedDBSync.queueOperation(
      'update',
      store,
      updated,
      'normal'
    );

    return updated as T;
  },

  async delete(store: string, id: string): Promise<void> {
    await indexedDBCache.remove(`${store}:${id}`);
    await indexedDBSync.queueOperation(
      'delete',
      store,
      { id },
      'normal'
    );
  },

  // ============ SPECIALIZED STORES ============
  
  // Vessels
  async cacheVessels(vessels: CachedVessel[]): Promise<void> {
    return indexedDBCache.cacheVessels(vessels);
  },

  async getVessels(): Promise<CachedVessel[]> {
    return indexedDBCache.getVessels();
  },

  // Crew
  async cacheCrew(crew: CachedCrewMember[]): Promise<void> {
    return indexedDBCache.cacheCrew(crew);
  },

  async getCrew(): Promise<CachedCrewMember[]> {
    return indexedDBCache.getCrew();
  },

  // Routes
  async cacheRoutes(routes: CachedRoute[]): Promise<void> {
    return indexedDBCache.cacheRoutes(routes);
  },

  async getRoutes(): Promise<CachedRoute[]> {
    return indexedDBCache.getRoutes();
  },

  // ============ SYNC QUEUE ============
  async queueAction(
    action: 'insert' | 'update' | 'delete',
    table: string,
    data: any,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    return indexedDBSync.queueOperation(action, table, data, priority);
  },

  async getPendingActions(): Promise<PendingAction[]> {
    const items = await indexedDBSync.getPendingOperations(100);
    return items.map(item => ({
      id: item.id,
      type: item.operation as any,
      table: item.table,
      data: item.data,
      timestamp: new Date(item.timestamp).toISOString(),
      synced: item.status === 'completed',
    }));
  },

  async getQueueStats() {
    return indexedDBSync.getQueueStats();
  },

  // ============ STATUS ============
  async getOfflineStatus(): Promise<OfflineStatus> {
    return indexedDBCache.getOfflineStatus();
  },

  async updateLastSync(): Promise<void> {
    return indexedDBCache.updateLastSync();
  },

  // ============ CLEANUP ============
  async clearExpired(): Promise<number> {
    return indexedDBSync.clearExpiredCache();
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      indexedDBSync.clearAll(),
      indexedDBCache.clearAll(),
    ]);
  },

  async clearCompleted(): Promise<number> {
    return indexedDBSync.clearCompletedOperations();
  },

  // ============ STORAGE ============
  async getStorageUsage() {
    return indexedDBSync.getStorageUsage();
  },
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  offlineDB.init().catch(console.error);
}

export default offlineDB;
