/**
 * useSatcomMonitor Hook - Patch 171.0 Enhanced
 * Monitors SATCOM connections and manages fallback state
 * Now integrated with enhanced monitoring and alert systems
 */

import { useState, useEffect, useCallback } from "react";
import type { SatcomConnection } from "../index";
import {
  simulateDisconnect,
  simulateFallbackActivation,
  simulateReconnect,
  getNextFallback,
  logEvent,
  type SimulationEvent,
} from "../simulator";
import { useToast } from "@/hooks/use-toast";
import { satcomStatusMonitor } from "../satcom-status";
import { linkFallbackManager } from "../linkFallbackManager";
import { alertHandler } from "../alertHandler";
import { satcomWatchdogIntegration } from "../watchdog-integration";

interface UseSatcomMonitorProps {
  connections: SatcomConnection[];
  onConnectionUpdate?: (connections: SatcomConnection[]) => void;
  vesselId?: string;
}

interface UseSatcomMonitorReturn {
  connections: SatcomConnection[];
  primaryConnection: SatcomConnection | null;
  fallbackConnection: SatcomConnection | null;
  isFallbackActive: boolean;
  simulationEvents: SimulationEvent[];
  simulateConnectionLoss: (connectionId: string) => void;
  simulateReconnection: (connectionId: string) => void;
  clearEvents: () => void;
}

export const useSatcomMonitor = ({
  connections: initialConnections,
  onConnectionUpdate,
  vesselId = "vessel-001",
}: UseSatcomMonitorProps): UseSatcomMonitorReturn => {
  const [connections, setConnections] = useState<SatcomConnection[]>(initialConnections);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const { toast } = useToast();

  // Initialize watchdog integration on mount
  useEffect(() => {
    if (connections.length > 0) {
      satcomWatchdogIntegration.start(connections);
      linkFallbackManager.initialize(connections);

      // Register alert handler callback
      const unsubscribe = alertHandler.onAlert((alert) => {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.severity === "error" || alert.severity === "critical" 
            ? "destructive" 
            : "default",
        });
      });

      return () => {
        satcomWatchdogIntegration.stop();
        unsubscribe();
      };
    }
  }, []); // Only run once on mount

  // Sync with parent component and update watchdog
  useEffect(() => {
    setConnections(initialConnections);
    satcomWatchdogIntegration.updateConnections(initialConnections);
    
    // Update status monitor for each connection
    initialConnections.forEach(conn => {
      satcomStatusMonitor.updateLatency(conn.id, conn.latency);
    });
  }, [initialConnections]);

  // Determine primary and fallback connections from fallback manager
  const fallbackState = linkFallbackManager.getState();
  const primaryConnection = fallbackState.primaryConnectionId
    ? connections.find(c => c.id === fallbackState.primaryConnectionId) || null
    : connections.find(c => c.status === "connected") || null;
  const fallbackConnection = fallbackState.isActive && fallbackState.fallbackConnectionId
    ? connections.find(c => c.id === fallbackState.fallbackConnectionId) || null
    : null;

  // Sync fallback state
  useEffect(() => {
    setIsFallbackActive(fallbackState.isActive);
  }, [fallbackState.isActive]);

  // Add event to log
  const addEvent = useCallback((event: SimulationEvent) => {
    setSimulationEvents(prev => [...prev, event]);
  }, []);

  // Simulate connection loss
  const simulateConnectionLoss = useCallback((connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Disconnect the connection
    const event = simulateDisconnect(connection, vesselId);
    addEvent(event);

    // Update connection status
    const updatedConnections = connections.map(c => 
      c.id === connectionId 
        ? { ...c, status: "disconnected" as const, signalStrength: 0 }
        : c
    );

    // Find fallback
    const fallback = getNextFallback(updatedConnections, [connectionId]);
    
    if (fallback) {
      setIsFallbackActive(true);
      const fallbackEvent = simulateFallbackActivation(connection, fallback, vesselId);
      addEvent(fallbackEvent);

      toast({
        title: "Fallback Ativado",
        description: `Conexão transferida para ${fallback.name}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Perda de Conectividade",
        description: "Nenhuma conexão de backup disponível",
        variant: "destructive",
      });
    }

    setConnections(updatedConnections);
    onConnectionUpdate?.(updatedConnections);
  }, [connections, vesselId, addEvent, onConnectionUpdate, toast]);

  // Simulate reconnection
  const simulateReconnection = useCallback((connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Reconnect the connection
    const event = simulateReconnect(connection, vesselId);
    addEvent(event);

    // Update connection status
    const updatedConnections = connections.map(c =>
      c.id === connectionId
        ? { 
          ...c, 
          status: "connected" as const, 
          signalStrength: Math.floor(Math.random() * 20) + 80, // 80-100%
          lastSeen: new Date().toISOString(),
        }
        : c
    );

    setConnections(updatedConnections);
    onConnectionUpdate?.(updatedConnections);

    // Check if we can disable fallback
    const primaryIsBack = updatedConnections.some(
      c => c.status === "connected" && c.id === connectionId
    );
    
    if (primaryIsBack && isFallbackActive) {
      setIsFallbackActive(false);
      
      toast({
        title: "Conexão Restaurada",
        description: `${connection.name} reconectado. Retornando ao modo normal.`,
        variant: "default",
      });

      logEvent("satcom", "primary-restored", new Date().toISOString(), vesselId, {
        connectionId: connection.id,
        connectionName: connection.name,
      });
    }
  }, [connections, vesselId, isFallbackActive, addEvent, onConnectionUpdate, toast]);

  // Clear events
  const clearEvents = useCallback(() => {
    setSimulationEvents([]);
  }, []);

  // Monitor connection health
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for degraded connections
      const hasDisconnected = connections.some(c => c.status === "disconnected");
      const hasConnected = connections.some(c => c.status === "connected");

      // Auto-activate fallback if primary is down and we have backup
      if (hasDisconnected && hasConnected && !isFallbackActive) {
        const fallback = getNextFallback(connections);
        if (fallback) {
          setIsFallbackActive(true);
        }
      }

      // Auto-deactivate fallback if all connections are up
      if (!hasDisconnected && isFallbackActive) {
        setIsFallbackActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connections, isFallbackActive]);

  return {
    connections,
    primaryConnection,
    fallbackConnection,
    isFallbackActive,
    simulationEvents,
    simulateConnectionLoss,
    simulateReconnection,
    clearEvents,
  };
};
