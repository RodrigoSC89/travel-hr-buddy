/**
 * AI Mega-Hub - Inteligência Artificial Unificada
 * Rota canônica: /ai
 * 
 * Consolida: AI Control Tower + Enterprise Intelligence + AI Modules + Voice
 * 
 * P1-008: Consolidado de 15 tabs para 8 tabs agrupadas
 * ✅ ZERO CONSOLE.LOG HANDLERS
 * ✅ REAL DATA INTEGRATION
 * ✅ SYSTEM STATUS BAR
 * ✅ FUNCTIONAL ACTIONS
 */

import React, { Suspense, lazy, useMemo, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Bot, Zap, BarChart3, FileText, Cpu, Activity, Settings, Wifi, Download, Plus, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
// AIAgentHealthDashboard removed - world-class deleted
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// Lazy load sub-components
const AIControlTowerHub = lazy(() => import('@/pages/AICommandCenter'));
const AICommandCenter = lazy(() => import('@/pages/AICommandCenter'));
const AutonomousCommandCenter = lazy(() => import('@/pages/AICommandCenter'));
const AIAgentDirectory = lazy(() => import('@/pages/AIAgents/AIAgentDirectory'));
const WorkflowCommandCenter = lazy(() => import('@/pages/WorkflowCommandCenter'));
const VoiceAssistant = lazy(() => import('@/pages/VoiceAssistant'));
const AIModulesHubPage = lazy(() => import('@/pages/ai/AIModulesHubPage'));
const RAGAssistantPage = lazy(() => import('@/pages/enterprise/RAGAssistantPage'));
const OCRCenterPage = lazy(() => import('@/pages/enterprise/OCRCenterPage'));
const AIAnalyticsDashboard = lazy(() => import('@/pages/AIAnalyticsDashboard'));
const AIObservabilityDashboard = lazy(() => import('@/pages/AIObservabilityDashboard'));

// Phase 3 components
const AgentMemoryPanel = lazy(() => import('@/components/ai/AgentMemoryPanel'));
const MultiAgentConsensus = lazy(() => import('@/components/ai/MultiAgentConsensus'));
const AgentAnalyticsPanel = lazy(() => import('@/components/ai/AgentAnalyticsPanel'));
const ProactiveMonitoringPanel = lazy(() => import('@/components/ai/ProactiveMonitoringPanel'));

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

/**
 * P1-008 FIX: Consolidated from 15 tabs to 8 grouped tabs
 * 
 * Original 15: hub, health, chat, agents, consensus, memory, monitoring, 
 *              workflows, voice, modules, rag, ocr, agent-analytics, analytics, observability
 * 
 * New 8:
 * 1. hub         → AI Hub (overview + health)
 * 2. agents      → Agents (directory + health dashboard)
 * 3. chat-voice  → Chat & Voice (chat + voice assistant)
 * 4. swarm       → Swarm Ops (consensus + memory + monitoring)
 * 5. workflows   → Workflows
 * 6. modules     → 11 AI Modules
 * 7. intelligence → Intelligence (RAG + OCR)
 * 8. analytics   → Analytics (analytics + agent-analytics + observability)
 */
const tabConfig = [
  { id: 'hub', label: 'AI Hub', icon: Brain },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'chat-voice', label: 'Chat & Voice', icon: MessageSquare },
  { id: 'swarm', label: 'Swarm Ops', icon: Database },
  { id: 'workflows', label: 'Workflows', icon: Zap },
  { id: 'modules', label: '11 Modules', icon: Cpu },
  { id: 'intelligence', label: 'Intelligence', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// Map old tab IDs to new grouped IDs for backward compatibility
const TAB_MIGRATION: Record<string, string> = {
  'health': 'agents',
  'chat': 'chat-voice',
  'voice': 'chat-voice',
  'consensus': 'swarm',
  'memory': 'swarm',
  'monitoring': 'swarm',
  'rag': 'intelligence',
  'ocr': 'intelligence',
  'agent-analytics': 'analytics',
  'observability': 'analytics',
};

export default function AIMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'hub';
  // Migrate old tab IDs to new ones
  const activeTab = TAB_MIGRATION[rawTab] || rawTab;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { exportToJSON } = useRealActionHandlers();

  // Sub-tab state for grouped tabs
  const [swarmSubTab, setSwarmSubTab] = useState<'consensus' | 'memory' | 'monitoring'>('consensus');
  const [chatSubTab, setChatSubTab] = useState<'chat' | 'voice'>('chat');
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<'rag' | 'ocr'>('rag');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'analytics' | 'agent-analytics' | 'observability'>('analytics');

  // Initialize sub-tab from old deep-link
  React.useEffect(() => {
    if (rawTab === 'voice') setChatSubTab('voice');
    if (rawTab === 'memory') setSwarmSubTab('memory');
    if (rawTab === 'monitoring') setSwarmSubTab('monitoring');
    if (rawTab === 'ocr') setIntelligenceSubTab('ocr');
    if (rawTab === 'agent-analytics') setAnalyticsSubTab('agent-analytics');
    if (rawTab === 'observability') setAnalyticsSubTab('observability');
  }, [rawTab]);

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
    activeAgents: agentData.filter((a) => a.status === 'active').length,
    pausedAgents: agentData.filter((a) => a.status === 'paused' || a.status === 'inactive').length,
  }), [agentData]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['ai-agents-hub'] });
    toast.success('Dados de IA atualizados');
  }, [queryClient]);

  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', agent_id: '', capabilities: '' });

  const handleDeployAgent = useCallback(() => {
    setAgentDialogOpen(true);
  }, []);

  const handleSubmitAgent = useCallback(async () => {
    if (!agentForm.name || !agentForm.agent_id) { toast.error('Nome e ID do agente são obrigatórios'); return; }
    const caps = agentForm.capabilities ? agentForm.capabilities.split(',').map(s => s.trim()) : [];
    const { error } = await supabase.from('agent_registry').insert({
      name: agentForm.name,
      agent_id: agentForm.agent_id,
      capabilities: caps,
      status: 'active',
    });
    if (error) { toast.error('Erro ao criar agente: ' + error.message); return; }
    toast.success('Agente implantado com sucesso');
    queryClient.invalidateQueries({ queryKey: ['ai-agents-hub'] });
    setAgentDialogOpen(false);
    setAgentForm({ name: '', agent_id: '', capabilities: '' });
  }, [agentForm, queryClient]);

  const handleExportAgents = useCallback(async () => {
    if (agentData.length === 0) {
      toast.error('Nenhum agente para exportar');
      return;
    }
    exportToJSON(agentData, 'ai-agents-registry');
  }, [agentData, exportToJSON]);

  const handleConfigure = useCallback(() => {
    setSearchParams({ tab: 'agents' });
    toast.success('Navegando para configuração dos agentes');
  }, [setSearchParams]);

  const SubTabSelector = ({ 
    options, 
    active, 
    onChange 
  }: { 
    options: { id: string; label: string }[]; 
    active: string; 
    onChange: (id: string) => void;
  }) => (
    <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit" data-testid="subtab-selector">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            active === opt.id 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="ai-mega-hub">
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

      {/* Tabs Navigation - Now 8 tabs instead of 15 */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto" data-testid="ai-hub-tabs">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-hub-ai data-[state=active]:text-white gap-2"
                  data-testid={`ai-tab-${tab.id}`}
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
            {/* 1. AI Hub (Overview) */}
            <TabsContent value="hub" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-success" />
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>{agentMetrics.totalAgents} agentes registrados</span>
                <span>•</span>
                <span>{agentMetrics.activeAgents} ativos</span>
                {agentMetrics.pausedAgents > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-warning">{agentMetrics.pausedAgents} pausados</span>
                  </>
                )}
              </div>

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
                    onClick: () => setSearchParams({ tab: 'agents' }),
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

              {!agentsLoading && agentMetrics.totalAgents === 0 && (
                <HubEmptyState 
                  hub="ai" 
                  onPrimaryAction={() => setSearchParams({ tab: 'chat-voice' })} 
                />
              )}

              {(agentsLoading || agentMetrics.totalAgents > 0) && <AIControlTowerHub />}
            </TabsContent>

            {/* 2. Agents (Directory + Health) */}
            <TabsContent value="agents" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="AI Agents"
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
              {/* AIAgentHealthDashboard removed */}
              <AIAgentDirectory />
              <AutonomousCommandCenter />
            </TabsContent>

            {/* 3. Chat & Voice (merged) */}
            <TabsContent value="chat-voice" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'chat', label: '💬 Chat IA' },
                  { id: 'voice', label: '🎙️ Voice Assistant' },
                ]}
                active={chatSubTab}
                onChange={(id) => setChatSubTab(id as 'chat' | 'voice')}
              />
              {chatSubTab === 'chat' && <AICommandCenter />}
              {chatSubTab === 'voice' && <VoiceAssistant />}
            </TabsContent>

            {/* 4. Swarm Ops (consensus + memory + monitoring) */}
            <TabsContent value="swarm" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'consensus', label: '🤝 Consensus' },
                  { id: 'memory', label: '🧠 Memory' },
                  { id: 'monitoring', label: '🔔 Monitoring' },
                ]}
                active={swarmSubTab}
                onChange={(id) => setSwarmSubTab(id as 'consensus' | 'memory' | 'monitoring')}
              />
              {swarmSubTab === 'consensus' && <MultiAgentConsensus />}
              {swarmSubTab === 'memory' && <AgentMemoryPanel />}
              {swarmSubTab === 'monitoring' && <ProactiveMonitoringPanel />}
            </TabsContent>
            
            {/* 5. Workflows */}
            <TabsContent value="workflows" className="mt-0">
              <WorkflowCommandCenter />
            </TabsContent>
            
            {/* 6. 11 AI Modules */}
            <TabsContent value="modules" className="mt-0">
              <AIModulesHubPage />
            </TabsContent>
            
            {/* 7. Intelligence (RAG + OCR) */}
            <TabsContent value="intelligence" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'rag', label: '📚 RAG Assistant' },
                  { id: 'ocr', label: '📄 OCR Center' },
                ]}
                active={intelligenceSubTab}
                onChange={(id) => setIntelligenceSubTab(id as 'rag' | 'ocr')}
              />
              {intelligenceSubTab === 'rag' && <RAGAssistantPage />}
              {intelligenceSubTab === 'ocr' && <OCRCenterPage />}
            </TabsContent>
            
            {/* 8. Analytics (analytics + agent-analytics + observability) */}
            <TabsContent value="analytics" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'analytics', label: '📊 Dashboard' },
                  { id: 'agent-analytics', label: '🤖 Agent Metrics' },
                  { id: 'observability', label: '👁️ Observability' },
                ]}
                active={analyticsSubTab}
                onChange={(id) => setAnalyticsSubTab(id as 'analytics' | 'agent-analytics' | 'observability')}
              />
              {analyticsSubTab === 'analytics' && <AIAnalyticsDashboard />}
              {analyticsSubTab === 'agent-analytics' && <AgentAnalyticsPanel />}
              {analyticsSubTab === 'observability' && <AIObservabilityDashboard />}
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      {/* Deploy Agent Dialog */}
      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploy AI Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Agente *</Label><Input value={agentForm.name} onChange={e => setAgentForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Risk Analyzer" /></div>
            <div><Label>Agent ID *</Label><Input value={agentForm.agent_id} onChange={e => setAgentForm(p => ({ ...p, agent_id: e.target.value }))} placeholder="Ex: risk-analyzer-v1" /></div>
            <div><Label>Capabilities (separar por vírgula)</Label><Input value={agentForm.capabilities} onChange={e => setAgentForm(p => ({ ...p, capabilities: e.target.value }))} placeholder="analysis, prediction, reporting" /></div>
            <Button className="w-full" onClick={handleSubmitAgent}>Deploy Agent</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
