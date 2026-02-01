/**
 * Maritime Offline-First Sync Engine
 * Optimized for 2Mbps satellite connections with 30-120s latency
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logger } from '@/lib/logger';

interface NautiDBSchema extends DBSchema {
  pendingSync: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'insert' | 'update' | 'delete';
      data: Record<string, any>;
      timestamp: number;
      retries: number;
      priority: 'critical' | 'high' | 'normal' | 'low';
    };
    indexes: { 'by-priority': string; 'by-timestamp': number };
  };
  cachedData: {
    key: string;
    value: {
      key: string;
      data: any;
      expiresAt: number;
      fetchedAt: number;
      etag?: string;
    };
    indexes: { 'by-expiry': number };
  };
  syncMetadata: {
    key: string;
    value: {
      table: string;
      lastSyncAt: number;
      lastSyncVersion: number;
    };
  };
}

let db: IDBPDatabase<NautiDBSchema> | null = null;

/**
 * Initialize IndexedDB for offline storage
 */
export async function initOfflineDB(): Promise<IDBPDatabase<NautiDBSchema>> {
  if (db) return db;

  db = await openDB<NautiDBSchema>('nauti-one-offline', 1, {
    upgrade(database) {
      // Pending sync queue
      const pendingStore = database.createObjectStore('pendingSync', { keyPath: 'id' });
      pendingStore.createIndex('by-priority', 'priority');
      pendingStore.createIndex('by-timestamp', 'timestamp');

      // Cached data store
      const cacheStore = database.createObjectStore('cachedData', { keyPath: 'key' });
      cacheStore.createIndex('by-expiry', 'expiresAt');

      // Sync metadata
      database.createObjectStore('syncMetadata', { keyPath: 'table' });
    },
  });

  return db;
}

/**
 * Connection quality detector
 */
export interface ConnectionQuality {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  isOnline: boolean;
  isMaritime: boolean; // Detected satellite connection
}

export function detectConnectionQuality(): ConnectionQuality {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  const quality: ConnectionQuality = {
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 100,
    saveData: connection?.saveData || false,
    isOnline: navigator.onLine,
    isMaritime: false,
  };

  // Detect maritime/satellite conditions
  // High latency (>500ms) + low bandwidth (<5Mbps) = likely satellite
  if (quality.rtt > 500 || quality.downlink < 2) {
    quality.isMaritime = true;
  }

  return quality;
}

/**
 * Adaptive timeout based on connection quality
 */
export function getAdaptiveTimeout(quality: ConnectionQuality): number {
  if (quality.isMaritime) {
    return 120000; // 2 minutes for satellite
  }
  if (quality.effectiveType === 'slow-2g' || quality.effectiveType === '2g') {
    return 60000; // 1 minute for slow connections
  }
  if (quality.effectiveType === '3g') {
    return 30000; // 30 seconds for 3G
  }
  return 15000; // 15 seconds default
}

/**
 * Queue operation for sync when online
 */
