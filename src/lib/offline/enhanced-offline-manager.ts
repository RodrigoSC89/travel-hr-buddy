/**
 * Enhanced Offline Manager v4.0
 * IndexedDB-based offline manager optimized for 2G/Satellite (2MB/s)
 * Implements request queuing, sync, and intelligent caching
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

interface NautiOfflineDB extends DBSchema {
  requests: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      body: unknown;
      headers: Record<string, string>;
      timestamp: number;
      retries: number;
      priority: number;
      actionType: string;
    };
    indexes: { 'by-timestamp': number; 'by-priority': number };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: unknown;
      timestamp: number;
      expiresAt: number;
      accessCount: number;
      size: number;
    };
    indexes: { 'by-expires': number; 'by-access': number };
  };
  syncLog: {
    key: string;
    value: {
      id: string;
      action: string;
      status: 'pending' | 'success' | 'failed';
      timestamp: number;
      error?: string;
    };
  };
}

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
  priority: number;
  actionType: string;
}

interface SyncStatus {
  inProgress: boolean;
  pendingCount: number;
  lastSyncAt: number | null;
  errors: string[];
}

// =============================================================================
// ENHANCED OFFLINE MANAGER
// =============================================================================

class EnhancedOfflineManager {
  private db: IDBPDatabase<NautiOfflineDB> | null = null;
  private syncInProgress = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private readonly DB_NAME = 'nauti-one-offline-v4';
  private readonly DB_VERSION = 1;
  private readonly MAX_RETRIES = 5;
  private readonly SYNC_INTERVAL = 30000; // 30s
  private syncTimer: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<NautiOfflineDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Requests store
          if (!db.objectStoreNames.contains('requests')) {
            const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
            requestStore.createIndex('by-timestamp', 'timestamp');
            requestStore.createIndex('by-priority', 'priority');
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
            cacheStore.createIndex('by-expires', 'expiresAt');
            cacheStore.createIndex('by-access', 'accessCount');
          }

          // Sync log store
          if (!db.objectStoreNames.contains('syncLog')) {
            db.createObjectStore('syncLog', { keyPath: 'id' });
          }
        },
      });

      // Start periodic sync
      this.startPeriodicSync();

      // Listen for online events
      window.addEventListener('online', () => this.syncPendingRequests());

      logger.info('EnhancedOfflineManager initialized');
    } catch (error) {
      logger.error('Failed to initialize EnhancedOfflineManager', { error });
    }
  }

  private startPeriodicSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    
    this.syncTimer = setInterval(() => {
      this.syncPendingRequests();
    }, this.SYNC_INTERVAL);
  }

  // =============================================================================
  // REQUEST QUEUING
  // =============================================================================

  async queueRequest(
    url: string,
    method: string,
    body?: unknown,
    headers?: Record<string, string>,
    options?: { priority?: number; actionType?: string }
  ): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const request: QueuedRequest = {
      id,
      url,
      method,
      body: body ?? null,
      headers: headers ?? {},
      timestamp: Date.now(),
      retries: 0,
      priority: options?.priority ?? 5,
      actionType: options?.actionType ?? 'generic',
    };

    await this.db.add('requests', request);
    this.notifyListeners();

    // Try immediate sync if online
    this.syncPendingRequests();

    return id;
  }

  async getPendingCount(): Promise<number> {
    await this.init();
    if (!this.db) return 0;
    return this.db.count('requests');
  }

  async getPendingRequests(): Promise<QueuedRequest[]> {
    await this.init();
    if (!this.db) return [];
    
    // Get sorted by priority (lower = higher priority)
    return this.db.getAllFromIndex('requests', 'by-priority');
  }

  // =============================================================================
  // SYNC ENGINE
  // =============================================================================

  async syncPendingRequests(): Promise<void> {
    if (this.syncInProgress) return;
    await this.init();
    if (!this.db) return;

    this.syncInProgress = true;
    this.notifyListeners();

    const errors: string[] = [];

    try {
      const requests = await this.getPendingRequests();
      
      for (const req of requests) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for slow connections

          const response = await fetch(req.url, {
            method: req.method,
            body: req.body ? JSON.stringify(req.body) : undefined,
            headers: {
              'Content-Type': 'application/json',
              ...req.headers,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            // Success - remove from queue
            await this.db!.delete('requests', req.id);
            await this.logSync(req.id, req.actionType, 'success');
          } else if (response.status >= 400 && response.status < 500) {
            // Client error - don't retry
            await this.db!.delete('requests', req.id);
            await this.logSync(req.id, req.actionType, 'failed', `HTTP ${response.status}`);
            errors.push(`Request failed: ${req.url} (${response.status})`);
          } else {
            // Server error - increment retries
            req.retries++;
            if (req.retries >= this.MAX_RETRIES) {
              await this.db!.delete('requests', req.id);
              await this.logSync(req.id, req.actionType, 'failed', 'Max retries exceeded');
              errors.push(`Request failed after ${this.MAX_RETRIES} retries: ${req.url}`);
            } else {
              await this.db!.put('requests', req);
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          
          // Network error - increment retries
          req.retries++;
          if (req.retries >= this.MAX_RETRIES) {
            await this.db!.delete('requests', req.id);
            await this.logSync(req.id, req.actionType, 'failed', errorMsg);
            errors.push(`Request failed: ${req.url} - ${errorMsg}`);
          } else {
            await this.db!.put('requests', req);
          }
        }
      }
    } catch (error) {
      logger.error('Sync error', { error });
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async logSync(id: string, action: string, status: 'pending' | 'success' | 'failed', error?: string): Promise<void> {
    if (!this.db) return;
    
    await this.db.put('syncLog', {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      action,
      status,
      timestamp: Date.now(),
      error,
    });
  }

  // =============================================================================
  // CACHING
  // =============================================================================

  async getCached<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    const cached = await this.db.get('cache', key);
    
    if (!cached) return null;

    // Check expiration
    if (Date.now() > cached.expiresAt) {
      await this.db.delete('cache', key);
      return null;
    }

    // Update access count
    cached.accessCount++;
    await this.db.put('cache', cached);

    return cached.data as T;
  }

  async setCache<T>(key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    await this.init();
    if (!this.db) return;

    const size = new Blob([JSON.stringify(data)]).size;

    await this.db.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
      accessCount: 0,
      size,
    });
  }

  async deleteCache(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;
    await this.db.delete('cache', key);
  }

  async clearExpiredCache(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const now = Date.now();
    const expired = await this.db.getAllFromIndex('cache', 'by-expires');
    let count = 0;

    for (const entry of expired) {
      if (entry.expiresAt < now) {
        await this.db.delete('cache', entry.key);
        count++;
      }
    }

    return count;
  }

  // =============================================================================
  // STATUS & LISTENERS
  // =============================================================================

  async getStatus(): Promise<SyncStatus> {
    const pendingCount = await this.getPendingCount();
    
    return {
      inProgress: this.syncInProgress,
      pendingCount,
      lastSyncAt: null, // Could track this
      errors: [],
    };
  }

  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(cb => cb(status));
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.clear('requests');
    await this.db.clear('cache');
    await this.db.clear('syncLog');
  }

  async getCacheStats(): Promise<{
    entries: number;
    totalSize: number;
    totalSizeKB: string;
  }> {
    await this.init();
    if (!this.db) return { entries: 0, totalSize: 0, totalSizeKB: '0' };

    const entries = await this.db.getAll('cache');
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

    return {
      entries: entries.length,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  }
}

export const enhancedOfflineManager = new EnhancedOfflineManager();

// =============================================================================
// REACT HOOKS
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useEnhancedOffline() {
  const [status, setStatus] = useState<SyncStatus>({
    inProgress: false,
    pendingCount: 0,
    lastSyncAt: null,
    errors: [],
  });

  useEffect(() => {
    enhancedOfflineManager.init().then(() => {
      enhancedOfflineManager.getStatus().then(setStatus);
    });

    const unsubscribe = enhancedOfflineManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const queueRequest = useCallback(
    (url: string, method: string, body?: unknown, headers?: Record<string, string>) => {
      return enhancedOfflineManager.queueRequest(url, method, body, headers);
    },
    []
  );

  const forceSync = useCallback(() => {
    return enhancedOfflineManager.syncPendingRequests();
  }, []);

  const clearCache = useCallback(() => {
    return enhancedOfflineManager.clearExpiredCache();
  }, []);

  return {
    ...status,
    queueRequest,
    forceSync,
    clearCache,
    hasPendingSync: status.pendingCount > 0,
  };
}

export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 3600000
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await enhancedOfflineManager.getCached<T>(key);
      if (cached) {
        setData(cached);
        setIsStale(false);
      }

      // Try network
      try {
        const fresh = await fetcher();
        setData(fresh);
        setIsStale(false);
        await enhancedOfflineManager.setCache(key, fresh, ttlMs);
      } catch (fetchError) {
        if (cached) {
          setIsStale(true);
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttlMs]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await enhancedOfflineManager.deleteCache(key);
    await load();
  }, [key, load]);

  return { data, isLoading, error, isStale, refresh };
}
