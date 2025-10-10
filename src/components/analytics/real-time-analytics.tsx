import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  Activity,
  Clock,
  Filter,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  users?: number;
  revenue?: number;
  growth?: number;
}

const RealTimeAnalytics = () => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  // Mock real-time data
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: "Usuários Ativos",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: <Users className="w-4 h-4" />,
      description: "Usuários online agora",
    },
    {
      title: "Receita Mensal",
      value: "R$ 84.392",
      change: "+8.2%",
      trend: "up",
      icon: <DollarSign className="w-4 h-4" />,
      description: "Receita do mês atual",
    },
    {
      title: "Transações",
      value: "1,429",
      change: "-2.1%",
      trend: "down",
      icon: <Package className="w-4 h-4" />,
      description: "Transações hoje",
    },
    {
      title: "Performance",
      value: "98.5%",
      change: "+0.3%",
      trend: "up",
      icon: <Activity className="w-4 h-4" />,
      description: "Uptime do sistema",
    },
  ]);

  const [chartData] = useState<ChartData[]>([
    { name: "Jan", value: 400, users: 400, revenue: 2400, growth: 24 },
    { name: "Fev", value: 300, users: 300, revenue: 1398, growth: 13 },
    { name: "Mar", value: 600, users: 600, revenue: 9800, growth: 98 },
    { name: "Abr", value: 800, users: 800, revenue: 3908, growth: 39 },
    { name: "Mai", value: 1000, users: 1000, revenue: 4800, growth: 48 },
    { name: "Jun", value: 1200, users: 1200, revenue: 3800, growth: 38 },
  ]);

  const [performanceData] = useState([
    { name: "CPU", value: 65, color: "#8884d8" },
    { name: "Memória", value: 78, color: "#82ca9d" },
    { name: "Disco", value: 45, color: "#ffc658" },
    { name: "Rede", value: 32, color: "#ff7300" },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());

      // Update metrics with random variations
      setMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          value: generateRandomValue(metric.title),
          change: generateRandomChange(),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const generateRandomValue = (title: string): string => {
    switch (title) {
      case "Usuários Ativos":
        return (2800 + Math.floor(Math.random() * 100)).toLocaleString();
      case "Receita Mensal":
        return `R$ ${(84000 + Math.floor(Math.random() * 2000)).toLocaleString()}`;
      case "Transações":
        return (1400 + Math.floor(Math.random() * 100)).toLocaleString();
      case "Performance":
        return `${(98 + Math.random() * 2).toFixed(1)}%`;
      default:
        return "0";
    }
  };

  const generateRandomChange = (): string => {
    const change = (Math.random() * 20 - 10).toFixed(1);
    return `${Number(change) > 0 ? "+" : ""}${change}%`;
  };

  const exportData = () => {
    toast({
      title: "Exportando dados",
      description: "Relatório será enviado por email",
    });
  };

  const shareReport = () => {
    toast({
      title: "Compartilhando relatório",
      description: "Link compartilhado copiado",
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics em Tempo Real</h1>
          <p className="text-muted-foreground">Monitoramento avançado de métricas empresariais</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            />
            <span className="text-sm font-medium">{isLive ? "AO VIVO" : "PAUSADO"}</span>
          </div>

          <Badge variant="outline" className="gap-2">
            <Clock className="w-3 h-3" />
            Atualizado: {lastUpdate.toLocaleTimeString()}
          </Badge>

          <Button
            variant={isLive ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLive ? "animate-spin" : ""}`} />
            {isLive ? "Pausar" : "Retomar"}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select
            className="bg-background border border-border rounded px-3 py-1"
            value={selectedTimeRange}
            onChange={e => setSelectedTimeRange(e.target.value)}
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={exportData} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>

        <Button variant="outline" size="sm" onClick={shareReport} className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getTrendIcon(metric.trend)}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {metric.change}
                </span>
                <span>vs. período anterior</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento Mensal</CardTitle>
                <CardDescription>Evolução de usuários e receita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>Monitoramento de infraestrutura</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Detalhada</CardTitle>
              <CardDescription>Análise temporal de faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base de Usuários</CardTitle>
              <CardDescription>Crescimento e engajamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {performanceData.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{item.value}%</div>
                  <Progress value={item.value} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.value > 70 ? "Alto uso" : item.value > 40 ? "Uso normal" : "Baixo uso"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeAnalytics;
