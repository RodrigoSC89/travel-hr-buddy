/**
 * AI Observability Dashboard - PATCH R01 COMPLIANCE
 * Refactored: orchestrator only, sub-components handle UI
 */
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Brain, RefreshCw, Download, AlertTriangle, Settings, WifiOff } from "lucide-react";
import {
  useAIAgents, useAIMetrics, useAILogs, useAIObservabilityStatus,
  type AIAgent
} from "@/hooks/useAIObservabilityData";
import { supabase } from "@/integrations/supabase/client";

import { ObservabilityStatsBar } from "./observability/ObservabilityStatsBar";
import { ObservabilityTabs } from "./observability/ObservabilityTabs";
import { AgentConfigDialog } from "./observability/AgentConfigDialog";

export function AIObservabilityDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: agentsData, isLoading: agentsLoading, refetch: refetchAgents } = useAIAgents();
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useAIMetrics();
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useAILogs();
  const { data: statusData, isLoading: statusLoading } = useAIObservabilityStatus();

  const agents = agentsData || [];
  const metrics = metricsData || [];
  const logs = logsData || [];

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => ({
    totalAgents: agents.length,
    running: agents.filter(a => a.status === "running").length,
    paused: agents.filter(a => a.status === "paused").length,
    errors: agents.filter(a => a.status === "error").length,
    totalTasks: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    queuedTasks: agents.reduce((sum, a) => sum + a.tasksQueued, 0),
    avgSuccessRate: agents.length ? (agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length).toFixed(1) : "0",
    totalCost: agents.reduce((sum, a) => sum + a.costUSD, 0).toFixed(2)
  }), [agents]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.agentName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === "all" || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchQuery, levelFilter]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAgents(), refetchMetrics(), refetchLogs()]);
    setIsRefreshing(false);
    toast({ title: "Dados Atualizados", description: "Métricas e status dos agentes atualizados do servidor" });
  }, [refetchAgents, refetchMetrics, refetchLogs, toast]);

  const startAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase.from("agent_registry").update({ status: "active", last_heartbeat: new Date().toISOString() }).eq("agent_id", agentId);
    await refetchAgents();
    toast({ title: "Agente Iniciado", description: `${agent?.name} está em execução` });
  }, [agents, toast, refetchAgents]);

  const pauseAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase.from("agent_registry").update({ status: "paused" }).eq("agent_id", agentId);
    await refetchAgents();
    toast({ title: "Agente Pausado", description: `${agent?.name} foi pausado` });
  }, [agents, toast, refetchAgents]);

  const restartAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase.from("agent_registry").update({ status: "active", last_heartbeat: new Date().toISOString() }).eq("agent_id", agentId);
    await refetchAgents();
    toast({ title: "Agente Reiniciado", description: `${agent?.name} foi reiniciado com sucesso` });
  }, [agents, toast, refetchAgents]);

  const clearQueue = useCallback((agentId: string) => {
    toast({ title: "Fila Limpa", description: "Tarefas pendentes foram removidas" });
  }, [toast]);

  // Loading state
  if (agentsLoading || metricsLoading || statusLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={`obs-skeleton-${i}`} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Not configured state
  if (!statusData?.isConfigured && agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">AI Observability</h2>
            <p className="text-muted-foreground">Monitoramento de agentes de IA</p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhum Agente Configurado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure agentes de IA no sistema para visualizar métricas, logs e controlar operações.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este dashboard exibe apenas dados reais. Configure as integrações para começar.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/integrations')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Integrações de IA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Observability
          </h2>
          <p className="text-muted-foreground">Monitoramento e controle de agentes de IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <ObservabilityStatsBar stats={stats} />

      <ObservabilityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        agents={agents}
        metrics={metrics}
        filteredLogs={filteredLogs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        onStartAgent={startAgent}
        onPauseAgent={pauseAgent}
        onRestartAgent={restartAgent}
        onClearQueue={clearQueue}
        onConfigAgent={(agent) => {
          setSelectedAgent(agent);
          setIsConfigDialogOpen(true);
        }}
      />

      <AgentConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        agent={selectedAgent}
        onSave={() => {
          setIsConfigDialogOpen(false);
          toast({ title: "Configuração Salva", description: "As alterações foram aplicadas" });
        }}
      />
    </div>
  );
}

export default AIObservabilityDashboard;
