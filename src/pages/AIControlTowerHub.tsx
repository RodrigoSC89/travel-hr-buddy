/**
 * AI Control Tower Hub
 * Unified hub for all AI modules
 * 
 * FUSION GROUP E - PROMPT MASTER V4.1
 * 
 * Consolidates 11 AI modules into 1 hub with tabs:
 * - Hub (AI Modules Hub + AI Hub Central)
 * - Chat & Assistants
 * - Agents & Orchestration
 * - Workflows
 * - Analytics
 * - Observability
 * - Audit & Logs
 * - Journaling
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Bot, 
  Workflow,
  BarChart3,
  Eye,
  ClipboardList,
  FileText,
  Loader2,
  Sparkles
} from "lucide-react";

// Lazy load original components
const AIModulesHub = lazy(() => import("@/pages/ai/AIModulesHub"));
const AICommandCenter = lazy(() => import("@/pages/mission-control/ai-command-center"));
const AutonomousCommandCenter = lazy(() => import("@/pages/AutonomousCommandCenter"));
// Use full AgentOrchestrationDashboard with all 8 specialized agents
const AgentOrchestrationDashboard = lazy(() => import("@/components/ai/AgentOrchestrationDashboard"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const AIObservabilityPage = lazy(() => import("@/pages/AIObservabilityPage"));
const AIAuditPage = lazy(() => import("@/pages/AIAuditPage"));
const AIJournalingPage = lazy(() => import("@/pages/AIJournalingPage"));
const WorkflowCommand = lazy(() => import("@/pages/mission-control/workflow-engine"));

// Loading skeleton
function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando módulo IA...</span>
    </div>
  );
}

// Tab configuration
const TABS = [
  {
    id: "hub",
    label: "Hub",
    icon: Sparkles,
    description: "Central de IAs",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "Assistentes",
  },
  {
    id: "agents",
    label: "Agentes",
    icon: Bot,
    description: "Orquestração",
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: Workflow,
    description: "Automação",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Métricas",
  },
  {
    id: "observability",
    label: "Observ.",
    icon: Eye,
    description: "Monitoramento",
  },
  {
    id: "audit",
    label: "Auditoria",
    icon: ClipboardList,
    description: "Logs",
  },
  {
    id: "journaling",
    label: "Journaling",
    icon: FileText,
    description: "Registros",
  },
];

export default function AIControlTowerHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "hub";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync URL with tab changes
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Handle URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Control Tower
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de comando de inteligência artificial
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          11 módulos IA
        </Badge>
      </div>

      {/* Main Tabs */}
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

        {/* Hub Tab */}
        <TabsContent value="hub" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AIModulesHub />
          </Suspense>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AICommandCenter />
          </Suspense>
        </TabsContent>

        {/* Agents Tab - Full Dashboard with 8 Specialized Agents */}
        <TabsContent value="agents" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AgentOrchestrationDashboard />
          </Suspense>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <WorkflowCommand />
          </Suspense>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AIAnalyticsDashboard />
          </Suspense>
        </TabsContent>

        {/* Observability Tab */}
        <TabsContent value="observability" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AIObservabilityPage />
          </Suspense>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AIAuditPage />
          </Suspense>
        </TabsContent>

        {/* Journaling Tab */}
        <TabsContent value="journaling" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AIJournalingPage />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
