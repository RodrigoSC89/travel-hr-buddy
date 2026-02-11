/**
 * 🔔 ProactiveMonitoringPanel - AI proactive monitoring alerts
 * Checkpoint 3.6: Proactive scanning for certificates, fatigue, maintenance
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, Bell, Shield, Clock, Wrench,
  CheckCircle2, XCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonitoringAlert {
  id: string;
  type: "certificate" | "maintenance" | "compliance" | "fatigue" | "anomaly";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

export default function ProactiveMonitoringPanel() {
  // Fetch NC predictions as certificate-like alerts
  const { data: certAlerts = [], isLoading: certsLoading } = useQuery({
    queryKey: ["proactive-cert-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_nc_predictions")
        .select("id, area_name, area_code, inspection_type, created_at, preparation_status")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [];
      return (data || []).map((pred: typeof data[number]): MonitoringAlert => ({
        id: pred.id,
        type: "compliance",
        severity: pred.preparation_status === "not_started" ? "critical" : "warning",
        title: `Compliance: ${pred.area_name || pred.area_code || "Área"}`,
        description: `Inspeção ${pred.inspection_type || "pendente"} - Status: ${pred.preparation_status || "não iniciado"}`,
        timestamp: pred.created_at || new Date().toISOString(),
        source: "NC Prediction AI",
        resolved: pred.preparation_status === "completed",
      }));
    },
    staleTime: 60000,
  });

  // Fetch maintenance predictions
  const { data: maintAlerts = [], isLoading: maintLoading } = useQuery({
    queryKey: ["proactive-maint-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_maintenance_predictions")
        .select("id, equipment_name, failure_probability, predicted_failure_date, recommended_action, status")
        .gte("failure_probability", 0.6)
        .order("failure_probability", { ascending: false })
        .limit(15);
      if (error) return [];
      return (data || []).map((pred): MonitoringAlert => ({
        id: pred.id,
        type: "maintenance",
        severity: pred.failure_probability >= 0.8 ? "critical" : "warning",
        title: `Manutenção: ${pred.equipment_name}`,
        description: `Probabilidade de falha: ${Math.round(pred.failure_probability * 100)}%. ${pred.recommended_action || ""}`,
        timestamp: pred.predicted_failure_date || new Date().toISOString(),
        source: "Predictive Maintenance AI",
        resolved: pred.status === "resolved",
      }));
    },
    staleTime: 60000,
  });

  // Fetch AI anomalies
  const { data: anomalyAlerts = [], isLoading: anomalyLoading } = useQuery({
    queryKey: ["proactive-anomaly-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_access_anomalies")
        .select("id, anomaly_type, severity, description, created_at, status, recommendation")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) return [];
      return (data || []).map((anom): MonitoringAlert => ({
        id: anom.id,
        type: "anomaly",
        severity: anom.severity === "critical" ? "critical" : anom.severity === "high" ? "warning" : "info",
        title: `Anomalia: ${anom.anomaly_type}`,
        description: anom.description || anom.recommendation || "Anomalia detectada",
        timestamp: anom.created_at,
        source: "Anomaly Detection AI",
        resolved: false,
      }));
    },
    staleTime: 60000,
  });

  const isLoading = certsLoading || maintLoading || anomalyLoading;

  // Combine and sort all alerts
  const allAlerts = [...certAlerts, ...maintAlerts, ...anomalyAlerts]
    .filter((a) => !a.resolved)
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = allAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = allAlerts.filter((a) => a.severity === "info").length;

  const severityConfig = {
    critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", badge: "bg-destructive/15 text-destructive" },
    warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", badge: "bg-warning/15 text-warning" },
    info: { icon: Info, color: "text-primary", bg: "bg-primary/10", badge: "bg-primary/15 text-primary" },
  };

  const typeConfig = {
    certificate: { icon: Shield, label: "Certificado" },
    maintenance: { icon: Wrench, label: "Manutenção" },
    compliance: { icon: Shield, label: "Compliance" },
    fatigue: { icon: Clock, label: "Fadiga" },
    anomaly: { icon: AlertTriangle, label: "Anomalia" },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Monitoramento Proativo</h2>
          <p className="text-sm text-muted-foreground">
            Scan 24/7 de certificados, manutenção e anomalias • {allAlerts.length} alertas ativos
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(criticalCount > 0 && "border-destructive/30")}>
          <CardContent className="pt-6 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Críticos</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(warningCount > 0 && "border-warning/30")}>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Avisos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Info className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{infoCount}</p>
              <p className="text-xs text-muted-foreground">Informativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas Ativos ({allAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {allAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <CheckCircle2 className="h-10 w-10 text-success" />
                <p className="text-sm font-medium">Nenhum alerta ativo</p>
                <p className="text-xs">Todos os sistemas estão dentro dos parâmetros normais.</p>
              </div>
            ) : (
              <div className="divide-y">
                {allAlerts.map((alert) => {
                  const sev = severityConfig[alert.severity];
                  const typ = typeConfig[alert.type];
                  const SevIcon = sev.icon;
                  const TypeIcon = typ.icon;
                  return (
                    <div key={alert.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-lg shrink-0", sev.bg)}>
                          <SevIcon className={cn("h-4 w-4", sev.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{alert.title}</p>
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 shrink-0", sev.badge)}>
                              {alert.severity === "critical" ? "CRÍTICO" : alert.severity === "warning" ? "AVISO" : "INFO"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {typ.label}
                            </span>
                            <span>{alert.source}</span>
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
