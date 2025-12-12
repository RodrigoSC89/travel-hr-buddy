/**
import { useCallback, useEffect, useMemo, useState } from "react";;
 * PATCH 215.2 - Telemetry Dashboard 360 (Painel Cognitivo Operacional)
 * 
 * Complete, integrated, and professional telemetry dashboard with LLM integration,
 * real-time data sync, PDF export, and interactive map visualization.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe,
  Satellite,
  Brain,
  FlaskConical,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { satelliteSyncEngine } from "@/lib/satelliteSyncEngine";
import { missionSimulationCore } from "@/ai/missionSimulationCore";
import { missionAutonomyEngine } from "@/ai/missionAutonomyEngine";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { TelemetryAIAssistant } from "./TelemetryAIAssistant";
import { TelemetryExporter } from "./TelemetryExporter";
import { TelemetryAlerts, type TelemetryAlert } from "./TelemetryAlerts";
import { TelemetryMap } from "./TelemetryMap";
import { TelemetrySettings, type TelemetryConfig } from "./TelemetrySettings";
import { motion } from "framer-motion";

interface TelemetryDashboard360Props {
  userId?: string;
}

// Default config
const defaultTelemetryConfig: TelemetryConfig = {
  autoSyncInterval: 60,
  enableNotifications: true,
  notificationSound: true,
  dataRetentionDays: 30,
  mapRefreshRate: 30,
  alertThreshold: "medium",
  aiModelPreference: "balanced",
  showWeatherAlerts: true,
  showSatelliteAlerts: true,
  showSystemAlerts: true,
  darkMapTheme: true,
};

export const TelemetryDashboard360: React.FC<TelemetryDashboard360Props> = ({ userId }) => {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [satelliteData, setSatelliteData] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [autonomyActions, setAutonomyActions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any[]>([]);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [telemetryConfig, setTelemetryConfig] = useState<TelemetryConfig>(defaultTelemetryConfig);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      logger.info("[TelemetryDashboard360] Loading dashboard data");

      // Load weather data
      const weather = await satelliteSyncEngine.getLatestWeatherData();
      setWeatherData(weather.slice(0, 20));

      // Load satellite data
      const satellite = await satelliteSyncEngine.getLatestSatelliteData();
      setSatelliteData(satellite.slice(0, 20));

      // Load simulations
      const sims = await missionSimulationCore.listSimulations();
      setSimulations(sims.slice(0, 15));

      // Load autonomy actions
      const actions = await missionAutonomyEngine.getAuditLogs(30);
      setAutonomyActions(actions);

      // Get sync status
      const status = satelliteSyncEngine.getSyncStatus();
      setSyncStatus(status);

      // Generate alerts based on data
      generateAlerts(weather, satellite, status);

      setLastRefresh(new Date());
      logger.info("[TelemetryDashboard360] Dashboard data loaded successfully");
    } catch (error) {
      logger.error("[TelemetryDashboard360] Failed to load data", { error });
      toast.error("Erro ao carregar dados de telemetria");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateAlerts = (weather: unknown[], satellite: unknown[], status: unknown[]) => {
    const newAlerts: TelemetryAlert[] = [];

    // Check for dangerous weather
    weather.forEach((w, idx) => {
      if (w.risk_level === "danger" || w.risk_level === "warning") {
        newAlerts.push({
          id: `weather-alert-${idx}`,
          type: "weather",
          severity: w.risk_level === "danger" ? "critical" : "warning",
          title: `Alerta Meteorológico: ${w.location_name || "Região"}`,
          message: `Vento ${w.wind_speed} kt, Visibilidade ${w.visibility}m`,
          timestamp: new Date(),
          read: false,
          source: "Sistema Meteorológico",
        };
      }
    };

    // Check sync errors
    status.forEach((s) => {
      if (s.status === "error") {
        newAlerts.push({
          id: `sync-error-${s.source}`,
          type: "system",
          severity: "warning",
          title: `Erro de Sincronização: ${s.source}`,
          message: s.error_message || "Falha na sincronização de dados",
          timestamp: new Date(),
          read: false,
          source: "Motor de Sincronização",
        });
      }
    });

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 50)]);
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const toggleAutoSync = useCallback(() => {
    if (isAutoSyncEnabled) {
      satelliteSyncEngine.stopAutoSync();
      setIsAutoSyncEnabled(false);
      toast.success("Auto-sync desativado", {
        description: "A sincronização automática foi pausada",
      };
    } else {
      satelliteSyncEngine.startAutoSync();
      setIsAutoSyncEnabled(true);
      toast.success("Auto-sync ativado", {
        description: "Os dados serão atualizados automaticamente a cada minuto",
      };
      // Trigger immediate refresh
      loadDashboardData();
    }
  }, [isAutoSyncEnabled, loadDashboardData]);

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
    case "danger":
    case "critical":
      return "destructive";
    case "warning":
    case "high":
      return "default";
    case "caution":
    case "medium":
      return "secondary";
    default:
      return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
    case "active":
    case "completed":
    case "executed":
      return "default";
    case "pending":
      return "secondary";
    case "error":
    case "failed":
    case "rejected":
      return "destructive";
    default:
      return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Telemetry Dashboard 360
          </h1>
          <p className="text-muted-foreground">
            Monitoramento global de operações e inteligência artificial
            {lastRefresh && (
              <span className="ml-2 text-xs">
                • Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button
            variant={isAutoSyncEnabled ? "default" : "outline"}
            onClick={toggleAutoSync}
          >
            {isAutoSyncEnabled ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar Auto-Sync
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Auto-Sync
              </>
            )}
          </Button>
          <TelemetryExporter
            weatherData={weatherData}
            satelliteData={satelliteData}
            syncStatus={syncStatus}
            autonomyActions={autonomyActions}
          />
          <TelemetrySettings 
            config={telemetryConfig}
            onSave={setTelemetryConfig}
          />
        </div>
      </motion.div>

      {/* Sync Status Overview */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {syncStatus.map((status, idx) => (
          <Card key={status.source} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  {status.source}
                </div>
                <Badge variant={getStatusBadgeVariant(status.status)} className="text-xs">
                  {status.status === "active" ? "Ativo" : 
                    status.status === "error" ? "Erro" : "Inativo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.records_synced || 0}</div>
              <p className="text-xs text-muted-foreground">registros sincronizados</p>
              {status.last_sync && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(status.last_sync).toLocaleTimeString("pt-BR")}
                </p>
              )}
              {status.error_message && (
                <p className="text-xs text-destructive mt-1 truncate">{status.error_message}</p>
              )}
            </CardContent>
            {status.status === "active" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/30">
                <div className="h-full bg-green-500 animate-pulse w-full" />
              </div>
            )}
          </Card>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="global-map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="global-map" className="text-xs md:text-sm">
            <Globe className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="text-xs md:text-sm">
            <Brain className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="ai-actions" className="text-xs md:text-sm">
            <FlaskConical className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Ações</span>
          </TabsTrigger>
          <TabsTrigger value="satellite" className="text-xs md:text-sm">
            <Satellite className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Satélite</span>
          </TabsTrigger>
          <TabsTrigger value="simulations" className="text-xs md:text-sm">
            <FlaskConical className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Simulações</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs md:text-sm relative">
            <AlertTriangle className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Alertas</span>
            {alerts.filter(a => !a.read).length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {alerts.filter(a => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Global Map Tab */}
        <TabsContent value="global-map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Interactive Map */}
            <TelemetryMap
              satellites={satelliteData}
              vessels={satelliteData.filter(s => s.source === "AIS")}
              weatherPoints={weatherData}
              onRefresh={loadDashboardData}
            />

            {/* Weather Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Condições Meteorológicas
                </CardTitle>
                <CardDescription>Dados em tempo real de satélites</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {weatherData.map((weather, idx) => (
                      <motion.div
                        key={weather.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {weather.location_name || "Região Marítima"}
                          </div>
                          <Badge variant={getRiskBadgeVariant(weather.risk_level)}>
                            {weather.risk_level === "safe" ? "Seguro" :
                              weather.risk_level === "caution" ? "Atenção" :
                                weather.risk_level === "warning" ? "Alerta" : "Perigo"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Temp:</span>{" "}
                            <span className="font-medium">{weather.temperature}°C</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vento:</span>{" "}
                            <span className="font-medium">{weather.wind_speed} kt</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Visibilidade:</span>{" "}
                            <span className="font-medium">{weather.visibility} m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fonte:</span>{" "}
                            <span className="font-medium">{weather.source}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {weatherData.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum dado meteorológico disponível</p>
                        <p className="text-xs mt-1">Inicie o Auto-Sync para carregar dados</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TelemetryAIAssistant
                weatherData={weatherData}
                satelliteData={satelliteData}
                syncStatus={syncStatus}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo de Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dados Meteorológicos</span>
                    <Badge>{weatherData.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dados de Satélite</span>
                    <Badge>{satelliteData.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ações de IA</span>
                    <Badge>{autonomyActions.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Alertas Ativos</span>
                    <Badge variant={alerts.filter(a => !a.read).length > 0 ? "destructive" : "secondary"}>
                      {alerts.filter(a => !a.read).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {syncStatus.map((s) => (
                    <div key={s.source} className="flex items-center gap-2">
                      {getStatusIcon(s.status)}
                      <span className="text-sm">{s.source}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Actions Tab */}
        <TabsContent value="ai-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Ações de Autonomia IA
              </CardTitle>
              <CardDescription>Decisões e ações tomadas pelo sistema de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {autonomyActions.map((action, idx) => (
                    <motion.div
                      key={action.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{action.action_type}</div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeVariant(action.status)}>
                            {action.status}
                          </Badge>
                          <Badge variant="outline">{action.decision_level}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.reasoning}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Confiança:</span>{" "}
                          <span className="font-medium">{(action.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risco:</span>{" "}
                          <span className="font-medium">{(action.risk_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      {action.result && (
                        <div className="text-xs bg-muted p-2 rounded">
                          <span className="font-medium">Resultado:</span> {JSON.stringify(action.result)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {autonomyActions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma ação de autonomia registrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satellite Data Tab */}
        <TabsContent value="satellite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5" />
                Telemetria de Satélite
              </CardTitle>
              <CardDescription>Feeds de dados brutos de satélites</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {satelliteData.map((data, idx) => (
                    <motion.div
                      key={data.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          <Satellite className="h-4 w-4" />
                          {data.source}
                        </div>
                        <Badge variant="outline">{data.data_type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lat: {data.latitude?.toFixed(4)}, Lon: {data.longitude?.toFixed(4)}
                      </div>
                      <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-auto font-mono">
                        {JSON.stringify(data.normalized_data || data.raw_data, null, 2)}
                      </div>
                    </motion.div>
                  ))}
                  {satelliteData.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum dado de satélite disponível</p>
                      <p className="text-xs mt-1">Inicie o Auto-Sync para carregar dados</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations Tab */}
        <TabsContent value="simulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Simulações de Missão
              </CardTitle>
              <CardDescription>Missões simuladas e previsões</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {simulations.map((sim, idx) => (
                    <motion.div
                      key={sim.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{sim.name}</div>
                        <Badge variant={getStatusBadgeVariant(sim.status)}>
                          {sim.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sim.description}
                      </p>
                      {sim.predictions && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Prob. Sucesso:</span>{" "}
                            <span className="font-medium">{(sim.predictions.success_probability * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Score de Risco:</span>{" "}
                            <span className="font-medium">{sim.predictions.risk_score?.toFixed(1) || "N/A"}</span>
                          </div>
                        </div>
                      )}
                      {sim.outcome && (
                        <div className="text-xs bg-muted p-2 rounded space-y-1">
                          <div className="flex items-center gap-2">
                            {sim.outcome.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span>
                              {sim.outcome.success ? "Sucesso" : "Falha"} ({sim.outcome.completion_percentage}%)
                            </span>
                          </div>
                          <div>Incidentes: {sim.outcome.incidents?.length || 0}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {simulations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <FlaskConical className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma simulação disponível</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <TelemetryAlerts 
            alerts={alerts} 
            onAlertsChange={setAlerts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
