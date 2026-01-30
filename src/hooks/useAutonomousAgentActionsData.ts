/**
 * Hook para dados reais de Agentes Autônomos
 * Substitui MOCK_ACTIONS em AutonomousAgentPanel.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  actionType: "execute" | "suggest" | "analyze" | "alert";
  description: string;
  target: string;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  confidence: number;
  timestamp: Date;
  result?: string;
  impact: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
}

export function useAutonomousAgentActions() {
  return useQuery({
    queryKey: ["autonomous-agent-actions"],
    queryFn: async (): Promise<AgentAction[]> => {
      // Buscar de ai_blockchain_audit (ações de agentes com rastreabilidade)
      const { data: actions, error } = await supabase
        .from("ai_blockchain_audit")
        .select(`
          id,
          agent_id,
          agent_name,
          action_type,
          action_description,
          module,
          resource,
          confidence,
          reasoning,
          result,
          human_override,
          timestamp
        `)
        .order("timestamp", { ascending: false })
        .limit(20);

      if (!error && actions && actions.length > 0) {
        return actions.map((action) => ({
          id: action.id,
          agentId: action.agent_id,
          agentName: action.agent_name,
          actionType: mapActionType(action.action_type),
          description: action.action_description,
          target: action.resource || action.module,
          status: action.human_override ? "approved" as const : action.result ? "executed" as const : "pending" as const,
          confidence: action.confidence || 85,
          timestamp: new Date(action.timestamp),
          result: action.reasoning || undefined,
          impact: mapImpact(action.confidence),
          requiresApproval: (action.confidence || 100) < 90,
        }));
      }

      // Fallback: buscar ai_decisions
      const { data: decisions } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);

      if (decisions && decisions.length > 0) {
        return decisions.map((dec) => ({
          id: dec.id,
          agentId: "agent-" + dec.type,
          agentName: `Agente ${dec.type}`,
          actionType: "suggest" as const,
          description: dec.description,
          target: dec.title,
          status: mapDecisionStatus(dec.status),
          confidence: dec.confidence,
          timestamp: new Date(dec.created_at),
          result: dec.justification_reasoning || undefined,
          impact: dec.impact === "high" ? "high" as const : dec.impact === "critical" ? "critical" as const : "medium" as const,
          requiresApproval: dec.status === "pending",
        }));
      }

      // Demo fallback
      return [
        {
          id: "demo-action-1",
          agentId: "agent-maintenance",
          agentName: "Agente de Manutenção",
          actionType: "suggest" as const,
          description: "Recomenda inspeção do motor principal baseado em análise de vibração",
          target: "Motor Principal - MV Atlas",
          status: "pending" as const,
          confidence: 87,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          impact: "high" as const,
          requiresApproval: true,
        },
      ];
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useApproveAgentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionId, approved }: { actionId: string; approved: boolean }) => {
      // Tentar atualizar ai_decisions
      const { error } = await supabase
        .from("ai_decisions")
        .update({
          status: approved ? "approved" : "rejected",
          executed_at: approved ? new Date().toISOString() : null,
        })
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-agent-actions"] });
      toast.success(approved ? "Ação aprovada e executada" : "Ação rejeitada");
    },
    onError: () => {
      toast.error("Erro ao processar ação");
    },
  });
}

function mapActionType(type: string | null): AgentAction["actionType"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("exec")) return "execute";
  if (lower.includes("analy")) return "analyze";
  if (lower.includes("alert")) return "alert";
  return "suggest";
}

function mapImpact(confidence: number | null): AgentAction["impact"] {
  if (!confidence) return "medium";
  if (confidence >= 95) return "critical";
  if (confidence >= 85) return "high";
  if (confidence >= 70) return "medium";
  return "low";
}

function mapDecisionStatus(status: string | null): AgentAction["status"] {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("approved") || lower.includes("accept")) return "approved";
  if (lower.includes("reject")) return "rejected";
  if (lower.includes("exec") || lower.includes("complet")) return "executed";
  if (lower.includes("fail")) return "failed";
  return "pending";
}
