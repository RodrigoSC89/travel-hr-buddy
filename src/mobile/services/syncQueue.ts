/**
 * PATCH 162.0 - Sync Queue Manager
 * Manages offline data queue with priority-based syncing
 */

import { sqliteStorage } from "./sqlite-storage";
import { supabase } from "@/integrations/supabase/client";
import { SyncQueueItem } from "../types";

type SyncPriority = "high" | "medium" | "low";

interface SyncRecord {
  id: string;
  table: string;
  action: "create" | "update" | "delete";
  data: Record<string, any>;
  timestamp: number;
  synced: boolean;
  priority: SyncPriority;
}

interface SyncOptions {
  maxRetries?: number;
  batchSize?: number;
  priorityOrder?: SyncPriority[];
}

class SyncQueue {
  private isSyncing = false;
  private readonly defaultOptions: SyncOptions = {
    maxRetries: 3,
    batchSize: 10,
    priorityOrder: ["high", "medium", "low"]
  };

  /**
   * Add item to sync queue
   */
  async enqueue(
    table: string,
    data: any,
    action: "create" | "update" | "delete",
    priority: SyncPriority = "medium"
  ): Promise<string> {
    return sqliteStorage.save(table, data, action, priority);
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    return sqliteStorage.getQueueCount();
  }

  /**
   * Process sync queue
   */
  async processQueue(options: SyncOptions = {}): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return { success: 0, failed: 0, total: 0 };
    }

    this.isSyncing = true;
    const opts = { ...this.defaultOptions, ...options };
    
    let successCount = 0;
    let failedCount = 0;

    try {
      // Get all unsynced records (already sorted by priority)
      const records = await sqliteStorage.getUnsyncedRecords();
      const totalCount = records.length;

      console.log(`Processing ${totalCount} items in sync queue`);

      // Process in batches
      for (let i = 0; i < records.length; i += opts.batchSize!) {
        const batch = records.slice(i, i + opts.batchSize!);
        
        await Promise.all(
          batch.map(async (record) => {
            try {
              await this.syncRecord(record);
              await sqliteStorage.markAsSynced(record.id);
              successCount++;
              
              // Clean up old synced records
              const age = Date.now() - record.timestamp;
              if (age > 24 * 60 * 60 * 1000) { // 24 hours
                await sqliteStorage.deleteSyncedRecord(record.id);
              }
            } catch (error) {
              console.error(`Failed to sync record ${record.id}:`, error);
              failedCount++;
            }
          })
        );
      }

      return {
        success: successCount,
        failed: failedCount,
        total: totalCount
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single record to Supabase
   */
  private async syncRecord(record: SyncRecord): Promise<void> {
    const { table, action, data } = record;
    
    // Type-safe access to dynamic tables
    const supabaseAny = supabase as any;

    switch (action) {
    case "create": {
      const { error: createError } = await supabaseAny
        .from(table)
        .insert(data);
      if (createError) throw createError;
      break;
    }

    case "update": {
      const { id, ...updateData } = data;
      if (!id) throw new Error("Update requires an ID");
        
      const { error: updateError } = await supabaseAny
        .from(table)
        .update(updateData)
        .eq("id", id);
      if (updateError) throw updateError;
      break;
    }

    case "delete": {
      if (!data.id) throw new Error("Delete requires an ID");
        
      const { error: deleteError } = await supabaseAny
        .from(table)
        .delete()
        .eq("id", data.id);
      if (deleteError) throw deleteError;
      break;
    }

    default:
      throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Clear synced items
   */
  async clearSynced(): Promise<void> {
    await sqliteStorage.clearSyncedRecords();
  }

  /**
   * Get queue statistics by priority
   */
  async getQueueStats(): Promise<{
    high: number;
    medium: number;
    low: number;
    total: number;
  }> {
    const records = await sqliteStorage.getUnsyncedRecords();
    
    return {
      high: records.filter(r => r.priority === "high").length,
      medium: records.filter(r => r.priority === "medium").length,
      low: records.filter(r => r.priority === "low").length,
      total: records.length
    };
  }

  /**
   * Get priority for table/action combination
   * Priority logic: incident > checklist > logs
   */
  getPriorityForTable(table: string, action: string): SyncPriority {
    // High priority
    if (table.includes("incident") || table.includes("emergency")) {
      return "high";
    }
    
    // Medium priority
    if (
      table.includes("checklist") || 
      table.includes("mission") ||
      action === "delete"
    ) {
      return "medium";
    }
    
    // Low priority (logs, analytics, etc.)
    return "low";
  }
}

export const syncQueue = new SyncQueue();
