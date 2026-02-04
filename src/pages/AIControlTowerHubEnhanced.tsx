/**
 * AI Control Tower Hub Enhanced
 * Centro de comando de IA com UX premium
 * 
 * Features:
 * - Dashboard de IA com métricas em tempo real
 * - Agentes especializados interativos
 * - Insights e recomendações acionáveis
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, MessageSquare, Bot, Workflow, BarChart3, Eye, ClipboardList,
  FileText, Loader2, Sparkles, Zap, TrendingUp, Activity, Shield,
  Lightbulb, Target, CheckCircle2, AlertTriangle, Clock, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";

// Lazy load components
const AIModulesHub = lazy(() => import("@/pages/ai/AIModulesHub"));
const AICommandCenter = lazy(() => import("@/pages/mission-control/ai-command-center"));
const AgentOrchestrationDashboard = lazy(() => import("@/components/ai/AgentOrchestrationDashboard"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const AIObservabilityPage = lazy(() => import("@/pages/AIObservabilityPage"));
const AIAuditPage = lazy(() => import("@/pages/AIAuditPage"));
const AIJournalingPage = lazy(() => import("@/pages/AIJournalingPage"));
const WorkflowCommand = lazy(() => import("@/pages/mission-control/workflow-engine"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando módulo IA...</span>
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "hub", label: "Hub IA", icon: Sparkles },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "observability", label: "Monitor", icon: Eye },
  { id: "audit", label: "Auditoria", icon: ClipboardList },
];

// Onboarding
const onboardingSteps = [
  {
    title: "Bem-vindo ao AI Control Tower",
    description: "Centro de comando para todos os recursos de inteligência artificial do sistema.",
    icon: <Brain className="h-8 w-8 text-primary" />
  },
  {
    title: "Agentes Especializados",
    description: "10 agentes marítimos especializados: PEOTRAM, ISM, MLC, MARPOL, SOLAS e mais.",
    icon: <Bot className="h-8 w-8 text-primary" />
  },
  {
    title: "Insights Automatizados",
    description: "A IA analisa dados continuamente e sugere ações para otimizar operações.",
    icon: <Lightbulb className="h-8 w-8 text-primary" />
  },
  {
    title: "Workflows Inteligentes",
    description: "Automatize processos repetitivos com fluxos de trabalho baseados em IA.",
    icon: <Workflow className="h-8 w-8 text-primary" />
  }
];

// Quick actions
const quickActions = [
  { id: "ask-ai", label: "Perguntar à IA", icon: <MessageSquare className="h-4 w-4" />, badge: 0 },
  { id: "run-analysis", label: "Análise Rápida", icon: <Brain className="h-4 w-4" />, badge: 0 },
  { id: "check-agents", label: "Status Agentes", icon: <Bot className="h-4 w-4" />, badge: 2 },
  { id: "view-insights", label: "Ver Insights", icon: <Lightbulb className="h-4 w-4" />, badge: 5 },
  { id: "create-workflow", label: "Novo Workflow", icon: <Workflow className="h-4 w-4" />, badge: 0 },
];

// AI KPIs
const aiKPIs = [
  {
    title: "Agentes Ativos",
    value: "10",
    subtitle: "100% operacionais",
    change: 0,
    trend: "stable" as const,
    icon: <Bot className="h-5 w-5" />,
    details: [
      { label: "Compliance", value: "5" },
      { label: "Operações", value: "3" },
      { label: "Analytics", value: "2" }
    ]
  },
  {
    title: "Interações Hoje",
    value: "847",
    subtitle: "+23% vs ontem",
    change: 23,
    trend: "up" as const,
    icon: <MessageSquare className="h-5 w-5" />,
    details: [
      { label: "Chat", value: "542" },
      { label: "Automações", value: "215" },
      { label: "Análises", value: "90" }
    ]
  },
  {
    title: "Precisão Média",
    value: "96.8%",
    subtitle: "últimos 7 dias",
    change: 1.2,
    trend: "up" as const,
    icon: <Target className="h-5 w-5" />,
    details: [
      { label: "Compliance", value: "98%" },
      { label: "Previsões", value: "94%" },
      { label: "Classificação", value: "97%" }
    ]
  },
  {
    title: "Economia Gerada",
    value: "$45.2K",
    subtitle: "este mês",
    change: 15,
    trend: "up" as const,
    icon: <TrendingUp className="h-5 w-5" />,
    details: [
      { label: "Manutenção", value: "$18K" },
      { label: "Compliance", value: "$12K" },
      { label: "Operações", value: "$15K" }
    ]
  }
];

// AI Insights
const aiInsights = [
  {
    id: "1",
    title: "Padrão de falha detectado",
    description: "Motor auxiliar da Nautilus Star mostra padrão similar a falhas anteriores",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    module: "Manutenção Preditiva",
    actions: [
      { label: "Ver Análise", onClick: () => toast.info("Abrindo análise...") },
      { label: "Agendar Manutenção", onClick: () => toast.success("Manutenção agendada") }
    ]
  },
  {
    id: "2",
    title: "Oportunidade de economia",
    description: "Rota Santos-Paranaguá pode economizar 12% de combustível com ajuste",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    module: "Otimização de Rotas",
    actions: [
      { label: "Aplicar Sugestão", onClick: () => toast.success("Sugestão aplicada!") }
    ]
  },
  {
    id: "3",
    title: "Anomalia em certificação",
    description: "3 tripulantes com certificados inconsistentes detectados",
    severity: "medium" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    module: "Compliance AI",
    actions: [
      { label: "Revisar", onClick: () => toast.info("Abrindo revisão...") }
    ]
  }
];

// Active agents
const activeAgents = [
  { name: "PEOTRAM Agent", status: "active", tasks: 12, accuracy: 98 },
  { name: "MLC Compliance", status: "active", tasks: 8, accuracy: 97 },
  { name: "ISM Auditor", status: "active", tasks: 5, accuracy: 99 },
  { name: "MARPOL Monitor", status: "active", tasks: 15, accuracy: 96 },
  { name: "Predictive Maintenance", status: "processing", tasks: 3, accuracy: 94 },
];

export default function AIControlTowerHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("ai-control-tower-onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("ai-control-tower-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao AI Control Tower! 🤖");
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    toast.info(`Executando: ${action?.label}`);
  };

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
    toast.success("Insight arquivado");
  };

  const activeInsights = aiInsights.filter(i => !dismissedInsights.includes(i.id));

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showOnboarding && (
          <ModuleOnboarding
            moduleName="AI Control Tower"
            steps={onboardingSteps}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                AI Control Tower
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  GPT-5 + Gemini
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Centro de comando de inteligência artificial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
              10 Agentes Online
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              <Brain className="h-4 w-4 mr-2" />
              Tour
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab - NEW */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiKPIs.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <InteractiveKPICard {...kpi} />
                </motion.div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Insights */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Insights da IA
                  </h3>
                  <Badge variant="outline">{activeInsights.length} novos</Badge>
                </div>
                <ActionableAlertList
                  alerts={activeInsights}
                  onDismiss={handleDismissInsight}
                  emptyMessage="Nenhum insight novo. A IA está monitorando..."
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Active Agents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bot className="h-4 w-4 text-purple-500" />
                      Agentes Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeAgents.map((agent, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === "active" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.tasks} tarefas</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {agent.accuracy}%
                        </Badge>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => setActiveTab("agents")}
                    >
                      Ver Todos os Agentes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Performance IA (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tempo de Resposta</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Sucesso</span>
                        <span className="font-medium">98.5%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tokens Utilizados</span>
                        <span className="font-medium">124K</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { time: "2min", action: "Análise de compliance concluída" },
                      { time: "15min", action: "Previsão de manutenção gerada" },
                      { time: "32min", action: "Documento classificado" },
                      { time: "1h", action: "Workflow automatizado" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="min-w-[45px] text-xs justify-center">
                          {item.time}
                        </Badge>
                        <span className="text-muted-foreground truncate">{item.action}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hub" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AIModulesHub />
            </Suspense>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AICommandCenter />
            </Suspense>
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AgentOrchestrationDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <WorkflowCommand />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AIAnalyticsDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="observability" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AIObservabilityPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AIAuditPage />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
