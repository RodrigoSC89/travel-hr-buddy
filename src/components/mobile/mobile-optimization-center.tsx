import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Tablet,
  Monitor,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Navigation,
  Zap,
  Wifi,
  Battery,
  Signal,
  MapPin,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Globe,
  Layers,
  Settings,
  Target,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UserSession {
  id: string;
  userId: string;
  device: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  location: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  pages: number;
  actions: number;
  isActive: boolean;
}

interface PerformanceMetric {
  timestamp: Date;
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface UserBehavior {
  page: string;
  sessions: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversions: number;
  exitRate: number;
}

export const MobileOptimizationCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [behavior, setBehavior] = useState<UserBehavior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [deviceFilter, setDeviceFilter] = useState("all");

  // Dados simulados para demonstração
  const generateMockData = () => {
    const mockSessions: UserSession[] = Array.from({ length: 50 }, (_, i) => ({
      id: `session-${i}`,
      userId: `user-${Math.floor(Math.random() * 20)}`,
      device: ["mobile", "tablet", "desktop"][Math.floor(Math.random() * 3)] as any,
      os: ["iOS", "Android", "Windows", "macOS"][Math.floor(Math.random() * 4)],
      browser: ["Chrome", "Safari", "Firefox", "Edge"][Math.floor(Math.random() * 4)],
      location: ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"][
        Math.floor(Math.random() * 4)
      ],
      startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      duration: Math.floor(Math.random() * 1800) + 60, // 1-31 minutos
      pages: Math.floor(Math.random() * 10) + 1,
      actions: Math.floor(Math.random() * 20) + 1,
      isActive: Math.random() > 0.7,
    }));

