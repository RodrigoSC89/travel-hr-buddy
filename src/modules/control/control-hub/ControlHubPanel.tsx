/**
import { useEffect, useState, useCallback } from "react";;
 * Control Hub Panel
 * Main dashboard for Nautilus One Control Hub
 */

import React, { useEffect, useState } from "react";
import { controlHub } from "@/modules/control/control-hub";
import { 
  SystemStatus, 
  ConnectionStatus, 
  ModuleCard, 
  CacheStats, 
  SyncStatus 
} from "@/modules/control/control-hub/hub_ui";
import { ControlHubState } from "@/modules/control/control-hub/types";
import { hubBridge } from "@/modules/control/control-hub/hub_bridge";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, RotateCcw } from "lucide-react";
import { BridgeLink } from "@/core/BridgeLink";
import { MQTTClient } from "@/core/MQTTClient";

export default function ControlHubPanel() {
  const [state, setState] = useState<ControlHubState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ message: string; timestamp: string }>>([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const { exportReport, resetIndicators } = useButtonHandlers();

  useEffect(() => {
    // Initialize Control Hub
    const init = async () => {
      if (!controlHub.isInitialized()) {
        await controlHub.iniciar();
      }
      updateState();
    };

    init();

    // Connect to MQTT broker
    MQTTClient.connect();

    // Subscribe to BridgeLink events for telemetry
    const unsubscribe = BridgeLink.on("nautilus:event" as unknown, (event) => {
      const data = event.data as { message: string; timestamp: string };
      setTelemetryLogs((prev) => {
        const newLogs = [...prev, { 
          message: data.message, 
          timestamp: data.timestamp || new Date().toISOString() 
        }];
        // Keep only last 50 events
        return newLogs.slice(-50);
      });
    });

    // Check MQTT connection status
    const mqttStatusInterval = setInterval(() => {
      setMqttConnected(MQTTClient.isConnected());
    }, 1000);

    // Auto-refresh every 30 seconds
    const interval = setInterval(updateState, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(mqttStatusInterval);
      unsubscribe();
      MQTTClient.disconnect();
    };
  }, []);

  const updateState = () => {
    const newState = controlHub.getState();
    setState(newState);
    setLastCheck(hubBridge.getLastCheck());
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await controlHub.sincronizar();
      updateState();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!state) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Inicializando Control Hub...</p>
          </div>
        </div>
      </div>
    );
  }

  const cacheStats = controlHub.getCacheStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Nautilus Control Hub</h1>
        <p className="text-muted-foreground">
          Centro de Controle - Monitoramento em Tempo Real e Operação Offline
        </p>
      </div>

      {/* System Status */}
      <SystemStatus health={state.systemHealth} />

      {/* Technical Indicators Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Técnicos</CardTitle>
          <CardDescription>Métricas de desempenho e compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">DP Reliability</p>
              <p className="text-3xl font-bold text-green-600">98.5%</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">ASOG Compliance</p>
              <p className="text-3xl font-bold text-blue-600">100%</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-muted-foreground">FMEA Actions</p>
              <p className="text-3xl font-bold text-purple-600">12</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportReport} className="flex-1">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button onClick={resetIndicators} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetar Indicadores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Conectividade BridgeLink</h3>
            <ConnectionStatus quality={state.connectionQuality} lastCheck={lastCheck} />
          </div>
          <SyncStatus 
            lastSync={state.lastSync} 
            isSyncing={isSyncing}
            onSync={handleSync}
          />
        </div>
        <CacheStats 
          size={cacheStats.size}
          capacity={cacheStats.capacity}
          pending={cacheStats.pending}
          total={cacheStats.total}
        />
      </div>

      {/* Telemetry Console - Real-time events from BridgeLink + MQTT */}
      <Card className="bg-slate-950 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-400">🌐 Console de Telemetria Global</CardTitle>
              <CardDescription className="text-slate-400">
                Eventos em tempo real (BridgeLink + MQTT)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Status MQTT:</span>
              <span className="text-lg">{mqttConnected ? "🟢" : "🔴"}</span>
              <span className="text-sm text-slate-400">
                {mqttConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 h-64 overflow-y-auto font-mono text-sm">
            {telemetryLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                Aguardando eventos de telemetria...
              </div>
            ) : (
              <div className="space-y-1">
                {telemetryLogs.map((log, index) => (
                  <div key={index} className="text-green-400">
                    <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Módulos Operacionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(state.modules).map(([key, module]) => (
            <ModuleCard key={key} moduleKey={key} module={module} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Atualização automática a cada 30 segundos • Última atualização: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
