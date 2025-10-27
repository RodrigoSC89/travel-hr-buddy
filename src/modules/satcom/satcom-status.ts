/**
 * PATCH 171.0 - SATCOM Status Monitor
 * Monitors latency, packet loss, and active fallback status
 * Integrates with system-watchdog for centralized monitoring
 */

import { logger } from "@/lib/logger";
import type { SatcomConnection } from "./index";

export interface LatencyMetrics {
  current: number;
  average: number;
  min: number;
  max: number;
  samples: number[];
}

export interface PacketLossMetrics {
  lossRate: number; // percentage
  packetsLost: number;
  packetsTotal: number;
  lastCheckTime: Date;
}

export interface SatcomStatusReport {
  connectionId: string;
  connectionName: string;
  provider: string;
  isActive: boolean;
  isFallback: boolean;
  latency: LatencyMetrics;
  packetLoss: PacketLossMetrics;
  signalStrength: number;
  bandwidth: number;
  uptime: number; // percentage over last hour
  lastUpdate: Date;
}

export interface SatcomHealthStatus {
  overall: "healthy" | "degraded" | "critical";
  activeConnections: number;
  fallbackActive: boolean;
  reports: SatcomStatusReport[];
  timestamp: Date;
}

class SatcomStatusMonitor {
  private latencyHistory: Map<string, number[]> = new Map();
  private packetLossData: Map<string, PacketLossMetrics> = new Map();
  private maxHistorySize = 60; // Keep last 60 measurements

  /**
   * Update latency metrics for a connection
   */
  updateLatency(connectionId: string, latency: number): void {
    let history = this.latencyHistory.get(connectionId) || [];
    history.push(latency);

    // Keep only the last N measurements
    if (history.length > this.maxHistorySize) {
      history = history.slice(-this.maxHistorySize);
    }

    this.latencyHistory.set(connectionId, history);
  }

  /**
   * Get latency metrics for a connection
   */
  getLatencyMetrics(connectionId: string): LatencyMetrics {
    const history = this.latencyHistory.get(connectionId) || [];
    
    if (history.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        samples: []
      };
    }

    const sum = history.reduce((acc, val) => acc + val, 0);
    const average = sum / history.length;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const current = history[history.length - 1];

    return {
      current,
      average,
      min,
      max,
      samples: history
    };
  }

  /**
   * Update packet loss metrics
   */
  updatePacketLoss(
    connectionId: string,
    packetsLost: number,
    packetsTotal: number
  ): void {
    const lossRate = packetsTotal > 0 ? (packetsLost / packetsTotal) * 100 : 0;

    this.packetLossData.set(connectionId, {
      lossRate,
      packetsLost,
      packetsTotal,
      lastCheckTime: new Date()
    });

    // Log warning if packet loss is high
    if (lossRate > 5) {
      logger.warn(`[SATCOM Status] High packet loss detected on ${connectionId}: ${lossRate.toFixed(2)}%`);
    }
  }

  /**
   * Get packet loss metrics for a connection
   */
  getPacketLossMetrics(connectionId: string): PacketLossMetrics {
    return this.packetLossData.get(connectionId) || {
      lossRate: 0,
      packetsLost: 0,
      packetsTotal: 0,
      lastCheckTime: new Date()
    };
  }

  /**
   * Calculate uptime percentage for a connection
   */
  private calculateUptime(connection: SatcomConnection): number {
    // In a real implementation, this would track connection history
    // For now, we'll estimate based on current status
    switch (connection.status) {
    case "connected":
      return 99.9;
    case "degraded":
      return 85.0;
    case "disconnected":
      return 0;
    default:
      return 0;
    }
  }

  /**
   * Generate status report for a connection
   */
  generateStatusReport(
    connection: SatcomConnection,
    isFallback: boolean = false
  ): SatcomStatusReport {
    const latency = this.getLatencyMetrics(connection.id);
    const packetLoss = this.getPacketLossMetrics(connection.id);
    const uptime = this.calculateUptime(connection);

    return {
      connectionId: connection.id,
      connectionName: connection.name,
      provider: connection.provider,
      isActive: connection.status === "connected",
      isFallback,
      latency,
      packetLoss,
      signalStrength: connection.signalStrength,
      bandwidth: connection.bandwidth,
      uptime,
      lastUpdate: new Date()
    };
  }

  /**
   * Generate comprehensive health status
   */
  generateHealthStatus(
    connections: SatcomConnection[],
    fallbackActive: boolean
  ): SatcomHealthStatus {
    const reports = connections.map(conn => 
      this.generateStatusReport(conn, false)
    );

    const activeConnections = reports.filter(r => r.isActive).length;
    const hasHighPacketLoss = reports.some(r => r.packetLoss.lossRate > 10);
    const hasHighLatency = reports.some(r => r.latency.average > 1000);
    const hasDisconnected = reports.some(r => !r.isActive);

    let overall: "healthy" | "degraded" | "critical" = "healthy";
    
    if (hasDisconnected || fallbackActive) {
      overall = "degraded";
    }
    if (activeConnections === 0 || (hasHighPacketLoss && hasHighLatency)) {
      overall = "critical";
    }

    return {
      overall,
      activeConnections,
      fallbackActive,
      reports,
      timestamp: new Date()
    };
  }

  /**
   * Simulate latency measurement (in production, this would be real measurements)
   */
  simulateLatencyMeasurement(connection: SatcomConnection): number {
    // Simulate realistic latency based on provider type
    const baseLatency = connection.latency;
    const variance = baseLatency * 0.1; // 10% variance
    const measured = baseLatency + (Math.random() - 0.5) * variance * 2;

    this.updateLatency(connection.id, measured);
    return measured;
  }

  /**
   * Simulate packet loss measurement
   */
  simulatePacketLossMeasurement(connection: SatcomConnection): void {
    const packetsTotal = 1000;
    let packetsLost = 0;

    // Simulate packet loss based on connection status
    switch (connection.status) {
    case "connected":
      // Low packet loss for good connections
      packetsLost = Math.floor(Math.random() * 5);
      break;
    case "degraded":
      // Higher packet loss for degraded connections
      packetsLost = Math.floor(Math.random() * 50 + 10);
      break;
    case "disconnected":
      // Complete packet loss
      packetsLost = packetsTotal;
      break;
    }

    this.updatePacketLoss(connection.id, packetsLost, packetsTotal);
  }

  /**
   * Clear all monitoring data
   */
  clear(): void {
    this.latencyHistory.clear();
    this.packetLossData.clear();
    logger.info("[SATCOM Status] Monitoring data cleared");
  }

  /**
   * Export monitoring data for analysis
   */
  exportData(): {
    latency: Record<string, number[]>;
    packetLoss: Record<string, PacketLossMetrics>;
    } {
    const latency: Record<string, number[]> = {};
    const packetLoss: Record<string, PacketLossMetrics> = {};

    this.latencyHistory.forEach((value, key) => {
      latency[key] = [...value];
    });

    this.packetLossData.forEach((value, key) => {
      packetLoss[key] = { ...value };
    });

    return { latency, packetLoss };
  }
}

// Export singleton instance
export const satcomStatusMonitor = new SatcomStatusMonitor();
