/**
 * IndexedDB Optimizer - PATCH 975
 * Smart indexing and fast access for local data
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  accessCount: number;
  size: number;
  module: string;
  expiresAt: number;
}

interface SearchIndex {
  field: string;
  values: Map<string, string[]>; // value -> keys mapping
}

interface OptimizedDBSchema extends DBSchema {
  cache: {
    key: string;
    value: CacheEntry;
    indexes: {
      'by-module': string;
      'by-timestamp': number;
      'by-expires': number;
      'by-access': number;
    };
  };
  search_index: {
    key: string;
    value: {
      module: string;
      field: string;
      value: string;
      keys: string[];
    };
    indexes: {
      'by-module-field': [string, string];
      'by-value': string;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      module: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retries: number;
      priority: number;
    };
    indexes: {
      'by-module': string;
      'by-priority': number;
      'by-timestamp': number;
    };
  };
}

class IndexedDBOptimizer {
  private db: IDBPDatabase<OptimizedDBSchema> | null = null;
  private readonly DB_NAME = 'app_optimized_cache';
  private readonly DB_VERSION = 3;
  private searchCache: Map<string, any[]> = new Map();
  
  /**
   * Initialize database with indexes
   */
  async init(): Promise<void> {
    if (this.db) return;
    
    try {
      this.db = await openDB<OptimizedDBSchema>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion) {
          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
            cacheStore.createIndex('by-module', 'module');
            cacheStore.createIndex('by-timestamp', 'timestamp');
            cacheStore.createIndex('by-expires', 'expiresAt');
            cacheStore.createIndex('by-access', 'accessCount');
          }
          
          // Search index store
          if (!db.objectStoreNames.contains('search_index')) {
            const searchStore = db.createObjectStore('search_index', { keyPath: 'id', autoIncrement: true } as any);
            searchStore.createIndex('by-module-field', ['module', 'field']);
            searchStore.createIndex('by-value', 'value');
          }
          
          // Sync queue store
          if (!db.objectStoreNames.contains('sync_queue')) {
            const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            syncStore.createIndex('by-module', 'module');
            syncStore.createIndex('by-priority', 'priority');
            syncStore.createIndex('by-timestamp', 'timestamp');
          }
        }
      });
      
      console.log('[IndexedDBOptimizer] Database initialized');
    } catch (e) {
      console.error('[IndexedDBOptimizer] Failed to initialize:', e);
    }
  }
  
  /**
   * Store data with automatic indexing
   */
  async set(
    key: string,
    value: any,
    options: {
      module?: string;
      ttlMs?: number;
      indexFields?: string[];
    } = {}
  ): Promise<void> {
    await this.init();
    if (!this.db) return;
    
    const { module = 'default', ttlMs = 24 * 60 * 60 * 1000, indexFields = [] } = options;
    
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.estimateSize(value),
      module,
      expiresAt: Date.now() + ttlMs
    };
    
    await this.db.put('cache', entry);
    
    // Build search indexes
    if (indexFields.length > 0 && typeof value === 'object') {
      await this.buildIndexes(key, value, module, indexFields);
    }
  }
  
  /**
   * Get data with access tracking
   */
  async get<T = any>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;
    
    const entry = await this.db.get('cache', key);
    if (!entry) return null;
    
    // Check expiration
    if (entry.expiresAt < Date.now()) {
      await this.db.delete('cache', key);
      return null;
    }
    
    // Update access count
    entry.accessCount++;
    await this.db.put('cache', entry);
    
    return entry.value as T;
  }
  
  /**
   * Fast search using indexes
   */
  async search(
    module: string,
    field: string,
    query: string,
    options: { limit?: number; exact?: boolean } = {}
  ): Promise<any[]> {
    await this.init();
    if (!this.db) return [];
    
    const { limit = 50, exact = false } = options;
    const cacheKey = `${module}:${field}:${query}:${exact}`;
    
    // Check search cache
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }
    
    const tx = this.db.transaction('search_index', 'readonly');
    const index = tx.store.index('by-module-field');
    
    const results: any[] = [];
    const seenKeys = new Set<string>();
    
    let cursor = await index.openCursor([module, field]);
    
    while (cursor && results.length < limit) {
      const record = cursor.value;
      const matches = exact 
        ? record.value === query
        : record.value.toLowerCase().includes(query.toLowerCase());
      
      if (matches) {
        for (const key of record.keys) {
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            const data = await this.get(key);
            if (data) {
              results.push(data);
            }
          }
        }
      }
      
      cursor = await cursor.continue();
    }
    
    // Cache search results for 30 seconds
    this.searchCache.set(cacheKey, results);
    setTimeout(() => this.searchCache.delete(cacheKey), 30000);
    
    return results;
  }
  
  /**
   * Get data by module with pagination
   */
  async getByModule(
    module: string,
    options: { offset?: number; limit?: number; sortBy?: 'timestamp' | 'access' } = {}
  ): Promise<any[]> {
    await this.init();
    if (!this.db) return [];
    
    const { offset = 0, limit = 50, sortBy = 'timestamp' } = options;
    
    const tx = this.db.transaction('cache', 'readonly');
    const index = tx.store.index('by-module');
    
    let cursor = await index.openCursor(module, sortBy === 'access' ? 'prev' : 'prev');
    const results: any[] = [];
    let skipped = 0;
    
    while (cursor && results.length < limit) {
      if (skipped >= offset) {
        if (cursor.value.expiresAt > Date.now()) {
          results.push(cursor.value.value);
        }
      } else {
        skipped++;
      }
      cursor = await cursor.continue();
    }
    
    return results;
  }
  
  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<number> {
    await this.init();
    if (!this.db) return 0;
    
    const tx = this.db.transaction('cache', 'readwrite');
    const index = tx.store.index('by-expires');
    const now = Date.now();
    
    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    let deleted = 0;
    
    while (cursor) {
      await cursor.delete();
      deleted++;
      cursor = await cursor.continue();
    }
    
    console.log(`[IndexedDBOptimizer] Cleaned ${deleted} expired entries`);
    return deleted;
  }
  
  /**
   * Clean least accessed entries when storage is full
   */
  async cleanLeastAccessed(targetSizeMB: number = 50): Promise<number> {
    await this.init();
    if (!this.db) return 0;
    
    const stats = await this.getStats();
    if (stats.totalSizeMB < targetSizeMB) return 0;
    
    const toDelete = stats.totalSizeMB - targetSizeMB;
    const tx = this.db.transaction('cache', 'readwrite');
    const index = tx.store.index('by-access');
    
    let cursor = await index.openCursor(); // Ascending order = least accessed first
    let deleted = 0;
    let deletedSize = 0;
    
    while (cursor && deletedSize < toDelete * 1024 * 1024) {
      deletedSize += cursor.value.size;
      await cursor.delete();
      deleted++;
      cursor = await cursor.continue();
    }
    
    console.log(`[IndexedDBOptimizer] Cleaned ${deleted} least accessed entries (${(deletedSize / 1024 / 1024).toFixed(2)}MB)`);
    return deleted;
  }
  
  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalSizeMB: number;
    byModule: Record<string, { count: number; sizeMB: number }>;
    expiredCount: number;
  }> {
    await this.init();
    if (!this.db) return { totalEntries: 0, totalSizeMB: 0, byModule: {}, expiredCount: 0 };
    
    const tx = this.db.transaction('cache', 'readonly');
    const all = await tx.store.getAll();
    
    const now = Date.now();
    const byModule: Record<string, { count: number; sizeMB: number }> = {};
    let totalSize = 0;
    let expiredCount = 0;
    
    for (const entry of all) {
      if (entry.expiresAt < now) {
        expiredCount++;
        continue;
      }
      
      totalSize += entry.size;
      
      if (!byModule[entry.module]) {
        byModule[entry.module] = { count: 0, sizeMB: 0 };
      }
      byModule[entry.module].count++;
      byModule[entry.module].sizeMB += entry.size / 1024 / 1024;
    }
    
    return {
      totalEntries: all.length - expiredCount,
      totalSizeMB: totalSize / 1024 / 1024,
      byModule,
      expiredCount
    };
  }
  
  /**
   * Build search indexes for a value
   */
  private async buildIndexes(
    key: string,
    value: any,
    module: string,
    fields: string[]
  ): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('search_index', 'readwrite');
    
    for (const field of fields) {
      const fieldValue = this.getNestedValue(value, field);
      if (fieldValue !== undefined && fieldValue !== null) {
        const stringValue = String(fieldValue);
        
        await tx.store.put({
          module,
          field,
          value: stringValue,
          keys: [key]
        } as any);
      }
    }
  }
  
  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }
  
  /**
   * Estimate size of a value in bytes
   */
  private estimateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }
  
  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;
    
    await this.db.clear('cache');
    await this.db.clear('search_index');
    this.searchCache.clear();
  }
}

export const indexedDBOptimizer = new IndexedDBOptimizer();
