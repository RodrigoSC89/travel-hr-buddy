/**
 * Condition-Based Monitoring (CBM) Dashboard - M050
 * IoT sensor integration with real-time alerts and trend analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, AlertTriangle, Bell, CheckCircle, Clock,
  Cpu, Gauge, RefreshCw, Sparkles, ThermometerSun, TrendingUp,
  Waves, Zap, ShieldAlert, BarChart3,
} from "lucide-react";
import { maintenanceIntelligence, CBMAlert } from "@/services/maintenance";
import { toast } from "sonner";

const severityConfig = {
  critical: { color: "bg-red-500", text: "text-red-500", border: "border-red-500/30", icon: ShieldAlert, label: "Crítico" },
  warning: { color: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30", icon: AlertTriangle, label: "Atenção" },
  info: { color: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", icon: Activity, label: "Info" },
};

export function ConditionBasedMonitoring() {
  const [alerts, setAlerts] = useState<CBMAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await maintenanceIntelligence.getCBMAlerts();
      setAlerts(data);
    } catch (err) {
      toast.error("Erro ao carregar alertas CBM");
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const avgDaysToFailure = alerts.length > 0
    ? Math.round(alerts.reduce((sum, a) => sum + a.estimatedDaysToFailure, 0) / alerts.length)
    : 0;

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">Alertas Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Críticos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Atenção</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDaysToFailure}d</p>
              <p className="text-xs text-muted-foreground">Média até Falha</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        {(["all", "critical", "warning", "info"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="gap-1"
          >
            {f === "all" ? "Todos" : severityConfig[f].label}
            {f !== "all" && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {alerts.filter((a) => a.severity === f).length}
              </Badge>
            )}
          </Button>
        ))}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={loadAlerts} className="gap-1">
          <RefreshCw className="h-3 w-3" /> Atualizar
        </Button>
      </div>

      {/* Alerts List */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Alertas de Monitoramento por Condição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-3 text-emerald-500/50" />
                <p className="font-medium">Nenhum alerta nesta categoria</p>
                <p className="text-sm">Todos os equipamentos dentro dos parâmetros</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const cfg = severityConfig[alert.severity];
                  const Icon = cfg.icon;
                  const overThreshold = alert.currentValue > alert.normalRange.max;

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${cfg.border} bg-muted/10`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${cfg.color}/10`}>
                          <Icon className={`h-5 w-5 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{alert.equipmentName}</p>
                            <Badge variant="outline" className={`text-xs ${cfg.text}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                          {/* Sensor Bar */}
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="h-3 w-3 text-muted-foreground" />
                            <div className="flex-1">
                              <Progress
                                value={Math.min(100, (alert.currentValue / (alert.normalRange.max * 1.5)) * 100)}
                                className="h-2"
                              />
                            </div>
                            <span className={`text-xs font-mono ${overThreshold ? cfg.text : "text-foreground"}`}>
                              {alert.currentValue}%
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alert.estimatedDaysToFailure}d até falha estimada
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {alert.recommendedAction}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
