/**
 * TelemetryAlertsTimeline - Timeline de Alertas em Tempo Real
 * PATCH 860 - Sistema de alertas avançado com IA
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  XCircle,
  Radio,
  Ship,
  Thermometer,
  Gauge,
  Zap,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface TelemetryAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "sensor" | "vessel" | "system" | "weather" | "maintenance";
  source: string;
  vesselName?: string;
  status: "active" | "acknowledged" | "resolved" | "escalated";
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  aiSuggestion?: string;
}

interface TelemetryAlertsTimelineProps {
  className?: string;
  maxAlerts?: number;
  onAlertClick?: (alert: TelemetryAlert) => void;
}

export function TelemetryAlertsTimeline({ 
  className, 
  maxAlerts = 50,
  onAlertClick 
}: TelemetryAlertsTimelineProps) {
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const generateMockAlerts = useCallback(() => {
    const mockAlerts: TelemetryAlert[] = [
      {
        id: "alert-1",
        title: "Temperatura do Motor Crítica",
        description: "Motor principal atingiu 95°C - limite máximo: 90°C",
        severity: "critical",
        category: "sensor",
        source: "Sensor TMP-001",
        vesselName: "MV Atlantic Pioneer",
        status: "active",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        aiSuggestion: "Reduzir carga do motor e verificar sistema de refrigeração",
      },
      {
        id: "alert-2",
        title: "Nível de Combustível Baixo",
        description: "Tanque principal com 15% - abaixo do mínimo recomendado",
        severity: "high",
        category: "sensor",
        source: "Sensor FUEL-003",
        vesselName: "MV Pacific Explorer",
        status: "acknowledged",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        acknowledgedBy: "Capitão Silva",
        acknowledgedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        aiSuggestion: "Agendar reabastecimento no próximo porto",
      },
      {
        id: "alert-3",
        title: "Vibração Anormal Detectada",
        description: "Vibração no eixo de transmissão 40% acima do normal",
        severity: "medium",
        category: "maintenance",
        source: "Sensor VIB-007",
        vesselName: "MV Titan",
        status: "active",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        aiSuggestion: "Agendar inspeção do eixo na próxima parada",
      },
      {
        id: "alert-4",
        title: "Alerta Meteorológico",
        description: "Sistema de baixa pressão previsto na rota em 24h",
        severity: "high",
        category: "weather",
        source: "Sistema Meteorológico",
        status: "active",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        aiSuggestion: "Considerar rota alternativa ou atraso na partida",
      },
      {
        id: "alert-5",
        title: "Falha de Comunicação GPS",
        description: "Perda intermitente de sinal GPS no último hour",
        severity: "low",
        category: "system",
        source: "GPS Principal",
        vesselName: "MV Ocean Star",
        status: "resolved",
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        resolvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "alert-6",
        title: "Manutenção Programada",
        description: "Inspeção de casco agendada para amanhã",
        severity: "low",
        category: "maintenance",
        source: "Sistema de Manutenção",
        vesselName: "MV Atlantic Pioneer",
        status: "acknowledged",
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        acknowledgedBy: "Chefe de Máquinas",
        acknowledgedAt: new Date(Date.now() - 100 * 60000).toISOString(),
      },
    ];

    setAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    generateMockAlerts();
  }, [generateMockAlerts]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "acknowledged", acknowledgedBy: "Você", acknowledgedAt: new Date().toISOString() }
        : a
    ));
    toast.success("Alerta reconhecido");
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "resolved", resolvedAt: new Date().toISOString() }
        : a
    ));
    toast.success("Alerta resolvido");
  };

  const escalateAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "escalated" }
        : a
    ));
    toast.info("Alerta escalado para supervisão");
  };

  const getSeverityColor = (severity: TelemetryAlert["severity"]) => {
    const colors: Record<TelemetryAlert["severity"], string> = {
      critical: "border-red-500 bg-red-500/10",
      high: "border-orange-500 bg-orange-500/10",
      medium: "border-amber-500 bg-amber-500/10",
      low: "border-blue-500 bg-blue-500/10",
    };
    return colors[severity];
  };

  const getSeverityBadge = (severity: TelemetryAlert["severity"]) => {
    const badges: Record<TelemetryAlert["severity"], string> = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-amber-500 text-black",
      low: "bg-blue-500 text-white",
    };
    return badges[severity];
  };

  const getStatusBadge = (status: TelemetryAlert["status"]) => {
    const badges: Record<TelemetryAlert["status"], { color: string; label: string }> = {
      active: { color: "bg-destructive/20 text-destructive", label: "Ativo" },
      acknowledged: { color: "bg-warning/20 text-warning", label: "Reconhecido" },
      resolved: { color: "bg-success/20 text-success", label: "Resolvido" },
      escalated: { color: "bg-accent/20 text-accent-foreground", label: "Escalado" },
    };
    return badges[status];
  };

  const getCategoryIcon = (category: TelemetryAlert["category"]) => {
    const icons: Record<TelemetryAlert["category"], React.ReactNode> = {
      sensor: <Radio className="h-4 w-4" />,
      vessel: <Ship className="h-4 w-4" />,
      system: <Zap className="h-4 w-4" />,
      weather: <Gauge className="h-4 w-4" />,
      maintenance: <Thermometer className="h-4 w-4" />,
    };
    return icons[category];
  };

  const filteredAlerts = alerts
    .filter(a => filter === "all" || a.status === filter)
    .filter(a => severityFilter === "all" || a.severity === severityFilter)
    .slice(0, maxAlerts);

  const alertCounts = {
    active: alerts.filter(a => a.status === "active").length,
    acknowledged: alerts.filter(a => a.status === "acknowledged").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
    critical: alerts.filter(a => a.severity === "critical" && a.status === "active").length,
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Bell className="h-5 w-5 text-destructive" />
              </div>
              {alertCounts.critical > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertCounts.critical}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Alertas</CardTitle>
              <CardDescription className="text-xs">
                {alertCounts.active} ativos • {alertCounts.acknowledged} reconhecidos
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px] h-8">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="acknowledged">Reconhecidos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="escalated">Escalados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative pl-10"
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10",
                      alert.status === "active" && alert.severity === "critical" && "border-destructive bg-destructive animate-pulse",
                      alert.status === "active" && alert.severity !== "critical" && "border-warning bg-warning",
                      alert.status === "acknowledged" && "border-warning bg-warning/50",
                      alert.status === "resolved" && "border-success bg-success/50",
                      alert.status === "escalated" && "border-info bg-info"
                    )}>
                      {alert.status === "resolved" ? (
                        <CheckCircle className="h-3 w-3 text-white" />
                      ) : alert.status === "escalated" ? (
                        <AlertTriangle className="h-3 w-3 text-white" />
                      ) : null}
                    </div>

                    <div className={cn(
                      "p-4 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer",
                      getSeverityColor(alert.severity)
                    )}
                    onClick={() => onAlertClick?.(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded bg-muted">
                            {getCategoryIcon(alert.category)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                              <Badge className={cn("text-[10px]", getSeverityBadge(alert.severity))}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {alert.description}
                            </p>
                            {alert.vesselName && (
                              <Badge variant="outline" className="text-[10px]">
                                <Ship className="h-3 w-3 mr-1" />
                                {alert.vesselName}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAlertClick?.(alert)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {alert.status === "active" && (
                              <DropdownMenuItem onClick={() => acknowledgeAlert(alert.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reconhecer
                              </DropdownMenuItem>
                            )}
                            {alert.status !== "resolved" && (
                              <DropdownMenuItem onClick={() => resolveAlert(alert.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver
                              </DropdownMenuItem>
                            )}
                            {alert.status === "active" && (
                              <DropdownMenuItem onClick={() => escalateAlert(alert.id)}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Escalar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {alert.aiSuggestion && (
                        <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
                          <p className="text-xs text-primary flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="font-medium">Sugestão IA:</span>
                            {alert.aiSuggestion}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString("pt-BR")}
                        </div>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusBadge(alert.status).color)}>
                          {getStatusBadge(alert.status).label}
                        </Badge>
                      </div>

                      {alert.acknowledgedBy && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Reconhecido por {alert.acknowledgedBy}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {filteredAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 pl-10">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum alerta encontrado</p>
                  </div>
                )}
              </div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TelemetryAlertsTimeline;