    const mockPerformance: PerformanceMetric[] = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
      pageLoad: Math.random() * 2000 + 500,
      firstContentfulPaint: Math.random() * 1000 + 200,
      largestContentfulPaint: Math.random() * 2000 + 800,
      cumulativeLayoutShift: Math.random() * 0.2,
      firstInputDelay: Math.random() * 100 + 10,
      timeToInteractive: Math.random() * 3000 + 1000,
    }));

    const mockBehavior: UserBehavior[] = [
      {
        page: "/dashboard",
        sessions: 342,
        bounceRate: 24,
        avgTimeOnPage: 180,
        conversions: 89,
        exitRate: 32,
      },
      {
        page: "/hr",
        sessions: 156,
        bounceRate: 18,
        avgTimeOnPage: 240,
        conversions: 45,
        exitRate: 28,
      },
      {
        page: "/analytics",
        sessions: 89,
        bounceRate: 31,
        avgTimeOnPage: 320,
        conversions: 23,
        exitRate: 41,
      },
      {
        page: "/reports",
        sessions: 78,
        bounceRate: 29,
        avgTimeOnPage: 280,
        conversions: 34,
        exitRate: 38,
      },
      {
        page: "/maritime",
        sessions: 67,
        bounceRate: 22,
        avgTimeOnPage: 200,
        conversions: 12,
        exitRate: 35,
      },
      {
        page: "/travel",
        sessions: 54,
        bounceRate: 45,
        avgTimeOnPage: 120,
        conversions: 8,
        exitRate: 52,
      },
      {
        page: "/settings",
        sessions: 43,
        bounceRate: 38,
        avgTimeOnPage: 90,
        conversions: 15,
        exitRate: 48,
      },
    ];

    setSessions(mockSessions);
    setPerformance(mockPerformance);
    setBehavior(mockBehavior);
    setIsLoading(false);
  };

  useEffect(() => {
    generateMockData();
  }, [dateRange]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getDeviceStats = () => {
    const total = sessions.length;
    return {
      mobile: Math.round((sessions.filter(s => s.device === "mobile").length / total) * 100),
      tablet: Math.round((sessions.filter(s => s.device === "tablet").length / total) * 100),
      desktop: Math.round((sessions.filter(s => s.device === "desktop").length / total) * 100),
    };
  };

  const getPerformanceScore = () => {
    if (performance.length === 0) return 0;
    const latest = performance[performance.length - 1];

    // Calcular score baseado em Core Web Vitals
    const fcpScore =
      latest.firstContentfulPaint < 1800 ? 100 : latest.firstContentfulPaint < 3000 ? 50 : 0;
    const lcpScore =
      latest.largestContentfulPaint < 2500 ? 100 : latest.largestContentfulPaint < 4000 ? 50 : 0;
    const clsScore =
      latest.cumulativeLayoutShift < 0.1 ? 100 : latest.cumulativeLayoutShift < 0.25 ? 50 : 0;
    const fidScore = latest.firstInputDelay < 100 ? 100 : latest.firstInputDelay < 300 ? 50 : 0;

    return Math.round((fcpScore + lcpScore + clsScore + fidScore) / 4);
  };

  const filteredSessions = sessions.filter(
    session => deviceFilter === "all" || session.device === deviceFilter
  );

  const activeSessions = sessions.filter(s => s.isActive).length;
  const avgSessionDuration = Math.round(
    sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length / 60
  );
  const bounceRate = Math.round(
    behavior.reduce((acc, b) => acc + b.bounceRate, 0) / behavior.length
  );
  const deviceStats = getDeviceStats();
  const performanceScore = getPerformanceScore();

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "#8884d8",
    "#82ca9d",
  ];

  const performanceChartData = performance.map(p => ({
    date: p.timestamp.toLocaleDateString(),
    "Page Load": p.pageLoad,
    FCP: p.firstContentfulPaint,
    LCP: p.largestContentfulPaint,
    TTI: p.timeToInteractive,
  }));

  const deviceDistribution = [
    { name: "Mobile", value: deviceStats.mobile, color: COLORS[0] },
    { name: "Desktop", value: deviceStats.desktop, color: COLORS[1] },
    { name: "Tablet", value: deviceStats.tablet, color: COLORS[2] },
  ];

  const handleOptimizeImages = () => {
    toast({
      title: "Otimização iniciada",
      description: "Compressão de imagens para dispositivos móveis em andamento.",
    });
  };

  const handleEnablePWA = () => {
    toast({
      title: "PWA habilitado",
      description: "Recursos de Progressive Web App foram ativados.",
    });
  };

  const handleLazyLoad = () => {
    toast({
      title: "Lazy loading ativado",
      description: "Carregamento sob demanda configurado para componentes.",
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
          <h2 className="text-3xl font-bold tracking-tight">Otimização Mobile</h2>
          <p className="text-muted-foreground">Analytics e otimizações para dispositivos móveis</p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">usuários online agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionDuration}min</div>
            <p className="text-xs text-muted-foreground">tempo por sessão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${performanceScore >= 90 ? "text-green-600" : performanceScore >= 70 ? "text-yellow-600" : "text-red-600"}`}
            >
              {performanceScore}
            </div>
            <p className="text-xs text-muted-foreground">Core Web Vitals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Usage</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.mobile}%</div>
            <p className="text-xs text-muted-foreground">do tráfego total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="optimization">Otimizações</TabsTrigger>
          <TabsTrigger value="testing">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dispositivo</CardTitle>
                <CardDescription>Tráfego nos últimos {dateRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessões por Sistema Operacional</CardTitle>
                <CardDescription>Distribuição de usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["iOS", "Android", "Windows", "macOS"].map(os => {
                    const count = sessions.filter(s => s.os === os).length;
                    const percentage = (count / sessions.length) * 100;

                    return (
                      <div key={os} className="flex items-center justify-between">
                        <span>{os}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>Usuários conectados em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredSessions
                  .filter(s => s.isActive)
                  .map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(session.device)}
                        <div>
                          <p className="text-sm font-medium">{session.userId}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.os} • {session.browser} • {session.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{Math.floor(session.duration / 60)}min</span>
                        <span>{session.pages} páginas</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>Métricas de performance ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Page Load" stroke={COLORS[0]} strokeWidth={2} />
                  <Line type="monotone" dataKey="FCP" stroke={COLORS[1]} strokeWidth={2} />
                  <Line type="monotone" dataKey="LCP" stroke={COLORS[2]} strokeWidth={2} />
                  <Line type="monotone" dataKey="TTI" stroke={COLORS[3]} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">First Contentful Paint</CardTitle>
                <CardDescription>Primeira renderização de conteúdo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.length > 0
                    ? Math.round(performance[performance.length - 1].firstContentfulPaint)
                    : 0}
                  ms
                </div>
                <Progress
                  value={
                    performance.length > 0
                      ? Math.min(
                          (1800 / performance[performance.length - 1].firstContentfulPaint) * 100,
                          100
                        )
                      : 0
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Meta: &lt; 1.8s</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Largest Contentful Paint</CardTitle>
                <CardDescription>Maior elemento carregado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.length > 0
                    ? Math.round(performance[performance.length - 1].largestContentfulPaint)
                    : 0}
                  ms
                </div>
                <Progress
                  value={
                    performance.length > 0
                      ? Math.min(
                          (2500 / performance[performance.length - 1].largestContentfulPaint) * 100,
                          100
                        )
                      : 0
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Meta: &lt; 2.5s</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cumulative Layout Shift</CardTitle>
                <CardDescription>Estabilidade visual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.length > 0
                    ? performance[performance.length - 1].cumulativeLayoutShift.toFixed(3)
                    : 0}
                </div>
                <Progress
                  value={
                    performance.length > 0
                      ? Math.min(
                          (0.1 / performance[performance.length - 1].cumulativeLayoutShift) * 100,
                          100
                        )
                      : 0
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Meta: &lt; 0.1</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Páginas</CardTitle>
              <CardDescription>Performance por página do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behavior.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{page.page}</h4>
                      <div className="flex items-center space-x-6 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {page.sessions} sessões
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.round(page.avgTimeOnPage / 60)}min média
                        </span>
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {page.conversions} conversões
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Taxa de Rejeição</p>
                        <p
                          className={`text-lg font-bold ${page.bounceRate < 30 ? "text-green-600" : page.bounceRate < 50 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {page.bounceRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Taxa de Saída</p>
                        <p className="text-lg font-bold">{page.exitRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Automáticas</CardTitle>
                <CardDescription>Melhorias aplicadas automaticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Compressão de Imagens</span>
                    </div>
                    <Badge className="bg-green-100 text-green-600">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Minificação CSS/JS</span>
                    </div>
                    <Badge className="bg-green-100 text-green-600">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Service Worker</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-600">Pendente</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Lazy Loading</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-600">Configurar</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Recomendadas</CardTitle>
                <CardDescription>Melhorias sugeridas para performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleOptimizeImages}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Otimizar Imagens para Mobile
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleEnablePWA}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Habilitar PWA
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLazyLoad}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Configurar Lazy Loading
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Layers className="h-4 w-4 mr-2" />
                    Implementar Code Splitting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Otimização</CardTitle>
              <CardDescription>Impacto das melhorias implementadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-34%</div>
                  <p className="text-sm text-muted-foreground">Tempo de Carregamento</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+28%</div>
                  <p className="text-sm text-muted-foreground">Performance Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-45%</div>
                  <p className="text-sm text-muted-foreground">Tamanho dos Bundles</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+12%</div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Teste A/B Mobile</CardTitle>
                <CardDescription>Variações em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Layout do Dashboard</h4>
                      <Badge className="bg-blue-100 text-blue-600">Ativo</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Versão A (Atual)</p>
                        <p className="font-bold">67% conversão</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Versão B (Teste)</p>
                        <p className="font-bold">72% conversão</p>
                      </div>
                    </div>
                    <Progress value={72} className="mt-2" />
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Botões de Ação</h4>
                      <Badge className="bg-green-100 text-green-600">Vencedor</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Versão A</p>
                        <p className="font-bold">45% clicks</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Versão B</p>
                        <p className="font-bold text-green-600">58% clicks</p>
                      </div>
                    </div>
                    <Progress value={58} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testes de Usabilidade</CardTitle>
                <CardDescription>Feedback dos usuários mobile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Facilidade de Navegação</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={87} className="w-20 h-2" />
                      <span className="text-sm font-bold">87%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Velocidade Percebida</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-20 h-2" />
                      <span className="text-sm font-bold">78%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Facilidade de Leitura</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-bold">92%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Interface Intuitiva</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={84} className="w-20 h-2" />
                      <span className="text-sm font-bold">84%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Satisfação Geral</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={89} className="w-20 h-2" />
                      <span className="text-sm font-bold">89%</span>
                    </div>
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
