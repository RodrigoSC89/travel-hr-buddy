/**
 * PATCH 187.0 - Enhanced Sync Engine with WebSocket + Fallback
 * 
 * Real-time sync with Supabase Realtime + offline fallback
 * Features:
 * - WebSocket-based real-time updates
 * - Automatic fallback to polling when offline
 * - Conflict resolution
 * - Optimistic updates
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { syncQueue } from './syncQueue';
import { networkDetector } from './networkDetector';
import { structuredLogger } from '@/lib/logger/structured-logger';

interface SyncConfig {
  tables: string[];
  pollingInterval?: number;
  enableRealtime?: boolean;
  conflictResolution?: 'local' | 'remote' | 'latest';
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  mode: 'realtime' | 'polling' | 'offline';
}

export class EnhancedSyncEngine {
  private channels: Map<string, RealtimeChannel> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<SyncConfig>;
  private status: SyncStatus = {
    isConnected: false,
    lastSync: null,
    pendingChanges: 0,
    mode: 'offline',
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor(config: SyncConfig) {
    this.config = {
      tables: config.tables,
      pollingInterval: config.pollingInterval || 30000, // 30 seconds
      enableRealtime: config.enableRealtime !== false,
      conflictResolution: config.conflictResolution || 'latest',
    };
  }

  /**
   * Initialize sync engine
   */
  async initialize(): Promise<void> {
    structuredLogger.info('Initializing Enhanced Sync Engine', {
      tables: this.config.tables,
      mode: this.config.enableRealtime ? 'realtime' : 'polling',
    });

    // Monitor network status
    networkDetector.addListener((isOnline: boolean) => {
      if (isOnline) {
        this.onOnline();
      } else {
        this.onOffline();
      }
    });

    // Check initial network status
    const currentStatus = networkDetector.getStatus();
    if (currentStatus.isOnline) {
      await this.onOnline();
    }
  }

  /**
   * Handle online state
   */
  private async onOnline(): Promise<void> {
    structuredLogger.info('Sync engine going online');
    
    this.updateStatus({
      isConnected: true,
      mode: this.config.enableRealtime ? 'realtime' : 'polling',
    });

    // Process pending queue
    await this.processPendingQueue();

    // Start sync based on configuration
    if (this.config.enableRealtime) {
      await this.startRealtimeSync();
    } else {
      this.startPollingSync();
    }
  }

  /**
   * Handle offline state
   */
  private onOffline(): void {
    structuredLogger.warn('Sync engine going offline');
    
    this.updateStatus({
      isConnected: false,
      mode: 'offline',
    });

    // Stop all sync operations
    this.stopRealtimeSync();
    this.stopPollingSync();
  }

  /**
   * Start WebSocket-based realtime sync
   */
  private async startRealtimeSync(): Promise<void> {
    for (const table of this.config.tables) {
      const channel = supabase
        .channel(`sync:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            this.handleRealtimeChange(table, payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            structuredLogger.info(`Realtime sync active for ${table}`);
          } else if (status === 'CHANNEL_ERROR') {
            structuredLogger.error(`Realtime sync error for ${table}`, 
              new Error('Channel error'));
            // Fallback to polling
            this.startPollingForTable(table);
          }
        });

      this.channels.set(table, channel);
    }
  }

  /**
   * Stop WebSocket sync
   */
  private stopRealtimeSync(): void {
    for (const [table, channel] of this.channels.entries()) {
      channel.unsubscribe();
      structuredLogger.info(`Stopped realtime sync for ${table}`);
    }
    this.channels.clear();
  }

  /**
   * Start polling-based sync
   */
  private startPollingSync(): void {
    for (const table of this.config.tables) {
      this.startPollingForTable(table);
    }
  }

  /**
   * Start polling for specific table
   */
  private startPollingForTable(table: string): void {
    // Clear existing interval if any
    const existing = this.pollingIntervals.get(table);
    if (existing) {
      clearInterval(existing);
    }

    const interval = setInterval(async () => {
      try {
        await this.pollTable(table);
      } catch (error) {
        structuredLogger.error(`Polling error for ${table}`, error as Error);
      }
    }, this.config.pollingInterval);

    this.pollingIntervals.set(table, interval);
    structuredLogger.info(`Started polling for ${table}`);
  }

  /**
   * Stop polling sync
   */
  private stopPollingSync(): void {
    for (const [table, interval] of this.pollingIntervals.entries()) {
      clearInterval(interval);
      structuredLogger.info(`Stopped polling for ${table}`);
    }
    this.pollingIntervals.clear();
  }

  /**
   * Poll table for changes
   */
  private async pollTable(table: string): Promise<void> {
    const lastSync = this.status.lastSync || new Date(0);
    
    const { data, error } = await supabase
      .from(table as any)
      .select('*')
      .gte('updated_at', lastSync.toISOString())
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      structuredLogger.debug(`Polled ${data.length} changes from ${table}`);
      // Process changes
      for (const record of data) {
        await this.handleRemoteChange(table, record);
      }
      
      this.updateStatus({ lastSync: new Date() });
    }
  }

  /**
   * Handle realtime change from WebSocket
   */
  private async handleRealtimeChange(
    table: string,
    payload: any
  ): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    structuredLogger.debug('Realtime change received', {
      table,
      event: eventType,
    });

    switch (eventType) {
      case 'INSERT':
        await this.handleRemoteChange(table, newRecord);
        break;
      case 'UPDATE':
        await this.handleRemoteChange(table, newRecord, oldRecord);
        break;
      case 'DELETE':
        await this.handleRemoteDelete(table, oldRecord);
        break;
    }

    this.updateStatus({ lastSync: new Date() });
  }

  /**
   * Handle remote change with conflict resolution
   */
  private async handleRemoteChange(
    table: string,
    newRecord: any,
    oldRecord?: any
  ): Promise<void> {
    // Check for local pending changes
    const localChanges = await syncQueue.getQueueStats();
    
    if (localChanges.total > 0) {
      // Apply conflict resolution strategy
      switch (this.config.conflictResolution) {
        case 'local':
          // Keep local changes, ignore remote
          structuredLogger.debug('Conflict: keeping local changes');
          break;
        case 'remote':
          // Accept remote changes, discard local
          structuredLogger.debug('Conflict: accepting remote changes');
          // TODO: Update local storage with remote data
          break;
        case 'latest':
          // Use timestamp to determine winner
          const localTimestamp = oldRecord?.updated_at;
          const remoteTimestamp = newRecord.updated_at;
          if (remoteTimestamp > localTimestamp) {
            structuredLogger.debug('Conflict: remote is newer');
            // TODO: Update local storage with remote data
          }
          break;
      }
    }

    // Emit event for UI updates
    this.emitChange(table, 'update', newRecord);
  }

  /**
   * Handle remote delete
   */
  private async handleRemoteDelete(table: string, record: any): Promise<void> {
    // TODO: Update local storage to mark as deleted
    this.emitChange(table, 'delete', record);
  }

  /**
   * Process pending sync queue
   */
  private async processPendingQueue(): Promise<void> {
    const stats = await syncQueue.getQueueStats();
    
    if (stats.total === 0) {
      return;
    }

    structuredLogger.info('Processing pending sync queue', stats);
    
    const result = await syncQueue.processQueue();
    
    this.updateStatus({ pendingChanges: result.failed });
    
    structuredLogger.info('Sync queue processed', result);
  }

  /**
   * Update sync status and notify listeners
   */
  private updateStatus(update: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...update };
    this.notifyListeners();
  }

  /**
   * Add status listener
   */
  public addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all status listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.status);
    }
  }

  /**
   * Emit change event for table
   */
  private emitChange(table: string, event: string, data: any): void {
    // TODO: Implement event emitter for UI updates
    structuredLogger.debug('Change emitted', { table, event });
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Force sync now
   */
  public async forceSync(): Promise<void> {
    await this.processPendingQueue();
    
    if (this.status.isConnected && !this.config.enableRealtime) {
      for (const table of this.config.tables) {
        await this.pollTable(table);
      }
    }
  }

  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    this.stopRealtimeSync();
    this.stopPollingSync();
    this.listeners.clear();
    structuredLogger.info('Enhanced Sync Engine shutdown');
  }
}

// Export singleton with default configuration
export const enhancedSyncEngine = new EnhancedSyncEngine({
  tables: [
    'checklists',
    'missions',
    'logs',
    'crew_members',
    'incidents',
    'maintenance_schedules',
  ],
  enableRealtime: true,
  conflictResolution: 'latest',
});
