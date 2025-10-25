/**
 * SATCOM Simulator - Patch 142.1
 * Simulates satellite connection loss and fallback scenarios
 */

import { logger } from "@/lib/logger";
import type { SatcomConnection } from "./index";

export type DisconnectMode = "manual" | "timed";

export interface SimulationConfig {
  mode: DisconnectMode;
  targetConnectionId?: string;
  duration?: number; // in seconds for timed mode
}

export interface SimulationEvent {
  timestamp: string;
  type: "disconnect" | "fallback_activated" | "reconnect";
  connectionId: string;
  connectionName: string;
  message: string;
}

/**
 * Logs a SATCOM event to the operational logging system
 */
export const logEvent = (
  module: string,
  eventType: string,
  timestamp: string,
  vesselId: string,
  metadata?: Record<string, any>
) => {
  const logEntry = {
    module,
    eventType,
    timestamp,
    vesselId,
    ...metadata,
  };

  logger.info(`[SATCOM Event] ${eventType}`, logEntry);

  // Store in localStorage for operational logs
  try {
    const existingLogs = localStorage.getItem("satcom_operational_logs");
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem("satcom_operational_logs", JSON.stringify(logs));
  } catch (error) {
    logger.error("Failed to store SATCOM log", error);
  }
};

/**
 * Simulates a connection disconnection
 */
export const simulateDisconnect = (
  connection: SatcomConnection,
  vesselId: string = "vessel-001"
): SimulationEvent => {
  const timestamp = new Date().toISOString();
  const event: SimulationEvent = {
    timestamp,
    type: "disconnect",
    connectionId: connection.id,
    connectionName: connection.name,
    message: `${connection.name} desconectado - iniciando fallback`,
  };

  logEvent("satcom", "connection-lost", timestamp, vesselId, {
    connectionId: connection.id,
    connectionName: connection.name,
    provider: connection.provider,
  });

  logger.warn(`SATCOM: ${event.message}`);
  return event;
};

/**
 * Simulates fallback activation
 */
export const simulateFallbackActivation = (
  primaryConnection: SatcomConnection,
  fallbackConnection: SatcomConnection,
  vesselId: string = "vessel-001"
): SimulationEvent => {
  const timestamp = new Date().toISOString();
  const event: SimulationEvent = {
    timestamp,
    type: "fallback_activated",
    connectionId: fallbackConnection.id,
    connectionName: fallbackConnection.name,
    message: `Fallback ativado: ${fallbackConnection.name}`,
  };

  logEvent("satcom", "fallback-activated", timestamp, vesselId, {
    primaryConnectionId: primaryConnection.id,
    primaryConnectionName: primaryConnection.name,
    fallbackConnectionId: fallbackConnection.id,
    fallbackConnectionName: fallbackConnection.name,
    fallbackProvider: fallbackConnection.provider,
  });

  logger.info(`SATCOM: ${event.message}`);
  return event;
};

/**
 * Simulates reconnection
 */
export const simulateReconnect = (
  connection: SatcomConnection,
  vesselId: string = "vessel-001"
): SimulationEvent => {
  const timestamp = new Date().toISOString();
  const event: SimulationEvent = {
    timestamp,
    type: "reconnect",
    connectionId: connection.id,
    connectionName: connection.name,
    message: `${connection.name} reconectado`,
  };

  logEvent("satcom", "connection-restored", timestamp, vesselId, {
    connectionId: connection.id,
    connectionName: connection.name,
    provider: connection.provider,
  });

  logger.info(`SATCOM: ${event.message}`);
  return event;
};

/**
 * Get the next best fallback connection
 */
export const getNextFallback = (
  connections: SatcomConnection[],
  excludeIds: string[] = []
): SatcomConnection | null => {
  const availableConnections = connections
    .filter(conn => 
      !excludeIds.includes(conn.id) && 
      conn.status !== "disconnected"
    )
    .sort((a, b) => {
      // Priority: connected > degraded
      if (a.status === "connected" && b.status !== "connected") return -1;
      if (b.status === "connected" && a.status !== "connected") return 1;
      
      // Then by signal strength
      return b.signalStrength - a.signalStrength;
    });

  return availableConnections[0] || null;
};

/**
 * Retrieves operational logs
 */
export const getOperationalLogs = (): any[] => {
  try {
    const logs = localStorage.getItem("satcom_operational_logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    logger.error("Failed to retrieve SATCOM logs", error);
    return [];
  }
};

/**
 * Clears operational logs
 */
export const clearOperationalLogs = (): void => {
  try {
    localStorage.removeItem("satcom_operational_logs");
    logger.info("SATCOM operational logs cleared");
  } catch (error) {
    logger.error("Failed to clear SATCOM logs", error);
  }
};
