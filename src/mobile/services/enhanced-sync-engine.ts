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

import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { syncQueue } from "./syncQueue";
import { networkDetector } from "./networkDetector";
import { structuredLogger } from "@/lib/logger/structured-logger";
import { localStorageService, StoredRecord } from "./local-storage-service";

interface SyncConfig {
  tables: string[];
  pollingInterval?: number;
  enableRealtime?: boolean;
  conflictResolution?: "local" | "remote" | "latest";
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  mode: "realtime" | "polling" | "offline";
}

interface SyncChangeEvent {
  table: string;
  event: "insert" | "update" | "delete";
  data: any;
  timestamp: Date;
}

type ChangeListener = (event: SyncChangeEvent) => void;

export class EnhancedSyncEngine {
  private channels: Map<string, RealtimeChannel> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<SyncConfig>;
  private status: SyncStatus = {
    isConnected: false,
    lastSync: null,
    pendingChanges: 0,
    mode: "offline",
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private changeListeners: Set<ChangeListener> = new Set();

  constructor(config: SyncConfig) {
    this.config = {
      tables: config.tables,
      pollingInterval: config.pollingInterval || 30000, // 30 seconds
      enableRealtime: config.enableRealtime !== false,
      conflictResolution: config.conflictResolution || "latest",
    };
  }

  /**
   * Initialize sync engine
   */
  async initialize(): Promise<void> {
    structuredLogger.info("Initializing Enhanced Sync Engine", {
      tables: this.config.tables,
      mode: this.config.enableRealtime ? "realtime" : "polling",
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
    structuredLogger.info("Sync engine going online");
    
    this.updateStatus({
      isConnected: true,
      mode: this.config.enableRealtime ? "realtime" : "polling",
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
    structuredLogger.warn("Sync engine going offline");
    
    this.updateStatus({
      isConnected: false,
      mode: "offline",
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
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
          },
          (payload) => {
            this.handleRealtimeChange(table, payload);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            structuredLogger.info(`Realtime sync active for ${table}`);
          } else if (status === "CHANNEL_ERROR") {
            structuredLogger.error(`Realtime sync error for ${table}`, 
              new Error("Channel error"));
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
      .select("*")
      .gte("updated_at", lastSync.toISOString())
      .order("updated_at", { ascending: false })
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

    structuredLogger.debug("Realtime change received", {
      table,
      event: eventType,
    });

    switch (eventType) {
    case "INSERT":
      await this.handleRemoteChange(table, newRecord);
      break;
    case "UPDATE":
      await this.handleRemoteChange(table, newRecord, oldRecord);
      break;
    case "DELETE":
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
    try {
      // Validate input
      if (!newRecord?.id) {
        structuredLogger.warn("Remote change missing ID", { table });
        return;
      }

      // Get local record if exists
      const localRecord = await localStorageService.getRecord(table, newRecord.id);
      
      // Check for conflicts
      if (localRecord && !localRecord.synced && localRecord.local_changes) {
        // Apply conflict resolution strategy
        switch (this.config.conflictResolution) {
        case "local":
          // Keep local changes, ignore remote
          structuredLogger.debug("Conflict: keeping local changes", {
            table,
            id: newRecord.id,
            strategy: "local",
          });
          return; // Don't update local storage
          
        case "remote":
          // Accept remote changes, discard local
          structuredLogger.debug("Conflict: accepting remote changes", {
            table,
            id: newRecord.id,
            strategy: "remote",
          });
          await localStorageService.storeRecord(table, newRecord.id, newRecord, true);
          break;
          
        case "latest":
          // Use timestamp to determine winner
          const localTimestamp = new Date(localRecord.updated_at).getTime();
          const remoteTimestamp = new Date(newRecord.updated_at).getTime();
          
          if (remoteTimestamp > localTimestamp) {
            structuredLogger.debug("Conflict: remote is newer", {
              table,
              id: newRecord.id,
              strategy: "latest",
              localTime: localRecord.updated_at,
              remoteTime: newRecord.updated_at,
            });
            await localStorageService.storeRecord(table, newRecord.id, newRecord, true);
          } else {
            structuredLogger.debug("Conflict: local is newer or equal", {
              table,
              id: newRecord.id,
              strategy: "latest",
            });
            return; // Keep local version
          }
          break;
        }
      } else {
        // No conflict, update local storage
        await localStorageService.storeRecord(table, newRecord.id, newRecord, true);
        
        structuredLogger.debug("Remote change applied", {
          table,
          id: newRecord.id,
          hasLocal: !!localRecord,
        });
      }

      // Emit event for UI updates
      this.emitChange(table, oldRecord ? "update" : "insert", newRecord);
    } catch (error) {
      structuredLogger.error("Failed to handle remote change", error as Error, {
        table,
        recordId: newRecord?.id,
      });
    }
  }

  /**
   * Handle remote delete
   */
  private async handleRemoteDelete(table: string, record: any): Promise<void> {
    try {
      // Validate input
      if (!record?.id) {
        structuredLogger.warn("Remote delete missing ID", { table });
        return;
      }

      // Mark as deleted in local storage
      const success = await localStorageService.markAsDeleted(table, record.id);
      
      if (success) {
        structuredLogger.debug("Remote delete applied", {
          table,
          id: record.id,
        });
        
        // Emit event for UI updates
        this.emitChange(table, "delete", record);
      } else {
        structuredLogger.warn("Failed to apply remote delete", {
          table,
          id: record.id,
        });
      }
    } catch (error) {
      structuredLogger.error("Failed to handle remote delete", error as Error, {
        table,
        recordId: record?.id,
      });
    }
  }

  /**
   * Process pending sync queue
   */
  private async processPendingQueue(): Promise<void> {
    const stats = await syncQueue.getQueueStats();
    
    if (stats.total === 0) {
      return;
    }

    structuredLogger.info("Processing pending sync queue", stats);
    
    const result = await syncQueue.processQueue();
    
    this.updateStatus({ pendingChanges: result.failed });
    
    structuredLogger.info("Sync queue processed", result);
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
  private emitChange(
    table: string, 
    event: "insert" | "update" | "delete", 
    data: any
  ): void {
    try {
      const changeEvent: SyncChangeEvent = {
        table,
        event,
        data,
        timestamp: new Date(),
      };

      // Notify all change listeners
      for (const listener of this.changeListeners) {
        try {
          listener(changeEvent);
        } catch (error) {
          structuredLogger.error("Change listener error", error as Error, {
            table,
            event,
          });
        }
      }

      structuredLogger.debug("Change emitted to UI", { 
        table, 
        event,
        listenerCount: this.changeListeners.size,
      });
    } catch (error) {
      structuredLogger.error("Failed to emit change", error as Error, {
        table,
        event,
      });
    }
  }

  /**
   * Add change listener for UI updates
   */
  public addChangeListener(listener: ChangeListener): () => void {
    this.changeListeners.add(listener);
    structuredLogger.debug("Change listener added", {
      totalListeners: this.changeListeners.size,
    });
    
    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(listener);
      structuredLogger.debug("Change listener removed", {
        totalListeners: this.changeListeners.size,
      });
    };
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
   * Create or update a local record with sync queue
   */
  public async upsertLocal(
    table: string,
    id: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      if (!table || typeof table !== "string" || !this.config.tables.includes(table)) {
        return {
          success: false,
          error: "Invalid table name",
        };
      }

      if (!id || typeof id !== "string") {
        return {
          success: false,
          error: "Invalid record ID",
        };
      }

      if (!data || typeof data !== "object") {
        return {
          success: false,
          error: "Invalid data object",
        };
      }

      // Store locally with unsynced flag
      const stored = await localStorageService.storeRecord(table, id, {
        ...data,
        id,
        updated_at: new Date().toISOString(),
      }, false);

      if (!stored) {
        return {
          success: false,
          error: "Failed to store record locally",
        };
      }

      // Add to sync queue if online
      if (this.status.isConnected) {
        await syncQueue.addToQueue({
          table,
          action: "upsert",
          data: { ...data, id },
          timestamp: Date.now(),
        });
      }

      structuredLogger.debug("Local upsert queued", { table, id });
      
      // Emit change event
      this.emitChange(table, "update", { ...data, id });

      return { success: true };
    } catch (error) {
      structuredLogger.error("Failed to upsert local record", error as Error, {
        table,
        id,
      });
      return {
        success: false,
        error: "Upsert operation failed",
      });
    }
  }

  /**
   * Delete a local record with sync queue
   */
  public async deleteLocal(
    table: string,
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      if (!table || typeof table !== "string" || !this.config.tables.includes(table)) {
        return {
          success: false,
          error: "Invalid table name",
        };
      }

      if (!id || typeof id !== "string") {
        return {
          success: false,
          error: "Invalid record ID",
        };
      }

      // Mark as deleted locally
      const deleted = await localStorageService.markAsDeleted(table, id);

      if (!deleted) {
        return {
          success: false,
          error: "Failed to mark record as deleted",
        };
      }

      // Add to sync queue if online
      if (this.status.isConnected) {
        await syncQueue.addToQueue({
          table,
          action: "delete",
          data: { id },
          timestamp: Date.now(),
        });
      }

      structuredLogger.debug("Local delete queued", { table, id });
      
      // Emit change event
      this.emitChange(table, "delete", { id });

      return { success: true };
    } catch (error) {
      structuredLogger.error("Failed to delete local record", error as Error, {
        table,
        id,
      });
      return {
        success: false,
        error: "Delete operation failed",
      });
    }
  }

  /**
   * Get local records for a table
   */
  public async getLocalRecords(table: string): Promise<any[]> {
    try {
      if (!table || !this.config.tables.includes(table)) {
        structuredLogger.warn("Invalid table for getLocalRecords", { table });
        return [];
      }

      const records = await localStorageService.getTableRecords(table);
      return records.map(r => r.data);
    } catch (error) {
      structuredLogger.error("Failed to get local records", error as Error, {
        table,
      });
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats() {
    try {
      const stats = await localStorageService.getStats();
      
      structuredLogger.debug("Storage stats retrieved", stats);
      
      return stats;
    } catch (error) {
      structuredLogger.error("Failed to get storage stats", error as Error);
      return {
        totalRecords: 0,
        unsyncedRecords: 0,
        tableBreakdown: {},
      };
    }
  }

  /**
   * Clear all local data for a table
   */
  public async clearTableData(table: string): Promise<boolean> {
    try {
      if (!table || !this.config.tables.includes(table)) {
        structuredLogger.warn("Invalid table for clearTableData", { table });
        return false;
      }

      const success = await localStorageService.clearTable(table);
      
      if (success) {
        structuredLogger.info("Table data cleared", { table });
      }
      
      return success;
    } catch (error) {
      structuredLogger.error("Failed to clear table data", error as Error, {
        table,
      });
      return false;
    }
  }

  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    this.stopRealtimeSync();
    this.stopPollingSync();
    this.listeners.clear();
    this.changeListeners.clear();
    structuredLogger.info("Enhanced Sync Engine shutdown");
  }
}

// Export singleton with default configuration
export const enhancedSyncEngine = new EnhancedSyncEngine({
  tables: [
    "checklists",
    "missions",
    "logs",
    "crew_members",
    "incidents",
    "maintenance_schedules",
  ],
  enableRealtime: true,
  conflictResolution: "latest",
});
