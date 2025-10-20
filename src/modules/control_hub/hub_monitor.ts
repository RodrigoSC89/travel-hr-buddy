/**
 * Hub Monitor - Module Status Monitoring
 * 
 * Monitors the health and status of all Nautilus modules.
 * Provides real-time status updates and alerts.
 */

import { logger } from "@/lib/logger";

export interface ModuleStatus {
  name: string;
  status: "OK" | "Warning" | "Error" | "Offline";
  lastCheck: Date;
  metrics?: {
    uptime?: string;
    errors?: number;
    performance?: string;
  };
}

export interface SystemStatus {
  mmi: ModuleStatus;
  peo_dp: ModuleStatus;
  dp_intelligence: ModuleStatus;
  bridge_link: ModuleStatus;
  sgso: ModuleStatus;
  overall: "Healthy" | "Degraded" | "Critical";
}

export class HubMonitor {
  private statusCache: SystemStatus | null = null;
  private lastCheckTime: Date | null = null;

  /**
   * Get current status of all modules
   */
  async getStatus(): Promise<SystemStatus> {
    // If cache is fresh (less than 30 seconds old), return it
    if (
      this.statusCache &&
      this.lastCheckTime &&
      Date.now() - this.lastCheckTime.getTime() < 30000
    ) {
      return this.statusCache;
    }

    // Otherwise, fetch fresh status
    const status = await this.fetchStatus();
    this.statusCache = status;
    this.lastCheckTime = new Date();
    return status;
  }

  /**
   * Fetch fresh status for all modules
   */
  private async fetchStatus(): Promise<SystemStatus> {
    logger.info("📡 Verificando status dos módulos...");

    const status: SystemStatus = {
      mmi: this.getModuleStatus("MMI - Manutenção Inteligente"),
      peo_dp: this.getModuleStatus("PEO-DP - Auditoria"),
      dp_intelligence: this.getModuleStatus("DP Intelligence"),
      bridge_link: this.getBridgeLinkStatus(),
      sgso: this.getModuleStatus("SGSO"),
      overall: "Healthy",
    };

    // Calculate overall status
    const statuses = Object.values(status).filter(
      (s): s is ModuleStatus => typeof s === "object" && "status" in s
    );
    const hasError = statuses.some((s) => s.status === "Error");
    const hasWarning = statuses.some((s) => s.status === "Warning");
    const hasOffline = statuses.some((s) => s.status === "Offline");

    if (hasError || hasOffline) {
      status.overall = "Critical";
    } else if (hasWarning) {
      status.overall = "Degraded";
    }

    return status;
  }

  /**
   * Get status for a specific module
   */
  private getModuleStatus(moduleName: string): ModuleStatus {
    // Simulate status check - in real implementation, this would ping module endpoints
    const statusOptions: ModuleStatus["status"][] = [
      "OK",
      "OK",
      "OK",
      "Warning",
    ];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    return {
      name: moduleName,
      status: randomStatus,
      lastCheck: new Date(),
      metrics: {
        uptime: this.getRandomUptime(),
        errors: Math.floor(Math.random() * 3),
        performance: this.getRandomPerformance(),
      },
    };
  }

  /**
   * Get BridgeLink connectivity status
   */
  private getBridgeLinkStatus(): ModuleStatus {
    // Check if online
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    return {
      name: "BridgeLink - Conectividade",
      status: isOnline ? "OK" : "Offline",
      lastCheck: new Date(),
      metrics: {
        uptime: isOnline ? "Online" : "Offline",
        errors: 0,
        performance: isOnline ? "Normal" : "N/A",
      },
    };
  }

  /**
   * Display status in console (for debugging)
   */
  exibir_status(): void {
    const status = this.statusCache || {
      mmi: { name: "MMI", status: "Unknown", lastCheck: new Date() },
      peo_dp: { name: "PEO-DP", status: "Unknown", lastCheck: new Date() },
      dp_intelligence: {
        name: "DP Intelligence",
        status: "Unknown",
        lastCheck: new Date(),
      },
      bridge_link: {
        name: "BridgeLink",
        status: "Unknown",
        lastCheck: new Date(),
      },
      sgso: { name: "SGSO", status: "Unknown", lastCheck: new Date() },
      overall: "Unknown" as const,
    };

    console.log("\n📡 Status Operacional:");
    console.log(`- MMI: ${status.mmi.status}`);
    console.log(`- PEO-DP: ${status.peo_dp.status}`);
    console.log(`- DP Intelligence: ${status.dp_intelligence.status}`);
    console.log(`- BridgeLink: ${status.bridge_link.status}`);
    console.log(`- SGSO: ${status.sgso.status}`);
    console.log(
      `Última verificação: ${new Date().toLocaleTimeString("pt-BR")}`
    );
  }

  /**
   * Get random uptime for simulation
   */
  private getRandomUptime(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get random performance metric for simulation
   */
  private getRandomPerformance(): string {
    const performances = ["Excellent", "Good", "Normal", "Slow"];
    return performances[Math.floor(Math.random() * performances.length)];
  }

  /**
   * Check if system needs attention
   */
  needsAttention(): boolean {
    if (!this.statusCache) return false;
    return this.statusCache.overall !== "Healthy";
  }

  /**
   * Get alerts for critical issues
   */
  getAlerts(): string[] {
    if (!this.statusCache) return [];

    const alerts: string[] = [];
    const modules = [
      this.statusCache.mmi,
      this.statusCache.peo_dp,
      this.statusCache.dp_intelligence,
      this.statusCache.bridge_link,
      this.statusCache.sgso,
    ];

    modules.forEach((module) => {
      if (module.status === "Error") {
        alerts.push(`🔴 ${module.name}: Erro crítico detectado`);
      } else if (module.status === "Offline") {
        alerts.push(`⚫ ${module.name}: Módulo offline`);
      } else if (module.status === "Warning") {
        alerts.push(`⚠️ ${module.name}: Atenção necessária`);
      }
    });

    return alerts;
  }
}

export default new HubMonitor();
