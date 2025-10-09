import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Brain,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Clock,
  Settings,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PredictiveAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedModel, setSelectedModel] = useState("maintenance");

  // Sample data for charts
  const maintenanceData = [
    { month: "Jan", predicted: 85, actual: 82, confidence: 94 },
    { month: "Fev", predicted: 78, actual: 76, confidence: 91 },
    { month: "Mar", predicted: 92, actual: 89, confidence: 87 },
    { month: "Abr", predicted: 67, actual: 71, confidence: 89 },
    { month: "Mai", predicted: 88, actual: null, confidence: 92 },
    { month: "Jun", predicted: 75, actual: null, confidence: 88 },
  ];

  const performanceData = [
    { category: "Motores", efficiency: 92, prediction: "stable" },
    { category: "Navegação", efficiency: 88, prediction: "improving" },
    { category: "Combustível", efficiency: 85, prediction: "declining" },
    { category: "Elétrica", efficiency: 94, prediction: "stable" },
  ];

  const riskData = [
    { name: "Baixo Risco", value: 65, color: "#10b981" },
    { name: "Médio Risco", value: 25, color: "#f59e0b" },
    { name: "Alto Risco", value: 10, color: "#ef4444" },
  ];

  const predictions = [
    {
      id: 1,
      title: "Motor Principal - Manutenção Preventiva",
      confidence: 94,
      timeframe: "15 dias",
      priority: "high",
      description:
        "Baseado em padrões de vibração e temperatura, recomenda-se manutenção preventiva.",
      actions: ["Verificar filtros", "Analisar óleo", "Inspeção visual"],
    },
    {
      id: 2,
      title: "Consumo de Combustível - Otimização",
      confidence: 87,
      timeframe: "7 dias",
      priority: "medium",
      description: "Padrão de consumo indica oportunidade de otimização de rota.",
      actions: ["Revisar rotas", "Otimizar velocidade", "Calibrar sistemas"],
    },
    {
      id: 3,
      title: "Sistema Elétrico - Estabilidade",
      confidence: 91,
      timeframe: "30 dias",
      priority: "low",
      description: "Todos os indicadores apontam para operação estável do sistema elétrico.",
      actions: ["Monitoramento contínuo", "Manutenção programada"],
    },
  ];

  const modelAccuracy = {
    maintenance: 94.2,
    performance: 89.7,
    fuel: 91.3,
    safety: 96.1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "stable":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise Preditiva</h1>
          <p className="text-muted-foreground">
            Inteligência artificial para predição e otimização operacional
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Brain className="h-3 w-3" />
            IA Ativa
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Manutenção</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelAccuracy.maintenance}%</div>
            <Progress value={modelAccuracy.maintenance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelAccuracy.performance}%</div>
            <Progress value={modelAccuracy.performance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Combustível</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelAccuracy.fuel}%</div>
            <Progress value={modelAccuracy.fuel} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Segurança</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelAccuracy.safety}%</div>
            <Progress value={modelAccuracy.safety} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Análise de Risco</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="fuel">Combustível</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {predictions.map(prediction => (
              <Card key={prediction.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{prediction.title}</CardTitle>
                    <Badge variant={getPriorityColor(prediction.priority)}>
                      {prediction.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confiança</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Prazo: {prediction.timeframe}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{prediction.description}</p>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ações Recomendadas:</div>
                    <ul className="text-xs space-y-1">
                      {prediction.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Manutenção Preditiva</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Predito"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Real"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceData.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.category}</CardTitle>
                    {getPredictionIcon(item.prediction)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Eficiência</span>
                      <span className="font-medium">{item.efficiency}%</span>
                    </div>
                    <Progress value={item.efficiency} />
                    <div className="text-sm text-muted-foreground">
                      Tendência:{" "}
                      {item.prediction === "improving"
                        ? "Melhorando"
                        : item.prediction === "declining"
                          ? "Declinando"
                          : "Estável"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de Risco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Alto Risco - Motor Auxiliar</div>
                    <div className="text-xs text-muted-foreground">
                      Temperatura elevada detectada
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Médio Risco - Sistema Hidráulico</div>
                    <div className="text-xs text-muted-foreground">Pressão ligeiramente baixa</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Baixo Risco - Todos os Sistemas</div>
                    <div className="text-xs text-muted-foreground">Operação normal</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
