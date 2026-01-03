/**
 * MLC Offline Storage Service
 * IndexedDB-based persistence for MLC inspections aboard vessels
 * PATCH 860: PWA Offline Mode for MLC Module
 */

import { openDB, IDBPDatabase } from 'idb';
import { logger } from '@/lib/logger';

const DB_NAME = 'nautilus-mlc-offline';
const DB_VERSION = 1;

interface MLCInspection {
  id: string;
  vesselName: string;
  imo: string;
  flag: string;
  port: string;
  inspectorName: string;
  startDate: string;
  status: 'draft' | 'in_progress' | 'completed' | 'synced';
  answers: Record<string, ChecklistAnswer>;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
}

interface ChecklistAnswer {
  status: 'compliant' | 'non-compliant' | 'na' | null;
  observation: string;
  evidence: string[];
  photos: string[];
  aiAssisted: boolean;
}

interface PendingSync {
  id: string;
  type: 'inspection' | 'evidence' | 'report';
  data: unknown;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface MLCOfflineDB {
  inspections: {
    key: string;
    value: MLCInspection;
    indexes: { 'by-status': string; 'by-date': number };
  };
  pendingSync: {
    key: string;
    value: PendingSync;
    indexes: { 'by-timestamp': number; 'by-type': string };
  };
  cachedChecklist: {
    key: string;
    value: { id: string; data: unknown; expiry: number };
  };
}

class MLCOfflineStorage {
  private db: IDBPDatabase<MLCOfflineDB> | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<MLCOfflineDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Inspections store
          if (!db.objectStoreNames.contains('inspections')) {
            const inspectionsStore = db.createObjectStore('inspections', { keyPath: 'id' });
            inspectionsStore.createIndex('by-status', 'status');
            inspectionsStore.createIndex('by-date', 'updatedAt');
          }

          // Pending sync queue
          if (!db.objectStoreNames.contains('pendingSync')) {
            const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
            syncStore.createIndex('by-timestamp', 'timestamp');
            syncStore.createIndex('by-type', 'type');
          }

          // Cached checklist items
          if (!db.objectStoreNames.contains('cachedChecklist')) {
            db.createObjectStore('cachedChecklist', { keyPath: 'id' });
          }
        },
      });

      this.isInitialized = true;
      logger.info('[MLC Offline] Storage initialized');
    } catch (error) {
      logger.error('[MLC Offline] Failed to initialize storage:', error);
      throw error;
    }
  }

  // ==========================================
  // INSPECTION CRUD
  // ==========================================

  async saveInspection(inspection: Omit<MLCInspection, 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.initialize();
    
    const now = Date.now();
    const existingInspection = await this.getInspection(inspection.id);
    
    const data: MLCInspection = {
      ...inspection,
      createdAt: existingInspection?.createdAt || now,
      updatedAt: now,
    };

    await this.db!.put('inspections', data);
    
    // Queue for sync if not already synced
    if (inspection.status !== 'synced') {
      await this.queueForSync({
        id: `inspection-${inspection.id}`,
        type: 'inspection',
        data: inspection,
        timestamp: now,
        retryCount: 0,
        priority: inspection.status === 'completed' ? 'high' : 'medium',
      });
    }

    logger.info('[MLC Offline] Inspection saved:', inspection.id);
    return inspection.id;
  }

  async getInspection(id: string): Promise<MLCInspection | undefined> {
    await this.initialize();
    return this.db!.get('inspections', id);
  }

  async getAllInspections(): Promise<MLCInspection[]> {
    await this.initialize();
    return this.db!.getAll('inspections');
  }

  async getInspectionsByStatus(status: MLCInspection['status']): Promise<MLCInspection[]> {
    await this.initialize();
    return this.db!.getAllFromIndex('inspections', 'by-status', status);
  }

  async deleteInspection(id: string): Promise<void> {
    await this.initialize();
    await this.db!.delete('inspections', id);
    logger.info('[MLC Offline] Inspection deleted:', id);
  }

  // ==========================================
  // SYNC QUEUE
  // ==========================================

  async queueForSync(item: PendingSync): Promise<void> {
    await this.initialize();
    await this.db!.put('pendingSync', item);
    logger.info('[MLC Offline] Queued for sync:', item.id);
  }

  async getPendingSync(): Promise<PendingSync[]> {
    await this.initialize();
    const items = await this.db!.getAllFromIndex('pendingSync', 'by-timestamp');
    
    // Sort by priority
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return items.sort((a, b) => {
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });
  }

  async removeSyncedItem(id: string): Promise<void> {
    await this.initialize();
    await this.db!.delete('pendingSync', id);
  }

  async updateSyncRetry(id: string): Promise<void> {
    await this.initialize();
    const item = await this.db!.get('pendingSync', id);
    if (item) {
      item.retryCount++;
      if (item.retryCount >= 5) {
        logger.warn('[MLC Offline] Max retries reached, removing:', { id });
        await this.removeSyncedItem(id);
      } else {
        await this.db!.put('pendingSync', item);
      }
    }
  }

  async getPendingSyncCount(): Promise<number> {
    await this.initialize();
    return (await this.db!.getAll('pendingSync')).length;
  }

  // ==========================================
  // CACHED DATA
  // ==========================================

  async cacheData(key: string, data: unknown, ttlMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.initialize();
    await this.db!.put('cachedChecklist', {
      id: key,
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    await this.initialize();
    const cached = await this.db!.get('cachedChecklist', key);
    
    if (!cached) return null;
    if (cached.expiry < Date.now()) {
      await this.db!.delete('cachedChecklist', key);
      return null;
    }
    
    return cached.data as T;
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  async clearAll(): Promise<void> {
    await this.initialize();
    await this.db!.clear('inspections');
    await this.db!.clear('pendingSync');
    await this.db!.clear('cachedChecklist');
    logger.info('[MLC Offline] All data cleared');
  }

  async getStorageStats(): Promise<{
    inspections: number;
    pendingSync: number;
    cachedItems: number;
  }> {
    await this.initialize();
    return {
      inspections: (await this.db!.getAll('inspections')).length,
      pendingSync: (await this.db!.getAll('pendingSync')).length,
      cachedItems: (await this.db!.getAll('cachedChecklist')).length,
    };
  }
}

// Singleton instance
export const mlcOfflineStorage = new MLCOfflineStorage();

// Types export
export type { MLCInspection, ChecklistAnswer, PendingSync };
