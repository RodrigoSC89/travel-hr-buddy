/**
 * Advanced Cache Manager with IndexedDB
 * TTL-based caching with offline support
 */
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { logger } from '@/lib/logger';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheDB extends DBSchema {
  'api-cache': {
    key: string;
    value: CacheEntry;
    indexes: { 'by-timestamp': number };
  };
  'user-data': {
    key: string;
    value: unknown;
  };
  'offline-queue': {
    key: string;
    value: {
      action: string;
      payload: unknown;
      timestamp: number;
      retries: number;
    };
  };
}

class CacheManager {
  private db: IDBPDatabase<CacheDB> | null = null;
  private dbName = 'nauti-one-cache';
  private version = 1;
  private initPromise: Promise<void> | null = null;
  
  async init(): Promise<void> {
    if (this.db) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this.initDB();
    return this.initPromise;
  }
  
  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>(this.dbName, this.version, {
        upgrade(db) {
          // API Cache store
          if (!db.objectStoreNames.contains('api-cache')) {
            const cacheStore = db.createObjectStore('api-cache', { keyPath: 'key' });
            cacheStore.createIndex('by-timestamp', 'timestamp');
          }
          
          // User data store
          if (!db.objectStoreNames.contains('user-data')) {
            db.createObjectStore('user-data');
          }
          
          // Offline queue store
          if (!db.objectStoreNames.contains('offline-queue')) {
            db.createObjectStore('offline-queue');
          }
        },
      });
      
      logger.debug('Cache database initialized');
      
      // Clean expired entries on init
      this.cleanExpired();
    } catch (error) {
      logger.error('Failed to initialize cache database', error as Error);
      throw error;
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.init();
      
      const cached = await this.db!.get('api-cache', key);
      
      if (!cached) return null;
      
      // Check if expired
      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        await this.delete(key);
        logger.debug(`Cache expired for key: ${key}`);
        return null;
      }
      
      logger.debug(`Cache hit for key: ${key}`);
      return cached.data as T;
    } catch (error) {
      logger.error('Cache get failed', error as Error);
      return null;
    }
  }
  
  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    try {
      await this.init();
      
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await this.db!.put('api-cache', entry);
      logger.debug(`Cache set for key: ${key}, TTL: ${ttl}ms`);
    } catch (error) {
      logger.error('Cache set failed', error as Error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await this.init();
      await this.db!.delete('api-cache', key);
      logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error('Cache delete failed', error as Error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      await this.init();
      await this.db!.clear('api-cache');
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear failed', error as Error);
    }
  }
  
  async cleanExpired(): Promise<void> {
    try {
      await this.init();
      
      const now = Date.now();
      const tx = this.db!.transaction('api-cache', 'readwrite');
      const store = tx.objectStore('api-cache');
      
      let cursor = await store.openCursor();
      let deletedCount = 0;
      
      while (cursor) {
        const entry = cursor.value;
        if (now - entry.timestamp > entry.ttl) {
          await cursor.delete();
          deletedCount++;
        }
        cursor = await cursor.continue();
      }
      
      await tx.done;
      
      if (deletedCount > 0) {
        logger.debug(`Cleaned ${deletedCount} expired cache entries`);
      }
    } catch (error) {
      logger.error('Cache cleanup failed', error as Error);
    }
  }
  
  // User data methods
  async getUserData<T>(key: string): Promise<T | null> {
    try {
      await this.init();
      const data = await this.db!.get('user-data', key);
      return data as T | null;
    } catch (error) {
      logger.error('Get user data failed', error as Error);
      return null;
    }
  }
  
  async setUserData<T>(key: string, data: T): Promise<void> {
    try {
      await this.init();
      await this.db!.put('user-data', data, key);
    } catch (error) {
      logger.error('Set user data failed', error as Error);
    }
  }
  
  // Offline queue methods
  async addToOfflineQueue(action: string, payload: unknown): Promise<string> {
    try {
      await this.init();
      
      const id = `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db!.put('offline-queue', {
        action,
        payload,
        timestamp: Date.now(),
        retries: 0,
      }, id);
      
      logger.debug(`Added to offline queue: ${action}`);
      return id;
    } catch (error) {
      logger.error('Add to offline queue failed', error as Error);
      throw error;
    }
  }
  
  async getOfflineQueue(): Promise<Array<{ id: string; action: string; payload: unknown; timestamp: number; retries: number }>> {
    try {
      await this.init();
      
      const entries: Array<{ id: string; action: string; payload: unknown; timestamp: number; retries: number }> = [];
      const tx = this.db!.transaction('offline-queue', 'readonly');
      const store = tx.objectStore('offline-queue');
      
      let cursor = await store.openCursor();
      
      while (cursor) {
        entries.push({
          id: cursor.key as string,
          ...cursor.value,
        });
        cursor = await cursor.continue();
      }
      
      await tx.done;
      return entries;
    } catch (error) {
      logger.error('Get offline queue failed', error as Error);
      return [];
    }
  }
  
  async removeFromOfflineQueue(id: string): Promise<void> {
    try {
      await this.init();
      await this.db!.delete('offline-queue', id);
      logger.debug(`Removed from offline queue: ${id}`);
    } catch (error) {
      logger.error('Remove from offline queue failed', error as Error);
    }
  }
  
  // Stats
  async getStats(): Promise<{ cacheSize: number; queueSize: number }> {
    try {
      await this.init();
      
      const cacheSize = await this.db!.count('api-cache');
      const queueSize = await this.db!.count('offline-queue');
      
      return { cacheSize, queueSize };
    } catch (error) {
      logger.error('Get cache stats failed', error as Error);
      return { cacheSize: 0, queueSize: 0 };
    }
  }
}

export const cacheManager = new CacheManager();

// Hook for using cache with React Query
export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 3600000
) {
  return {
    queryFn: async (): Promise<T> => {
      // Try cache first
      const cached = await cacheManager.get<T>(key);
      if (cached) {
        return cached;
      }
      
      // Fetch fresh data
      const data = await queryFn();
      
      // Cache for specified TTL
      await cacheManager.set(key, data, ttl);
      
      return data;
    },
  };
}
