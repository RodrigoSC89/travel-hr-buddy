/**
 * AI Mega-Hub - Inteligência Artificial Unificada
 * Rota canônica: /ai
 * 
 * Consolida: AI Control Tower + Enterprise Intelligence + AI Modules + Voice
 * 
 * ✅ ZERO CONSOLE.LOG HANDLERS
 * ✅ REAL DATA INTEGRATION
 * ✅ SYSTEM STATUS BAR
 * ✅ FUNCTIONAL ACTIONS
 */

import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Bot, Zap, Mic, BarChart3, Eye, FileText, Cpu, Activity, Settings, Wifi, Download, RefreshCw, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { AIAgentHealthDashboard } from '@/components/world-class';
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// Lazy load sub-components
const AIControlTowerHub = lazy(() => import('@/pages/AIControlTowerHubEnhanced'));
const AICommandCenter = lazy(() => import('@/pages/AICommandCenter'));
const AutonomousCommandCenter = lazy(() => import('@/pages/AutonomousCommandCenter'));
const AIAgentDirectory = lazy(() => import('@/pages/AIAgents/AIAgentDirectory'));
const WorkflowCommandCenter = lazy(() => import('@/pages/WorkflowCommandCenter'));
const VoiceAssistant = lazy(() => import('@/pages/VoiceAssistant'));
const AIModulesHubPage = lazy(() => import('@/pages/ai/AIModulesHubPage'));
const RAGAssistantPage = lazy(() => import('@/pages/enterprise/RAGAssistantPage'));
const OCRCenterPage = lazy(() => import('@/pages/enterprise/OCRCenterPage'));
const AIAnalyticsDashboard = lazy(() => import('@/pages/AIAnalyticsDashboard'));
const AIObservabilityDashboard = lazy(() => import('@/pages/AIObservabilityDashboard'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabConfig = [
  { id: 'hub', label: 'AI Hub', icon: Brain },
  { id: 'health', label: 'Agent Health', icon: Activity },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: Zap },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'modules', label: '11 Modules', icon: Cpu },
  { id: 'rag', label: 'RAG', icon: FileText },
  { id: 'ocr', label: 'OCR', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'observability', label: 'Observability', icon: Eye },
];

