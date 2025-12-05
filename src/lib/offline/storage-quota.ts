/**
 * Storage Quota Management - PATCH 900
 * Monitor and manage IndexedDB/Cache storage
 */

import { logger } from '@/lib/logger';

export interface StorageQuota {
  usage: number;
  quota: number;
  usagePercent: number;
  available: number;
  persisted: boolean;
}

export interface StorageBreakdown {
  indexedDB: number;
  cacheStorage: number;
  localStorage: number;
  total: number;
}

/**
 * Get current storage quota and usage
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  try {
    if (!navigator.storage?.estimate) {
      return {
        usage: 0,
        quota: 0,
        usagePercent: 0,
        available: 0,
        persisted: false,
      };
    }

    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;
    const persisted = await navigator.storage.persisted?.() || false;

    return {
      usage,
      quota,
      usagePercent,
      available: quota - usage,
      persisted,
    };
  } catch (error) {
    logger.error('[StorageQuota] Failed to get storage estimate', { error });
    return {
      usage: 0,
      quota: 0,
      usagePercent: 0,
      available: 0,
      persisted: false,
    };
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) {
      return false;
    }

    const granted = await navigator.storage.persist();
    logger.info('[StorageQuota] Persistence requested', { granted });
    return granted;
  } catch (error) {
    logger.error('[StorageQuota] Failed to request persistence', { error });
    return false;
  }
}

/**
 * Get localStorage usage
 */
function getLocalStorageSize(): number {
  let total = 0;
  
  try {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
  } catch (error) {
    logger.warn('[StorageQuota] Cannot access localStorage');
  }
  
  return total * 2; // UTF-16 encoding
}

/**
 * Get cache storage usage
 */
async function getCacheStorageSize(): Promise<number> {
  try {
    if (!('caches' in window)) return 0;
    
    const cacheNames = await caches.keys();
    let total = 0;
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.clone().blob();
          total += blob.size;
        }
      }
    }
    
    return total;
  } catch (error) {
    logger.warn('[StorageQuota] Cannot estimate cache size');
    return 0;
  }
}

/**
 * Get detailed storage breakdown
 */
export async function getStorageBreakdown(): Promise<StorageBreakdown> {
  const [quota, cacheSize] = await Promise.all([
    getStorageQuota(),
    getCacheStorageSize(),
  ]);
  
  const localStorageSize = getLocalStorageSize();
  const indexedDBSize = quota.usage - cacheSize - localStorageSize;
  
  return {
    indexedDB: Math.max(0, indexedDBSize),
    cacheStorage: cacheSize,
    localStorage: localStorageSize,
    total: quota.usage,
  };
}

/**
 * Check if storage is running low
 */
export async function isStorageLow(threshold = 0.9): Promise<boolean> {
  const quota = await getStorageQuota();
  return quota.usagePercent > threshold * 100;
}

/**
 * Clear old cache entries to free space
 */
export async function clearOldCaches(keepLast = 3): Promise<number> {
  try {
    if (!('caches' in window)) return 0;
    
    const cacheNames = await caches.keys();
    let cleared = 0;
    
    // Sort caches by name (assuming version in name)
    const sorted = [...cacheNames].sort().reverse();
    
    for (let i = keepLast; i < sorted.length; i++) {
      await caches.delete(sorted[i]);
      cleared++;
      logger.info('[StorageQuota] Deleted old cache', { name: sorted[i] });
    }
    
    return cleared;
  } catch (error) {
    logger.error('[StorageQuota] Failed to clear caches', { error });
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Storage quota monitoring
 */
class StorageMonitor {
  private intervalId: number | null = null;
  private listeners: Set<(quota: StorageQuota) => void> = new Set();
  private lastQuota: StorageQuota | null = null;

  start(intervalMs = 30000): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(async () => {
      const quota = await getStorageQuota();
      this.lastQuota = quota;
      
      // Notify if storage is low
      if (quota.usagePercent > 80) {
        logger.warn('[StorageMonitor] Storage usage high', {
          percent: quota.usagePercent.toFixed(1) + '%',
        });
      }
      
      this.listeners.forEach(listener => listener(quota));
    }, intervalMs);
    
    // Initial check
    this.checkNow();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkNow(): Promise<StorageQuota> {
    const quota = await getStorageQuota();
    this.lastQuota = quota;
    this.listeners.forEach(listener => listener(quota));
    return quota;
  }

  getLastQuota(): StorageQuota | null {
    return this.lastQuota;
  }

  subscribe(callback: (quota: StorageQuota) => void): () => void {
    this.listeners.add(callback);
    if (this.lastQuota) {
      callback(this.lastQuota);
    }
    return () => this.listeners.delete(callback);
  }
}

export const storageMonitor = new StorageMonitor();
