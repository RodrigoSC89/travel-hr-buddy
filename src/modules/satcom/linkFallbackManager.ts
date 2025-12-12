/**
 * PATCH 171.0 - Link Fallback Manager
 * Manages automatic switching between satellite links (Iridium, Inmarsat, Starlink)
 * Implements intelligent failover with priority-based selection
 */

import { logger } from "@/lib/logger";
import type { SatcomConnection } from "./index";
import { satcomStatusMonitor } from "./satcom-status";

export interface FallbackPolicy {
  priorityOrder: string[]; // Connection IDs in priority order
  autoFallbackEnabled: boolean;
  autoRecoveryEnabled: boolean;
  fallbackThreshold: {
    maxLatency: number; // ms
    minSignalStrength: number; // percentage
    maxPacketLoss: number; // percentage
  };
  recoveryThreshold: {
    minUptime: number; // percentage
    minStabilityDuration: number; // seconds
  };
}

export interface FallbackEvent {
  id: string;
  timestamp: Date;
  type: "fallback_initiated" | "fallback_completed" | "recovery_initiated" | "recovery_completed";
  fromConnection: string;
  toConnection: string;
  reason: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface FallbackState {
  isActive: boolean;
  primaryConnectionId: string | null;
  activeConnectionId: string | null;
  fallbackConnectionId: string | null;
  activeSince: Date | null;
  reason: string | null;
}

class LinkFallbackManager {
  private policy: FallbackPolicy = {
    priorityOrder: [],
    autoFallbackEnabled: true,
    autoRecoveryEnabled: true,
    fallbackThreshold: {
      maxLatency: 2000, // 2 seconds
      minSignalStrength: 30, // 30%
      maxPacketLoss: 15 // 15%
    },
    recoveryThreshold: {
      minUptime: 95, // 95%
      minStabilityDuration: 120 // 2 minutes
    }
  };

  private state: FallbackState = {
    isActive: false,
    primaryConnectionId: null,
    activeConnectionId: null,
    fallbackConnectionId: null,
    activeSince: null,
    reason: null
  };

  private eventHistory: FallbackEvent[] = [];
  private maxEventHistory = 100;
  private stabilityTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize fallback manager with connections
   */
  initialize(connections: SatcomConnection[]): void {
    // Set priority order based on typical performance characteristics
    this.policy.priorityOrder = this.determineOptimalPriority(connections);

    // Set initial primary connection
    const primaryConnection = this.selectBestConnection(connections);
    if (primaryConnection) {
      this.state.primaryConnectionId = primaryConnection.id;
      this.state.activeConnectionId = primaryConnection.id;
      this.state.activeSince = new Date();

      logger.info(`[Fallback Manager] Initialized with primary: ${primaryConnection.name}`);
    }
  }

  /**
   * Determine optimal priority order for connections
   */
  private determineOptimalPriority(connections: SatcomConnection[]): string[] {
    // Rank connections by typical performance characteristics
    const ranked = [...connections].sort((a, b) => {
      // LEO satellites (Starlink) typically have lowest latency
      if (a.provider === "Starlink" && b.provider !== "Starlink") return -1;
      if (b.provider === "Starlink" && a.provider !== "Starlink") return 1;

      // Iridium for reliability
      if (a.provider === "Iridium" && b.provider !== "Iridium") return -1;
      if (b.provider === "Iridium" && a.provider !== "Iridium") return 1;

      // Then by signal strength
      return b.signalStrength - a.signalStrength;
    });

    return ranked.map(conn => conn.id);
  }

