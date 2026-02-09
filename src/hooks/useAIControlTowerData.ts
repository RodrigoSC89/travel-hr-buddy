/**
 * AI Control Tower Data Hook - Full Backend Integration
 * PATCH AI-TOWER-2.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import type { Json } from "@/integrations/supabase/types";

export interface AIAgent {
  id: string;
  agent_id: string;
  name: string;
  status: string;
  capabilities: Json;
  last_heartbeat: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface AIDecision {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  confidence: number;
  confidence_level: string;
  impact: string;
  justification_reasoning: string;
  created_at: string;
  executed_at: string | null;
}

export interface AIAuditLog {
  id: string;
  user_input: string;
  ai_response: string | null;
  model_version: string | null;
  confidence_score: number | null;
  tokens_input: number | null;
  tokens_output: number | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  steps: Json;
  trigger_conditions: Json;
  created_at: string;
}

export function useAIControlTowerData() {
  const queryClient = useQueryClient();

  // Fetch AI agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["ai-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_registry")
        .select("*")
        .order("last_heartbeat", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Fetch AI decisions
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["ai-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  // Fetch AI audit logs
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["ai-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  // AI workflows (simulated since table may not exist)
  const workflowsLoading = false;
  const workflows: AIWorkflow[] = [];

  // Fetch AI insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch AI configurations
  const { data: configurations = [], isLoading: configLoading } = useQuery({
    queryKey: ["ai-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_configurations")
        .select("*")
        .order("config_key", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Approve AI decision
  const approveDecision = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback?: string }) => {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ 
          status: "approved",
          executed_at: new Date().toISOString(),
          feedback_notes: feedback,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-decisions"] });
      toast.success("Decisão aprovada");
    },
  });

  // Reject AI decision
  const rejectDecision = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ 
          status: "rejected",
          rejected_reason: reason,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-decisions"] });
      toast.success("Decisão rejeitada");
    },
  });

  // Update AI configuration
  const updateConfiguration = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { error } = await supabase
        .from("ai_configurations")
        .upsert({ 
          config_key: key,
          config_value: value,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-configurations"] });
      toast.success("Configuração atualizada");
    },
  });

  // Calculate AI metrics
  const aiMetrics = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === "active" || a.status === "online").length,
    pendingDecisions: decisions.filter(d => d.status === "pending").length,
    approvedDecisions: decisions.filter(d => d.status === "approved").length,
    rejectedDecisions: decisions.filter(d => d.status === "rejected").length,
    avgConfidence: decisions.length > 0 
      ? Math.round(decisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / decisions.length) 
      : 0,
    totalInteractions: auditLogs.length,
    avgResponseTime: auditLogs.length > 0
      ? Math.round(auditLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / auditLogs.length)
      : 0,
    activeWorkflows: workflows.filter(w => w.status === "active").length,
    actionableInsights: insights.filter(i => i.actionable && i.status === "pending").length,
  };

  return {
    // Data
    agents,
    decisions,
    auditLogs,
    workflows,
    insights,
    configurations,
    metrics: aiMetrics,
    
    // Loading states
    isLoading: agentsLoading || decisionsLoading || auditLoading || workflowsLoading || insightsLoading || configLoading,
    agentsLoading,
    decisionsLoading,
    auditLoading,
    workflowsLoading,
    insightsLoading,
    configLoading,
    
    // Mutations
    approveDecision,
    rejectDecision,
    updateConfiguration,
  };
}

export default useAIControlTowerData;
