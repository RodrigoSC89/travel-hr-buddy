/**
 * PATCH UNIFY-11.1: AI Command Center
 * Fusão de: IA Revolucionária + Dashboard IA + Insights de IA + Automação IA + Métricas de Adoção
 * 
 * Funcionalidades integradas:
 * - Comando Universal (linguagem natural)
 * - Fleet Cockpit 360° 
 * - Manutenção Preditiva
 * - Estoque Vivo
 * - Agente Autônomo
 * - Simulador de Cenários
 * - Auditoria Assistida
 * - Comparador de Fornecedores
 * - Dashboard de monitoramento IA
 * - Métricas de adoção e saúde
 * - Insights avançados com ML
 * - Automações e workflows
 * - Sugestões inteligentes
 * - Relatórios automatizados
 * - Métricas de Adoção por Módulo (PATCH UNIFY-11.1)
 * - Atividade Recente de IA
 * - Adoção por Departamento
 */

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  Brain, 
  Command, 
  Ship, 
  Wrench, 
  Package, 
  Calculator,
  FileSearch,
  Building2,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Bell,
  Zap,
  BarChart3,
  Lightbulb,
  Target,
  Users,
  Clock,
  Settings,
  FileText,
  Play,
  Bot,
  Cpu,
  ArrowUp,
  ArrowDown,
  Download,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSystemHealth } from "@/hooks/ai/useSystemHealth";
import { useWatchdogAlerts } from "@/hooks/ai/useWatchdogAlerts";

// Revolutionary AI Components
import { NaturalLanguageCommand } from "@/modules/revolutionary-ai/NaturalLanguageCommand";
import { FleetCockpit360 } from "@/modules/revolutionary-ai/FleetCockpit360";
import { PredictiveMaintenanceScheduler } from "@/modules/revolutionary-ai/PredictiveMaintenanceScheduler";
import { LiveInventoryMap } from "@/modules/revolutionary-ai/LiveInventoryMap";
import { AutonomousAgent } from "@/modules/revolutionary-ai/AutonomousAgent";
import { ScenarioSimulator } from "@/modules/revolutionary-ai/ScenarioSimulator";
import { AuditAssistant } from "@/modules/revolutionary-ai/AuditAssistant";
import { SupplierComparator } from "@/modules/revolutionary-ai/SupplierComparator";

// Dashboard Components
import { AIAdoptionScorecard } from "@/components/ai/AIAdoptionScorecard";
import { WorkflowAISuggestions } from "@/components/ai/WorkflowAISuggestions";

// Automation Components
import { AISuggestionsPanel } from "@/components/automation/ai-suggestions-panel";
import { AutomationWorkflowsManager } from "@/components/automation/automation-workflows-manager";
import { AutomatedReportsManager } from "@/components/automation/automated-reports-manager";
import { SmartOnboardingWizard } from "@/components/automation/smart-onboarding-wizard";

// Insights Charts
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar, Legend } from "recharts";

const REVOLUTIONARY_FEATURES = [
  { id: "command", name: "Comando Universal", icon: Command, color: "text-blue-400", description: "Linguagem natural" },
  { id: "cockpit", name: "Cockpit 360°", icon: Ship, color: "text-cyan-400", description: "Visão da frota" },
  { id: "maintenance", name: "Manutenção Preditiva", icon: Wrench, color: "text-amber-400", description: "ML + Telemetria" },
  { id: "inventory", name: "Estoque Vivo", icon: Package, color: "text-green-400", description: "Mapa geográfico" },
  { id: "agent", name: "Agente Autônomo", icon: Bot, color: "text-purple-400", description: "IA proativa" },
  { id: "simulator", name: "Simulador", icon: Calculator, color: "text-pink-400", description: "What-if analysis" },
  { id: "audit", name: "Auditoria", icon: FileSearch, color: "text-indigo-400", description: "Dossiês automáticos" },
  { id: "suppliers", name: "Fornecedores", icon: Building2, color: "text-orange-400", description: "Comparação IA" },
];

