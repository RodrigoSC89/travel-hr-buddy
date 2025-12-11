/**
 * SATCOM Dashboard - Main Component
 * Monitors satellite communication connectivity (Iridium, Starlink, etc.)
 * PATCH 171.0 - Enhanced with redundancy engine, fallback management, and alert handling
 * PATCH 420.0 - Interactive simulation with terminal interface and communication logging
 * PATCH 442 - Added failover logging and diagnostic panel
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Satellite, Radio, TrendingUp, AlertTriangle } from "lucide-react";
import { SatcomStatus } from "./components/SatcomStatus";
import { SignalHistory } from "./components/SignalHistory";
import { FallbackSimulator } from "./components/FallbackSimulator";
import { FallbackStatus } from "./components/FallbackStatus";
import { SatcomTerminal } from "./components/SatcomTerminal";
import { CommunicationHistory } from "./components/CommunicationHistory";
import { DiagnosticPanel } from "./components/DiagnosticPanel";
import { ConnectivityPanel } from "./components/ConnectivityPanel";
import { useSatcomMonitor } from "./hooks/useSatcomMonitor";

// Export new PATCH 171.0 modules
export { satcomStatusMonitor } from "./satcom-status";
export { linkFallbackManager } from "./linkFallbackManager";
export { alertHandler } from "./alertHandler";
export { satcomWatchdogIntegration } from "./watchdog-integration";
export type { SatcomStatusReport, SatcomHealthStatus } from "./satcom-status";
export type { FallbackPolicy, FallbackEvent, FallbackState } from "./linkFallbackManager";
export type { AlertConfig, SatcomAlert } from "./alertHandler";

// Export PATCH 442 modules
export { satcomFailoverService } from "./services/failover-service";
export type { FailoverLogEntry, ConnectionStatus, CommunicationLog } from "./services/failover-service";

// Export PATCH 476 modules
export { satcomPingService } from "./services/ping-service";
export type { SatcomLink, PingResult, SatcomLog } from "./services/ping-service";
export { ConnectivityPanel } from "./components/ConnectivityPanel";

export interface SatcomConnection {
  id: string;
  name: string;
  provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  status: "connected" | "degraded" | "disconnected";
  signalStrength: number;
  latency: number;
  bandwidth: number;
  lastSeen: string;
}

export interface SignalEvent {
  timestamp: string;
  provider: string;
  type: "connection_lost" | "connection_restored" | "degraded" | "maintenance";
  duration?: number;
  reason?: string;
}

const SatcomDashboard = () => {
  const [connections, setConnections] = useState<SatcomConnection[]>([
    {
      id: "conn-1",
      name: "Iridium Certus 700",
      provider: "Iridium",
      status: "connected",
      signalStrength: 92,
      latency: 680,
      bandwidth: 700,
      lastSeen: new Date().toISOString(),
    },
    {
      id: "conn-2",
      name: "Starlink Maritime",
      provider: "Starlink",
      status: "connected",
      signalStrength: 88,
      latency: 35,
      bandwidth: 150000,
      lastSeen: new Date().toISOString(),
    },
    {
      id: "conn-3",
      name: "Inmarsat FleetBroadband",
      provider: "Inmarsat",
      status: "degraded",
      signalStrength: 45,
      latency: 720,
      bandwidth: 432,
      lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ]);

  const [signalHistory, setSignalHistory] = useState<SignalEvent[]>([
    {
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      provider: "Inmarsat",
      type: "connection_lost",
      duration: 15,
      reason: "Storm interference",
    },
    {
      timestamp: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
      provider: "Inmarsat",
      type: "connection_restored",
    },
    {
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      provider: "Iridium",
      type: "degraded",
      duration: 10,
      reason: "Satellite handover",
    },
  ]);

  const [uptimeStats, setUptimeStats] = useState({
    overall: 99.2,
    last24h: 98.8,
    last7d: 99.5,
    last30d: 99.2,
  });

  // Use the SATCOM monitor hook
  const {
    connections: monitoredConnections,
    primaryConnection,
    fallbackConnection,
    isFallbackActive,
    simulationEvents,
    simulateConnectionLoss,
    simulateReconnection,
    clearEvents,
  } = useSatcomMonitor({
    connections,
    onConnectionUpdate: setConnections,
    vesselId: "vessel-001",
  });

  // Calculate active connections
  const activeConnections = monitoredConnections.filter(c => c.status === "connected").length;
  const averageSignal = monitoredConnections.reduce((acc, c) => acc + c.signalStrength, 0) / monitoredConnections.length;

  // Simulate real-time updates (in production, this would come from WebSocket/API)
  useEffect(() => {
    const interval = setInterval(() => {
      setConnections(prev => prev.map(conn => ({
        ...conn,
        signalStrength: Math.max(0, Math.min(100, conn.signalStrength + (Math.random() - 0.5) * 5)),
        latency: Math.max(20, conn.latency + (Math.random() - 0.5) * 50),
        lastSeen: new Date().toISOString(),
      })));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">SATCOM Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnections}</div>
            <p className="text-xs text-muted-foreground">De {connections.length} disponíveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sinal Médio</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSignal.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Todas as conexões</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptimeStats.last30d}%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {signalHistory.filter(e => 
                Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60000
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Perda de sinal</p>
          </CardContent>
        </Card>
      </div>

      {/* PATCH 476: Enhanced Connectivity Panel with Ping Simulation */}
      <ConnectivityPanel />

      <SatcomStatus connections={monitoredConnections} />

      {/* New Fallback Status Component */}
      <FallbackStatus
        primaryConnection={primaryConnection}
        fallbackConnection={fallbackConnection}
        isFallbackActive={isFallbackActive}
      />

      {/* PATCH 442: Diagnostic Panel */}
      <DiagnosticPanel
        connections={monitoredConnections}
        vesselId="vessel-001"
        onTestComplete={() => {
          // Reload any necessary data after test
        }}
      />

      {/* PATCH 420: Interactive Terminal and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SatcomTerminal
          vesselId="vessel-001"
          activeProvider={primaryConnection?.provider || "Iridium"}
          signalStrength={primaryConnection?.signalStrength || 0}
        />
        <CommunicationHistory vesselId="vessel-001" limit={50} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SignalHistory events={signalHistory} />
        <FallbackSimulator 
          connections={monitoredConnections}
          onDisconnect={simulateConnectionLoss}
          onReconnect={simulateReconnection}
          simulationEvents={simulationEvents}
          onClearEvents={clearEvents}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uptime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Geral</div>
              <div className="text-2xl font-bold">{uptimeStats.overall}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Últimas 24h</div>
              <div className="text-2xl font-bold">{uptimeStats.last24h}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Últimos 7 dias</div>
              <div className="text-2xl font-bold">{uptimeStats.last7d}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Últimos 30 dias</div>
              <div className="text-2xl font-bold">{uptimeStats.last30d}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatcomDashboard;