export default function AIMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hub';
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { exportToJSON } = useRealActionHandlers();

  // Real data: fetch AI agent registry
  const { data: agentData = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['ai-agents-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const agentMetrics = useMemo(() => ({
    totalAgents: agentData.length,
    activeAgents: agentData.filter((a: any) => a.status === 'active').length,
    pausedAgents: agentData.filter((a: any) => a.status === 'paused' || a.status === 'inactive').length,
  }), [agentData]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['ai-agents-hub'] });
    toast.success('Dados de IA atualizados');
  }, [queryClient]);

  const handleDeployAgent = useCallback(async () => {
    const agentId = `agent-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from('agent_registry').insert([{
      agent_id: agentId,
      name: `Agent ${agentId}`,
      status: 'active',
      capabilities: ['analysis', 'reporting'],
    }]);
    if (error) {
      toast.error(`Erro ao criar agente: ${error.message}`);
    } else {
      toast.success('Agente implantado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['ai-agents-hub'] });
    }
  }, [queryClient]);

  const handleExportAgents = useCallback(async () => {
    if (agentData.length === 0) {
      toast.error('Nenhum agente para exportar');
      return;
    }
    exportToJSON(agentData, 'ai-agents-registry');
  }, [agentData, exportToJSON]);

  const handleConfigure = useCallback(() => {
    setSearchParams({ tab: 'agents' });
    toast.info('Abrindo configuração dos agentes...');
  }, [setSearchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-ai/10 rounded-lg">
                <Brain className="h-6 w-6 text-hub-ai" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hub de Inteligência Artificial</h1>
                <p className="text-sm text-muted-foreground">
                  Chat IA, agentes autônomos, workflows, voz, OCR e analytics — {agentMetrics.totalAgents} agentes disponíveis
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {agentMetrics.activeAgents} agentes ativos
              </Badge>
              <Badge variant="outline" className="bg-hub-ai/10 text-hub-ai border-hub-ai/20">
                IA Operacional
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-hub-ai data-[state=active]:text-white gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="hub" className="mt-0 space-y-6">
              {/* System Status */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>{agentMetrics.totalAgents} agentes registrados</span>
                <span>•</span>
                <span>{agentMetrics.activeAgents} ativos</span>
                {agentMetrics.pausedAgents > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-500">{agentMetrics.pausedAgents} pausados</span>
                  </>
                )}
                <span>•</span>
                <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="AI Control Tower"
                subtitle={`${agentMetrics.activeAgents} agentes ativos | ${agentMetrics.totalAgents} total registrados`}
                actions={[
                  {
                    id: 'deploy-agent',
                    label: 'Deploy Agent',
                    icon: <Bot className="h-4 w-4" />,
                    onClick: handleDeployAgent,
                    variant: 'default',
                    tooltip: 'Criar e implantar novo agente de IA'
                  },
                  {
                    id: 'configure',
                    label: 'Configure',
                    icon: <Settings className="h-4 w-4" />,
                    onClick: handleConfigure,
                    variant: 'outline',
                    tooltip: 'Abrir configuração dos agentes'
                  },
                  {
                    id: 'health',
                    label: 'Agent Health',
                    icon: <Activity className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'health' }),
                    variant: 'outline',
                    tooltip: 'Verificar saúde dos agentes'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={agentsLoading}
                secondaryActions={[
                  {
                    id: 'export-agents',
                    label: 'Exportar Registro (JSON)',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportAgents,
                  }
                ]}
                showSearch
                searchPlaceholder="Search agents, workflows, logs..."
              />

              {/* Empty state when no agents */}
              {!agentsLoading && agentMetrics.totalAgents === 0 && (
                <HubEmptyState 
                  hub="ai" 
                  onPrimaryAction={() => setSearchParams({ tab: 'chat' })} 
                />
              )}

              {(agentsLoading || agentMetrics.totalAgents > 0) && <AIControlTowerHub />}
            </TabsContent>

            <TabsContent value="health" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Health */}
              <EnhancedActionBar
                title="AI Agent Health Monitor"
                subtitle={`${agentMetrics.activeAgents} agentes ativos | ${agentMetrics.pausedAgents} pausados`}
                actions={[
                  {
                    id: 'refresh-health',
                    label: 'Refresh Status',
                    icon: <Activity className="h-4 w-4" />,
                    onClick: handleRefresh,
                    variant: 'default',
                    tooltip: 'Recarregar status dos agentes'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={agentsLoading}
                secondaryActions={[
                  {
                    id: 'export-health',
                    label: 'Exportar Health Report',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportAgents,
                  }
                ]}
              />

              {/* World-Class AI Agent Health Dashboard */}
              <AIAgentHealthDashboard />
            </TabsContent>
            
            <TabsContent value="chat" className="mt-0">
              <AICommandCenter />
            </TabsContent>
            
            <TabsContent value="agents" className="mt-0 space-y-6">
              <AIAgentDirectory />
              <AutonomousCommandCenter />
            </TabsContent>
            
            <TabsContent value="workflows" className="mt-0">
              <WorkflowCommandCenter />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-0">
              <VoiceAssistant />
            </TabsContent>
            
            <TabsContent value="modules" className="mt-0">
              <AIModulesHubPage />
            </TabsContent>
            
            <TabsContent value="rag" className="mt-0">
              <RAGAssistantPage />
            </TabsContent>
            
            <TabsContent value="ocr" className="mt-0">
              <OCRCenterPage />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <AIAnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="observability" className="mt-0">
              <AIObservabilityDashboard />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