export default function AICommandCenter() {
  const { toast } = useToast();
  const { healthStatus, overallStatus, getLatestHealth, isLoading: healthLoading } = useSystemHealth();
  const { alerts, unreadCount, getActiveAlerts, resolveAlert, isLoading: alertsLoading } = useWatchdogAlerts();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFeature, setActiveFeature] = useState("command");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    getActiveAlerts();
  }, [getActiveAlerts]);

  // Performance metrics
  const [performanceMetrics] = useState({
    aiAccuracy: 94.5,
    predictionReliability: 91.2,
    automationEfficiency: 87.8,
    insightValue: 89.5,
    userAdoption: 76.3
  });

  // Predictive data for charts
  const predictiveData = [
    { day: "Seg", atual: 45, previsto: 48, efficiency: 92 },
    { day: "Ter", atual: 52, previsto: 55, efficiency: 89 },
    { day: "Qua", atual: 48, previsto: 50, efficiency: 94 },
    { day: "Qui", atual: 61, previsto: 58, efficiency: 88 },
    { day: "Sex", atual: 55, previsto: 57, efficiency: 91 },
    { day: "Sab", atual: 33, previsto: 35, efficiency: 95 },
    { day: "Dom", atual: 28, previsto: 30, efficiency: 97 }
  ];

  const radarData = [
    { subject: "Eficiência", A: 120, fullMark: 150 },
    { subject: "Qualidade", A: 98, fullMark: 150 },
    { subject: "Velocidade", A: 130, fullMark: 150 },
    { subject: "Precisão", A: 115, fullMark: 150 },
    { subject: "Automação", A: 108, fullMark: 150 },
    { subject: "Adoção", A: 95, fullMark: 150 }
  ];

  // AI Insights
  const [aiInsights] = useState([
    { id: 1, title: "Otimização de Processos", confidence: 92, impact: "high", status: "new", savings: "25% tempo" },
    { id: 2, title: "Padrões de Uso", confidence: 87, impact: "medium", status: "active", savings: "15% engajamento" },
    { id: 3, title: "Predição de Demanda", confidence: 95, impact: "high", status: "implemented", savings: "30% recursos" },
    { id: 4, title: "Anomalia Detectada", confidence: 78, impact: "low", status: "monitoring", savings: "5% riscos" },
  ]);

  // Adoption metrics data (from AIAdoption module)
  const [adoptionData] = useState({
    overview: {
      acceptanceRate: 78,
      totalSuggestions: 1247,
      avgResponseTime: 245,
      successRate: 94,
      activeUsers: 89,
      totalInteractions: 3856,
      previousAcceptanceRate: 72,
    },
    modules: [
      { name: "Manutenção Preditiva", interactions: 456, accepted: 387, rejected: 69, avgTime: 180, trend: "up" },
      { name: "Compliance", interactions: 342, accepted: 298, rejected: 44, avgTime: 220, trend: "up" },
      { name: "Gestão de Tripulação", interactions: 289, accepted: 231, rejected: 58, avgTime: 195, trend: "stable" },
      { name: "Rotas Marítimas", interactions: 234, accepted: 187, rejected: 47, avgTime: 310, trend: "up" },
      { name: "Documentação", interactions: 198, accepted: 158, rejected: 40, avgTime: 150, trend: "down" },
      { name: "Segurança", interactions: 167, accepted: 150, rejected: 17, avgTime: 280, trend: "up" },
    ],
    timeline: [
      { date: "Jan", interactions: 450, accepted: 360, rate: 80 },
      { date: "Fev", interactions: 520, accepted: 390, rate: 75 },
      { date: "Mar", interactions: 580, accepted: 464, rate: 80 },
      { date: "Abr", interactions: 620, accepted: 527, rate: 85 },
      { date: "Mai", interactions: 680, accepted: 544, rate: 80 },
      { date: "Jun", interactions: 750, accepted: 638, rate: 85 },
    ],
    userAdoption: [
      { department: "Operações", users: 32, activeUsers: 28, adoptionRate: 87 },
      { department: "Manutenção", users: 24, activeUsers: 22, adoptionRate: 92 },
      { department: "Compliance", users: 18, activeUsers: 15, adoptionRate: 83 },
      { department: "RH", users: 12, activeUsers: 9, adoptionRate: 75 },
      { department: "Segurança", users: 15, activeUsers: 12, adoptionRate: 80 },
    ],
    recentActivity: [
      { id: "1", type: "accepted", module: "MMI", description: "Sugestão de manutenção preventiva aceita", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: "2", type: "rejected", module: "Compliance", description: "Ajuste de prazo rejeitado pelo usuário", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { id: "3", type: "accepted", module: "Tripulação", description: "Reatribuição de tarefas aceita", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { id: "4", type: "accepted", module: "Rotas", description: "Otimização de rota implementada", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
      { id: "5", type: "accepted", module: "Segurança", description: "Alerta de segurança processado", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
    ],
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <span className="h-4 w-4 text-muted-foreground">-</span>;
    }
  };

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "degraded": return "text-yellow-500";
      case "critical": case "unhealthy": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getHealthStatusIcon = (status?: string) => {
    switch (status) {
      case "healthy": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical": case "unhealthy": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const avgResponseTime = healthStatus.length > 0
    ? Math.round(healthStatus.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / healthStatus.length)
    : 0;

  const successRate = healthStatus.length > 0
    ? Math.round((healthStatus.filter(h => h.status === "healthy").length / healthStatus.length) * 100)
    : 100;

  const criticalAlerts = alerts.filter(a => a.severity === "critical");

  const runAnalysis = () => {
    setIsAnalyzing(true);
    toast({ title: "Análise Iniciada", description: "Processando dados com IA..." });
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({ title: "Análise Completa", description: "Novos insights disponíveis!" });
    }, 3000);
  };

  const renderRevolutionaryContent = () => {
    switch (activeFeature) {
      case "command": return <NaturalLanguageCommand />;
      case "cockpit": return <FleetCockpit360 />;
      case "maintenance": return <PredictiveMaintenanceScheduler />;
      case "inventory": return <LiveInventoryMap />;
      case "agent": return <AutonomousAgent />;
      case "simulator": return <ScenarioSimulator />;
      case "audit": return <AuditAssistant />;
      case "suppliers": return <SupplierComparator />;
      default: return <NaturalLanguageCommand />;
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Command Center | Nautilus One</title>
        <meta name="description" content="Centro de Comando de IA - Automação, Insights e Funcionalidades Revolucionárias" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-purple-500/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Command Center</h1>
                  <p className="text-muted-foreground">
                    Centro unificado de IA: Automação, Insights e Funcionalidades Revolucionárias
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {criticalAlerts.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="h-3 w-3 mr-1" />
                    {criticalAlerts.length} alertas críticos
                  </Badge>
                )}
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  15 Funcionalidades
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { getLatestHealth(); getActiveAlerts(); }}
                  disabled={healthLoading || alertsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${(healthLoading || alertsLoading) ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Button size="sm" onClick={runAnalysis} disabled={isAnalyzing}>
                  <Play className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-pulse" : ""}`} />
                  {isAnalyzing ? "Analisando..." : "Analisar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className={`text-lg font-bold capitalize ${getHealthStatusColor(overallStatus)}`}>
                      {overallStatus || "..."}
                    </p>
                  </div>
                  {getHealthStatusIcon(overallStatus)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Precisão IA</p>
                    <p className="text-lg font-bold">{performanceMetrics.aiAccuracy}%</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Automação</p>
                    <p className="text-lg font-bold">{performanceMetrics.automationEfficiency}%</p>
                  </div>
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Resposta</p>
                    <p className="text-lg font-bold">{avgResponseTime}ms</p>
                  </div>
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-500/10 to-green-500/10 border-teal-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                    <p className="text-lg font-bold text-green-500">{successRate}%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Alertas</p>
                    <p className="text-lg font-bold">{unreadCount}</p>
                  </div>
                  <Bell className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="container mx-auto px-4 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="revolutionary">
                <Sparkles className="w-4 h-4 mr-2" />
                IA Revolucionária
              </TabsTrigger>
              <TabsTrigger value="adoption">
                <TrendingUp className="w-4 h-4 mr-2" />
                Adoção
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="automation">
                <Zap className="w-4 h-4 mr-2" />
                Automação
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="w-4 h-4 mr-2" />
                Alertas
                {unreadCount > 0 && <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance IA</CardTitle>
                    <CardDescription>Comparativo real vs previsto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={predictiveData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="atual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Real" />
                        <Area type="monotone" dataKey="previsto" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Previsto" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                        <Radar name="Performance" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Insights Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiInsights.map((insight) => (
                      <Card key={insight.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getImpactColor(insight.impact)}>{insight.impact}</Badge>
                            <span className="text-sm font-bold">{insight.confidence}%</span>
                          </div>
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">Economia: {insight.savings}</p>
                          <Progress value={insight.confidence} className="mt-2 h-1" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revolutionary AI Tab */}
            <TabsContent value="revolutionary" className="space-y-4">
              {/* Feature Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {REVOLUTIONARY_FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  const isActive = activeFeature === feature.id;
                  return (
                    <motion.button
                      key={feature.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "bg-muted hover:bg-muted/80 border border-border/50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "" : feature.color}`} />
                      <span className="font-medium text-sm">{feature.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feature Content */}
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderRevolutionaryContent()}
              </motion.div>
            </TabsContent>

            {/* Adoption Metrics Tab */}
            <TabsContent value="adoption" className="space-y-6">
              {/* Adoption Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                        <p className="text-3xl font-bold text-primary">{adoptionData.overview.acceptanceRate}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          {adoptionData.overview.acceptanceRate > adoptionData.overview.previousAcceptanceRate ? (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            vs {adoptionData.overview.previousAcceptanceRate}% anterior
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Sugestões</p>
                        <p className="text-3xl font-bold">{adoptionData.overview.totalSuggestions.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {adoptionData.overview.totalInteractions.toLocaleString()} interações
                        </p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Médio</p>
                        <p className="text-3xl font-bold">{adoptionData.overview.avgResponseTime}ms</p>
                        <p className="text-xs text-muted-foreground mt-1">Resposta do sistema</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                        <p className="text-3xl font-bold text-green-500">{adoptionData.overview.successRate}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {adoptionData.overview.activeUsers} usuários ativos
                          </span>
                        </div>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução da Adoção</CardTitle>
                    <CardDescription>Tendência de interações e aceitação</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={adoptionData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="interactions" name="Interações" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="accepted" name="Aceitas" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Department Adoption Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adoção por Departamento</CardTitle>
                    <CardDescription>Taxa de adoção em cada departamento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={adoptionData.userAdoption} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="department" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="adoptionRate" name="Taxa de Adoção" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Module Usage & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Module Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Uso por Módulo</CardTitle>
                    <CardDescription>Operações de IA por módulo do sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {adoptionData.modules.map((module) => {
                          const rate = Math.round((module.accepted / module.interactions) * 100);
                          return (
                            <div key={module.name} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{module.name}</span>
                                  {getTrendIcon(module.trend)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{module.interactions} ops</span>
                                  <Badge variant="outline" className="text-xs">{rate}%</Badge>
                                </div>
                              </div>
                              <Progress value={rate} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividade Recente
                    </CardTitle>
                    <CardDescription>Últimas interações com sugestões de IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {adoptionData.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            {activity.type === "accepted" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <Badge variant="outline" className="text-xs">{activity.module}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {activity.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Sugestões</CardTitle>
                  <CardDescription>Estatísticas das sugestões geradas pela IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold text-green-500">
                        {Math.round(adoptionData.overview.totalSuggestions * adoptionData.overview.acceptanceRate / 100)}
                      </p>
                      <p className="text-xs text-muted-foreground">Aceitas</p>
                    </div>

                    <div className="p-4 rounded-lg bg-red-500/10 text-center">
                      <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                      <p className="text-2xl font-bold text-red-500">
                        {Math.round(adoptionData.overview.totalSuggestions * (100 - adoptionData.overview.acceptanceRate) / 100)}
                      </p>
                      <p className="text-xs text-muted-foreground">Rejeitadas</p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                      <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold text-blue-500">{adoptionData.overview.totalInteractions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Operações IA</p>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-2xl font-bold text-purple-500">{adoptionData.overview.acceptanceRate}%</p>
                      <p className="text-xs text-muted-foreground">Taxa Adoção</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIAdoptionScorecard />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Saúde por Serviço</CardTitle>
                    <CardDescription>Status de cada serviço do sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {healthStatus.length > 0 ? (
                        <div className="space-y-3">
                          {healthStatus.map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                {getHealthStatusIcon(service.status)}
                                <span className="font-medium text-sm">{service.service_name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{service.response_time_ms || 0}ms</span>
                                <Badge variant={service.status === "critical" ? "destructive" : service.status === "degraded" ? "outline" : "default"}>
                                  {service.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <WorkflowAISuggestions limit={10} />
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Automações Ativas</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Settings className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sugestões IA</p>
                        <p className="text-2xl font-bold">7</p>
                      </div>
                      <Lightbulb className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Relatórios Auto</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Economizado</p>
                        <p className="text-2xl font-bold">48h</p>
                        <p className="text-xs text-green-600">este mês</p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="suggestions" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="suggestions">Sugestões IA</TabsTrigger>
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                  <TabsTrigger value="reports">Relatórios</TabsTrigger>
                  <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                </TabsList>

                <TabsContent value="suggestions"><AISuggestionsPanel /></TabsContent>
                <TabsContent value="workflows"><AutomationWorkflowsManager /></TabsContent>
                <TabsContent value="reports"><AutomatedReportsManager /></TabsContent>
                <TabsContent value="onboarding"><SmartOnboardingWizard /></TabsContent>
              </Tabs>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendência de Eficiência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={predictiveData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(performanceMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="font-medium">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alertas do Sistema
                  </CardTitle>
                  <CardDescription>Monitoramento de anomalias e alertas de performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>Nenhum alerta no momento</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div 
                            key={alert.id}
                            className={`flex items-start justify-between p-4 rounded-lg border ${
                              alert.resolved_at ? "opacity-50 bg-muted/30" : "bg-card"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                                alert.severity === "critical" ? "text-red-500" :
                                alert.severity === "high" ? "text-orange-500" :
                                alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                              }`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "high" ? "outline" : "secondary"}>
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{alert.component_name}</span>
                                </div>
                                <p className="mt-1">{alert.anomaly_detected}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(alert.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!alert.resolved_at && (
                              <Button variant="ghost" size="sm" onClick={() => resolveAlert(alert.id, "Resolvido manualmente")}>
                                Resolver
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
