/**
 * Mobile Sync Manager
 * Offline-first sync with background capabilities
 */

import { supabase } from '@/integrations/supabase/client';

export interface QueuedItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  failedCount: number;
  isOnline: boolean;
}

export type SyncEventType = 'sync-start' | 'sync-complete' | 'sync-error' | 'item-synced' | 'offline' | 'online';

interface SyncEvent {
  type: SyncEventType;
  data?: unknown;
  error?: Error;
}

type EventCallback = (event: SyncEvent) => void;

const DB_NAME = 'nautilus-sync-db';
const STORE_NAME = 'sync-queue';
const DB_VERSION = 1;

class MobileSyncManager {
  private db: IDBDatabase | null = null;
  // PATCH v17 iOS PWA: Sempre assumir online
  private isOnline = true;
  private isSyncing = false;
  private eventListeners: Map<SyncEventType, Set<EventCallback>> = new Map();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initDatabase();
    this.setupNetworkListeners();
    this.startBackgroundSync();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  private setupNetworkListeners(): void {
    // PATCH v17 iOS PWA: Apenas escutar 'online' para trigger de sync
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit({ type: 'online' });
      this.syncData();
    });
    // REMOVIDO: listener 'offline' - causava falsos positivos no iOS
  }

  private startBackgroundSync(): void {
    // PATCH v17 iOS PWA: Sync a cada 30 segundos, ignorando status isOnline
    this.syncInterval = setInterval(() => {
      if (!this.isSyncing) {
        this.syncData();
      }
    }, 30000);
  }

  /**
   * Add item to sync queue
   */
  async queueItem(item: Omit<QueuedItem, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): Promise<string> {
    const queuedItem: QueuedItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    };

    await this.addToStore(queuedItem);

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncData();
    }

    return queuedItem.id;
  }

  private async addToStore(item: QueuedItem): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(item);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async removeFromStore(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async updateInStore(item: QueuedItem): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getAllFromStore(): Promise<QueuedItem[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Sync all queued items to server
   */
  async syncData(): Promise<void> {
    // PATCH v17 iOS PWA: Sempre tentar sync, ignorar status isOnline
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.emit({ type: 'sync-start' });

    try {
      const queue = await this.getAllFromStore();
      let syncedCount = 0;
      let failedCount = 0;

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await this.removeFromStore(item.id);
          syncedCount++;
          this.emit({ type: 'item-synced', data: item });
        } catch (error) {
          failedCount++;
          
          // Increment retry count
          item.retries++;
          
          if (item.retries >= item.maxRetries) {
            // Move to dead letter queue or delete
            await this.removeFromStore(item.id);
            // Error tracked via sync-error event emission below
          } else {
            await this.updateInStore(item);
          }
          
          this.emit({ type: 'sync-error', data: item, error: error as Error });
        }
      }

      this.emit({ 
        type: 'sync-complete', 
        data: { synced: syncedCount, failed: failedCount } 
      });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: QueuedItem): Promise<void> {
    const { type, table, data } = item;

    switch (type) {
      case 'create': {
        const { error } = await (supabase.from as Function)(table).insert(data);
        if (error) throw error;
        break;
      }
      case 'update': {
        const { id, ...updateData } = data;
        const { error } = await (supabase.from as Function)(table)
          .update(updateData)
          .eq('id', id as string);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await (supabase.from as Function)(table)
          .delete()
          .eq('id', data.id as string);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const queue = await this.getAllFromStore();
    const failedItems = queue.filter(item => item.retries > 0);

    return {
      isSyncing: this.isSyncing,
      pendingCount: queue.length,
      lastSyncTime: null, // Could be stored separately
      failedCount: failedItems.length,
      isOnline: this.isOnline
    };
  }

  /**
   * Event subscription
   */
  on(event: SyncEventType, callback: EventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  private emit(event: SyncEvent): void {
    this.eventListeners.get(event.type)?.forEach(cb => cb(event));
  }

  /**
   * Clear all queued items
   */
  async clearQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.eventListeners.clear();
  }
}

// Singleton
export const mobileSyncManager = new MobileSyncManager();

export default MobileSyncManager;
