import { useEffect, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logsEngine } from "@/lib/monitoring/LogsEngine";
import { metricsDaemon } from "@/lib/monitoring/MetricsDaemon";
import { systemWatchdog } from "@/lib/monitoring/SystemWatchdog";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, AlertTriangle, Activity, Brain, Download, 
  Mail, RefreshCw, Zap, Clock, Database, Cpu 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InsightDashboard() {
  const [metrics, setMetrics] = useState<unknown>(null);
  const [systemStatus, setSystemStatus] = useState<unknown>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [aiReport, setAiReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    // Get current metrics
    const currentMetrics = metricsDaemon.getCurrentMetrics();
    setMetrics(currentMetrics);

    // Get system status
    const status = systemWatchdog.getSystemStatus();
    setSystemStatus(status);

    // Get recent logs
    const recentLogs = logsEngine.getRecentLogs(50);
    setLogs(recentLogs);

    // Build time series data
    updateTimeSeriesData(currentMetrics);
  };

  const updateTimeSeriesData = (newMetrics: unknown) => {
    setTimeSeriesData(prev => {
      const updated = [...prev, {
        time: new Date().toLocaleTimeString("pt-BR"),
        cpu: newMetrics.cpu_usage,
        memory: newMetrics.memory_usage,
        fps: newMetrics.fps,
        errors: newMetrics.error_rate
      }];
      return updated.slice(-20); // Keep last 20 data points
    });
  });

  const generateAIReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insight-report", {
        body: {
          metrics,
          systemStatus,
          logs: logs.slice(0, 20)
        }
      };

      if (error) throw error;
      
      setAiReport(data.report);
      toast({
        title: "Relatório Gerado",
        description: "Análise de IA concluída com sucesso",
      };
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório com IA",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    const reportContent = `
NAUTILUS ONE - RELATÓRIO OPERACIONAL
Data: ${new Date().toLocaleString("pt-BR")}

=== MÉTRICAS DO SISTEMA ===
CPU: ${metrics?.cpu_usage?.toFixed(1)}%
Memória: ${metrics?.memory_usage} MB
FPS: ${metrics?.fps}
Taxa de Erro: ${metrics?.error_rate?.toFixed(2)}%
Módulos Ativos: ${metrics?.active_modules}

=== STATUS DO SISTEMA ===
Total de Módulos: ${systemStatus?.totalModules}
Ativos: ${systemStatus?.active}
Degradados: ${systemStatus?.degraded}
Offline: ${systemStatus?.offline}
Saúde Geral: ${systemStatus?.health}

=== ANÁLISE IA ===
${aiReport || "Nenhuma análise gerada ainda"}

=== LOGS RECENTES ===
${logs.slice(0, 10).map(log => 
    `[${log.level.toUpperCase()}] ${log.timestamp} - ${log.category}: ${log.message}`
  ).join("\n")}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nautilus-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Baixado",
      description: "Arquivo salvo com sucesso",
    });
  });

  const sendReportByEmail = async () => {
    toast({
      title: "Enviando Relatório",
      description: "Funcionalidade em desenvolvimento (Supabase Edge Function)",
    };
  };

  // Chart colors
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Module status distribution
  const moduleStatusData = systemStatus ? [
    { name: "Ativos", value: systemStatus.active, color: "#10b981" },
    { name: "Degradados", value: systemStatus.degraded, color: "#f59e0b" },
    { name: "Offline", value: systemStatus.offline, color: "#ef4444" }
  ] : [];

  // Error distribution by category
  const errorsByCategory = logs.reduce((acc, log) => {
    if (log.level === "error" || log.level === "critical") {
      acc[log.category] = (acc[log.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const errorCategoryData = Object.entries(errorsByCategory).map(([name, value]) => ({
    name, value
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Insight Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visibilidade estratégica e análise inteligente do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={generateAIReport} disabled={isGenerating} size="sm">
            <Brain className="w-4 h-4 mr-2" />
            {isGenerating ? "Gerando..." : "Relatório IA"}
          </Button>
          <Button onClick={downloadReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu_usage?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uso do processador
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory_usage} MB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uso de memória
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              FPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.fps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Frames por segundo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Taxa de Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.error_rate?.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Erros recentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="ai-report">Relatório IA</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas em Tempo Real</CardTitle>
              <CardDescription>Últimos 20 pontos de coleta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memória MB" />
                  <Line type="monotone" dataKey="fps" stroke="#f59e0b" name="FPS" />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Erros %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Module Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Módulos</CardTitle>
                <CardDescription>Distribuição atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={moduleStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moduleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Erros por Categoria</CardTitle>
                <CardDescription>Distribuição de problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={errorCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Status Detalhado dos Módulos</CardTitle>
              <CardDescription>
                {systemStatus?.totalModules} módulos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {systemStatus?.modules?.map((module: unknown) => (
                    <Card key={module.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{module.name}</span>
                              <Badge variant={
                                module.status === "active" ? "default" :
                                  module.status === "degraded" ? "secondary" : "destructive"
                              }>
                                {module.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {module.responseTime}ms
                              </span>
                              <span>{new Date(module.lastCheck).toLocaleString("pt-BR")}</span>
                            </div>
                            {module.errors.length > 0 && (
                              <div className="mt-2 text-xs text-red-500">
                                {module.errors.join(", ")}
                              </div>
                            )}
                          </div>
                          <Activity className={`w-5 h-5 ${
                            module.status === "active" ? "text-green-500" :
                              module.status === "degraded" ? "text-yellow-500" : "text-red-500"
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs Recentes do Sistema</CardTitle>
              <CardDescription>Últimos 50 eventos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="p-3 border rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={
                          log.level === "critical" ? "destructive" :
                            log.level === "error" ? "destructive" :
                              log.level === "warning" ? "secondary" : "outline"
                        }>
                          {log.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="font-medium">[{log.category}] {log.message}</div>
                      {log.module && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Módulo: {log.module}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análise Inteligente do Sistema
              </CardTitle>
              <CardDescription>
                Relatório gerado por IA com base nas métricas e logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!aiReport ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum relatório gerado ainda
                  </p>
                  <Button onClick={generateAIReport} disabled={isGenerating}>
                    <Brain className="w-4 h-4 mr-2" />
                    {isGenerating ? "Gerando Relatório..." : "Gerar Relatório com IA"}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {aiReport}
                    </pre>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={generateAIReport} disabled={isGenerating} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar
                    </Button>
                    <Button onClick={downloadReport} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={sendReportByEmail} variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar por Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
