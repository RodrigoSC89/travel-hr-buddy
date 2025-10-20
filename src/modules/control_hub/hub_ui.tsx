/**
 * Hub UI - Control Hub Interface Components
 * 
 * React components for the Control Hub dashboard and interface.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  Cloud,
  CloudOff,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { SystemStatus, ModuleStatus } from "./hub_monitor";
import type { BridgeLinkStatus } from "./hub_bridge";

interface DashboardProps {
  moduleStatus: SystemStatus;
  bridgeStatus: BridgeLinkStatus;
  cacheInfo: {
    pending: number;
    sizeMB: number;
    isFull: boolean;
  };
  syncInfo: {
    lastSync: Date | null;
    inProgress: boolean;
  };
  onRefresh?: () => void;
  onSync?: () => void;
}

/**
 * Main Dashboard Component
 */
export const HubDashboard: React.FC<DashboardProps> = ({
  moduleStatus,
  bridgeStatus,
  cacheInfo,
  syncInfo,
  onRefresh,
  onSync,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔱 Nautilus Control Hub</h1>
          <p className="text-muted-foreground mt-1">
            Central de controle de operações embarcadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={onSync}
            disabled={syncInfo.inProgress}
            size="sm"
          >
            <Cloud className="w-4 h-4 mr-2" />
            {syncInfo.inProgress ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      <OverallStatusAlert status={moduleStatus.overall} />

      {/* Status Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* BridgeLink Status */}
        <BridgeLinkCard status={bridgeStatus} />

        {/* Cache Status */}
        <CacheCard cacheInfo={cacheInfo} />

        {/* Sync Status */}
        <SyncCard syncInfo={syncInfo} />
      </div>

      {/* Module Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ModuleCard module={moduleStatus.mmi} />
        <ModuleCard module={moduleStatus.peo_dp} />
        <ModuleCard module={moduleStatus.dp_intelligence} />
        <ModuleCard module={moduleStatus.bridge_link} />
        <ModuleCard module={moduleStatus.sgso} />
      </div>
    </div>
  );
};

/**
 * Overall Status Alert
 */
const OverallStatusAlert: React.FC<{ status: string }> = ({ status }) => {
  const getAlertVariant = () => {
    switch (status) {
    case "Healthy":
      return "default";
    case "Degraded":
      return "default";
    case "Critical":
      return "destructive";
    default:
      return "default";
    }
  };

  const getIcon = () => {
    switch (status) {
    case "Healthy":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Degraded":
      return <AlertTriangle className="h-4 w-4" />;
    case "Critical":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
    }
  };

  const getMessage = () => {
    switch (status) {
    case "Healthy":
      return "Todos os sistemas operando normalmente";
    case "Degraded":
      return "Alguns sistemas necessitam atenção";
    case "Critical":
      return "Sistemas críticos com problemas - ação necessária";
    default:
      return "Status do sistema desconhecido";
    }
  };

  return (
    <Alert variant={getAlertVariant()}>
      {getIcon()}
      <AlertTitle>Status Geral do Sistema: {status}</AlertTitle>
      <AlertDescription>{getMessage()}</AlertDescription>
    </Alert>
  );
};

/**
 * BridgeLink Status Card
 */
const BridgeLinkCard: React.FC<{ status: BridgeLinkStatus }> = ({ status }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">BridgeLink</CardTitle>
        {status.connected ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {status.connected ? "Online" : "Offline"}
        </div>
        <div className="space-y-1 mt-2">
          {status.connected && (
            <>
              <p className="text-xs text-muted-foreground">
                Latência: {status.latencyMs}ms
              </p>
              <p className="text-xs text-muted-foreground">
                Autenticado:{" "}
                {status.authenticated ? "✅ Sim" : "⚠️ Não"}
              </p>
            </>
          )}
          {status.lastPing && (
            <p className="text-xs text-muted-foreground">
              Último ping: {status.lastPing.toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Cache Status Card
 */
const CacheCard: React.FC<{
  cacheInfo: { pending: number; sizeMB: number; isFull: boolean };
}> = ({ cacheInfo }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cache Offline</CardTitle>
        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{cacheInfo.pending}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Registros pendentes
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            Tamanho: {cacheInfo.sizeMB.toFixed(2)} MB
          </p>
          {cacheInfo.isFull && (
            <Badge variant="destructive" className="text-xs">
              Cache cheio
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Sync Status Card
 */
const SyncCard: React.FC<{
  syncInfo: { lastSync: Date | null; inProgress: boolean };
}> = ({ syncInfo }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sincronização</CardTitle>
        {syncInfo.inProgress ? (
          <Cloud className="h-4 w-4 text-blue-600 animate-pulse" />
        ) : (
          <CloudOff className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {syncInfo.inProgress ? "Em andamento" : "Aguardando"}
        </div>
        {syncInfo.lastSync ? (
          <p className="text-xs text-muted-foreground mt-2">
            Última sync: {syncInfo.lastSync.toLocaleString("pt-BR")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            Nenhuma sincronização realizada
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Module Status Card
 */
const ModuleCard: React.FC<{ module: ModuleStatus }> = ({ module }) => {
  const getStatusColor = (status: ModuleStatus["status"]) => {
    switch (status) {
      case "OK":
        return "text-green-600";
      case "Warning":
        return "text-yellow-600";
      case "Error":
        return "text-red-600";
      case "Offline":
        return "text-gray-400";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: ModuleStatus["status"]) => {
    const variants = {
      OK: "default",
      Warning: "secondary",
      Error: "destructive",
      Offline: "outline",
    } as const;

    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
        <Activity className={`h-4 w-4 ${getStatusColor(module.status)}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold">{getStatusBadge(module.status)}</span>
        </div>
        {module.metrics && (
          <div className="space-y-1">
            {module.metrics.uptime && (
              <p className="text-xs text-muted-foreground">
                Uptime: {module.metrics.uptime}
              </p>
            )}
            {module.metrics.performance && (
              <p className="text-xs text-muted-foreground">
                Performance: {module.metrics.performance}
              </p>
            )}
            {module.metrics.errors !== undefined && (
              <p className="text-xs text-muted-foreground">
                Erros: {module.metrics.errors}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Verificado: {module.lastCheck.toLocaleTimeString("pt-BR")}
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Simple Menu UI (Console-style interface for backwards compatibility)
 */
export class HubUI {
  menuPrincipal(): string {
    console.log("\n=== 🧭 Nautilus Control Hub ===");
    console.log("1. Monitorar módulos ativos");
    console.log("2. Sincronizar com BridgeLink");
    console.log("3. Painel geral de conformidade");
    console.log("0. Sair");

    // In a real CLI, we'd get input from user
    // For now, just return empty string
    return "";
  }

  exibirDashboard(): void {
    console.log("\n📊 Painel Global de Operações");
    console.log(" - MMI: ✅ 100% atualizado");
    console.log(" - PEO-DP: ⚙️ Auditoria ativa");
    console.log(" - DP Intelligence: 🔮 Forecast 92% precisão");
    console.log(" - BridgeLink: 🌐 Conectado à costa");
  }
}
