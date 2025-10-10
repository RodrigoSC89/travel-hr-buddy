import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Ship,
  Zap,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  Users,
  Download,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TooltipProvider } from "@/components/ui/tooltip";

interface PerformanceIndicator {
  id: string;
  name: string;
  description: string;
  category: "safety" | "availability" | "innovation" | "certification" | "supplier";
  currentValue: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  status: "excellent" | "good" | "warning" | "critical";
  lastUpdated: string;
  benchmark: number;
  historicalData: { period: string; value: number }[];
}

interface SupplierPerformance {
  id: string;
  name: string;
  category: string;
  overallScore: number;
  indicators: {
    safety: number;
    quality: number;
    delivery: number;
    cost: number;
    innovation: number;
  };
  contractValue: number;
  lastEvaluation: string;
  status: "excellent" | "good" | "warning" | "critical";
  improvements: string[];
  risks: string[];
}

const PERFORMANCE_INDICATORS: PerformanceIndicator[] = [
  {
    id: "TASO",
    name: "TASO",
    description: "Taxa de Acidentes de Segurança Operacional",
    category: "safety",
    currentValue: 0.12,
    target: 0.15,
    unit: "acidentes/milhão HH",
    trend: "down",
    trendValue: -15.2,
    status: "good",
    lastUpdated: "2024-12-15",
    benchmark: 0.18,
    historicalData: [
      { period: "Jan", value: 0.18 },
      { period: "Fev", value: 0.16 },
      { period: "Mar", value: 0.14 },
      { period: "Abr", value: 0.13 },
      { period: "Mai", value: 0.15 },
      { period: "Jun", value: 0.12 },
      { period: "Jul", value: 0.11 },
      { period: "Ago", value: 0.13 },
      { period: "Set", value: 0.12 },
      { period: "Out", value: 0.1 },
      { period: "Nov", value: 0.11 },
      { period: "Dez", value: 0.12 },
    ],
  },
  {
    id: "IDEMB",
    name: "IDEMB",
    description: "Índice de Disponibilidade de Embarcação",
    category: "availability",
    currentValue: 94.7,
    target: 95.0,
    unit: "%",
    trend: "up",
    trendValue: 2.3,
    status: "warning",
    lastUpdated: "2024-12-15",
    benchmark: 92.0,
    historicalData: [
      { period: "Jan", value: 91.2 },
      { period: "Fev", value: 92.1 },
      { period: "Mar", value: 93.4 },
      { period: "Abr", value: 94.1 },
      { period: "Mai", value: 93.8 },
      { period: "Jun", value: 94.5 },
      { period: "Jul", value: 95.2 },
      { period: "Ago", value: 94.9 },
      { period: "Set", value: 94.3 },
      { period: "Out", value: 95.1 },
      { period: "Nov", value: 94.8 },
      { period: "Dez", value: 94.7 },
    ],
  },
  {
    id: "INNOVATION",
    name: "Índice de Inovação",
    description: "Pontuação de iniciativas de inovação implementadas",
    category: "innovation",
    currentValue: 78.5,
    target: 80.0,
    unit: "pontos",
    trend: "up",
    trendValue: 5.8,
    status: "good",
    lastUpdated: "2024-12-15",
    benchmark: 75.0,
    historicalData: [
      { period: "Jan", value: 70.2 },
      { period: "Fev", value: 71.5 },
      { period: "Mar", value: 73.1 },
      { period: "Abr", value: 74.8 },
      { period: "Mai", value: 75.2 },
      { period: "Jun", value: 76.1 },
      { period: "Jul", value: 77.3 },
      { period: "Ago", value: 77.8 },
      { period: "Set", value: 78.1 },
      { period: "Out", value: 78.9 },
      { period: "Nov", value: 78.2 },
      { period: "Dez", value: 78.5 },
    ],
  },
];

