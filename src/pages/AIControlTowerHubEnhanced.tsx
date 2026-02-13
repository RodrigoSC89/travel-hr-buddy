/**
 * AI Control Tower Hub Enhanced
 * Centro de comando de IA com UX premium
 * 
 * Features:
 * - Dashboard de IA com métricas em tempo real
 * - Agentes especializados interativos
 * - Insights e recomendações acionáveis
 */

import React, { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, MessageSquare, Bot, Workflow, BarChart3, Eye, ClipboardList,
  FileText, Loader2, Sparkles, Zap, TrendingUp, Activity, Shield,
  Lightbulb, Target, CheckCircle2, AlertTriangle, Clock, ArrowRight, RefreshCw, Mic
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";

// Lazy load components
const AIModulesHub = lazy(() => import("@/pages/ai/AIModulesHub"));
const AICommandCenter = lazy(() => import("@/pages/mission-control/ai-command-center"));
const AgentOrchestrationDashboard = lazy(() => import("@/components/ai/AgentOrchestrationDashboard"));
const AIAgentsDashboard = lazy(() => import("@/modules/ai-control-tower/components/AIAgentsDashboard"));
const AICommandDashboard = lazy(() => import("@/modules/ai-control-tower/components/AICommandDashboard"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const AIObservabilityPage = lazy(() => import("@/pages/AIObservabilityDashboard"));
const AIAuditPage = lazy(() => import("@/pages/AIAudit"));
const AIJournalingPage = lazy(() => import("@/pages/Documents"));
const WorkflowCommand = lazy(() => import("@/pages/mission-control/workflow-engine"));
const VoiceAssistantIntelligence = lazy(() => import("@/components/premium/VoiceAssistantIntelligence"));

// Enterprise Components - Phase 3
import { 
  AIAgentOrchestrator,
  AIAuditTrail
} from "@/components/enterprise";

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
  { id: "command", label: "Comando IA", icon: Brain, badge: "NOVO" },
  { id: "orchestrator", label: "Orchestrator", icon: Zap, badge: "ENT" },
  { id: "hub", label: "Hub IA", icon: Sparkles },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "voice", label: "Voice AI", icon: Mic, badge: "NOVO" },
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "observability", label: "Monitor", icon: Eye },
  { id: "audit", label: "Auditoria", icon: ClipboardList },
  { id: "blockchain", label: "Blockchain", icon: Shield, badge: "ENT" },
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

// KPIs and insights will be calculated from real data inside component

// Active agents will be derived from real data

export default function AIControlTowerHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // Use prefixed param 'aitab' to avoid conflict with parent AIMegaHub's 'tab' param
  const activeTab = useMemo(() => {
    const tabFromUrl = searchParams.get("aitab");
    const validTab = TABS.find(t => t.id === tabFromUrl);
    return validTab ? tabFromUrl : "dashboard";
  }, [searchParams]);

  // Handle tab change by preserving existing params (especially parent's 'tab')
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("aitab", value);
    setSearchParams(newParams);
  };

  // Real data from Supabase
  const { agents, decisions, auditLogs, insights, metrics, isLoading: dataLoading } = useAIControlTowerData();

  // Build KPIs from real data
  const aiKPIs = useMemo(() => [
    {
      title: "Agentes Ativos",
      value: String(metrics.activeAgents),
      subtitle: `${metrics.totalAgents} total registrados`,
      change: 0,
      trend: metrics.activeAgents > 0 ? "up" as const : "stable" as const,
      icon: <Bot className="h-5 w-5" />,
      details: [
        { label: "Ativos", value: String(metrics.activeAgents) },
        { label: "Total", value: String(metrics.totalAgents) },
        { label: "Online", value: String(agents.filter((a) => a.status === "online").length) }
      ]
    },
    {
      title: "Interações",
      value: String(metrics.totalInteractions),
      subtitle: `${metrics.avgResponseTime}ms tempo médio`,
      change: metrics.totalInteractions > 0 ? 23 : 0,
      trend: "up" as const,
      icon: <MessageSquare className="h-5 w-5" />,
      details: [
        { label: "Total", value: String(auditLogs.length) },
        { label: "Decisões", value: String(decisions.length) },
        { label: "Insights", value: String(insights.length) }
      ]
    },
    {
      title: "Precisão Média",
      value: `${metrics.avgConfidence}%`,
      subtitle: "confiança nas decisões",
      change: metrics.avgConfidence > 90 ? 1.2 : 0,
      trend: metrics.avgConfidence > 90 ? "up" as const : "stable" as const,
      icon: <Target className="h-5 w-5" />,
      details: [
        { label: "Aprovadas", value: String(metrics.approvedDecisions) },
        { label: "Rejeitadas", value: String(metrics.rejectedDecisions) },
        { label: "Pendentes", value: String(metrics.pendingDecisions) }
      ]
    },
    {
      title: "Insights Acionáveis",
      value: String(metrics.actionableInsights),
      subtitle: "requerem ação",
      change: metrics.actionableInsights,
      trend: metrics.actionableInsights > 0 ? "up" as const : "stable" as const,
      icon: <Lightbulb className="h-5 w-5" />,
      details: [
        { label: "Acionáveis", value: String(metrics.actionableInsights) },
        { label: "Total", value: String(insights.length) },
        { label: "Workflows", value: String(metrics.activeWorkflows) }
      ]
    }
  ], [metrics, agents, auditLogs, decisions, insights]);

  // Build alerts from real insights
  const aiInsights = useMemo(() => insights.slice(0, 5).map((insight) => ({
    id: insight.id,
    title: insight.title || "Insight IA",
    description: insight.description || "",
    severity: (insight.priority === "high" ? "high" : insight.priority === "medium" ? "medium" : "info") as "high" | "medium" | "info",
    timestamp: new Date(insight.created_at),
    module: insight.related_module || "AI",
    actions: [
      { label: "Ver Detalhes", onClick: () => { window.history.pushState({}, '', `/ai-control-tower?insight=${insight.id}`); window.dispatchEvent(new PopStateEvent('popstate')); } },
    ]
  })), [insights]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("ai-control-tower-onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // No need for sync effects - activeTab comes directly from URL

  const handleOnboardingComplete = () => {
    localStorage.setItem("ai-control-tower-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao AI Control Tower! 🤖");
  };

  const handleQuickAction = (actionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    switch (actionId) {
      case 'ask-ai':
        newParams.set("aitab", "chat");
        setSearchParams(newParams);
        toast.success('Abrindo Chat IA...');
        break;
      case 'run-analysis':
        toast.success('Análise iniciada — verificando agentes e insights...');
        break;
      case 'check-agents':
        newParams.set("aitab", "agents");
        setSearchParams(newParams);
        toast.success('Abrindo painel de agentes...');
        break;
      case 'view-insights':
        toast.success(`${metrics.actionableInsights} insights acionáveis encontrados`);
        break;
      case 'create-workflow':
        newParams.set("aitab", "workflows");
        setSearchParams(newParams);
        toast.success('Abrindo criador de workflows...');
        break;
      default:
        toast.info('Ação não reconhecida');
    }
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
        {/* Header - NO motion to prevent flickering */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* Quick Actions */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Tabs */}
        <Tabs value={activeTab || "dashboard"} onValueChange={handleTabChange} className="space-y-6">
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
            {/* KPIs - NO staggered animations to prevent flickering */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiKPIs.map((kpi) => (
                <InteractiveKPICard key={kpi.title} {...kpi} />
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
                    {agents.slice(0, 5).map((agent, idx: number) => (
                      <div key={agent.id || idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === "active" || agent.status === "online" 
                            ? "bg-success" 
                            : "bg-warning animate-pulse"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(agent.capabilities) ? agent.capabilities.length : 0} capacidades
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleTabChange("agents")}
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
                    ].map((item) => (
                      <div key={`${item.time}-${item.action.slice(0, 15)}`} className="flex items-center gap-2 text-sm">
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

          <TabsContent value="command" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AICommandDashboard />
            </Suspense>
          </TabsContent>

          {/* Enterprise Component - Phase 3 */}
          <TabsContent value="orchestrator" className="mt-6">
            <AIAgentOrchestrator />
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

          <TabsContent value="voice" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <VoiceAssistantIntelligence />
            </Suspense>
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AIAgentsDashboard />
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

          {/* Enterprise Component - Phase 3 (Blockchain Audit Trail) */}
          <TabsContent value="blockchain" className="mt-6">
            <AIAuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
