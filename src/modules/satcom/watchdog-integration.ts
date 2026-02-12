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

interface FallbackState {
  isActive: boolean;
  reason?: string | null;
}

class SatcomWatchdogIntegration {
  private config: SatcomWatchdogConfig = {
    enabled: true,
    checkIntervalMs: 30000,
    reportToWatchdog: true
  };

  private monitoringInterval: NodeJS.Timeout | null = null;
  private connections: SatcomConnection[] = [];

  start(connections: SatcomConnection[]): void {
    if (!this.config.enabled) {
      logger.info("[SATCOM Watchdog] Integration disabled");
      return;
    }

    this.connections = connections;
    linkFallbackManager.initialize(connections);
    logger.info("[SATCOM Watchdog] Starting integration with system watchdog");
    this.runHealthCheck();
    this.monitoringInterval = setInterval(() => {
      this.runHealthCheck();
    }, this.config.checkIntervalMs);
    logger.info("[SATCOM Watchdog] Integration started");
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info("[SATCOM Watchdog] Integration stopped");
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      this.connections.forEach(conn => {
        satcomStatusMonitor.simulateLatencyMeasurement(conn);
        satcomStatusMonitor.simulatePacketLossMeasurement(conn);
      });

      await linkFallbackManager.monitor(this.connections);

      const fallbackState: FallbackState = linkFallbackManager.getState();
      const healthStatus = satcomStatusMonitor.generateHealthStatus(
        this.connections,
        fallbackState.isActive
      );

      const latency = Date.now() - startTime;

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
      };

      if (this.config.reportToWatchdog) {
        logger.debug("[SATCOM Watchdog] Health check completed", result);
      }

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
      };
    }
  }

  private handleAlerts(
    overall: "healthy" | "degraded" | "critical",
    fallbackState: FallbackState
  ): void {
    const activeConnections = this.connections.filter(c => c.status === "connected");

    if (overall === "critical" && activeConnections.length === 0) {
      alertHandler.alertNoConnections();
      return;
    }

    this.connections.forEach(conn => {
      if (conn.status === "disconnected") return;

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

    if (overall === "healthy" && activeConnections.length === this.connections.length) {
      const recentAlerts = alertHandler.getActiveAlerts();
      const hadCriticalAlert = recentAlerts.some(a => a.severity === "critical");
      if (hadCriticalAlert) {
        alertHandler.alertAllConnectionsRestored();
      }
    }
  }

  updateConnections(connections: SatcomConnection[]): void {
    this.connections = connections;
  }

  getStatus(): {
    isRunning: boolean;
    fallbackActive: boolean;
    activeConnections: number;
    totalConnections: number;
  } {
    const fallbackState: FallbackState = linkFallbackManager.getState();
    const activeConnections = this.connections.filter(c => c.status === "connected").length;

    return {
      isRunning: this.monitoringInterval !== null,
      fallbackActive: fallbackState.isActive,
      activeConnections,
      totalConnections: this.connections.length
    };
  }

  updateConfig(updates: Partial<SatcomWatchdogConfig>): void {
    this.config = { ...this.config, ...updates };
    if (updates.checkIntervalMs && this.monitoringInterval) {
      this.stop();
      this.start(this.connections);
    }
    logger.info("[SATCOM Watchdog] Configuration updated", updates);
  }

  getConfig(): SatcomWatchdogConfig {
    return { ...this.config };
  }
}

export const satcomWatchdogIntegration = new SatcomWatchdogIntegration();
