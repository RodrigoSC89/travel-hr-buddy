/**
 * Telemetria Command Center - Orchestrator
 * Refactored: tabs extracted to src/pages/telemetria/
 */
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Radio, RefreshCw, Brain, Eye, EyeOff, Wifi, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useTelemetryAI, TelemetrySensorData } from "@/hooks/useTelemetryAI";
import { format } from "date-fns";
import { logger } from '@/lib/logger';
import { TelemetryLog, TelemetryAlert } from "./telemetria/types";
import { TelemetriaTabs } from "./telemetria/TelemetriaTabs";

export default function TelemetriaCommand() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<TelemetryLog[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { analyze, loading: aiLoading, lastAnalysis } = useTelemetryAI();

  const fetchData = useCallback(async () => {
    try {
      const sensorsRes = await fromUntyped("telemetry_logs").select("*").order("timestamp", { ascending: false }).limit(100);
      const alertsRes = await fromUntyped("telemetry_alerts").select("*").eq("resolved", false).order("created_at", { ascending: false }).limit(50);
      if (sensorsRes.data) {
        setSensors(sensorsRes.data as TelemetryLog[]);
        const grouped = (sensorsRes.data as TelemetryLog[]).reduce((acc: Record<string, Record<string, unknown>>, log: TelemetryLog) => {
          const time = format(new Date(log.timestamp), "HH:mm");
          if (!acc[time]) acc[time] = { time };
          acc[time][log.sensor_type] = log.value;
          return acc;
        }, {});
        setChartData(Object.values(grouped).slice(0, 20).reverse());
      }
      if (alertsRes.data) setAlerts(alertsRes.data as TelemetryAlert[]);
    } catch (error) { logger.error("Error fetching telemetry:", error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const interval = autoRefresh ? setInterval(fetchData, 30000) : null; return () => { if (interval) clearInterval(interval); }; }, [fetchData, autoRefresh]);

  const runAnalysis = async () => {
    const sensorData: TelemetrySensorData[] = sensors.map(s => ({ sensor_id: s.sensor_id, sensor_type: s.sensor_type, value: s.value, unit: s.unit || undefined, status: s.status, location: s.location || undefined, timestamp: s.timestamp }));
    await analyze(sensorData);
    toast.success("Análise IA concluída");
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await fromUntyped("telemetry_alerts").update({ acknowledged: true, acknowledged_at: new Date().toISOString() } as never).eq("id", alertId);
    if (!error) { setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)); toast.success("Alerta reconhecido"); }
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await fromUntyped("telemetry_alerts").update({ resolved: true, resolved_at: new Date().toISOString() } as never).eq("id", alertId);
    if (!error) { setAlerts(prev => prev.filter(a => a.id !== alertId)); toast.success("Alerta resolvido"); }
  };

  const filteredSensors = sensors.filter(s => {
    const matchesSearch = s.sensor_id.toLowerCase().includes(searchTerm.toLowerCase()) || s.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || s.sensor_type === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    totalSensors: new Set(sensors.map(s => s.sensor_id)).size,
    activeSensors: sensors.filter(s => s.status !== "offline").length,
    criticalAlerts: alerts.filter(a => a.severity === "critical").length,
    warnings: alerts.filter(a => a.severity === "high" || a.severity === "medium").length
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Radio className="h-8 w-8 text-primary" />Telemetria Command Center</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real com análise preditiva por IA</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>{autoRefresh ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}{autoRefresh ? "Auto" : "Manual"}</Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}><RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />Atualizar</Button>
          <Button size="sm" onClick={runAnalysis} disabled={aiLoading}><Brain className={`h-4 w-4 mr-1 ${aiLoading ? "animate-pulse" : ""}`} />Analisar IA</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Sensores Ativos</p><p className="text-2xl font-bold">{stats.totalSensors}</p></div><Wifi className="h-8 w-8 text-success" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Sinais Recentes</p><p className="text-2xl font-bold">{sensors.length}</p></div><Activity className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card className={stats.criticalAlerts > 0 ? "border-destructive" : ""}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Alertas Críticos</p><p className="text-2xl font-bold text-destructive">{stats.criticalAlerts}</p></div><AlertTriangle className="h-8 w-8 text-destructive" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Saúde Geral</p><p className="text-2xl font-bold">{lastAnalysis?.overallHealth || 85}%</p></div><TrendingUp className="h-8 w-8 text-primary" /></div><Progress value={lastAnalysis?.overallHealth || 85} className="mt-2 h-2" /></CardContent></Card>
      </div>

      <TelemetriaTabs activeTab={activeTab} setActiveTab={setActiveTab} sensors={sensors} alerts={alerts} chartData={chartData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filteredSensors={filteredSensors} acknowledgeAlert={acknowledgeAlert} resolveAlert={resolveAlert} runAnalysis={runAnalysis} aiLoading={aiLoading} lastAnalysis={lastAnalysis} />
    </div>
  );
}
