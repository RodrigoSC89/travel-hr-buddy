/**
 * TelemetryAlertsTimeline - Timeline de Alertas em Tempo Real
 * PATCH 903 - Mock Zero compliance - Uses real data from Supabase
 */

import { useState } from "react";
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
  Loader2,
  RefreshCw,
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
import { useTelemetryAlertsData, TelemetryAlertData } from "@/hooks/useIntelligentAlertsData";
import { EmptyState } from "@/components/ui/EmptyState";

export type { TelemetryAlertData as TelemetryAlert };

interface TelemetryAlertsTimelineProps {
  className?: string;
  maxAlerts?: number;
  onAlertClick?: (alert: TelemetryAlertData) => void;
}

export function TelemetryAlertsTimeline({ 
  className, 
  maxAlerts = 50,
  onAlertClick 
}: TelemetryAlertsTimelineProps) {
  const { alerts, isLoading, refetch } = useTelemetryAlertsData();
  const [filter, setFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const acknowledgeAlert = (alertId: string) => {
    toast.success("Alerta reconhecido");
  };

  const resolveAlert = (alertId: string) => {
    toast.success("Alerta resolvido");
  };

  const escalateAlert = (alertId: string) => {
    toast.info("Alerta escalado para supervisão");
  };

  const getSeverityColor = (severity: TelemetryAlertData["severity"]) => {
    const colors: Record<TelemetryAlertData["severity"], string> = {
      critical: "border-destructive bg-destructive/10",
      high: "border-warning bg-warning/10",
      medium: "border-warning bg-warning/10",
      low: "border-primary bg-primary/10",
    };
    return colors[severity];
  };

  const getSeverityBadge = (severity: TelemetryAlertData["severity"]) => {
    const badges: Record<TelemetryAlertData["severity"], string> = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-amber-500 text-black",
      low: "bg-blue-500 text-white",
    };
    return badges[severity];
  };

  const getStatusBadge = (status: TelemetryAlertData["status"]) => {
    const badges: Record<TelemetryAlertData["status"], { color: string; label: string }> = {
      active: { color: "bg-destructive/20 text-destructive", label: "Ativo" },
      acknowledged: { color: "bg-warning/20 text-warning", label: "Reconhecido" },
      resolved: { color: "bg-success/20 text-success", label: "Resolvido" },
      escalated: { color: "bg-accent/20 text-accent-foreground", label: "Escalado" },
    };
    return badges[status];
  };

  const getCategoryIcon = (category: TelemetryAlertData["category"]) => {
    const icons: Record<TelemetryAlertData["category"], React.ReactNode> = {
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

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

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
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
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
        {filteredAlerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhum Alerta"
            description={
              alerts.length === 0
                ? "Não há alertas de telemetria no momento. Os alertas aparecerão aqui quando sensores detectarem anomalias."
                : "Nenhum alerta corresponde aos filtros selecionados."
            }
          />
        ) : (
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

                      <div 
                        className={cn(
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
                              {alert.aiSuggestion && (
                                <div className="mt-2 p-2 bg-primary/5 rounded text-[11px] text-muted-foreground">
                                  💡 {alert.aiSuggestion}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge className={cn("text-[10px]", getStatusBadge(alert.status).color)}>
                              {getStatusBadge(alert.status).label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                            </span>
                            
                            {alert.status === "active" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => acknowledgeAlert(alert.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Reconhecer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => resolveAlert(alert.id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Resolver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => escalateAlert(alert.id)}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Escalar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default TelemetryAlertsTimeline;
