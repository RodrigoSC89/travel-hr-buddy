// @ts-nocheck
/**
 * Hub Sync - Intelligent Synchronization
 * Handles automatic and manual synchronization with BridgeLink
 */

import { SyncResult } from "./types";
import { hubCache } from "./hub_cache";
import { hubBridge } from "./hub_bridge";
import config from "./hub_config.json";

export class HubSync {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private lastSync: Date | null = null;

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(
      () => this.synchronize(),
      config.sync.autoSyncInterval
    );

    // Perform initial sync
    this.synchronize();
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform synchronization
   */
  async synchronize(): Promise<SyncResult> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      return {
        success: false,
        recordsSent: 0,
        recordsFailed: 0,
        errors: ["Sync already in progress"],
      };
    }

    this.isSyncing = true;

    try {
      // Check connection
      const quality = await hubBridge.checkConnection();
      if (quality === "offline") {
        return {
          success: false,
          recordsSent: 0,
          recordsFailed: 0,
          errors: ["No connection to BridgeLink"],
        };
      }

      // Get pending entries
      const pending = hubCache.getPendingEntries();
      if (pending.length === 0) {
        this.lastSync = new Date();
        return {
          success: true,
          recordsSent: 0,
          recordsFailed: 0,
          errors: [],
        };
      }

      // Process in batches
      const batchSize = config.sync.batchSize;
      let totalSent = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      for (let i = 0; i < pending.length; i += batchSize) {
        const batch = pending.slice(i, i + batchSize);
        const batchData = {
          timestamp: new Date().toISOString(),
          records: batch.map(entry => ({
            id: entry.id,
            module: entry.module,
            data: entry.data,
            timestamp: entry.timestamp.toISOString(),
          })),
        };

        const success = await hubBridge.sendData(batchData);
        
        if (success) {
          // Mark as synchronized
          const ids = batch.map(entry => entry.id);
          hubCache.markSynchronized(ids);
          totalSent += batch.length;
        } else {
          totalFailed += batch.length;
          errors.push(`Failed to sync batch ${i / batchSize + 1}`);
        }
      }

      this.lastSync = new Date();

      return {
        success: totalFailed === 0,
        recordsSent: totalSent,
        recordsFailed: totalFailed,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        recordsSent: 0,
        recordsFailed: pending.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSync(): Date | null {
    return this.lastSync;
  }

  /**
   * Check if currently syncing
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export const hubSync = new HubSync();
