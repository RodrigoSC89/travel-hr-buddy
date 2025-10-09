import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
  Zap,
  Calendar,
  DollarSign,
  Users,
  Ship,
  Fuel,
  Timer,
  Lightbulb,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Prediction {
  id: string;
  type: "cost" | "demand" | "maintenance" | "performance" | "risk";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  timeframe: string;
  value: number;
  trend: "up" | "down" | "stable";
  recommendation: string;
  priority: number;
}

interface AIInsight {
  id: string;
  category: "operational" | "financial" | "strategic" | "risk";
  title: string;
  description: string;
  action: string;
  expectedBenefit: string;
  complexity: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
}

export const PredictiveAnalyticsAdvanced: React.FC = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  const [predictions] = useState<Prediction[]>([
    {
      id: "1",
      type: "cost",
      title: "Aumento de Custos de Combustível",
      description: "Previsão de aumento de 15% nos custos de combustível",
      confidence: 85,
      impact: "high",
      timeframe: "30 dias",
      value: 150000,
      trend: "up",
      recommendation: "Considere contratos de hedge para mitigar o risco",
      priority: 1,
    },
    {
      id: "2",
      type: "maintenance",
      title: "Manutenção Preventiva Necessária",
      description: "Motor principal da embarcação A-001 precisa de manutenção",
      confidence: 92,
      impact: "critical",
      timeframe: "15 dias",
      value: 75000,
      trend: "stable",
      recommendation: "Agendar manutenção imediatamente para evitar falha",
      priority: 1,
    },
    {
      id: "3",
      type: "demand",
      title: "Aumento na Demanda de Viagens",
      description: "Esperado aumento de 25% na demanda para rota Santos-Europa",
      confidence: 78,
      impact: "medium",
      timeframe: "60 dias",
      value: 200000,
      trend: "up",
      recommendation: "Aumentar capacidade operacional na rota",
      priority: 2,
    },
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: "1",
      category: "operational",
      title: "Otimização de Rotas",
      description:
        "IA identificou oportunidade de reduzir 12% do tempo de viagem otimizando rotas atuais",
      action: "Implementar novo algoritmo de roteamento",
      expectedBenefit: "Economia de R$ 80.000/mês em combustível",
      complexity: "medium",
      urgency: "high",
    },
    {
      id: "2",
      category: "financial",
      title: "Renegociação de Contratos",
      description: "Análise mostra que 3 contratos específicos estão 20% acima do mercado",
      action: "Renegociar contratos identificados",
      expectedBenefit: "Redução de R$ 45.000/mês",
      complexity: "low",
      urgency: "medium",
    },
    {
      id: "3",
      category: "strategic",
      title: "Expansão para Nova Rota",
      description: "Dados indicam viabilidade para nova rota comercial Santos-Miami",
      action: "Realizar estudo de viabilidade detalhado",
      expectedBenefit: "Potencial receita adicional de R$ 2M/ano",
      complexity: "high",
      urgency: "low",
    },
  ]);

  // Dados simulados para gráficos
  const performanceData = [
    { month: "Jan", efficiency: 78, cost: 120000, revenue: 450000 },
    { month: "Fev", efficiency: 82, cost: 115000, revenue: 480000 },
    { month: "Mar", efficiency: 85, cost: 110000, revenue: 520000 },
    { month: "Abr", efficiency: 79, cost: 125000, revenue: 470000 },
    { month: "Mai", efficiency: 88, cost: 105000, revenue: 550000 },
    { month: "Jun", efficiency: 91, cost: 98000, revenue: 580000 },
  ];

  const riskData = [
    { name: "Operacional", value: 35, color: "#ef4444" },
    { name: "Financeiro", value: 25, color: "#f97316" },
    { name: "Regulatório", value: 20, color: "#eab308" },
    { name: "Ambiental", value: 15, color: "#22c55e" },
    { name: "Outros", value: 5, color: "#6b7280" },
  ];

  const demandForecast = [
    { date: "2024-01", actual: 100, predicted: 105 },
    { date: "2024-02", actual: 110, predicted: 115 },
    { date: "2024-03", actual: 120, predicted: 125 },
    { date: "2024-04", predicted: 135 },
    { date: "2024-05", predicted: 140 },
    { date: "2024-06", predicted: 150 },
  ];

  const runAnalysis = async () => {
    setIsAnalyzing(true);

    // Simular análise IA
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsAnalyzing(false);
    toast({
      title: "Análise Concluída",
      description: "Nova análise preditiva gerada com sucesso",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "low":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "high":
      return "text-orange-600 bg-orange-100";
    case "critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
    case "low":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "high":
      return "text-red-600";
    default:
      return "text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Análise Preditiva Avançada
          </h1>
          <p className="text-muted-foreground">IA e Machine Learning para insights estratégicos</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-w-32"
            value={selectedTimeframe}
            onChange={e => setSelectedTimeframe(e.target.value)}
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="1y">1 ano</option>
          </select>
          <Button onClick={runAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
            {isAnalyzing ? (
              <>
                <Timer className="h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Nova Análise
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Precisão IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">R$ 2.3M</div>
                <div className="text-sm text-muted-foreground">Economia Prevista</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">Oportunidades</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Riscos Críticos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="forecasts">Projeções</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-4">
            {predictions.map(prediction => (
              <Card key={prediction.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{prediction.title}</h3>
                        <Badge className={getImpactColor(prediction.impact)}>
                          {prediction.impact === "low"
                            ? "Baixo"
                            : prediction.impact === "medium"
                              ? "Médio"
                              : prediction.impact === "high"
                                ? "Alto"
                                : "Crítico"}
                        </Badge>
                        {prediction.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : prediction.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mb-3">{prediction.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Confiança:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={prediction.confidence} className="flex-1" />
                            <span>{prediction.confidence}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Prazo:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {prediction.timeframe}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Impacto Financeiro:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <DollarSign className="h-4 w-4" />
                            R$ {prediction.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Recomendação</h4>
                        <p className="text-blue-800 text-sm">{prediction.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map(insight => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant="outline">
                      {insight.category === "operational"
                        ? "Operacional"
                        : insight.category === "financial"
                          ? "Financeiro"
                          : insight.category === "strategic"
                            ? "Estratégico"
                            : "Risco"}
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Ação Recomendada:</span>
                      <p className="text-sm text-muted-foreground">{insight.action}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Benefício Esperado:</span>
                      <p className="text-sm text-green-600 font-medium">
                        {insight.expectedBenefit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-muted-foreground">Complexidade: </span>
                        <span className={getComplexityColor(insight.complexity)}>
                          {insight.complexity === "low"
                            ? "Baixa"
                            : insight.complexity === "medium"
                              ? "Média"
                              : "Alta"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Urgência: </span>
                        <span className={getComplexityColor(insight.urgency)}>
                          {insight.urgency === "low"
                            ? "Baixa"
                            : insight.urgency === "medium"
                              ? "Média"
                              : "Alta"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Implementar</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>Análise histórica e projeções</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#8884d8" name="Eficiência %" />
                  <Line type="monotone" dataKey="cost" stroke="#82ca9d" name="Custos (R$)" />
                  <Line type="monotone" dataKey="revenue" stroke="#ffc658" name="Receita (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
                <CardDescription>Análise por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matriz de Riscos</CardTitle>
                <CardDescription>Probabilidade vs Impacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 h-64">
                  {/* Matriz 3x3 de riscos */}
                  <div className="bg-green-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Baixo/Baixo</div>
                    <div className="text-green-600">2 riscos</div>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Baixo/Médio</div>
                    <div className="text-yellow-600">3 riscos</div>
                  </div>
                  <div className="bg-orange-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Baixo/Alto</div>
                    <div className="text-orange-600">1 risco</div>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Médio/Baixo</div>
                    <div className="text-yellow-600">4 riscos</div>
                  </div>
                  <div className="bg-orange-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Médio/Médio</div>
                    <div className="text-orange-600">5 riscos</div>
                  </div>
                  <div className="bg-red-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Médio/Alto</div>
                    <div className="text-red-600">2 riscos</div>
                  </div>
                  <div className="bg-orange-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Alto/Baixo</div>
                    <div className="text-orange-600">1 risco</div>
                  </div>
                  <div className="bg-red-100 p-2 rounded text-center text-xs">
                    <div className="font-medium">Alto/Médio</div>
                    <div className="text-red-600">3 riscos</div>
                  </div>
                  <div className="bg-red-200 p-2 rounded text-center text-xs border-2 border-red-400">
                    <div className="font-medium">Alto/Alto</div>
                    <div className="text-red-700 font-bold">3 riscos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Demanda</CardTitle>
              <CardDescription>Previsão baseada em ML para os próximos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Dados Reais"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Previsão IA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
