import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { OptimizationReportsManager } from "./optimization-reports-manager";
import { IntelligentAlertsCenter } from "./intelligent-alerts-center";
import {
  Zap,
  TrendingUp,
  Shield,
  Target,
  Activity,
  Gauge,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Database,
  Server,
  Globe,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Info,
  Rocket,
  Brain,
  FileText,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OptimizationMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "excellent" | "good" | "warning" | "critical";
  category: "performance" | "security" | "efficiency" | "user_experience";
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
}

interface SystemOptimization {
  id: string;
  title: string;
  description: string;
  category: "database" | "frontend" | "backend" | "security" | "infrastructure";
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "complex";
  estimatedImprovement: string;
  status: "available" | "in_progress" | "completed";
  autoApplicable: boolean;
}

export const OptimizationGeneralHub = () => {
  const { toast } = useToast();
  const [overallScore, setOverallScore] = useState(78.5);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [optimizationLevel, setOptimizationLevel] = useState(75);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [metrics, setMetrics] = useState<OptimizationMetric[]>([
    {
      id: "performance_score",
      name: "Performance Score",
      value: 85,
      target: 90,
      unit: "points",
      status: "good",
      category: "performance",
      trend: "up",
      lastUpdated: new Date(),
    },
    {
      id: "security_level",
      name: "Nível de Segurança",
      value: 92,
      target: 95,
      unit: "%",
      status: "excellent",
      category: "security",
      trend: "stable",
      lastUpdated: new Date(),
    },
    {
      id: "efficiency_rating",
      name: "Eficiência Operacional",
      value: 67,
      target: 80,
      unit: "%",
      status: "warning",
      category: "efficiency",
      trend: "up",
      lastUpdated: new Date(),
    },
    {
      id: "user_satisfaction",
      name: "Satisfação do Usuário",
      value: 88,
      target: 90,
      unit: "%",
      status: "good",
      category: "user_experience",
      trend: "up",
      lastUpdated: new Date(),
    },
  ]);

  const [optimizations, setOptimizations] = useState<SystemOptimization[]>([
    {
      id: "db_query_optimization",
      title: "Otimização de Consultas de Banco",
      description: "Implementar índices otimizados e cache de consultas frequentes",
      category: "database",
      impact: "high",
      effort: "moderate",
      estimatedImprovement: "+25% performance",
      status: "available",
      autoApplicable: true,
    },
    {
      id: "frontend_bundle_optimization",
      title: "Otimização de Bundle Frontend",
      description: "Implementar code splitting e lazy loading avançado",
      category: "frontend",
      impact: "high",
      effort: "moderate",
      estimatedImprovement: "+40% tempo de carregamento",
      status: "available",
      autoApplicable: true,
    },
    {
      id: "api_caching_strategy",
      title: "Estratégia de Cache da API",
      description: "Implementar cache distribuído e invalidação inteligente",
      category: "backend",
      impact: "medium",
      effort: "complex",
      estimatedImprovement: "+30% response time",
      status: "available",
      autoApplicable: false,
    },
  ]);

  const performanceData = [
    { time: "00:00", score: 75, cpu: 45, memory: 60 },
    { time: "04:00", score: 78, cpu: 42, memory: 58 },
    { time: "08:00", score: 82, cpu: 55, memory: 65 },
    { time: "12:00", score: 79, cpu: 68, memory: 72 },
    { time: "16:00", score: 85, cpu: 52, memory: 61 },
    { time: "20:00", score: 83, cpu: 48, memory: 59 },
    { time: "24:00", score: 78, cpu: 45, memory: 57 },
  ];

  const categoryData = [
    { name: "Performance", value: 85, color: "#0ea5e9" },
    { name: "Segurança", value: 92, color: "#10b981" },
    { name: "Eficiência", value: 67, color: "#f59e0b" },
    { name: "UX", value: 88, color: "#8b5cf6" },
  ];

  useEffect(() => {
    if (autoOptimization) {
      const interval = setInterval(() => {
        setMetrics(prev =>
          prev.map(metric => ({
            ...metric,
            value: Math.min(metric.target, metric.value + Math.random() * 2),
          }))
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoOptimization]);

  const runFullOptimization = async () => {
    setIsOptimizing(true);
    toast({
      title: "Otimização Geral Iniciada",
      description: "Executando análise completa do sistema...",
      duration: 3000,
    });

    // Simular processo de otimização
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setOverallScore(prev => prev + 0.5);
    }

    setIsOptimizing(false);
    setOverallScore(prev => Math.min(95, prev + 5));

    toast({
      title: "Otimização Concluída",
      description: "Sistema otimizado com sucesso! Performance melhorada em 12%",
      duration: 4000,
    });
  };

  const applyOptimization = async (optimizationId: string) => {
    const optimization = optimizations.find(opt => opt.id === optimizationId);
    if (!optimization) return;

    setOptimizations(prev =>
      prev.map(opt => (opt.id === optimizationId ? { ...opt, status: "in_progress" } : opt))
    );

    toast({
      title: "Aplicando Otimização",
      description: `Executando: ${optimization.title}`,
      duration: 2000,
    });

    setTimeout(() => {
      setOptimizations(prev =>
        prev.map(opt => (opt.id === optimizationId ? { ...opt, status: "completed" } : opt))
      );

      setOverallScore(prev => Math.min(95, prev + 2));

      toast({
        title: "Otimização Aplicada",
        description: `${optimization.title} foi implementada com sucesso!`,
        duration: 3000,
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return CheckCircle;
      case "good":
        return TrendingUp;
      case "warning":
        return AlertTriangle;
      case "critical":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-success";
      case "good":
        return "text-primary";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return Database;
      case "frontend":
        return Globe;
      case "backend":
        return Server;
      case "security":
        return Shield;
      case "infrastructure":
        return HardDrive;
      default:
        return Settings;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const filteredOptimizations =
    selectedCategory === "all"
      ? optimizations
      : optimizations.filter(opt => opt.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Otimização Geral do Sistema</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-otimização</span>
              <Switch checked={autoOptimization} onCheckedChange={setAutoOptimization} />
            </div>

            <Button
              onClick={runFullOptimization}
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Otimização Completa
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="optimizations" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Otimizações</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alertas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Score Geral e Configurações */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 glass-effect border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5 text-primary" />
                        Score Geral de Otimização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-4xl font-bold text-primary">
                            {overallScore.toFixed(1)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sistema otimizado em {overallScore.toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <Progress value={overallScore} className="h-3 mb-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-success">+12%</div>
                          <p className="text-xs text-muted-foreground">Performance geral</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-info">47</div>
                          <p className="text-xs text-muted-foreground">Otimizações aplicadas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações de Otimização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nível de Otimização</label>
                        <Slider
                          value={[optimizationLevel]}
                          onValueChange={value => setOptimizationLevel(value[0])}
                          max={100}
                          min={25}
                          step={25}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Conservador</span>
                          <span>Balanceado</span>
                          <span>Agressivo</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Cache Inteligente</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Compressão Avançada</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pré-carregamento</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Otimização em Tempo Real</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas por Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.map(metric => {
                    const StatusIcon = getStatusIcon(metric.status);
                    return (
                      <Card key={metric.id} className="glass-effect">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                            {metric.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                            {metric.value.toFixed(1)}
                            {metric.unit}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Meta: {metric.target}
                            {metric.unit}
                          </p>
                          <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Gráfico de Performance */}
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Tendências de Performance (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke="hsl(var(--warning))"
                            fill="hsl(var(--warning))"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="memory"
                            stroke="hsl(var(--info))"
                            fill="hsl(var(--info))"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="optimizations">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Otimizações Inteligentes Disponíveis
                  </CardTitle>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      Todas
                    </Button>
                    {["database", "frontend", "backend", "security", "infrastructure"].map(
                      category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="capitalize"
                        >
                          {category}
                        </Button>
                      )
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOptimizations.map(optimization => {
                      const CategoryIcon = getCategoryIcon(optimization.category);
                      return (
                        <Card key={optimization.id} className="border border-border/40">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <CategoryIcon className="h-4 w-4 text-primary" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{optimization.title}</h4>
                                    <Badge className={getImpactColor(optimization.impact)}>
                                      {optimization.impact.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {optimization.category}
                                    </Badge>
                                    {optimization.autoApplicable && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Auto
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-2">
                                    {optimization.description}
                                  </p>

                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Melhoria: {optimization.estimatedImprovement}</span>
                                    <span>Esforço: {optimization.effort}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {optimization.status === "completed" ? (
                                  <Badge className="bg-success/10 text-success border-success/20">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Concluída
                                  </Badge>
                                ) : optimization.status === "in_progress" ? (
                                  <Badge className="bg-warning/10 text-warning border-warning/20">
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Aplicando...
                                  </Badge>
                                ) : (
                                  <Button
                                    onClick={() => applyOptimization(optimization.id)}
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <Play className="h-3 w-3" />
                                    Aplicar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <OptimizationReportsManager />
            </TabsContent>

            <TabsContent value="alerts">
              <IntelligentAlertsCenter />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};
