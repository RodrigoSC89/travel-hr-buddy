import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  DollarSign,
  Target,
  Zap,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

interface PriceData {
  date: string;
  price: number;
  product: string;
  category: string;
}

interface AnalyticsData {
  categoryDistribution: { name: string; value: number; color: string }[];
  priceHistory: { date: string; [key: string]: any }[];
  savingsOverTime: { month: string; savings: number; alerts: number }[];
  topProducts: { name: string; savings: number; frequency: number }[];
  trends: {
    totalAlerts: number;
    activeSavings: number;
    avgDiscount: number;
    successRate: number;
  };
}

const COLORS = ["#0EA5E9", "#38BDF8", "#7DD3FC", "#BAE6FD", "#E0F2FE"];

export const PriceAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedCategory]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simulated analytics data - in production, this would come from your backend
    setTimeout(() => {
      const mockAnalytics: AnalyticsData = {
        categoryDistribution: [
          { name: "Viagens", value: 35, color: COLORS[0] },
          { name: "Hospedagem", value: 28, color: COLORS[1] },
          { name: "Combustível", value: 20, color: COLORS[2] },
          { name: "Suprimentos", value: 12, color: COLORS[3] },
          { name: "Equipamentos", value: 5, color: COLORS[4] }
        ],
        priceHistory: [
          { date: "2024-01", viagens: 1200, hospedagem: 800, combustivel: 600 },
          { date: "2024-02", viagens: 1150, hospedagem: 750, combustivel: 580 },
          { date: "2024-03", viagens: 1100, hospedagem: 720, combustivel: 620 },
          { date: "2024-04", viagens: 1250, hospedagem: 780, combustivel: 640 },
          { date: "2024-05", viagens: 1180, hospedagem: 760, combustivel: 590 },
          { date: "2024-06", viagens: 1080, hospedagem: 700, combustivel: 570 }
        ],
        savingsOverTime: [
          { month: "Jan", savings: 2450, alerts: 12 },
          { month: "Fev", savings: 1890, alerts: 8 },
          { month: "Mar", savings: 3200, alerts: 15 },
          { month: "Abr", savings: 2100, alerts: 10 },
          { month: "Mai", savings: 2800, alerts: 13 },
          { month: "Jun", savings: 3450, alerts: 16 }
        ],
        topProducts: [
          { name: "Passagem SP-RJ", savings: 850, frequency: 5 },
          { name: "Hotel Copacabana", savings: 650, frequency: 3 },
          { name: "Combustível MGO", savings: 420, frequency: 8 },
          { name: "Lubrificante Motor", savings: 280, frequency: 4 }
        ],
        trends: {
          totalAlerts: 47,
          activeSavings: 12450,
          avgDiscount: 18.5,
          successRate: 76
        }
      };
      
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`;
  const formatPercentage = (value: number) => `${value}%`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics de Preços e Economia
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  <SelectItem value="viagens">Viagens</SelectItem>
                  <SelectItem value="hospedagem">Hospedagem</SelectItem>
                  <SelectItem value="combustivel">Combustível</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold text-primary">{analytics.trends.totalAlerts}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +12% vs. período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(analytics.trends.activeSavings)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +25% vs. período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desconto Médio</p>
                <p className="text-2xl font-bold text-warning">{formatPercentage(analytics.trends.avgDiscount)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-warning" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +3.2% vs. período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-info">{formatPercentage(analytics.trends.successRate)}</p>
              </div>
              <Zap className="w-8 h-8 text-info" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +5% vs. período anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History Chart */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução de Preços por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: any) => [`R$ ${value}`, ""]}
                />
                <Line 
                  type="monotone" 
                  dataKey="viagens" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Viagens"
                />
                <Line 
                  type="monotone" 
                  dataKey="hospedagem" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Hospedagem"
                />
                <Line 
                  type="monotone" 
                  dataKey="combustivel" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  name="Combustível"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Over Time */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Economia ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.savingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: any, name: string) => [
                    name === "savings" ? `R$ ${value}` : `${value} alertas`,
                    name === "savings" ? "Economia" : "Alertas"
                  ]}
                />
                <Bar 
                  dataKey="savings" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Produtos com Maior Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.frequency} alertas disparados
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{formatCurrency(product.savings)}</p>
                    <p className="text-xs text-muted-foreground">economia total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-success/20 bg-success/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Melhor Categoria</span>
              </div>
              <p className="text-sm">
                <strong>Viagens</strong> teve o maior desconto médio (22%) no último mês.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">Melhor Período</span>
              </div>
              <p className="text-sm">
                <strong>Terças-feiras</strong> apresentam os melhores preços para viagens.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-info/20 bg-info/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-info" />
                <span className="text-sm font-medium text-info">Recomendação</span>
              </div>
              <p className="text-sm">
                Configure mais alertas para <strong>Hospedagem</strong> - alta oportunidade de economia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};