import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Settings,
  Cpu,
  Database,
  Wifi,
  HardDrive,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const PerformanceOptimizer = () => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [optimizationLevel, setOptimizationLevel] = useState("balanced");

  const [systemMetrics, setSystemMetrics] = useState({
    cpu: { usage: 45, cores: 8, temperature: 67 },
    memory: { usage: 68, total: 32, available: 10.2 },
    disk: { usage: 75, read: 125, write: 89 },
    network: { usage: 35, latency: 28, throughput: 850 },
    database: { connections: 24, queries: 1247, cache: 92 },
  });

  const [optimizations, setOptimizations] = useState([
    {
      id: 1,
      title: "Cache de Consultas",
      description: "Otimizar cache do banco de dados",
      impact: "high",
      status: "recommended",
      savings: "25% melhoria",
      category: "database",
    },
    {
      id: 2,
      title: "Compressão de Imagens",
      description: "Comprimir assets estáticos",
      impact: "medium",
      status: "active",
      savings: "15% bandwidth",
      category: "network",
    },
    {
      id: 3,
      title: "Lazy Loading",
      description: "Carregamento tardio de componentes",
      impact: "medium",
      status: "recommended",
      savings: "20% loading",
      category: "frontend",
    },
    {
      id: 4,
      title: "Memory Cleanup",
      description: "Limpeza automática de memória",
      impact: "high",
      status: "active",
      savings: "30% memory",
      category: "system",
    },
  ]);

  const performanceData = [
    { time: "00:00", cpu: 35, memory: 45, network: 25 },
    { time: "04:00", cpu: 28, memory: 38, network: 20 },
    { time: "08:00", cpu: 55, memory: 65, network: 45 },
    { time: "12:00", cpu: 68, memory: 72, network: 60 },
    { time: "16:00", cpu: 62, memory: 68, network: 55 },
    { time: "20:00", cpu: 45, memory: 58, network: 35 },
  ];

  const runOptimization = async (optimization: any) => {
    setIsOptimizing(true);

    toast({
      title: "Otimização iniciada",
      description: `Executando: ${optimization.title}`,
    });

    // Simular otimização
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Atualizar status
    setOptimizations(prev =>
      prev.map(opt => (opt.id === optimization.id ? { ...opt, status: "active" } : opt))
    );

    // Simular melhoria nas métricas
    setSystemMetrics(prev => ({
      ...prev,
      cpu: { ...prev.cpu, usage: Math.max(20, prev.cpu.usage - 5) },
      memory: { ...prev.memory, usage: Math.max(30, prev.memory.usage - 8) },
    }));

    setIsOptimizing(false);

    toast({
      title: "Otimização concluída",
      description: `${optimization.title} aplicada com sucesso`,
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-muted-foreground bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "recommended":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="w-4 h-4" />;
      case "network":
        return <Wifi className="w-4 h-4" />;
      case "system":
        return <Cpu className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoOptimization) {
        setSystemMetrics(prev => ({
          ...prev,
          cpu: {
            ...prev.cpu,
            usage: Math.max(20, Math.min(80, prev.cpu.usage + Math.random() * 6 - 3)),
          },
          memory: {
            ...prev.memory,
            usage: Math.max(30, Math.min(85, prev.memory.usage + Math.random() * 4 - 2)),
          },
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoOptimization]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            Otimizador de Performance
          </h1>
          <p className="text-muted-foreground">Monitoramento e otimização automática do sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto-otimização:</span>
            <Switch checked={autoOptimization} onCheckedChange={setAutoOptimization} />
          </div>
          <Button onClick={() => runOptimization(optimizations[0])} disabled={isOptimizing}>
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Otimizar Sistema
          </Button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* CPU */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{systemMetrics.cpu.usage}%</div>
              <Progress value={systemMetrics.cpu.usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.cpu.cores} cores • {systemMetrics.cpu.temperature}°C
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <HardDrive className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{systemMetrics.memory.usage}%</div>
              <Progress value={systemMetrics.memory.usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.memory.available}GB livre
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk */}
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disco</CardTitle>
            <HardDrive className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{systemMetrics.disk.usage}%</div>
              <Progress value={systemMetrics.disk.usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                R: {systemMetrics.disk.read} W: {systemMetrics.disk.write} MB/s
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rede</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{systemMetrics.network.usage}%</div>
              <Progress value={systemMetrics.network.usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.network.latency}ms • {systemMetrics.network.throughput}Mbps
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{systemMetrics.database.cache}%</div>
              <Progress value={systemMetrics.database.cache} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.database.connections} conn • {systemMetrics.database.queries} queries
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance em Tempo Real
            </CardTitle>
            <CardDescription>Monitoramento das últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={value => [`${value}%`, ""]} />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  name="CPU"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stackId="2"
                  stroke="hsl(var(--secondary))"
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.6}
                  name="Memória"
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  stackId="3"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.6}
                  name="Rede"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Otimizações Disponíveis
            </CardTitle>
            <CardDescription>Recomendações para melhorar performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimizations.map(optimization => (
              <div
                key={optimization.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                    {getCategoryIcon(optimization.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{optimization.title}</h4>
                      {getStatusIcon(optimization.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{optimization.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getImpactColor(optimization.impact)}>
                        {optimization.impact}
                      </Badge>
                      <span className="text-xs text-green-600 font-medium">
                        {optimization.savings}
                      </span>
                    </div>
                  </div>
                </div>
                {optimization.status === "recommended" && (
                  <Button
                    size="sm"
                    onClick={() => runOptimization(optimization)}
                    disabled={isOptimizing}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;
