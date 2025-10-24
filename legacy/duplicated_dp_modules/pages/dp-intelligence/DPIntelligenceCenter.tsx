import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nautilusRespond } from "@/lib/ai/nautilusLLM";
import { 
  Activity, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Compass,
  Anchor,
  Wind,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DPLog {
  id: string;
  timestamp: string;
  vessel_id: string;
  position_error: number;
  heading_error: number;
  thruster_power: number;
  wind_speed: number;
  wave_height: number;
  status: "normal" | "warning" | "critical";
  ai_analysis?: string;
}

const DPIntelligenceCenter = () => {
  const [logs, setLogs] = useState<DPLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<DPLog | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDPLogs();
    
    const interval = setInterval(() => {
      addSimulatedLog();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadDPLogs = async () => {
    const simulatedLogs: DPLog[] = Array.from({ length: 20 }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
      vessel_id: "NAUTILUS-001",
      position_error: Math.random() * 5,
      heading_error: Math.random() * 10,
      thruster_power: 40 + Math.random() * 40,
      wind_speed: 10 + Math.random() * 20,
      wave_height: 1 + Math.random() * 3,
      status: Math.random() > 0.8 ? "warning" : "normal",
    }));

    setLogs(simulatedLogs);
    updateChartData(simulatedLogs);
  };

  const addSimulatedLog = () => {
    const newLog: DPLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      vessel_id: "NAUTILUS-001",
      position_error: Math.random() * 5,
      heading_error: Math.random() * 10,
      thruster_power: 40 + Math.random() * 40,
      wind_speed: 10 + Math.random() * 20,
      wave_height: 1 + Math.random() * 3,
      status: Math.random() > 0.85 ? "warning" : "normal",
    };

    setLogs(prev => [...prev.slice(-19), newLog]);
    updateChartData([...logs.slice(-19), newLog]);
  };

  const updateChartData = (logsData: DPLog[]) => {
    const data = logsData.map(log => ({
      time: new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      positionError: log.position_error.toFixed(2),
      headingError: log.heading_error.toFixed(2),
      thrusterPower: log.thruster_power.toFixed(1),
    }));
    setChartData(data);
  };

  const analyzeWithAI = async (log: DPLog) => {
    setIsAnalyzing(true);
    setSelectedLog(log);

    try {
      const prompt = `Analise este registro de DP:
- Erro de Posição: ${log.position_error.toFixed(2)}m
- Erro de Heading: ${log.heading_error.toFixed(2)}°
- Potência dos Thrusters: ${log.thruster_power.toFixed(1)}%
- Velocidade do Vento: ${log.wind_speed.toFixed(1)} knots
- Altura das Ondas: ${log.wave_height.toFixed(1)}m

Identifique:
1. Se há padrões anormais de compensação
2. Possíveis falhas de sensor ou erro operacional
3. Recomendações técnicas`;

      const response = await nautilusRespond({
        prompt,
        contextId: "dp-intelligence",
        mode: "deterministic"
      });

      const updatedLog = { ...log, ai_analysis: response.response };
      setLogs(prev => prev.map(l => l.id === log.id ? updatedLog : l));
      setSelectedLog(updatedLog);

      toast({
        title: "Análise Concluída",
        description: "IA analisou o registro de DP com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ["Timestamp", "Position Error (m)", "Heading Error (°)", "Thruster Power (%)", "Wind Speed (knots)", "Wave Height (m)", "Status"],
      ...logs.map(log => [
        log.timestamp,
        log.position_error.toFixed(2),
        log.heading_error.toFixed(2),
        log.thruster_power.toFixed(1),
        log.wind_speed.toFixed(1),
        log.wave_height.toFixed(1),
        log.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dp-analysis-${new Date().toISOString()}.csv`;
    a.click();

    toast({
      title: "Relatório Exportado",
      description: "Análise de DP exportada com sucesso.",
    });
  };

  const getStatusColor = (status: DPLog["status"]) => {
    switch (status) {
      case "critical": return "destructive";
      case "warning": return "default";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: DPLog["status"]) => {
    switch (status) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-green-500" />;
    }
  };

  const averagePositionError = logs.reduce((sum, log) => sum + log.position_error, 0) / logs.length;
  const warningCount = logs.filter(l => l.status === "warning").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="h-8 w-8 text-primary" />
            DP Intelligence Center
          </h1>
          <p className="text-muted-foreground">Análise de Posicionamento Dinâmico com IA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDPLogs} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Erro Médio de Posição</CardTitle>
            <Anchor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePositionError.toFixed(2)}m</div>
            <p className="text-xs text-muted-foreground">Últimos 20 registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Operacional</div>
            <p className="text-xs text-muted-foreground">Todos thrusters ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Condições Ambientais</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Moderadas</div>
            <p className="text-xs text-muted-foreground">
              Vento: {logs[logs.length - 1]?.wind_speed.toFixed(1)} knots
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Gráficos</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de DP</CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positionError" stroke="#3b82f6" name="Erro Posição (m)" />
                  <Line type="monotone" dataKey="headingError" stroke="#ef4444" name="Erro Heading (°)" />
                  <Line type="monotone" dataKey="thrusterPower" stroke="#10b981" name="Potência Thruster (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros de DP</CardTitle>
              <CardDescription>Últimos 20 eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.slice().reverse().map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pos: {log.position_error.toFixed(2)}m | Head: {log.heading_error.toFixed(2)}°
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          analyzeWithAI(log);
                        }}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? "Analisando..." : "Analisar com IA"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedLog ? (
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
                <CardDescription>
                  {new Date(selectedLog.timestamp).toLocaleString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Erro de Posição</p>
                    <p className="text-2xl font-bold">{selectedLog.position_error.toFixed(2)}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Erro de Heading</p>
                    <p className="text-2xl font-bold">{selectedLog.heading_error.toFixed(2)}°</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potência Thrusters</p>
                    <p className="text-2xl font-bold">{selectedLog.thruster_power.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusColor(selectedLog.status)} className="text-base">
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>

                {selectedLog.ai_analysis ? (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-semibold mb-2">Análise da IA:</h4>
                    <p className="whitespace-pre-wrap">{selectedLog.ai_analysis}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma análise de IA disponível para este registro
                    </p>
                    <Button onClick={() => analyzeWithAI(selectedLog)} disabled={isAnalyzing}>
                      {isAnalyzing ? "Analisando..." : "Analisar com IA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Selecione um registro para ver a análise detalhada
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DPIntelligenceCenter;
