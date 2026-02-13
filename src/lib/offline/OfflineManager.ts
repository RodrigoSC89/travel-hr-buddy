/**
 * Offline Manager - Handles offline mode and data synchronization
 * Simplified version for vessel connectivity
 */

import { logger } from "@/lib/logger";

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  synced: boolean;
}

class OfflineManagerService {
  private pendingActions: PendingAction[] = [];
  // PATCH v17 iOS PWA: Sempre assumir online - navigator.onLine não é confiável
  private isOnline: boolean = true;
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
    // PATCH v17: Sempre tentar sync na inicialização
    this.syncPendingActions();
  }

  private initializeEventListeners(): void {
    // PATCH v17 iOS PWA: Apenas escutar 'online' para trigger de sync
    // NÃO escutar 'offline' - deixar o sistema sempre tentar
    window.addEventListener('online', () => {
      logger.info('Online event detected - starting sync');
      this.syncPendingActions();
    });
    // REMOVIDO: listener 'offline' que causava falsos positivos no iOS
  }

  async queueAction(type: 'create' | 'update' | 'delete', table: string, data: Record<string, unknown>): Promise<string> {
    const id = `action-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
    
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

  async cacheData(table: string, data: Record<string, unknown>[], ttlMinutes: number = 60): Promise<void> {
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
    // PATCH v17 iOS PWA: Sempre tentar sync, ignorar status isOnline
    if (this.syncInProgress) return;

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
    const tableName = action.table;

    switch (action.type) {
      case 'create':
        await (supabase.from as Function)(tableName).insert(action.data as never);
        break;
      case 'update': {
        const { id, ...updateData } = action.data;
        await (supabase.from as Function)(tableName).update(updateData as never).eq('id', id);
        break;
      }
      case 'delete':
        await (supabase.from as Function)(tableName).delete().eq('id', action.data.id);
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
    // PATCH v17 iOS PWA: Sempre permitir sync manual
    await this.syncPendingActions();
  }
}

export const offlineManager = new OfflineManagerService();
