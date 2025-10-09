import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  category: "financial" | "operational" | "customer" | "hr";
  trend: "up" | "down" | "stable";
  change: number;
  status: "healthy" | "warning" | "critical";
}

interface ChartData {
  name: string;
  value: number;
  target?: number;
  previous?: number;
}

export const BusinessIntelligenceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<BusinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Dados simulados para demonstração
  const generateMockData = () => {
    const mockMetrics: BusinessMetric[] = [
      {
        id: "1",
        name: "Receita Total",
        value: 2850000,
        previousValue: 2650000,
        target: 3000000,
        unit: "BRL",
        category: "financial",
        trend: "up",
        change: 7.5,
        status: "healthy",
      },
      {
        id: "2",
        name: "Lucro Líquido",
        value: 450000,
        previousValue: 380000,
        target: 500000,
        unit: "BRL",
        category: "financial",
        trend: "up",
        change: 18.4,
        status: "healthy",
      },
      {
        id: "3",
        name: "Clientes Ativos",
        value: 1240,
        previousValue: 1180,
        target: 1500,
        unit: "unidades",
        category: "customer",
        trend: "up",
        change: 5.1,
        status: "warning",
      },
      {
        id: "4",
        name: "Taxa de Conversão",
        value: 12.8,
        previousValue: 11.2,
        target: 15.0,
        unit: "%",
        category: "operational",
        trend: "up",
        change: 14.3,
        status: "healthy",
      },
      {
        id: "5",
        name: "Produtividade Média",
        value: 87.5,
        previousValue: 89.2,
        target: 90.0,
        unit: "%",
        category: "hr",
        trend: "down",
        change: -1.9,
        status: "warning",
      },
      {
        id: "6",
        name: "Satisfação do Cliente",
        value: 4.6,
        previousValue: 4.4,
        target: 4.8,
        unit: "estrelas",
        category: "customer",
        trend: "up",
        change: 4.5,
        status: "healthy",
      },
    ];

    setMetrics(mockMetrics);
    setIsLoading(false);
  };

  useEffect(() => {
    generateMockData();
  }, [selectedPeriod]);

  const revenueData: ChartData[] = [
    { name: "Jan", value: 2100000, target: 2200000 },
    { name: "Fev", value: 2300000, target: 2300000 },
    { name: "Mar", value: 2500000, target: 2400000 },
    { name: "Abr", value: 2650000, target: 2600000 },
    { name: "Mai", value: 2850000, target: 2800000 },
    { name: "Jun", value: 3100000, target: 3000000 },
  ];

  const customerData: ChartData[] = [
    { name: "Novos", value: 245 },
    { name: "Recorrentes", value: 680 },
    { name: "Reativados", value: 315 },
  ];

  const operationalData: ChartData[] = [
    { name: "Seg", value: 89 },
    { name: "Ter", value: 92 },
    { name: "Qua", value: 87 },
    { name: "Qui", value: 94 },
    { name: "Sex", value: 88 },
    { name: "Sab", value: 85 },
    { name: "Dom", value: 82 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];

  const formatValue = (value: number, unit: string) => {
    if (unit === "BRL") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }

    if (unit === "unidades") {
      return new Intl.NumberFormat("pt-BR").format(value);
    }

    return `${value} ${unit}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "healthy":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "healthy":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <div className="h-4 w-4" />;
    }
  };

  const filteredMetrics = metrics.filter(
    metric => selectedCategory === "all" || metric.category === selectedCategory
  );

  const handleExportData = () => {
    toast({
      title: "Exportando dados",
      description: "Relatório de BI será baixado em breve.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">Análise avançada de dados e insights estratégicos</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="1y">1 ano</option>
          </select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={generateMockData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMetrics.map(metric => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center space-x-1">
                {getStatusIcon(metric.status)}
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</div>
              <div className="flex items-center justify-between mt-2">
                <p
                  className={`text-xs flex items-center ${
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change >= 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                  <span className="text-muted-foreground ml-1">vs período anterior</span>
                </p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso da meta</span>
                  <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(metric.value / metric.target) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="customer">Clientes</TabsTrigger>
          <TabsTrigger value="predictive">Preditivo</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Receita</CardTitle>
                <CardDescription>Receita mensal vs meta</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={value => [
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value as number),
                        "",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Receita Atual" />
                    <Bar dataKey="target" fill="hsl(var(--secondary))" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Margem de Lucro</CardTitle>
                <CardDescription>Evolução da rentabilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtividade Semanal</CardTitle>
                <CardDescription>Eficiência operacional por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={operationalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={value => [`${value}%`, "Produtividade"]} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Operacionais</CardTitle>
                <CardDescription>Status dos principais processos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Entrega no Prazo</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94} className="w-20 h-2" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Qualidade dos Produtos</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={98} className="w-20 h-2" />
                      <span className="text-sm font-medium">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eficiência Energética</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={87} className="w-20 h-2" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio de Resposta</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={91} className="w-20 h-2" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação de Clientes</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
                <CardDescription>Indicadores de relacionamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Retenção</span>
                    <Badge variant="outline">92.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Net Promoter Score (NPS)</span>
                    <Badge variant="outline">+67</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticket Médio</span>
                    <Badge variant="outline">R$ 2.847</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lifetime Value (LTV)</span>
                    <Badge variant="outline">R$ 18.420</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Churn Rate</span>
                    <Badge variant="outline">3.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Previsões e Tendências</CardTitle>
                <CardDescription>Análise preditiva baseada em IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">Receita Prevista (30d)</h4>
                    <p className="text-2xl font-bold text-green-600">R$ 3.2M</p>
                    <p className="text-sm text-muted-foreground">+12% vs período atual</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Demanda Estimada</h4>
                    <p className="text-2xl font-bold text-blue-600">+18%</p>
                    <p className="text-sm text-muted-foreground">Próximo trimestre</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Risco de Churn</h4>
                    <p className="text-2xl font-bold text-yellow-600">2.8%</p>
                    <p className="text-sm text-muted-foreground">47 clientes em risco</p>
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
