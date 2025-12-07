/**
 * Offline Manager - Handles offline mode and data synchronization
 * Simplified version for vessel connectivity
 */

import { logger } from "@/lib/logger";

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, any>;
  timestamp: number;
  retries: number;
  synced: boolean;
}

class OfflineManagerService {
  private pendingActions: PendingAction[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncListeners: Set<(status: 'syncing' | 'synced' | 'error') => void> = new Set();

  constructor() {
    this.initializeEventListeners();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('nautilus_pending_actions');
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch {
      this.pendingActions = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('nautilus_pending_actions', JSON.stringify(this.pendingActions));
    } catch {
      logger.debug('Failed to save pending actions to storage');
    }
  }

  async initialize(): Promise<void> {
    logger.info('Offline manager initialized');
    if (this.isOnline) {
      this.syncPendingActions();
    }
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Connection restored - starting sync');
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('Connection lost - entering offline mode');
    });
  }

  async queueAction(type: 'create' | 'update' | 'delete', table: string, data: Record<string, any>): Promise<string> {
    const id = `action-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    this.pendingActions.push({
      id,
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      synced: false
    });

    this.saveToStorage();
    
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return id;
  }

  async cacheData(table: string, data: Record<string, any>[], ttlMinutes: number = 60): Promise<void> {
    try {
      const cacheKey = `nautilus_cache_${table}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
      }));
    } catch {
      logger.debug('Failed to cache data');
    }
  }

  async getCachedData<T>(table: string): Promise<T[] | null> {
    try {
      const cacheKey = `nautilus_cache_${table}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const { data, expiresAt } = JSON.parse(cached);
      if (expiresAt < Date.now()) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return data as T[];
    } catch {
      return null;
    }
  }

  async bufferSensorReading(vesselId: string, reading: { sensorId: string; type: string; value: number; unit: string }): Promise<void> {
    // Simplified - just log for now
    logger.debug('Sensor reading buffered', { vesselId, reading });
  }

  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    this.notifySyncListeners('syncing');

    try {
      const pending = this.pendingActions.filter(a => !a.synced);
      
      for (const action of pending) {
        try {
          await this.executeSyncAction(action);
          action.synced = true;
        } catch {
          action.retries++;
          if (action.retries >= 3) {
            action.synced = true;
          }
        }
      }

      this.pendingActions = this.pendingActions.filter(a => !a.synced || Date.now() - a.timestamp < 86400000);
      this.saveToStorage();
      this.notifySyncListeners('synced');
    } catch {
      this.notifySyncListeners('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeSyncAction(action: PendingAction): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    const tableName = action.table as any;

    switch (action.type) {
      case 'create':
        await supabase.from(tableName).insert(action.data);
        break;
      case 'update':
        const { id, ...updateData } = action.data;
        await supabase.from(tableName).update(updateData).eq('id', id);
        break;
      case 'delete':
        await supabase.from(tableName).delete().eq('id', action.data.id);
        break;
    }
  }

  onSyncStatus(listener: (status: 'syncing' | 'synced' | 'error') => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifySyncListeners(status: 'syncing' | 'synced' | 'error'): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  async getPendingCount(): Promise<number> {
    return this.pendingActions.filter(a => !a.synced).length;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async forceSync(): Promise<void> {
    if (!this.isOnline) throw new Error('Cannot sync while offline');
    await this.syncPendingActions();
  }
}

export const offlineManager = new OfflineManagerService();
