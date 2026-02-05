/**
 * Hook para dados reais de Agentes de IA
 * Substitui MOCK_AGENTS e MOCK_LOGS em AgentOrchestrator.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "processing" | "error" | "disabled";
  tasksCompleted: number;
  avgResponseTime: number;
  successRate: number;
  lastActivity: Date;
  capabilities: string[];
  autonomyLevel: 0 | 1 | 2 | 3;
  currentTask?: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: "success" | "error" | "warning" | "info";
  timestamp: Date;
  duration?: number;
  details?: string;
}

export function useAgentOrchestratorData() {
  const queryClient = useQueryClient();

  // Fetch agents from agent_registry
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["agent-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_registry")
        .select("*")
        .order("name");

      if (error) throw error;

      return (data || []).map((agent): Agent => ({
        id: agent.id,
        name: agent.name,
        type: (agent.capabilities as Record<string, unknown>)?.type as string || "Geral",
        status: agent.status as Agent["status"],
        tasksCompleted: (agent.metadata as Record<string, unknown>)?.tasks_completed as number || 0,
        avgResponseTime: (agent.metadata as Record<string, unknown>)?.avg_response_time as number || 0,
        successRate: (agent.metadata as Record<string, unknown>)?.success_rate as number || 95,
        lastActivity: agent.last_heartbeat ? new Date(agent.last_heartbeat) : new Date(),
        capabilities: Array.isArray((agent.capabilities as Record<string, unknown>)?.list) 
          ? (agent.capabilities as Record<string, unknown>).list as string[] 
          : [],
        autonomyLevel: ((agent.metadata as Record<string, unknown>)?.autonomy_level as 0 | 1 | 2 | 3) || 1,
        currentTask: (agent.metadata as Record<string, unknown>)?.current_task as string | undefined,
      }));
    },
    staleTime: 10000,
  });

  // Fetch agent metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ["agent-swarm-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_swarm_metrics")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5000,
  });

  // Fetch agent logs (from ai_audit_logs or ai_commands)
  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["agent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_commands")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((log): AgentLog => ({
        id: log.id,
        agentId: log.user_id || "system",
        agentName: log.source_module || "Sistema",
        action: log.command_text,
        status: log.execution_status === "completed" ? "success" : 
                log.execution_status === "failed" ? "error" : 
                log.execution_status === "pending" ? "info" : "warning",
        timestamp: new Date(log.created_at),
        duration: log.execution_time_ms || undefined,
        details: log.error_details || undefined,
      }));
    },
    staleTime: 5000,
  });

  // Send command to agent
  const sendCommand = useMutation({
    mutationFn: async ({ message, agentId }: { message: string; agentId?: string }) => {
      const { data, error } = await supabase
        .from("ai_commands")
        .insert({
          command_text: message,
          command_type: "user_message",
          source_module: "agent_orchestrator",
          execution_status: "pending",
          command_hash: btoa(message + Date.now()),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-logs"] });
      toast.success("Comando enviado para processamento");
    },
    onError: (error) => {
      toast.error("Erro ao enviar comando: " + error.message);
    },
  });

  // Toggle agent status
  const toggleAgentStatus = useMutation({
    mutationFn: async ({ agentId, newStatus }: { agentId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("agent_registry")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-registry"] });
      toast.success("Status do agente atualizado");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar agente: " + error.message);
    },
  });

  // Calculate stats
  const stats = {
    activeAgents: agents.filter((a) => a.status !== "disabled").length,
    totalAgents: agents.length,
    processingAgents: agents.filter((a) => a.status === "processing").length,
    totalTasks: agents.reduce((acc, a) => acc + a.tasksCompleted, 0),
    avgSuccessRate: agents.length > 0 
      ? Math.round(agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length * 10) / 10
      : 0,
  };

  return {
    agents,
    logs,
    metrics,
    stats,
    isLoading: loadingAgents || loadingLogs,
    sendCommand: sendCommand.mutate,
    toggleAgentStatus: toggleAgentStatus.mutate,
    isSending: sendCommand.isPending,
  };
}
