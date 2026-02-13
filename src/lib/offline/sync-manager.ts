/**
 * PATCH 587 - Enhanced Offline Sync Manager
 * DEBT-FIX: Dynamic table access requires type assertion on table name only (not entire client)
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/** Helper for dynamic table operations where table name is determined at runtime */
function dynamicFrom(table: string) {
  return supabase.from(table as TableName);
}

export interface SyncQueueItem {
  id: string;
  operation: "insert" | "update" | "delete";
  table: string;
  data: unknown;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  status: "pending" | "syncing" | "completed" | "failed";
}

export interface SyncStats {
  totalQueued: number;
  completed: number;
  failed: number;
  pending: number;
}

class OfflineSyncManager {
  private queue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private readonly STORAGE_KEY = "nautilus_offline_sync_queue";
  private readonly MAX_RETRIES = 3;
  private syncInterval: number | null = null;

  constructor() {
    this.loadQueueFromStorage();
    this.setupNetworkListeners();
    this.startAutoSync();
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      logger.info("[OfflineSync] Network event: online - starting sync");
      this.isOnline = true;
      this.syncAll();
    });
    window.addEventListener("offline", () => {
      logger.warn("[OfflineSync] Network offline - queuing operations");
      this.isOnline = false;
    });
  }

  private startAutoSync(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.queue.length > 0) {
        this.syncAll();
      }
    }, 30000);
  }

  public queueOperation(operation: "insert" | "update" | "delete", table: string, data: unknown): string {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      operation,
      table,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
      status: "pending"
    };

    this.queue.push(item);
    this.saveQueueToStorage();
    logger.info(`[OfflineSync] Queued ${operation} on ${table}`, { id: item.id });

    if (this.isOnline) this.syncAll();
    return item.id;
  }

  public async syncAll(): Promise<SyncStats> {
    if (this.isSyncing || !this.isOnline) return this.getStats();

    this.isSyncing = true;
    logger.info(`[OfflineSync] Starting sync of ${this.queue.length} operations`);

    const pendingItems = this.queue.filter(item => item.status === "pending" || item.status === "failed");

    for (const item of pendingItems) {
      try { await this.syncItem(item); }
      catch (error) { logger.error(`[OfflineSync] Failed to sync item ${item.id}`, { error }); }
    }

    this.isSyncing = false;
    this.saveQueueToStorage();

    const stats = this.getStats();
    logger.info("[OfflineSync] Sync completed", stats);
    return stats;
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    item.status = "syncing";

    try {
      let result;

      switch (item.operation) {
      case "insert":
        result = await dynamicFrom(item.table).insert(item.data as Record<string, unknown>);
        break;
      case "update": {
        const updateData = item.data as Record<string, unknown>;
        result = await dynamicFrom(item.table).update(updateData).eq("id", String(updateData.id));
        break;
      }
      case "delete": {
        const deleteData = item.data as Record<string, unknown>;
        result = await dynamicFrom(item.table).delete().eq("id", String(deleteData.id));
        break;
      }
      }

      if (result.error) throw result.error;

      item.status = "completed";
      logger.info(`[OfflineSync] Successfully synced ${item.operation} on ${item.table}`);
    } catch (error) {
      item.retryCount++;
      if (item.retryCount >= item.maxRetries) {
        item.status = "failed";
        logger.error(`[OfflineSync] Max retries reached for item ${item.id}`, { error });
      } else {
        item.status = "pending";
        logger.warn(`[OfflineSync] Retry ${item.retryCount}/${item.maxRetries} for item ${item.id}`);
      }
      throw error;
    }
  }

  public getStats(): SyncStats {
    return {
      totalQueued: this.queue.length,
      completed: this.queue.filter(i => i.status === "completed").length,
      failed: this.queue.filter(i => i.status === "failed").length,
      pending: this.queue.filter(i => i.status === "pending").length
    };
  }

  public clearCompleted(): void {
    const beforeCount = this.queue.length;
    this.queue = this.queue.filter(item => item.status !== "completed");
    this.saveQueueToStorage();
    const cleared = beforeCount - this.queue.length;
    if (cleared > 0) logger.info(`[OfflineSync] Cleared ${cleared} completed operations`);
  }

  public async retryFailed(): Promise<void> {
    const failedItems = this.queue.filter(item => item.status === "failed");
    for (const item of failedItems) { item.status = "pending"; item.retryCount = 0; }
    this.saveQueueToStorage();
    if (this.isOnline) await this.syncAll();
  }

  public getNetworkStatus(): { isOnline: boolean; isSyncing: boolean } {
    return { isOnline: this.isOnline, isSyncing: this.isSyncing };
  }

  private saveQueueToStorage(): void {
    try { sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue)); }
    catch (error) { logger.error("[OfflineSync] Failed to save queue to storage", { error }); }
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.STORAGE_KEY);
      if (stored) { this.queue = JSON.parse(stored); logger.info(`[OfflineSync] Loaded ${this.queue.length} items from storage`); }
    } catch (error) { logger.error("[OfflineSync] Failed to load queue from storage", { error }); this.queue = []; }
  }

  public destroy(): void {
    if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
  }
}

export const offlineSyncManager = new OfflineSyncManager();

export function initializeSyncManager(): () => void {
  return () => { offlineSyncManager.destroy(); };
}
