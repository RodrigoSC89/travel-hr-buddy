/**
 * Control Hub Panel
 * Main dashboard for Nautilus One Control Hub
 */

import React, { useEffect, useState } from "react";
import { controlHub } from '@/modules/control_hub';
import { 
  SystemStatus, 
  ConnectionStatus, 
  ModuleCard, 
  CacheStats, 
  SyncStatus 
} from '@/modules/control_hub/hub_ui';
import { ControlHubState } from '@/modules/control_hub/types';
import { hubBridge } from '@/modules/control_hub/hub_bridge';

export default function ControlHubPanel() {
  const [state, setState] = useState<ControlHubState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize Control Hub
    const init = async () => {
      if (!controlHub.isInitialized()) {
        await controlHub.iniciar();
      }
      updateState();
    };

    init();

    // Auto-refresh every 30 seconds
    const interval = setInterval(updateState, 30000);

    return () => {
      clearInterval(interval);
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
