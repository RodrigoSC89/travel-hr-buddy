/**
 * NOC (Network Operations Center) Page
 * REAL DATA from Supabase: vessels, soc_alerts, maintenance_tasks, crew_members
 */
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Activity, Ship, Shield, Fuel, Users, RefreshCw, Volume2, VolumeX, Maximize, Minimize, Mic, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { logger } from '@/lib/logger';

const severityConfig = {
  critical: { bg: "bg-destructive/20", border: "border-destructive", text: "text-destructive", icon: XCircle },
  warning: { bg: "bg-warning/20", border: "border-warning", text: "text-warning", icon: AlertCircle },
  info: { bg: "bg-info/20", border: "border-info", text: "text-info", icon: CheckCircle2 },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  operational: { bg: "bg-success", text: "Operacional" },
  active: { bg: "bg-success", text: "Operacional" },
  maintenance: { bg: "bg-warning", text: "Manutenção" },
  alert: { bg: "bg-destructive", text: "Alerta" },
  standby: { bg: "bg-muted-foreground", text: "Standby" },
  inactive: { bg: "bg-muted-foreground", text: "Inativo" },
};

interface NocVessel {
  id: string;
  name: string;
  status: string;
  vessel_type: string | null;
}

interface NocAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  source_module: string | null;
  acknowledged: boolean;
  created_at: string;
  [key: string]: unknown;
}

export default function NOC() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: vessels } = useQuery({
    queryKey: ["noc-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name, status, vessel_type").limit(12);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["noc-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("soc_alerts").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []).map((a): NocAlert => ({
        ...a,
        severity: a.severity || "info",
        acknowledged: a.is_acknowledged === true || false,
      }));
    },
    refetchInterval: 5000,
  });

  const { data: crewCount } = useQuery({
    queryKey: ["noc-crew-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("crew_members").select("id", { count: "exact", head: true }).eq("status", "active");
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const { data: maintenanceCount } = useQuery({
    queryKey: ["noc-maintenance-pending"],
    queryFn: async () => {
      const { count, error } = await supabase.from("maintenance_tasks").select("id", { count: "exact", head: true }).eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  const acknowledgeAlert = async (alertId: string) => {
    await supabase.from("soc_alerts").update({ acknowledged_at: new Date().toISOString(), acknowledged_by: (await supabase.auth.getUser()).data.user?.id || null }).eq("id", alertId);
    refetchAlerts();
  };

  const activeVessels = vessels?.filter((v) => v.status === "active" || v.status === "operational").length || 0;
  const criticalAlerts = (alerts || []).filter((a) => a.severity === "critical" && !a.acknowledged);
  const currentTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const metrics = [
    { id: "1", label: "Uptime Frota", value: vessels?.length ? Math.round((activeVessels / vessels.length) * 100) : 0, unit: "%", status: activeVessels === vessels?.length ? "good" : "warning" },
    { id: "2", label: "Embarcações Ativas", value: activeVessels, unit: `/${vessels?.length || 0}`, status: "good" as const },
    { id: "3", label: "Manutenções Pendentes", value: maintenanceCount || 0, unit: "", status: (maintenanceCount || 0) > 5 ? "warning" : "good" },
    { id: "4", label: "Tripulação Ativa", value: crewCount || 0, unit: "", status: "good" as const },
    { id: "5", label: "Alertas Abertos", value: (alerts || []).filter((a) => !a.acknowledged).length, unit: "", status: criticalAlerts.length > 0 ? "critical" : "good" },
    { id: "6", label: "Alertas Críticos", value: criticalAlerts.length, unit: "", status: criticalAlerts.length > 0 ? "critical" : "good" },
  ];

  return (
    <>
      <Helmet><title>NOC 24/7 | Centro de Operações</title></Helmet>
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary animate-pulse" />NOC 24/7</h1>
            <Badge variant="outline" className="border-success text-success"><span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />ONLINE</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xl font-mono bg-zinc-900 px-4 py-2 rounded-lg"><Clock className="h-5 w-5 text-primary" />{currentTime}</div>
            <div className="text-sm text-muted-foreground">Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>{isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>{isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</Button>
            </div>
          </div>
        </header>

        {criticalAlerts.length > 0 && (
          <div className="mb-4 p-4 bg-destructive/20 border border-destructive rounded-lg animate-pulse">
            <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-6 w-6" /><span className="font-bold text-lg">{criticalAlerts.length} ALERTA{criticalAlerts.length > 1 ? "S" : ""} CRÍTICO{criticalAlerts.length > 1 ? "S" : ""}</span></div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />Métricas em Tempo Real</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className={cn("p-4 rounded-lg border", metric.status === "good" && "bg-success/10 border-success/30", metric.status === "warning" && "bg-warning/10 border-warning/30", metric.status === "critical" && "bg-destructive/10 border-destructive/30")}>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                      <div className="text-3xl font-bold mt-1">{metric.value}{metric.unit}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 mt-4">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Ship className="h-5 w-5 text-primary" />Status da Frota</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(vessels || []).map((vessel) => {
                    const st = statusConfig[vessel.status || 'inactive'] || statusConfig.inactive;
                    return (
                      <div key={vessel.id} className={cn("p-3 rounded-lg border border-zinc-800 bg-zinc-800/50", vessel.status === "alert" && "border-destructive animate-pulse")}>
                        <div className="flex items-center justify-between mb-2"><span className="font-medium">{vessel.name}</span><span className={cn("w-2 h-2 rounded-full", st.bg)} /></div>
                        <div className="text-xs text-muted-foreground">Em trânsito</div>
                        <Badge variant="outline" className="mt-2 text-xs">{st.text}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5 text-primary" />Central de Alertas<Badge variant="secondary" className="ml-auto">{(alerts || []).filter((a) => !a.acknowledged).length}</Badge></CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {(alerts || []).map((alert) => {
                      const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
                      const Icon = config.icon;
                      return (
                        <div key={alert.id} className={cn("p-3 rounded-lg border", config.bg, config.border, alert.acknowledged && "opacity-50")}>
                          <div className="flex items-start gap-2">
                            <Icon className={cn("h-5 w-5 mt-0.5", config.text)} />
                            <div className="flex-1">
                              <div className={cn("font-medium", config.text)}>{alert.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">{alert.message}</div>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">{alert.source_module || "System"}</Badge>
                                {!alert.acknowledged && <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => acknowledgeAlert(alert.id)}>Reconhecer</Button>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!alerts || alerts.length === 0) && <p className="text-muted-foreground text-center py-8">Sem alertas ativos ✅</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" />Segurança: OK</span>
              <span className="flex items-center gap-2"><Fuel className="h-4 w-4 text-info" />Combustível: Normal</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-secondary-foreground" />Tripulação: {crewCount} ativos</span>
            </div>
            <div className="text-muted-foreground">Nauti One NOC v2.0 | Real-time</div>
          </div>
        </div>
      </div>
    </>
  );
}
