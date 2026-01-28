/**
 * NOC (Network Operations Center) Page
 * PATCH NOC-1.0: Interface fullscreen para operadores 24/7
 * 
 * Features:
 * - Monitoramento em tempo real
 * - Alertas críticos em destaque
 * - Métricas ao vivo
 * - Modo escuro otimizado
 * - IA ativa para comandos
 * - Atualizações a cada 5s
 */

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { 
  AlertTriangle, 
  Activity, 
  Ship, 
  Shield, 
  Fuel, 
  Users,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Mic,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useVoiceCommands } from "@/modules/nauti-command-center/hooks/useVoiceCommands";

// Types
interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: Date;
  module: string;
  acknowledged: boolean;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

interface VesselStatus {
  id: string;
  name: string;
  status: "operational" | "maintenance" | "alert" | "standby";
  location: string;
  lastUpdate: Date;
}

// Mock data generators
const generateAlerts = (): Alert[] => [
  {
    id: "1",
    title: "Manutenção Preventiva Vencida",
    description: "Ocean Pioneer - Motor principal necessita inspeção",
    severity: "critical",
    timestamp: new Date(Date.now() - 300000),
    module: "Manutenção",
    acknowledged: false
  },
  {
    id: "2",
    title: "Certificado STCW Expirando",
    description: "3 tripulantes com certificados vencendo em 15 dias",
    severity: "warning",
    timestamp: new Date(Date.now() - 600000),
    module: "Compliance",
    acknowledged: false
  },
  {
    id: "3",
    title: "Meta de Emissões Atingida",
    description: "Redução de 12% nas emissões de CO2 este mês",
    severity: "info",
    timestamp: new Date(Date.now() - 900000),
    module: "ESG",
    acknowledged: true
  }
];

const generateMetrics = (): Metric[] => [
  { id: "1", label: "Uptime Frota", value: 94.5, unit: "%", trend: "up", status: "good" },
  { id: "2", label: "Eficiência Operacional", value: 87, unit: "%", trend: "stable", status: "good" },
  { id: "3", label: "Índice TRIR", value: 0.42, unit: "", trend: "down", status: "good" },
  { id: "4", label: "Emissões CO2", value: -12, unit: "% vs meta", trend: "down", status: "good" },
  { id: "5", label: "Disponibilidade", value: 83, unit: "%", trend: "stable", status: "warning" },
  { id: "6", label: "Incidentes Abertos", value: 2, unit: "", trend: "stable", status: "warning" }
];

const generateVesselStatuses = (): VesselStatus[] => [
  { id: "1", name: "Ocean Pioneer", status: "operational", location: "Santos, BR", lastUpdate: new Date() },
  { id: "2", name: "Sea Guardian", status: "operational", location: "Rotterdam, NL", lastUpdate: new Date() },
  { id: "3", name: "Atlantic Star", status: "maintenance", location: "Estaleiro Jurong", lastUpdate: new Date() },
  { id: "4", name: "Pacific Voyager", status: "operational", location: "Singapore", lastUpdate: new Date() },
  { id: "5", name: "Nordic Explorer", status: "alert", location: "Mar do Norte", lastUpdate: new Date() },
  { id: "6", name: "Coastal Runner", status: "standby", location: "Rio de Janeiro, BR", lastUpdate: new Date() }
];

// Severity config
const severityConfig = {
  critical: { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-400", icon: XCircle },
  warning: { bg: "bg-yellow-500/20", border: "border-yellow-500", text: "text-yellow-400", icon: AlertCircle },
  info: { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-400", icon: CheckCircle2 }
};

const statusConfig = {
  operational: { bg: "bg-green-500", text: "Operacional" },
  maintenance: { bg: "bg-yellow-500", text: "Manutenção" },
  alert: { bg: "bg-red-500", text: "Alerta" },
  standby: { bg: "bg-gray-500", text: "Standby" }
};

export default function NOC() {
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts);
  const [metrics, setMetrics] = useState<Metric[]>(generateMetrics);
  const [vessels, setVessels] = useState<VesselStatus[]>(generateVesselStatuses);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Voice commands
  const { isListening, isSupported, transcript, toggleVoice } = useVoiceCommands({
    onCommand: (command) => {
      // Voice commands are processed by the voice command system
      // Additional NOC-specific commands can be handled here
    }
  });

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setMetrics(generateMetrics());
        setLastRefresh(new Date());
        setIsRefreshing(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.acknowledged);
  const currentTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <>
      <Helmet>
        <title>NOC 24/7 | Centro de Operações de Rede</title>
        <meta name="description" content="Centro de Operações de Rede Nautilus - Monitoramento em tempo real 24/7" />
      </Helmet>

      <div className="min-h-screen bg-zinc-950 text-white p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
              NOC 24/7
            </h1>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              ONLINE
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Current Time */}
            <div className="flex items-center gap-2 text-xl font-mono bg-zinc-900 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              {currentTime}
            </div>

            {/* Last Refresh */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {isSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoice}
                  className={cn(isListening && "bg-red-500/20 text-red-400")}
                >
                  <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <span className="font-bold text-lg">
                {criticalAlerts.length} ALERTA{criticalAlerts.length > 1 ? "S" : ""} CRÍTICO{criticalAlerts.length > 1 ? "S" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Metrics Panel */}
          <div className="col-span-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Métricas em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        metric.status === "good" && "bg-green-500/10 border-green-500/30",
                        metric.status === "warning" && "bg-yellow-500/10 border-yellow-500/30",
                        metric.status === "critical" && "bg-red-500/10 border-red-500/30"
                      )}
                    >
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                      <div className="text-3xl font-bold mt-1">
                        {metric.value}{metric.unit}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        metric.trend === "up" && "text-green-400",
                        metric.trend === "down" && "text-red-400",
                        metric.trend === "stable" && "text-gray-400"
                      )}>
                        {metric.trend === "up" && "↑"}
                        {metric.trend === "down" && "↓"}
                        {metric.trend === "stable" && "→"}
                        {" "}{metric.trend === "up" ? "Subindo" : metric.trend === "down" ? "Descendo" : "Estável"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fleet Status */}
            <Card className="bg-zinc-900 border-zinc-800 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ship className="h-5 w-5 text-primary" />
                  Status da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {vessels.map((vessel) => (
                    <div
                      key={vessel.id}
                      className={cn(
                        "p-3 rounded-lg border border-zinc-800 bg-zinc-800/50",
                        vessel.status === "alert" && "border-red-500 animate-pulse"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{vessel.name}</span>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          statusConfig[vessel.status].bg
                        )} />
                      </div>
                      <div className="text-xs text-muted-foreground">{vessel.location}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {statusConfig[vessel.status].text}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div className="col-span-4">
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Central de Alertas
                  <Badge variant="secondary" className="ml-auto">
                    {alerts.filter(a => !a.acknowledged).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {alerts.map((alert) => {
                      const config = severityConfig[alert.severity];
                      const Icon = config.icon;
                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            config.bg,
                            config.border,
                            alert.acknowledged && "opacity-50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className={cn("h-5 w-5 mt-0.5", config.text)} />
                            <div className="flex-1">
                              <div className={cn("font-medium", config.text)}>{alert.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {alert.description}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {alert.module}
                                </Badge>
                                {!alert.acknowledged && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                  >
                                    Reconhecer
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                Segurança: OK
              </span>
              <span className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-info" />
                Combustível: Normal
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary-foreground" />
                Tripulação: 247 ativos
              </span>
            </div>
            <div className="text-muted-foreground">
              Nautilus One NOC v2.0 | Latência: 42ms
            </div>
          </div>
        </div>
      </div>
    </>
  );
}