/**
 * Hook para dados reais de Agentes Autônomos
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: "pending" | "executing" | "completed" | "failed" | "cancelled";
  confidence: number;
  timestamp: Date;
  result?: string;
  parameters?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline" | "error";
  capabilities: string[];
  lastHeartbeat: Date;
  taskCount: number;
  successRate: number;
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  pendingActions: number;
  completedToday: number;
  averageConfidence: number;
  successRate: number;
}

export function useAutonomousAgentsData() {
  const queryClient = useQueryClient();
  const [realtimeActions, setRealtimeActions] = useState<AgentAction[]>([]);

  // Fetch agents from agent_registry
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["autonomous-agents"],
    queryFn: async (): Promise<Agent[]> => {
      const { data, error } = await supabase
        .from("agent_registry")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch metrics for each agent
      const agentIds = (data || []).map(a => a.agent_id);
      const { data: metrics } = await supabase
        .from("agent_swarm_metrics")
        .select("*")
        .in("agent_id", agentIds);

      const metricsMap = new Map(
        (metrics || []).map(m => [m.agent_id, m])
      );

      return (data || []).map(agent => {
        const agentMetrics = metricsMap.get(agent.agent_id);
        return {
          id: agent.id,
          name: agent.name,
          status: agent.status as Agent["status"],
          capabilities: Array.isArray(agent.capabilities) 
            ? (agent.capabilities as string[]) 
            : [],
          lastHeartbeat: new Date(agent.last_heartbeat || agent.updated_at),
          taskCount: agentMetrics?.task_count || 0,
          successRate: agentMetrics?.success_count && agentMetrics?.task_count
            ? (agentMetrics.success_count / agentMetrics.task_count) * 100
            : 0,
        };
      });
    },
    staleTime: 30000,
  });

  // Fetch recent actions from ai_blockchain_audit and ai_decisions
  const { data: actions = [], isLoading: loadingActions } = useQuery({
    queryKey: ["autonomous-actions"],
    queryFn: async (): Promise<AgentAction[]> => {
      const allActions: AgentAction[] = [];

      // Fetch from ai_blockchain_audit
      const { data: blockchainActions } = await supabase
        .from("ai_blockchain_audit")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      (blockchainActions || []).forEach(action => {
        allActions.push({
          id: action.id,
          agentId: action.agent_id,
          agentName: action.agent_name,
          action: action.action_description,
          status: action.human_override ? "cancelled" : "completed",
          confidence: action.confidence || 0.85,
          timestamp: new Date(action.timestamp),
          result: ((action.result as Record<string, unknown>)?.message as string) || "Executado",
          parameters: action.parameters as Record<string, unknown> || undefined,
        });
      });

      // Fetch from ai_decisions
      const { data: decisions } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      (decisions || []).forEach(decision => {
        allActions.push({
          id: decision.id,
          agentId: "ai-system",
          agentName: "Sistema IA",
          action: decision.title,
          status: mapDecisionStatus(decision.status),
          confidence: decision.confidence,
          timestamp: new Date(decision.created_at),
          result: decision.description,
          parameters: decision.action_payload as Record<string, unknown> || undefined,
        });
      });

      // Sort by timestamp
      return allActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("autonomous-agents-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_blockchain_audit" },
        (payload) => {
          const newAction: AgentAction = {
            id: payload.new.id,
            agentId: payload.new.agent_id,
            agentName: payload.new.agent_name,
            action: payload.new.action_description,
            status: "executing",
            confidence: payload.new.confidence || 0.85,
            timestamp: new Date(),
            parameters: payload.new.parameters,
          };
          setRealtimeActions(prev => [newAction, ...prev].slice(0, 10));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_registry" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["autonomous-agents"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Approve action mutation
  const approveAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ 
          status: "approved",
          executed_at: new Date().toISOString(),
        })
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-actions"] });
    },
  });

  // Reject action mutation
  const rejectAction = useMutation({
    mutationFn: async ({ actionId, reason }: { actionId: string; reason: string }) => {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ 
          status: "rejected",
          rejected_reason: reason,
        })
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-actions"] });
    },
  });

  // Combine realtime with fetched
  const combinedActions = [...realtimeActions, ...actions]
    .filter((a, index, self) => index === self.findIndex(m => m.id === a.id))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Calculate metrics
  const metrics: AgentMetrics = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === "active").length,
    pendingActions: combinedActions.filter(a => a.status === "pending" || a.status === "executing").length,
    completedToday: combinedActions.filter(a => 
      a.status === "completed" && 
      a.timestamp.toDateString() === new Date().toDateString()
    ).length,
    averageConfidence: combinedActions.length > 0
      ? Math.round(combinedActions.reduce((acc, a) => acc + a.confidence, 0) / combinedActions.length * 100)
      : 0,
    successRate: combinedActions.length > 0
      ? Math.round(combinedActions.filter(a => a.status === "completed").length / combinedActions.length * 100)
      : 0,
  };

  return {
    agents,
    actions: combinedActions,
    metrics,
    isLoading: loadingAgents || loadingActions,
    approveAction: (id: string) => approveAction.mutate(id),
    rejectAction: (id: string, reason: string) => rejectAction.mutate({ actionId: id, reason }),
  };
}

function mapDecisionStatus(status: string | null): AgentAction["status"] {
  switch (status?.toLowerCase()) {
    case "approved":
    case "executed":
      return "completed";
    case "rejected":
      return "cancelled";
    case "pending":
      return "pending";
    default:
      return "pending";
  }
}