  /**
   * Select best available connection
   */
  private selectBestConnection(
    connections: SatcomConnection[],
    excludeIds: string[] = []
  ): SatcomConnection | null {
    const available = connections.filter(
      conn => 
        !excludeIds.includes(conn.id) &&
        conn.status === "connected" &&
        conn.signalStrength >= this.policy.fallbackThreshold.minSignalStrength
    );

    if (available.length === 0) return null;

    // Sort by priority order
    const sorted = available.sort((a, b) => {
      const aIndex = this.policy.priorityOrder.indexOf(a.id);
      const bIndex = this.policy.priorityOrder.indexOf(b.id);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    return sorted[0];
  }

  /**
   * Check if connection meets fallback thresholds
   */
  private shouldFallback(connectionId: string): boolean {
    const metrics = satcomStatusMonitor.getLatencyMetrics(connectionId);
    const packetLoss = satcomStatusMonitor.getPacketLossMetrics(connectionId);

    const highLatency = metrics.average > this.policy.fallbackThreshold.maxLatency;
    const highPacketLoss = packetLoss.lossRate > this.policy.fallbackThreshold.maxPacketLoss;

    if (highLatency || highPacketLoss) {
      logger.warn(
        `[Fallback Manager] Connection ${connectionId} degraded - ` +
        `Latency: ${metrics.average.toFixed(0)}ms, Packet Loss: ${packetLoss.lossRate.toFixed(2)}%`
      );
      return true;
    }

    return false;
  }

  /**
   * Initiate fallback to backup connection
   */
  async initiateFallback(
    connections: SatcomConnection[],
    reason: string
  ): Promise<boolean> {
    if (!this.policy.autoFallbackEnabled) {
      logger.info("[Fallback Manager] Auto-fallback is disabled");
      return false;
    }

    const currentConnection = connections.find(
      c => c.id === this.state.activeConnectionId
    );
    
    if (!currentConnection) {
      logger.error("[Fallback Manager] Current connection not found");
      return false;
    }

    // Select fallback connection
    const fallbackConnection = this.selectBestConnection(
      connections,
      [this.state.activeConnectionId!]
    );

    if (!fallbackConnection) {
      logger.error("[Fallback Manager] No fallback connection available");
      
      this.addEvent({
        type: "fallback_initiated",
        fromConnection: currentConnection.name,
        toConnection: "none",
        reason: "No fallback available",
        success: false
      });

      return false;
    }

    logger.info(
      `[Fallback Manager] Initiating fallback: ${currentConnection.name} -> ${fallbackConnection.name}`
    );

    // Record event
    this.addEvent({
      type: "fallback_initiated",
      fromConnection: currentConnection.name,
      toConnection: fallbackConnection.name,
      reason,
      success: true
    });

    // Update state
    this.state.isActive = true;
    this.state.activeConnectionId = fallbackConnection.id;
    this.state.fallbackConnectionId = fallbackConnection.id;
    this.state.activeSince = new Date();
    this.state.reason = reason;

    // Complete fallback
    this.addEvent({
      type: "fallback_completed",
      fromConnection: currentConnection.name,
      toConnection: fallbackConnection.name,
      reason: "Fallback successful",
      success: true
    });

    logger.info(`[Fallback Manager] Fallback completed to ${fallbackConnection.name}`);
    
    return true;
  }

  /**
   * Initiate recovery to primary connection
   */
  async initiateRecovery(connections: SatcomConnection[]): Promise<boolean> {
    if (!this.policy.autoRecoveryEnabled || !this.state.isActive) {
      return false;
    }

    const primaryConnection = connections.find(
      c => c.id === this.state.primaryConnectionId
    );

    if (!primaryConnection || primaryConnection.status !== "connected") {
      return false;
    }

    // Check if primary connection is stable enough for recovery
    const metrics = satcomStatusMonitor.getLatencyMetrics(primaryConnection.id);
    const packetLoss = satcomStatusMonitor.getPacketLossMetrics(primaryConnection.id);

    const isStable = 
      metrics.average < this.policy.fallbackThreshold.maxLatency &&
      packetLoss.lossRate < this.policy.fallbackThreshold.maxPacketLoss &&
      primaryConnection.signalStrength >= this.policy.fallbackThreshold.minSignalStrength;

    if (!isStable) {
      return false;
    }

    const currentConnection = connections.find(
      c => c.id === this.state.activeConnectionId
    );

    if (!currentConnection) {
      return false;
    }

    logger.info(
      `[Fallback Manager] Initiating recovery: ${currentConnection.name} -> ${primaryConnection.name}`
    );

    this.addEvent({
      type: "recovery_initiated",
      fromConnection: currentConnection.name,
      toConnection: primaryConnection.name,
      reason: "Primary connection restored",
      success: true
    });

    // Update state
    this.state.isActive = false;
    this.state.activeConnectionId = primaryConnection.id;
    this.state.fallbackConnectionId = null;
    this.state.activeSince = new Date();
    this.state.reason = null;

    this.addEvent({
      type: "recovery_completed",
      fromConnection: currentConnection.name,
      toConnection: primaryConnection.name,
      reason: "Recovery successful",
      success: true
    });

    logger.info(`[Fallback Manager] Recovery completed to ${primaryConnection.name}`);
    
    return true;
  }

  /**
   * Monitor connections and trigger fallback/recovery as needed
   */
  async monitor(connections: SatcomConnection[]): Promise<void> {
    if (!this.state.activeConnectionId) {
      this.initialize(connections);
      return;
    }

    const activeConnection = connections.find(
      c => c.id === this.state.activeConnectionId
    );

    if (!activeConnection) {
      logger.error("[Fallback Manager] Active connection not found");
      return;
    }

    // Check if active connection needs fallback
    if (
      activeConnection.status === "disconnected" ||
      this.shouldFallback(activeConnection.id)
    ) {
      const reason = activeConnection.status === "disconnected"
        ? "Connection lost"
        : "Connection degraded";
      
      await this.initiateFallback(connections, reason);
      return;
    }

    // Check if we can recover to primary
    if (this.state.isActive) {
      await this.initiateRecovery(connections);
    }
  }

  /**
   * Add event to history
   */
  private addEvent(event: Omit<FallbackEvent, "id" | "timestamp">): void {
    const newEvent: FallbackEvent = {
      ...event,
      id: `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date()
    });

    this.eventHistory.unshift(newEvent);

    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(0, this.maxEventHistory);
    }
  }

  /**
   * Get current fallback state
   */
  getState(): FallbackState {
    return { ...this.state };
  }

  /**
   * Get event history
   */
  getEventHistory(): FallbackEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get current policy
   */
  getPolicy(): FallbackPolicy {
    return { ...this.policy };
  }

  /**
   * Update policy
   */
  updatePolicy(updates: Partial<FallbackPolicy>): void {
    this.policy = {
      ...this.policy,
      ...updates
    };

    logger.info("[Fallback Manager] Policy updated", updates);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = {
      isActive: false,
      primaryConnectionId: null,
      activeConnectionId: null,
      fallbackConnectionId: null,
      activeSince: null,
      reason: null
    };

    this.stabilityTimers.forEach(timer => clearTimeout(timer));
    this.stabilityTimers.clear();

    logger.info("[Fallback Manager] Reset to initial state");
  }
}

// Export singleton instance
export const linkFallbackManager = new LinkFallbackManager();
