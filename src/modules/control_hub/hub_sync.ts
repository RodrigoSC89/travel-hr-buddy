/**
 * Hub Sync - Synchronization Module
 * 
 * Manages data synchronization between onboard systems and BridgeLink.
 * Supports store-and-forward for offline operation.
 */

import { logger } from "@/lib/logger";
import hubCache, { type CacheEntry } from "./hub_cache";

export interface SyncResult {
  success: boolean;
  recordsSent: number;
  errors: string[];
  timestamp: Date;
}

export class HubSync {
  private isSyncing = false;
  private lastSync: Date | null = null;

  /**
   * Synchronize pending data with BridgeLink
   */
  async sincronizar(): Promise<SyncResult> {
    if (this.isSyncing) {
      logger.warn("Sincronização já em andamento");
      return {
        success: false,
        recordsSent: 0,
        errors: ["Sync already in progress"],
        timestamp: new Date(),
      };
    }

    this.isSyncing = true;
    logger.info("🌐 Tentando sincronização com BridgeLink...");

    try {
      // Check if online
      const isOnline = typeof navigator !== "undefined" && navigator.onLine;
      if (!isOnline) {
        logger.warn("Sistema offline - sincronização adiada");
        return {
          success: false,
          recordsSent: 0,
          errors: ["System offline"],
          timestamp: new Date(),
        };
      }

      // Get pending cache entries
      const pending = hubCache.getPending();

      if (pending.length === 0) {
        logger.info("✅ Nenhum dado pendente para sincronização");
        return {
          success: true,
          recordsSent: 0,
          errors: [],
          timestamp: new Date(),
        };
      }

      logger.info(`📤 Sincronizando ${pending.length} registros...`);

      // Send data to BridgeLink
      const result = await this.sendToBridgeLink(pending);

      if (result.success) {
        // Mark entries as synced
        const syncedIds = pending.map((entry) => entry.id);
        hubCache.markAsSynced(syncedIds);

        // Clean up synced entries
        hubCache.clearSynced();

        this.lastSync = new Date();
        logger.info(
          `✅ Sincronização concluída: ${result.recordsSent} registros enviados`
        );
      }

      return result;
    } catch (error) {
      logger.error("Erro durante sincronização", error);
      return {
        success: false,
        recordsSent: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        timestamp: new Date(),
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Send data to BridgeLink API
   */
  private async sendToBridgeLink(
    entries: CacheEntry[]
  ): Promise<SyncResult> {
    try {
      // In real implementation, this would call the actual BridgeLink API
      // For now, simulate the API call
      await this.simulateApiCall();

      return {
        success: true,
        recordsSent: entries.length,
        errors: [],
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        recordsSent: 0,
        errors: [error instanceof Error ? error.message : "API call failed"],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Simulate API call delay
   */
  private async simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSync;
  }

  /**
   * Check if sync is currently running
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get pending records count
   */
  getPendingCount(): number {
    return hubCache.getPending().length;
  }

  /**
   * Schedule automatic sync
   */
  scheduleAutoSync(intervalMinutes: number): NodeJS.Timeout {
    logger.info(`⏰ Sincronização automática agendada (${intervalMinutes}min)`);
    return setInterval(() => {
      this.sincronizar().catch((error) => {
        logger.error("Erro na sincronização automática", error);
      });
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Force sync now (bypass checks)
   */
  async forceSyncNow(): Promise<SyncResult> {
    this.isSyncing = false; // Reset sync flag
    return this.sincronizar();
  }
}

export default new HubSync();
