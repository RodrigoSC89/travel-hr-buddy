/**
 * Integrations Dashboard Component
 * Status de conexões, logs de sync, configuração guiada
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Settings, Clock, Activity, Database, Cloud, Ship,
  Anchor, Navigation, Radio, Thermometer, BarChart3,
  Zap, Eye, Play, Pause, MoreVertical
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  enabled: boolean;
  lastSync: string;
  syncFrequency: string;
  healthScore: number;
  dataPoints: number;
  icon: React.ElementType;
}

const integrations: Integration[] = [
  {
    id: "1",
    name: "AIS Provider",
    category: "Tracking",
    description: "Automatic Identification System feed",
    status: "connected",
    enabled: true,
    lastSync: "2024-02-05T14:30:00",
    syncFrequency: "Real-time",
    healthScore: 98,
    dataPoints: 125000,
    icon: Navigation
  },
  {
    id: "2",
    name: "Weather API",
    category: "Operations",
    description: "Marine weather forecasts",
    status: "connected",
    enabled: true,
    lastSync: "2024-02-05T14:25:00",
    syncFrequency: "Every 15 min",
    healthScore: 95,
    dataPoints: 48000,
    icon: Cloud
  },
  {
    id: "3",
    name: "Port Authority",
    category: "Operations",
    description: "Port schedules and berth availability",
    status: "syncing",
    enabled: true,
    lastSync: "2024-02-05T14:00:00",
    syncFrequency: "Hourly",
    healthScore: 88,
    dataPoints: 12500,
    icon: Anchor
  },
  {
    id: "4",
    name: "Bunker Suppliers",
    category: "Procurement",
    description: "Fuel pricing and availability",
    status: "connected",
    enabled: true,
    lastSync: "2024-02-05T12:00:00",
    syncFrequency: "Every 4 hours",
    healthScore: 92,
    dataPoints: 8900,
    icon: Thermometer
  },
  {
    id: "5",
    name: "SATCOM Gateway",
    category: "Communications",
    description: "Satellite communication bridge",
    status: "error",
    enabled: true,
    lastSync: "2024-02-05T10:15:00",
    syncFrequency: "Real-time",
    healthScore: 45,
    dataPoints: 0,
    icon: Radio
  },
  {
    id: "6",
    name: "ERP System",
    category: "Finance",
    description: "Financial data synchronization",
    status: "connected",
    enabled: true,
    lastSync: "2024-02-05T13:00:00",
    syncFrequency: "Every 2 hours",
    healthScore: 100,
    dataPoints: 34500,
    icon: Database
  },
  {
    id: "7",
    name: "Fleet Analytics",
    category: "Analytics",
    description: "Performance metrics aggregation",
    status: "disconnected",
    enabled: false,
    lastSync: "2024-02-01T08:00:00",
    syncFrequency: "Daily",
    healthScore: 0,
    dataPoints: 0,
    icon: BarChart3
  },
  {
    id: "8",
    name: "IoT Sensors",
    category: "Telemetry",
    description: "Onboard sensor data streams",
    status: "connected",
    enabled: true,
    lastSync: "2024-02-05T14:32:00",
    syncFrequency: "Real-time",
    healthScore: 94,
    dataPoints: 890000,
    icon: Activity
  }
];

const syncLogs = [
  { id: "1", integration: "AIS Provider", type: "sync", message: "Synced 1,250 vessel positions", timestamp: "14:30:00", status: "success" },
  { id: "2", integration: "Weather API", type: "sync", message: "Updated 45 weather zones", timestamp: "14:25:00", status: "success" },
  { id: "3", integration: "SATCOM Gateway", type: "error", message: "Connection timeout - retrying", timestamp: "14:20:00", status: "error" },
  { id: "4", integration: "Port Authority", type: "sync", message: "Syncing berth schedules...", timestamp: "14:15:00", status: "pending" },
  { id: "5", integration: "IoT Sensors", type: "sync", message: "Received 5,000 sensor readings", timestamp: "14:10:00", status: "success" },
  { id: "6", integration: "ERP System", type: "sync", message: "Exported 125 transactions", timestamp: "13:00:00", status: "success" },
  { id: "7", integration: "SATCOM Gateway", type: "error", message: "Authentication failed", timestamp: "12:45:00", status: "error" },
  { id: "8", integration: "Bunker Suppliers", type: "sync", message: "Updated fuel prices for 8 ports", timestamp: "12:00:00", status: "success" }
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "connected": return { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2, label: "Conectado" };
    case "disconnected": return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", icon: XCircle, label: "Desconectado" };
    case "error": return { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: AlertTriangle, label: "Erro" };
    case "syncing": return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: RefreshCw, label: "Sincronizando" };
    default: return { color: "bg-gray-100 text-gray-800", icon: Plug, label: status };
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function IntegrationsDashboard() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === "connected").length,
    errors: integrations.filter(i => i.status === "error").length,
    dataPoints: integrations.reduce((sum, i) => sum + i.dataPoints, 0)
  };

  const avgHealth = Math.round(
    integrations.filter(i => i.enabled).reduce((sum, i) => sum + i.healthScore, 0) / 
    integrations.filter(i => i.enabled).length
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Integrações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{stats.connected} ativas</p>
              </div>
              <Plug className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral</p>
                <p className="text-2xl font-bold">{avgHealth}%</p>
                <Progress value={avgHealth} className="h-2 mt-2" />
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                <p className="text-xs text-muted-foreground">Requer atenção</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{formatNumber(stats.dataPoints)}</p>
                <p className="text-xs text-muted-foreground">Último mês</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integrações Configuradas
              </CardTitle>
              <Button size="sm" onClick={() => toast.success("Configuração de integrações", { description: "Acesse System Hub > Integrações para configurar APIs REST, webhooks e feeds em tempo real." })}>
                <Zap className="h-4 w-4 mr-1" />
                Nova Integração
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.map((integration) => {
                const statusConfig = getStatusConfig(integration.status);
                const StatusIcon = statusConfig.icon;
                const IntegrationIcon = integration.icon;

                return (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedIntegration?.id === integration.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${integration.enabled ? "bg-primary/10" : "bg-muted"}`}>
                          <IntegrationIcon className={`h-5 w-5 ${integration.enabled ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{integration.name}</p>
                            <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium">{formatNumber(integration.dataPoints)}</p>
                          <p className="text-xs text-muted-foreground">data points</p>
                        </div>
                        <Badge className={statusConfig.color} variant="secondary">
                          <StatusIcon className={`h-3 w-3 mr-1 ${integration.status === "syncing" ? "animate-spin" : ""}`} />
                          {statusConfig.label}
                        </Badge>
                        <Switch checked={integration.enabled} />
                      </div>
                    </div>
                    {integration.enabled && (
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {integration.syncFrequency}
                          </span>
                          <span className="text-muted-foreground">
                            Último sync: {new Date(integration.lastSync).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Saúde:</span>
                          <Progress value={integration.healthScore} className="w-20 h-2" />
                          <span className={`font-medium ${
                            integration.healthScore >= 90 ? "text-green-600" :
                            integration.healthScore >= 70 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {integration.healthScore}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sync Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logs de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg border hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : log.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5 animate-spin" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.integration}</p>
                      <p className="text-xs text-muted-foreground">{log.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IntegrationsDashboard;
