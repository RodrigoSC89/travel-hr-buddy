/**
 * Control Hub Core - Main Orchestration Module
 * 
 * Orchestrates embedded modules, offline cache, and BridgeLink synchronization.
 * Central hub for the Nautilus control system.
 */

import { logger } from "@/lib/logger";
import hubMonitor, { type SystemStatus } from "./hub_monitor";
import hubSync, { type SyncResult } from "./hub_sync";
import hubBridge, { type BridgeLinkStatus } from "./hub_bridge";
import hubCache from "./hub_cache";
import hubConfig from "./hub_config.json";

export interface ControlHubState {
  initialized: boolean;
  moduleStatus: SystemStatus | null;
  bridgeLinkStatus: BridgeLinkStatus;
  pendingRecords: number;
  lastSync: Date | null;
}

export class ControlHub {
  private state: ControlHubState = {
    initialized: false,
    moduleStatus: null,
    bridgeLinkStatus: hubBridge.getStatus(),
    pendingRecords: 0,
    lastSync: null,
  };

  private autoSyncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize Control Hub
   */
  async iniciar(): Promise<void> {
    if (this.state.initialized) {
      logger.warn("Control Hub já inicializado");
      return;
    }

    logger.info("🔱 Nautilus Control Hub iniciando...");

    try {
      // Check BridgeLink connection
      await hubBridge.checkConnection();
      this.state.bridgeLinkStatus = hubBridge.getStatus();

      // Authenticate if required
      if (hubConfig.bridge_link.auth_required) {
        await hubBridge.authenticate();
      }

      // Get initial module status
      this.state.moduleStatus = await hubMonitor.getStatus();

      // Get pending records count
      this.state.pendingRecords = hubSync.getPendingCount();

      // Start auto-sync if enabled
      if (hubConfig.features.real_time_sync) {
        this.startAutoSync();
      }

      this.state.initialized = true;
      logger.info("✅ Nautilus Control Hub inicializado com sucesso");

      // Log initial status
      this.logStatus();
    } catch (error) {
      logger.error("Erro ao inicializar Control Hub", error);
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): ControlHubState {
    return { ...this.state };
  }

  /**
   * Refresh all status information
   */
  async refresh(): Promise<void> {
    try {
      // Update module status
      this.state.moduleStatus = await hubMonitor.getStatus();

      // Update BridgeLink status
      await hubBridge.checkConnection();
      this.state.bridgeLinkStatus = hubBridge.getStatus();

      // Update pending records
      this.state.pendingRecords = hubSync.getPendingCount();

      // Update last sync
      this.state.lastSync = hubSync.getLastSyncTime();

      logger.info("🔄 Status atualizado");
    } catch (error) {
      logger.error("Erro ao atualizar status", error);
      throw error;
    }
  }

  /**
   * Synchronize with BridgeLink
   */
  async sincronizar(): Promise<SyncResult> {
    try {
      const result = await hubSync.sincronizar();
      this.state.lastSync = result.timestamp;
      this.state.pendingRecords = hubSync.getPendingCount();
      return result;
    } catch (error) {
      logger.error("Erro durante sincronização", error);
      throw error;
    }
  }

  /**
   * Store data for offline sync
   */
  async storeOffline(data: unknown, module: string): Promise<void> {
    if (hubCache.isCacheFull()) {
      logger.error("Cache cheio - não é possível armazenar mais dados");
      throw new Error("Cache full");
    }

    await hubCache.salvar(data, module);
    this.state.pendingRecords = hubSync.getPendingCount();
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<{
    modules: SystemStatus;
    bridge: BridgeLinkStatus;
    cache: {
      pending: number;
      sizeMB: number;
      isFull: boolean;
    };
    sync: {
      lastSync: Date | null;
      inProgress: boolean;
    };
  }> {
    await this.refresh();

    return {
      modules: this.state.moduleStatus || ({} as SystemStatus),
      bridge: this.state.bridgeLinkStatus,
      cache: {
        pending: this.state.pendingRecords,
        sizeMB: hubCache.getCacheSizeMB(),
        isFull: hubCache.isCacheFull(),
      },
      sync: {
        lastSync: this.state.lastSync,
        inProgress: hubSync.isSyncInProgress(),
      },
    };
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    const intervalMinutes = hubConfig.sync.interval_seconds / 60;
    this.autoSyncInterval = hubSync.scheduleAutoSync(intervalMinutes);
    logger.info(`⏰ Sincronização automática ativada (${intervalMinutes}min)`);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      logger.info("⏹️ Sincronização automática desativada");
    }
  }

  /**
   * Log current status
   */
  private logStatus(): void {
    console.log("\n🔱 === Nautilus Control Hub Status ===");
    console.log(
      `Inicializado: ${this.state.initialized ? "✅" : "❌"}`
    );
    console.log(
      `BridgeLink: ${this.state.bridgeLinkStatus.connected ? "🌐 Conectado" : "⚫ Offline"}`
    );
    console.log(`Registros pendentes: ${this.state.pendingRecords}`);
    console.log(
      `Última sincronização: ${this.state.lastSync?.toLocaleString("pt-BR") || "Nunca"}`
    );

    if (this.state.moduleStatus) {
      console.log(
        `Status geral: ${this.getStatusEmoji(this.state.moduleStatus.overall)} ${this.state.moduleStatus.overall}`
      );
    }
    console.log("=====================================\n");
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
    case "Healthy":
      return "✅";
    case "Degraded":
      return "⚠️";
    case "Critical":
      return "🔴";
    default:
      return "❓";
    }
  }

  /**
   * Get system health
   */
  async getHealth(): Promise<{
    status: "healthy" | "degraded" | "critical";
    details: {
      modules: string;
      bridge: string;
      cache: string;
    };
  }> {
    await this.refresh();

    const moduleStatus = this.state.moduleStatus?.overall.toLowerCase() || "unknown";
    const bridgeStatus = this.state.bridgeLinkStatus.connected ? "connected" : "offline";
    const cacheStatus = hubCache.isCacheFull() ? "full" : "ok";

    let overallStatus: "healthy" | "degraded" | "critical" = "healthy";

    if (
      moduleStatus === "critical" ||
      (!this.state.bridgeLinkStatus.connected && this.state.pendingRecords > 100)
    ) {
      overallStatus = "critical";
    } else if (
      moduleStatus === "degraded" ||
      !this.state.bridgeLinkStatus.connected ||
      hubCache.isCacheFull()
    ) {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      details: {
        modules: moduleStatus,
        bridge: bridgeStatus,
        cache: cacheStatus,
      },
    };
  }

  /**
   * Shutdown Control Hub
   */
  shutdown(): void {
    logger.info("🛑 Encerrando Control Hub...");
    this.stopAutoSync();
    this.state.initialized = false;
    logger.info("✅ Control Hub encerrado");
  }
}

export default new ControlHub();
