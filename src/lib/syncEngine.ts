/**
 * PATCH 139.0 - Offline Data Sync Engine
 * Handles synchronization of local changes when connection is restored
 */

import { localSync, type OfflineRecord } from "./localSync";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  pending: number;
}

class SyncEngine {
  private isSyncing = false;
  private syncListeners: Array<(stats: SyncStats) => void> = [];

  /**
   * Push all local changes to Supabase
   */
  async pushLocalChanges(): Promise<SyncStats> {
    if (this.isSyncing) {
      return { total: 0, synced: 0, failed: 0, pending: 0 };
    }

    this.isSyncing = true;
    const stats: SyncStats = { total: 0, synced: 0, failed: 0, pending: 0 };

    try {
      // Get all unsynced records
      const records = await localSync.getUnsyncedRecords();
      stats.total = records.length;
      stats.pending = records.length;


      // Process each record
      for (const record of records) {
        try {
          await this.syncRecord(record);
          stats.synced++;
          stats.pending--;

          // Mark as synced and optionally delete
          if (record.id) {
            await localSync.markAsSynced(record.id);
            // Clean up synced records after 24 hours
            const age = Date.now() - record.timestamp;
            if (age > 24 * 60 * 60 * 1000) {
              await localSync.deleteSyncedRecord(record.id);
            }
          }
        } catch (error) {
          console.error(`Failed to sync record ${record.id}:`, error);
          console.error(`Failed to sync record ${record.id}:`, error);
          stats.failed++;
          stats.pending--;
        }

        // Notify listeners of progress
        this.notifyListeners(stats);
      }

      // Show completion toast
      if (stats.synced > 0) {
        toast.success(`Synchronized ${stats.synced} offline changes`);
      }
      if (stats.failed > 0) {
        toast.error(`Failed to sync ${stats.failed} changes`);
      }

      return stats;
    } catch (error) {
      console.error("Error during sync:", error);
      console.error("Error during sync:", error);
      toast.error("Sync failed. Will retry later.");
      return stats;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single record to Supabase
   */
  private async syncRecord(record: OfflineRecord): Promise<void> {
    const { table, action, data } = record;

    // Type cast to bypass TypeScript's type-safe supabase client for dynamic tables
    const supabaseAny = supabase as any;

    switch (action) {
    case "create":
      const { error: createError } = await supabaseAny.from(table).insert(data);
      if (createError) throw createError;
      break;

    case "update":
      const { id, ...updateData } = data;
      const { error: updateError } = await supabaseAny
        .from(table)
        .update(updateData)
        .eq("id", id);
      if (updateError) throw updateError;
      break;

    case "delete":
      const { error: deleteError } = await supabaseAny
        .from(table)
        .delete()
        .eq("id", data.id);
      if (deleteError) throw deleteError;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Check if there are pending changes
   */
  async hasPendingChanges(): Promise<boolean> {
    const count = await localSync.getQueueCount();
    return count > 0;
  }

  /**
   * Get count of pending changes
   */
  async getPendingCount(): Promise<number> {
    return localSync.getQueueCount();
  }

  /**
   * Add a listener for sync progress
   */
  onSyncProgress(callback: (stats: SyncStats) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of sync progress
   */
  private notifyListeners(stats: SyncStats): void {
    this.syncListeners.forEach(listener => listener(stats));
  }

  /**
   * Save data locally with offline support
   */
  async saveOffline(
    table: string,
    data: any,
    action: "create" | "update" | "delete" = "create"
  ): Promise<void> {
    // Try to save online first
    if (navigator.onLine) {
      try {
        await this.syncRecord({ table, action, data, timestamp: Date.now(), synced: false });
        return;
      } catch (error) {
      }
    }

    // Save locally if offline or online save failed
    await localSync.saveLocally(data, table, action);
    toast.info("Changes saved offline. Will sync when online.");
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();

/**
 * Auto-sync when connection is restored
 */
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    const hasPending = await syncEngine.hasPendingChanges();
    if (hasPending) {
      await syncEngine.pushLocalChanges();
    }
  });
}

/**
 * Periodic sync every 5 minutes if online
 */
if (typeof window !== "undefined") {
  setInterval(async () => {
    if (navigator.onLine) {
      const hasPending = await syncEngine.hasPendingChanges();
      if (hasPending) {
        await syncEngine.pushLocalChanges();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}
