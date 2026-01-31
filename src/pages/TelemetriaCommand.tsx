/**
 * Telemetria Command Center
 * Monitoramento, análise e diagnóstico técnico em tempo real com IA
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Radio, 
  AlertTriangle, 
  Brain, 
  History, 
  RefreshCw,
  Thermometer,
  Gauge,
  Zap,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Bell,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTelemetryAI, TelemetrySensorData, TelemetryInsight } from "@/hooks/useTelemetryAI";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { logger } from '@/lib/logger';

interface TelemetryLog {
  id: string;
  sensor_id: string;
  sensor_type: string;
  value: number;
  unit: string | null;
  status: string;
  location: string | null;
  timestamp: string;
}

interface TelemetryAlert {
  id: string;
  sensor_id: string;
  alert_type: string;
  severity: string;
  message: string;
  recommended_action: string | null;
  acknowledged: boolean;
  resolved: boolean;
  created_at: string;
}

export default function TelemetriaCommand() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<TelemetryLog[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { analyze, loading: aiLoading, lastAnalysis } = useTelemetryAI();

  // Fetch telemetry data (tables may not be in types yet)
  const fetchData = useCallback(async () => {
    try {
      // Use type assertions for tables not yet in generated types
      const sensorsRes = await (supabase.from("telemetry_logs" as any) as any)
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);
      
      const alertsRes = await (supabase.from("telemetry_alerts" as any) as any)
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (sensorsRes.data) {
        setSensors(sensorsRes.data as TelemetryLog[]);
        
        // Generate chart data
        const grouped = (sensorsRes.data as TelemetryLog[]).reduce((acc: any, log: TelemetryLog) => {
          const time = format(new Date(log.timestamp), "HH:mm");
          if (!acc[time]) acc[time] = { time };
          acc[time][log.sensor_type] = log.value;
          return acc;
        }, {});
        setChartData(Object.values(grouped).slice(0, 20).reverse());
      }

      if (alertsRes.data) {
        setAlerts(alertsRes.data as TelemetryAlert[]);
      }
    } catch (error) {
      logger.error("Error fetching telemetry:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchData, 30000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [fetchData, autoRefresh]);

  // Run AI analysis
  const runAnalysis = async () => {
    const sensorData: TelemetrySensorData[] = sensors.map(s => ({
      sensor_id: s.sensor_id,
      sensor_type: s.sensor_type,
      value: s.value,
      unit: s.unit || undefined,
      status: s.status,
      location: s.location || undefined,
      timestamp: s.timestamp
    }));
    
    await analyze(sensorData);
    toast.success("Análise IA concluída");
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await (supabase.from("telemetry_alerts" as any) as any)
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);
    
    if (!error) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      toast.success("Alerta reconhecido");
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    const { error } = await (supabase.from("telemetry_alerts" as any) as any)
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    
    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Alerta resolvido");
    }
  };

  // Filter sensors
  const filteredSensors = sensors.filter(s => {
    const matchesSearch = s.sensor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || s.sensor_type === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    totalSensors: new Set(sensors.map(s => s.sensor_id)).size,
    activeSensors: sensors.filter(s => s.status !== "offline").length,
    criticalAlerts: alerts.filter(a => a.severity === "critical").length,
    warnings: alerts.filter(a => a.severity === "high" || a.severity === "medium").length
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="h-4 w-4" />;
      case "pressure": return <Gauge className="h-4 w-4" />;
      case "fuel_level": return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      case "offline": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "high": return <Badge className="bg-orange-500">Alto</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
      default: return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Radio className="h-8 w-8 text-primary" />
            Telemetria Command Center
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real com análise preditiva por IA
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {autoRefresh ? "Auto" : "Manual"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={runAnalysis} disabled={aiLoading}>
            <Brain className={`h-4 w-4 mr-1 ${aiLoading ? "animate-pulse" : ""}`} />
            Analisar IA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sensores Ativos</p>
                <p className="text-2xl font-bold">{stats.totalSensors}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sinais Recentes</p>
                <p className="text-2xl font-bold">{sensors.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.criticalAlerts > 0 ? "border-red-500" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-500">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral</p>
                <p className="text-2xl font-bold">{lastAnalysis?.overallHealth || 85}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={lastAnalysis?.overallHealth || 85} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="sensors" className="flex items-center gap-1">
            <Radio className="h-4 w-4" />
            <span className="hidden md:inline">Sensores</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 relative">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">Alertas</span>
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">IA Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span className="hidden md:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leituras em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#ef444433" name="Temperatura" />
                      <Area type="monotone" dataKey="pressure" stroke="#3b82f6" fill="#3b82f633" name="Pressão" />
                      <Area type="monotone" dataKey="fuel_level" stroke="#22c55e" fill="#22c55e33" name="Combustível" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status dos Sensores</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {sensors.slice(0, 10).map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)}`} />
                          {getSensorIcon(sensor.sensor_type)}
                          <div>
                            <p className="font-medium text-sm">{sensor.sensor_id}</p>
                            <p className="text-xs text-muted-foreground">{sensor.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{sensor.value} {sensor.unit}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(sensor.timestamp), "HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Sensores & Sinais</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar sensor..." 
                      className="pl-8 w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="temperature">Temperatura</SelectItem>
                      <SelectItem value="pressure">Pressão</SelectItem>
                      <SelectItem value="fuel_level">Combustível</SelectItem>
                      <SelectItem value="vibration">Vibração</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredSensors.map(sensor => (
                    <div 
                      key={sensor.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                        sensor.status === "critical" ? "border-red-500 bg-red-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.status)}`} />
                        <div className="p-2 rounded-lg bg-muted">
                          {getSensorIcon(sensor.sensor_type)}
                        </div>
                        <div>
                          <p className="font-semibold">{sensor.sensor_id}</p>
                          <p className="text-sm text-muted-foreground">{sensor.location}</p>
                          <p className="text-xs text-muted-foreground capitalize">{sensor.sensor_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{sensor.value}</p>
                        <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                        <Badge variant={sensor.status === "normal" ? "default" : sensor.status === "critical" ? "destructive" : "secondary"}>
                          {sensor.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Técnicos
                {alerts.length > 0 && (
                  <Badge variant="destructive">{alerts.length} ativos</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum alerta ativo no momento</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div 
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === "critical" ? "border-red-500 bg-red-500/5" :
                          alert.severity === "high" ? "border-orange-500 bg-orange-500/5" :
                          "border-yellow-500 bg-yellow-500/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityBadge(alert.severity)}
                              <span className="text-sm text-muted-foreground">{alert.sensor_id}</span>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">Reconhecido</Badge>
                              )}
                            </div>
                            <p className="font-medium">{alert.message}</p>
                            {alert.recommended_action && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>Ação:</strong> {alert.recommended_action}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!alert.acknowledged && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Reconhecer
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    IA Preditiva
                  </CardTitle>
                  <CardDescription>
                    Análise inteligente de padrões e previsão de falhas
                  </CardDescription>
                </div>
                <Button onClick={runAnalysis} disabled={aiLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? "animate-spin" : ""}`} />
                  Nova Análise
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!lastAnalysis ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Clique em "Nova Análise" para executar a IA preditiva
                  </p>
                  <Button onClick={runAnalysis} disabled={aiLoading}>
                    Iniciar Análise
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <p className="text-3xl font-bold text-red-500">{lastAnalysis.anomalies}</p>
                      <p className="text-sm text-muted-foreground">Anomalias</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <p className="text-3xl font-bold text-yellow-500">{lastAnalysis.predictions}</p>
                      <p className="text-sm text-muted-foreground">Previsões</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <p className="text-3xl font-bold text-green-500">{lastAnalysis.overallHealth}%</p>
                      <p className="text-sm text-muted-foreground">Saúde</p>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="space-y-3">
                    {lastAnalysis.insights.map(insight => (
                      <div 
                        key={insight.id}
                        className={`p-4 rounded-lg border ${
                          insight.severity === "critical" ? "border-red-500 bg-red-500/5" :
                          insight.severity === "high" ? "border-orange-500 bg-orange-500/5" :
                          "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            insight.type === "anomaly" ? "bg-red-500/20" :
                            insight.type === "prediction" ? "bg-yellow-500/20" :
                            insight.type === "maintenance" ? "bg-blue-500/20" :
                            "bg-green-500/20"
                          }`}>
                            {insight.type === "anomaly" ? <AlertTriangle className="h-5 w-5" /> :
                             insight.type === "prediction" ? <TrendingUp className="h-5 w-5" /> :
                             <Settings className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confiança
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            <div className="mt-2 p-2 rounded bg-muted">
                              <p className="text-sm">
                                <strong>Ação recomendada:</strong> {insight.recommended_action}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Última análise: {format(new Date(lastAnalysis.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico & Tendências
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperatura" />
                    <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} name="Pressão" />
                    <Line type="monotone" dataKey="fuel_level" stroke="#22c55e" strokeWidth={2} dot={false} name="Combustível" />
                    <Line type="monotone" dataKey="vibration" stroke="#a855f7" strokeWidth={2} dot={false} name="Vibração" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
