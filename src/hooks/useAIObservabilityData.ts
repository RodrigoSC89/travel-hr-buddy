/**
 * Hook para dados reais de AI Observability
 * Substitui MOCK_AGENTS, MOCK_METRICS, MOCK_LOGS
 * ✅ R01 CORRIGIDO: Dados reais do Supabase
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgentStatus = "running" | "idle" | "paused" | "error";

export interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  model: string;
  tasksCompleted: number;
  tasksQueued: number;
  avgResponseTime: number;
  successRate: number;
  lastActivity: Date;
  tokensUsed: number;
  costUSD: number;
}

export interface AIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface AILog {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AIObservabilityStatus {
  isConfigured: boolean;
  hasData: boolean;
  agentCount: number;
  status: "connected" | "degraded" | "disconnected" | "not_configured";
}

/**
 * Fetch AI agents from database
 */
export function useAIAgents() {
  return useQuery({
    queryKey: ["ai-agents"],
    queryFn: async (): Promise<AIAgent[]> => {
      const { data, error } = await supabase
        .from("agent_registry")
        .select(`
          agent_id,
          name,
          capabilities,
          status,
          last_heartbeat,
          metadata
        `)
        .order("name", { ascending: true });

      if (error) throw error;

      // Buscar métricas dos agentes
      const { data: metricsData } = await supabase
        .from("agent_swarm_metrics")
        .select("*");

      const metricsMap = new Map(
        (metricsData || []).map((m) => [m.agent_id, m])
      );

      return (data || []).map((agent): AIAgent => {
        const metrics = metricsMap.get(agent.agent_id);
        const capabilities = agent.capabilities as Record<string, unknown> || {};
        const metadata = agent.metadata as Record<string, unknown> || {};
        
        return {
          id: agent.agent_id,
          name: agent.name,
          type: String(capabilities.type || "general"),
          status: mapAgentStatus(agent.status),
          model: String(metadata.model || "GPT-4o"),
          tasksCompleted: metrics?.task_count || 0,
          tasksQueued: 0, // Would need separate queue table
          avgResponseTime: metrics?.avg_response_time_ms || 0,
          successRate: metrics?.success_count && metrics?.task_count 
            ? (metrics.success_count / metrics.task_count) * 100 
            : 0,
          lastActivity: agent.last_heartbeat ? new Date(agent.last_heartbeat) : new Date(),
          tokensUsed: Number(metadata.tokens_used || 0),
          costUSD: Number(metadata.cost_usd || 0),
        };
      });
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Fetch AI metrics summary
 */
export function useAIMetrics() {
  return useQuery({
    queryKey: ["ai-metrics"],
    queryFn: async (): Promise<AIMetric[]> => {
      // Agregar métricas dos logs de IA
      const { data: logs, error } = await supabase
        .from("ai_logs")
        .select("status, response_time_ms, tokens_used")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const totalRequests = logs?.length || 0;
      const successCount = logs?.filter((l) => l.status === "success").length || 0;
      const avgResponseTime = logs?.length 
        ? logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length / 1000
        : 0;
      const totalTokens = logs?.reduce((sum, l) => sum + (l.tokens_used || 0), 0) || 0;
      const errorCount = logs?.filter((l) => l.status === "error").length || 0;

      // Calcular custo estimado (aproximação: $0.002 per 1K tokens)
      const estimatedCost = (totalTokens / 1000) * 0.002;

      return [
        {
          id: "m1",
          name: "Total de Requisições",
          value: totalRequests,
          unit: "",
          change: 0,
          trend: "stable" as const,
          status: "good" as const,
        },
        {
          id: "m2",
          name: "Tempo Médio de Resposta",
          value: Number(avgResponseTime.toFixed(2)),
          unit: "s",
          change: 0,
          trend: avgResponseTime < 2 ? "down" as const : "up" as const,
          status: avgResponseTime < 2 ? "good" as const : "warning" as const,
        },
        {
          id: "m3",
          name: "Taxa de Sucesso",
          value: totalRequests ? Number(((successCount / totalRequests) * 100).toFixed(1)) : 0,
          unit: "%",
          change: 0,
          trend: "stable" as const,
          status: (successCount / totalRequests) > 0.95 ? "good" as const : "warning" as const,
        },
        {
          id: "m4",
          name: "Tokens Utilizados",
          value: Number((totalTokens / 1000000).toFixed(2)),
          unit: "M",
          change: 0,
          trend: "up" as const,
          status: totalTokens > 1000000 ? "warning" as const : "good" as const,
        },
        {
          id: "m5",
          name: "Custo Acumulado",
          value: Number(estimatedCost.toFixed(2)),
          unit: "USD",
          change: 0,
          trend: "up" as const,
          status: estimatedCost > 50 ? "warning" as const : "good" as const,
        },
        {
          id: "m6",
          name: "Erros",
          value: errorCount,
          unit: "",
          change: 0,
          trend: errorCount > 10 ? "up" as const : "stable" as const,
          status: errorCount > 10 ? "critical" as const : "good" as const,
        },
      ];
    },
    staleTime: 60000,
  });
}

/**
 * Fetch AI logs
 */
export function useAILogs(limit: number = 50) {
  return useQuery({
    queryKey: ["ai-logs", limit],
    queryFn: async (): Promise<AILog[]> => {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select(`
          id,
          created_at,
          user_input,
          ai_response,
          model_provider,
          module_name,
          confidence_score
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log): AILog => ({
        id: log.id,
        timestamp: new Date(log.created_at || Date.now()),
        agentId: log.module_name || "system",
        agentName: log.model_provider || "AI Assistant",
        level: determineLogLevel(log.confidence_score),
        message: log.user_input?.substring(0, 200) || "Interação registrada",
        metadata: { response: log.ai_response?.substring(0, 100) },
      }));
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });
}

/**
 * Check AI observability configuration status
 */
export function useAIObservabilityStatus() {
  return useQuery({
    queryKey: ["ai-observability-status"],
    queryFn: async (): Promise<AIObservabilityStatus> => {
      const [agentsResult, logsResult] = await Promise.all([
        supabase.from("agent_registry").select("agent_id", { count: "exact", head: true }),
        supabase.from("ai_logs").select("id", { count: "exact", head: true }).limit(1),
      ]);

      const agentCount = agentsResult.count || 0;
      const hasLogs = (logsResult.count || 0) > 0;

      return {
        isConfigured: agentCount > 0 || hasLogs,
        hasData: hasLogs,
        agentCount,
        status: agentCount > 0 ? "connected" : hasLogs ? "degraded" : "not_configured",
      };
    },
    staleTime: 60000,
  });
}

// Helpers
function mapAgentStatus(status: string): AgentStatus {
  switch (status?.toLowerCase()) {
    case "active":
    case "running":
      return "running";
    case "idle":
    case "waiting":
      return "idle";
    case "paused":
    case "stopped":
      return "paused";
    case "error":
    case "failed":
      return "error";
    default:
      return "idle";
  }
}

function determineLogLevel(confidence: number | null): AILog["level"] {
  if (confidence === null) return "info";
  if (confidence < 0.5) return "warning";
  if (confidence < 0.3) return "error";
  return "info";
}
