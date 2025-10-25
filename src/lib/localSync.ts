/**
 * PATCH 137.0 - Local Sync Strategy with IndexedDB
 * Provides offline data persistence and synchronization capabilities
 */

const DB_NAME = 'nautilus-offline-db';
const DB_VERSION = 1;

export interface OfflineRecord {
  id?: number;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

class LocalSyncManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline actions queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('synced', 'synced', { unique: false });
          syncStore.createIndex('table', 'table', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('dataCache')) {
          const cacheStore = db.createObjectStore('dataCache', { 
            keyPath: 'key' 
          });
          cacheStore.createIndex('table', 'table', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save data locally when offline
   */
  async saveLocally(data: any, table: string, action: 'create' | 'update' | 'delete' = 'create'): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const record: OfflineRecord = {
        table,
        action,
        data,
        timestamp: Date.now(),
        synced: false
      };

      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, table: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['dataCache'], 'readwrite');
      const store = transaction.objectStore('dataCache');

      const cacheRecord = {
        key,
        table,
        data,
        timestamp: Date.now()
      };

      const request = store.put(cacheRecord);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data for offline access
   */
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['dataCache'], 'readonly');
      const store = transaction.objectStore('dataCache');

      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all unsynced records
   */
  async getUnsyncedRecords(): Promise<OfflineRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('synced');

      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark a record as synced
   */
  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const request = store.get(id);
      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record.synced = true;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a synced record
   */
  async deleteSyncedRecord(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all synced records (cleanup)
   */
  async clearSyncedRecords(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('synced');

      const request = index.openCursor(true);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync queue count
   */
  async getQueueCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('synced');

      const request = index.count(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const localSync = new LocalSyncManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  localSync.init().catch(console.error);
}