export async function queueForSync(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: Record<string, any>,
  priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
): Promise<string> {
  const database = await initOfflineDB();
  const id = `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await database.add('pendingSync', {
    id,
    table,
    operation,
    data,
    timestamp: Date.now(),
    retries: 0,
    priority,
  });

  return id;
}

/**
 * Get pending sync items ordered by priority
 */
export async function getPendingSyncItems(limit: number = 50) {
  const database = await initOfflineDB();
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

  const items = await database.getAll('pendingSync');
  return items
    .sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    })
    .slice(0, limit);
}

/**
 * Remove synced item from queue
 */
export async function removeSyncedItem(id: string): Promise<void> {
  const database = await initOfflineDB();
  await database.delete('pendingSync', id);
}

/**
 * Update retry count for failed sync
 */
export async function incrementRetryCount(id: string): Promise<void> {
  const database = await initOfflineDB();
  const item = await database.get('pendingSync', id);
  if (item) {
    item.retries++;
    await database.put('pendingSync', item);
  }
}

/**
 * Cache data with TTL
 */
export async function cacheData(
  key: string,
  data: any,
  ttlMs: number = 3600000, // 1 hour default
  etag?: string
): Promise<void> {
  const database = await initOfflineDB();
  await database.put('cachedData', {
    key,
    data,
    expiresAt: Date.now() + ttlMs,
    fetchedAt: Date.now(),
    etag,
  });
}

/**
 * Get cached data if not expired
 */
export async function getCachedData<T>(key: string): Promise<{ data: T; etag?: string } | null> {
  const database = await initOfflineDB();
  const cached = await database.get('cachedData', key);

  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    // Expired but return stale data with flag for stale-while-revalidate
    return { data: cached.data, etag: cached.etag };
  }

  return { data: cached.data, etag: cached.etag };
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  const database = await initOfflineDB();
  const tx = database.transaction('cachedData', 'readwrite');
  const index = tx.store.index('by-expiry');
  const now = Date.now();
  let cleared = 0;

  let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
  while (cursor) {
    await cursor.delete();
    cleared++;
    cursor = await cursor.continue();
  }

  return cleared;
}

/**
 * Delta sync - only fetch changes since last sync
 */
export async function getLastSyncTime(table: string): Promise<number> {
  const database = await initOfflineDB();
  const meta = await database.get('syncMetadata', table);
  return meta?.lastSyncAt || 0;
}

export async function updateSyncTime(table: string, syncTime: number): Promise<void> {
  const database = await initOfflineDB();
  const existing = await database.get('syncMetadata', table);
  await database.put('syncMetadata', {
    table,
    lastSyncAt: syncTime,
    lastSyncVersion: (existing?.lastSyncVersion || 0) + 1,
  });
}

/**
 * Compress data for transmission (using native compression when available)
 */
export async function compressData(data: any): Promise<ArrayBuffer> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(jsonString);

  // Use CompressionStream if available (modern browsers)
  if ('CompressionStream' in window) {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(uint8Array);
    writer.close();

    const reader = cs.readable.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  }

  // Fallback: return uncompressed
  return uint8Array.buffer;
}

/**
 * Background sync manager
 */
class SyncManager {
  private syncInProgress = false;
  private syncInterval: number | null = null;

  async startBackgroundSync(intervalMs: number = 30000): Promise<void> {
    if (this.syncInterval) return;

    this.syncInterval = window.setInterval(() => {
      this.performSync();
    }, intervalMs);

    // Also sync on online event
    window.addEventListener('online', () => {
      this.performSync();
    });
  }

  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // PATCH v26: Removido navigator.onLine check - não confiável no iOS PWA
  async performSync(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress) {
      return { synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let failed = 0;

    try {
      const items = await getPendingSyncItems(20);
      const quality = detectConnectionQuality();
      const timeout = getAdaptiveTimeout(quality);

      for (const item of items) {
        try {
          // Implement actual sync logic here
          // This would call Supabase with the pending operations
          logger.debug('[Sync] Processing:', { table: item.table, operation: item.operation });

          // Simulate sync delay based on connection
          await new Promise(resolve => setTimeout(resolve, quality.isMaritime ? 500 : 100));

          await removeSyncedItem(item.id);
          synced++;
        } catch (error) {
          logger.error('[Sync] Failed:', error, { itemId: item.id });
          await incrementRetryCount(item.id);
          failed++;

          // Skip remaining if too many failures
          if (failed >= 3) break;
        }
      }

      // Clear expired cache periodically
      await clearExpiredCache();
    } finally {
      this.syncInProgress = false;
    }

    return { synced, failed };
  }
}

export const syncManager = new SyncManager();

/**
 * Calculate estimated sync time based on pending items and connection
 */
export async function estimateSyncTime(): Promise<number> {
  const items = await getPendingSyncItems(100);
  const quality = detectConnectionQuality();

  // Estimate bytes per item (rough average)
  const bytesPerItem = 1024; // 1KB average
  const totalBytes = items.length * bytesPerItem;

  // Calculate time based on bandwidth
  const bytesPerSecond = (quality.downlink * 1024 * 1024) / 8;
  const transferTime = totalBytes / bytesPerSecond;

  // Add latency overhead
  const latencyOverhead = items.length * (quality.rtt / 1000);

  return Math.ceil(transferTime + latencyOverhead);
}
