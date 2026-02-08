/**
 * PATCH 837: Offline-First Sync System
 * Revolutionary offline capabilities for maritime environments
 * DEBT-FIX: Removed (supabase as any) - uses typed dynamic table access
 */

import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database["public"]["Tables"];

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  priority: 'high' | 'medium' | 'low';
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  version: number;
}

const DB_NAME = 'nautica-offline-db';
const DB_VERSION = 1;

class OfflineSyncManager {
  private db: IDBPDatabase | null = null;
  private syncInProgress = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('table', 'table');
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
          cacheStore.createIndex('ttl', 'ttl');
        }

        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
      },
    });

    window.addEventListener('online', () => this.onOnline());

    this.startPeriodicSync();
  }

  async queueSync(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    if (!this.db) await this.init();

    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    await this.db!.put('syncQueue', syncItem);
    this.notifyListeners({ type: 'queued', item: syncItem });

    if (navigator.onLine) {
      this.processQueue();
    }

    return syncItem.id;
  }

  async cacheData(key: string, data: any, ttlMinutes = 60): Promise<void> {
    if (!this.db) await this.init();

    const cached: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
      version: 1,
    };

    await this.db!.put('cache', cached);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    const cached = await this.db!.get('cache', key) as CachedData | undefined;

    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      await this.db!.delete('cache', key);
      return null;
    }

    return cached.data as T;
  }

  async processQueue(): Promise<void> {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    this.notifyListeners({ type: 'syncing' });

    try {
      if (!this.db) await this.init();

      const items = await this.db!.getAllFromIndex('syncQueue', 'priority') as SyncQueueItem[];
      
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const sortedItems = items.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] ?? 5;
        const bPriority = priorityOrder[b.priority] ?? 5;
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return a.timestamp - b.timestamp;
      });

      for (const item of sortedItems) {
        try {
          await this.syncItem(item);
          await this.db!.delete('syncQueue', item.id);
          this.notifyListeners({ type: 'synced', item });
        } catch (error) {
          item.retries++;
          if (item.retries >= 3) {
            this.notifyListeners({ type: 'failed', item, error });
            await this.db!.delete('syncQueue', item.id);
          } else {
            await this.db!.put('syncQueue', item);
          }
        }
      }

      this.notifyListeners({ type: 'complete' });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use typed dynamic table access
    const table = supabase.from(item.table as TableName);

    switch (item.action) {
      case 'create':
        await table.insert(item.data);
        break;
      case 'update':
        await table.update(item.data).eq('id', item.data.id);
        break;
      case 'delete':
        await table.delete().eq('id', item.data.id);
        break;
    }
  }

  async getQueueStatus(): Promise<{ pending: number; failed: number }> {
    if (!this.db) await this.init();

    const items = await this.db!.getAll('syncQueue');
    return {
      pending: items.filter(i => i.retries < 3).length,
      failed: items.filter(i => i.retries >= 3).length,
    };
  }

  async clearExpiredCache(): Promise<number> {
    if (!this.db) await this.init();

    const allCached = await this.db!.getAll('cache');
    let cleared = 0;

    for (const item of allCached) {
      if (Date.now() - item.timestamp > item.ttl) {
        await this.db!.delete('cache', item.key);
        cleared++;
      }
    }

    return cleared;
  }

  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(cb => cb(status));
  }

  private onOnline(): void {
    this.notifyListeners({ type: 'online' });
    this.processQueue();
  }

  private onOffline(): void {
    this.notifyListeners({ type: 'offline' });
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.processQueue();
      }
    }, 30000);
  }
}

type SyncStatus = 
  | { type: 'online' }
  | { type: 'offline' }
  | { type: 'syncing' }
  | { type: 'queued'; item: SyncQueueItem }
  | { type: 'synced'; item: SyncQueueItem }
  | { type: 'failed'; item: SyncQueueItem; error: any }
  | { type: 'complete' };

export const offlineSync = new OfflineSyncManager();

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [queueStatus, setQueueStatus] = useState({ pending: 0, failed: 0 });

  useEffect(() => {
    offlineSync.init();
    
    const unsubscribe = offlineSync.subscribe(setStatus);
    
    const updateQueueStatus = async () => {
      const status = await offlineSync.getQueueStatus();
      setQueueStatus(status);
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    status,
    queueStatus,
    queueSync: offlineSync.queueSync.bind(offlineSync),
    cacheData: offlineSync.cacheData.bind(offlineSync),
    getCachedData: offlineSync.getCachedData.bind(offlineSync),
    processQueue: offlineSync.processQueue.bind(offlineSync),
  };
}
