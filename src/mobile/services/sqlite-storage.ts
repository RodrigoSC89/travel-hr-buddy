/**
 * PATCH 161.0 - SQLite Storage Service
 * Handles offline data storage for mobile app using SQLite
 */

interface StorageRecord {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
  priority: 'high' | 'medium' | 'low';
}

class SQLiteStorage {
  private dbName = 'nautilus_mobile.db';
  private isInitialized = false;

  /**
   * Initialize SQLite database
   * Note: Using IndexedDB as universal storage for web and mobile compatibility
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Using IndexedDB for cross-platform compatibility
    // In production mobile apps, this can be replaced with native SQLite plugin
    this.isInitialized = true;
    console.log('Storage initialized (IndexedDB)');
  }

  /**
   * Save data locally with priority
   */
  async save(
    table: string,
    data: any,
    action: 'create' | 'update' | 'delete' = 'create',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    await this.initialize();

    const record: StorageRecord = {
      id: `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      synced: false,
      priority
    };

    // Store in IndexedDB for web compatibility
    await this.storeInIndexedDB('offline_queue', record);
    
    return record.id;
  }

  /**
   * Get all unsynced records
   */
  async getUnsyncedRecords(): Promise<StorageRecord[]> {
    await this.initialize();

    const records = await this.getAllFromIndexedDB('offline_queue');
    return records
      .filter((r: StorageRecord) => !r.synced)
      .sort((a: StorageRecord, b: StorageRecord) => {
        // Sort by priority first, then timestamp
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });
  }

  /**
   * Mark record as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await this.initialize();

    const record = await this.getFromIndexedDB('offline_queue', id);
    if (record) {
      record.synced = true;
      await this.storeInIndexedDB('offline_queue', record);
    }
  }

  /**
   * Delete synced record
   */
  async deleteSyncedRecord(id: string): Promise<void> {
    await this.initialize();
    await this.deleteFromIndexedDB('offline_queue', id);
  }

  /**
   * Get queue count
   */
  async getQueueCount(): Promise<number> {
    await this.initialize();
    const records = await this.getUnsyncedRecords();
    return records.length;
  }

  /**
   * Clear all synced records
   */
  async clearSyncedRecords(): Promise<void> {
    await this.initialize();
    const records = await this.getAllFromIndexedDB('offline_queue');
    
    for (const record of records) {
      if (record.synced) {
        await this.deleteFromIndexedDB('offline_queue', record.id);
      }
    }
  }

  // IndexedDB helper methods for web compatibility
  private async storeInIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NautilusMobileDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.put(data);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  private async getFromIndexedDB(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NautilusMobileDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  private async getAllFromIndexedDB(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NautilusMobileDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  private async deleteFromIndexedDB(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NautilusMobileDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }
}

export const sqliteStorage = new SQLiteStorage();