const SUPPLIER_PERFORMANCE: SupplierPerformance[] = [
  {
    id: "SUPP_001",
    name: "Fornecedor Alpha Marine",
    category: "Serviços de Manutenção",
    overallScore: 87.3,
    indicators: {
      safety: 92,
      quality: 88,
      delivery: 85,
      cost: 83,
      innovation: 89,
    },
    contractValue: 2500000,
    lastEvaluation: "2024-12-01",
    status: "good",
    improvements: ["Redução de 15% no tempo de manutenção", "Implementação de IoT"],
    risks: ["Dependência excessiva", "Capacidade limitada para expansão"],
  },
  {
    id: "SUPP_002",
    name: "Beta Logistics Corp",
    category: "Logística e Suprimentos",
    overallScore: 91.7,
    indicators: {
      safety: 95,
      quality: 90,
      delivery: 94,
      cost: 88,
      innovation: 92,
    },
    contractValue: 1800000,
    lastEvaluation: "2024-11-28",
    status: "excellent",
    improvements: ["Sistema de rastreamento em tempo real", "Redução de 20% nos custos"],
    risks: ["Exposição cambial", "Dependência de terceiros"],
  },
];

export const PeotramPerformanceIndicators: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [indicators] = useState<PerformanceIndicator[]>(PERFORMANCE_INDICATORS);
  const [suppliers] = useState<SupplierPerformance[]>(SUPPLIER_PERFORMANCE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "hsl(var(--success))";
      case "good":
        return "hsl(var(--info))";
      case "warning":
        return "hsl(var(--warning))";
      case "critical":
        return "hsl(var(--destructive))";
      default:
        return "hsl(var(--muted))";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-success/20 text-success border-success/30";
      case "good":
        return "bg-info/20 text-info border-info/30";
      case "warning":
        return "bg-warning/20 text-warning border-warning/30";
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return Shield;
      case "availability":
        return Ship;
      case "innovation":
        return Zap;
      case "certification":
        return Award;
      case "supplier":
        return Users;
      default:
        return BarChart3;
    }
  };

  const formatNumber = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "pontos") return `${value.toFixed(1)} pts`;
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Indicadores de Performance PEOTRAM
            </h2>
            <p className="text-muted-foreground">Monitoramento de KPIs e métricas de desempenho</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="indicators" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="indicators">Indicadores Principais</TabsTrigger>
            <TabsTrigger value="trends">Análise de Tendências</TabsTrigger>
            <TabsTrigger value="suppliers">Performance de Fornecedores</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="indicators" className="space-y-6">
            {/* Cards de indicadores principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {indicators.map(indicator => {
                const CategoryIcon = getCategoryIcon(indicator.category);
                const achievementRate = (indicator.currentValue / indicator.target) * 100;

                return (
                  <Card key={indicator.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: getStatusColor(indicator.status) + "20" }}
                          >
                            <CategoryIcon
                              className="w-5 h-5"
                              style={{ color: getStatusColor(indicator.status) }}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{indicator.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {indicator.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeColor(indicator.status)}>
                          {indicator.status === "excellent"
                            ? "Excelente"
                            : indicator.status === "good"
                              ? "Bom"
                              : indicator.status === "warning"
                                ? "Atenção"
                                : "Crítico"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {formatNumber(indicator.currentValue, indicator.unit)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getTrendIcon(indicator.trend)}
                            <span
                              className={
                                indicator.trend === "up"
                                  ? "text-success"
                                  : indicator.trend === "down"
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                              }
                            >
                              {indicator.trend === "up"
                                ? "+"
                                : indicator.trend === "down"
                                  ? ""
                                  : ""}
                              {indicator.trendValue.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            Meta: {formatNumber(indicator.target, indicator.unit)}
                          </div>
                          <Progress value={Math.min(achievementRate, 100)} className="w-20 h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {achievementRate.toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Benchmark do setor:</span>
                          <span className="font-medium">
                            {formatNumber(indicator.benchmark, indicator.unit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Última atualização:</span>
                          <span>{new Date(indicator.lastUpdated).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Mini gráfico */}
                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={indicator.historicalData.slice(-6)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={getStatusColor(indicator.status)}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumo de performance geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Performance Geral PEOTRAM
                </CardTitle>
                <CardDescription>
                  Consolidação dos principais indicadores de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">87.5%</div>
                    <div className="text-sm text-muted-foreground">Score Geral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-info">3</div>
                    <div className="text-sm text-muted-foreground">Indicadores Atendendo Meta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">1</div>
                    <div className="text-sm text-muted-foreground">Indicadores em Atenção</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">+2.1%</div>
                    <div className="text-sm text-muted-foreground">Melhoria no Período</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>Evolução dos indicadores ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={indicators[0].historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      {indicators.map((indicator, index) => (
                        <Line
                          key={indicator.id}
                          type="monotone"
                          dataKey="value"
                          stroke={getStatusColor(indicator.status)}
                          strokeWidth={2}
                          name={indicator.name}
                          data={indicator.historicalData}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suppliers.map(supplier => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <CardDescription>{supplier.category}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {supplier.overallScore.toFixed(1)}
                        </div>
                        <Badge variant="outline" className={getStatusBadgeColor(supplier.status)}>
                          {supplier.status === "excellent"
                            ? "Excelente"
                            : supplier.status === "good"
                              ? "Bom"
                              : supplier.status === "warning"
                                ? "Atenção"
                                : "Crítico"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries(supplier.indicators).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {key === "safety"
                              ? "Segurança"
                              : key === "quality"
                                ? "Qualidade"
                                : key === "delivery"
                                  ? "Entrega"
                                  : key === "cost"
                                    ? "Custo"
                                    : "Inovação"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress value={value} className="w-16 h-2" />
                            <span className="text-sm font-medium w-8">{value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Valor do Contrato:</span>
                        <span className="font-medium">
                          R$ {supplier.contractValue.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Última Avaliação:</span>
                        <span>{new Date(supplier.lastEvaluation).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    {supplier.improvements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-success">Melhorias Recentes:</h4>
                        <ul className="space-y-1">
                          {supplier.improvements.map((improvement, index) => (
                            <li
                              key={index}
                              className="text-xs text-muted-foreground flex items-start gap-1"
                            >
                              <CheckCircle className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {supplier.risks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-warning">Riscos Identificados:</h4>
                        <ul className="space-y-1">
                          {supplier.risks.map((risk, index) => (
                            <li
                              key={index}
                              className="text-xs text-muted-foreground flex items-start gap-1"
                            >
                              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benchmarks">
            <Card>
              <CardHeader>
                <CardTitle>Comparação com Benchmarks</CardTitle>
                <CardDescription>Posicionamento em relação aos padrões do setor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {indicators.map(indicator => (
                    <div key={indicator.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{indicator.name}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            Atual:{" "}
                            <strong>{formatNumber(indicator.currentValue, indicator.unit)}</strong>
                          </span>
                          <span>
                            Benchmark:{" "}
                            <strong>{formatNumber(indicator.benchmark, indicator.unit)}</strong>
                          </span>
                          <span>
                            Meta: <strong>{formatNumber(indicator.target, indicator.unit)}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress
                          value={
                            (indicator.currentValue /
                              Math.max(indicator.benchmark, indicator.target)) *
                            100
                          }
                          className="h-3"
                        />
                        <div
                          className="absolute top-0 h-3 w-1 bg-warning"
                          style={{
                            left: `${(indicator.benchmark / Math.max(indicator.benchmark, indicator.target)) * 100}%`,
                          }}
                        />
                        <div
                          className="absolute top-0 h-3 w-1 bg-success"
                          style={{
                            left: `${(indicator.target / Math.max(indicator.benchmark, indicator.target)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
