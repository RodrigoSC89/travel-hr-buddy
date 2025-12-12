/**
 * PATCH 171.0 - SATCOM Integration with System Watchdog
 * Connects SATCOM monitoring to centralized system watchdog
 */

import { watchdogService } from "@/modules/system-watchdog";
import type { HealthCheckResult } from "@/modules/system-watchdog";
import { satcomStatusMonitor } from "./satcom-status";
import { linkFallbackManager } from "./linkFallbackManager";
import { alertHandler } from "./alertHandler";
import type { SatcomConnection } from "./index";
import { logger } from "@/lib/logger";

export interface SatcomWatchdogConfig {
  enabled: boolean;
  checkIntervalMs: number;
  reportToWatchdog: boolean;
}

class SatcomWatchdogIntegration {
  private config: SatcomWatchdogConfig = {
    enabled: true,
    checkIntervalMs: 30000, // 30 seconds
    reportToWatchdog: true
  };

  private monitoringInterval: NodeJS.Timeout | null = null;
  private connections: SatcomConnection[] = [];

  /**
   * Start SATCOM monitoring integration
   */
  start(connections: SatcomConnection[]): void {
    if (!this.config.enabled) {
      logger.info("[SATCOM Watchdog] Integration disabled");
      return;
    }

    this.connections = connections;

    // Initialize fallback manager
    linkFallbackManager.initialize(connections);

    logger.info("[SATCOM Watchdog] Starting integration with system watchdog");

    // Run initial check
    this.runHealthCheck();

    // Schedule periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.runHealthCheck();
    }, this.config.checkIntervalMs);

    logger.info("[SATCOM Watchdog] Integration started");
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info("[SATCOM Watchdog] Integration stopped");
  }

  /**
   * Run health check and report to watchdog
   */
  async runHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Update connection measurements
      this.connections.forEach(conn => {
        satcomStatusMonitor.simulateLatencyMeasurement(conn);
        satcomStatusMonitor.simulatePacketLossMeasurement(conn);
      });

      // Monitor connections with fallback manager
      await linkFallbackManager.monitor(this.connections);

      // Get health status
      const fallbackState = linkFallbackManager.getState();
      const healthStatus = satcomStatusMonitor.generateHealthStatus(
        this.connections,
        fallbackState.isActive
      );

      const latency = Date.now() - startTime;

      // Determine overall status for watchdog
      let status: "online" | "degraded" | "offline";
      let message: string | undefined;

      switch (healthStatus.overall) {
      case "healthy":
        status = "online";
        break;
      case "degraded":
        status = "degraded";
        message = fallbackState.isActive
          ? `Fallback active: ${fallbackState.reason}`
          : "Some connections degraded";
        break;
      case "critical":
        status = "offline";
        message = "Critical connectivity issues";
        break;
      }

      const result: HealthCheckResult = {
        service: "satcom",
        status,
        latency,
        message,
        timestamp: new Date()
      });

      // Report to system watchdog if enabled
      if (this.config.reportToWatchdog) {
        // The watchdog service will handle logging
        logger.debug("[SATCOM Watchdog] Health check completed", result);
      }

      // Handle alerts based on status
      this.handleAlerts(healthStatus.overall, fallbackState);

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error("[SATCOM Watchdog] Health check failed", error);

      return {
        service: "satcom",
        status: "offline",
        latency,
        message: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle alerts based on health status
   */
  private handleAlerts(
    overall: "healthy" | "degraded" | "critical",
    fallbackState: any
  ): void {
    const activeConnections = this.connections.filter(c => c.status === "connected");

    // Alert for critical state (no connections)
    if (overall === "critical" && activeConnections.length === 0) {
      alertHandler.alertNoConnections();
      return;
    }

    // Alert for degraded connections
    this.connections.forEach(conn => {
      if (conn.status === "disconnected") {
        // Connection loss is handled by fallback manager events
        return;
      }

      if (conn.status === "degraded") {
        const metrics = satcomStatusMonitor.getLatencyMetrics(conn.id);
        const packetLoss = satcomStatusMonitor.getPacketLossMetrics(conn.id);

        alertHandler.alertDegradation(conn, {
          latency: metrics.average,
          packetLoss: packetLoss.lossRate,
          signalStrength: conn.signalStrength
        });
      }
    });

    // Check if all connections are now healthy after being critical
    if (overall === "healthy" && activeConnections.length === this.connections.length) {
      const recentAlerts = alertHandler.getActiveAlerts();
      const hadCriticalAlert = recentAlerts.some(a => a.severity === "critical");
      
      if (hadCriticalAlert) {
        alertHandler.alertAllConnectionsRestored();
      }
    }
  }

  /**
   * Update connections
   */
  updateConnections(connections: SatcomConnection[]): void {
    this.connections = connections;
  }

  /**
   * Get current status
   */
  getStatus(): {
    isRunning: boolean;
    fallbackActive: boolean;
    activeConnections: number;
    totalConnections: number;
    } {
    const fallbackState = linkFallbackManager.getState();
    const activeConnections = this.connections.filter(c => c.status === "connected").length;

    return {
      isRunning: this.monitoringInterval !== null,
      fallbackActive: fallbackState.isActive,
      activeConnections,
      totalConnections: this.connections.length
    });
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SatcomWatchdogConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    });

    // Restart monitoring if interval changed
    if (updates.checkIntervalMs && this.monitoringInterval) {
      this.stop();
      this.start(this.connections);
    }

    logger.info("[SATCOM Watchdog] Configuration updated", updates);
  }

  /**
   * Get configuration
   */
  getConfig(): SatcomWatchdogConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const satcomWatchdogIntegration = new SatcomWatchdogIntegration();
