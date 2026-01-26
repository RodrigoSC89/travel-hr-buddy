/**
 * Compliance Data Hook
 * Fetches and manages compliance module data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ComplianceRule,
  ComplianceRisk,
  ComplianceEvidence,
  ComplianceReport,
  ComplianceThirdParty,
  ComplianceWorkflow,
  ComplianceAIRecommendation,
  ComplianceDashboardStats,
} from "../types";

// Generic fetch helper - uses 'as unknown as' pattern for dynamic table access
async function fetchComplianceTable<T>(table: string): Promise<T[]> {
  try {
    const { data, error } = await (supabase
      .from(table as "profiles") // Cast to valid table for type system
      .select("*")
      .order("created_at", { ascending: false }) as unknown as Promise<{ data: T[] | null; error: Error | null }>);
    
    if (error) {
      // Silent fail - table may not exist or be inaccessible
      return [];
    }
    return data || [];
  } catch {
    // Silent fail - table may not exist yet in this environment
    return [];
  }
}

// Rules
export function useComplianceRules() {
  return useQuery({
    queryKey: ["compliance-rules"],
    queryFn: () => fetchComplianceTable<ComplianceRule>("compliance_rules"),
    staleTime: 30000,
  });
}

// Risks
export function useComplianceRisks() {
  return useQuery({
    queryKey: ["compliance-risks"],
    queryFn: () => fetchComplianceTable<ComplianceRisk>("compliance_risks"),
    staleTime: 30000,
  });
}

// Evidences
export function useComplianceEvidences() {
  return useQuery({
    queryKey: ["compliance-evidences"],
    queryFn: () => fetchComplianceTable<ComplianceEvidence>("compliance_evidences"),
    staleTime: 30000,
  });
}

// Reports (Whistleblower)
export function useComplianceReports() {
  return useQuery({
    queryKey: ["compliance-reports"],
    queryFn: () => fetchComplianceTable<ComplianceReport>("compliance_reports"),
    staleTime: 30000,
  });
}

// Third Parties
export function useComplianceThirdParties() {
  return useQuery({
    queryKey: ["compliance-thirdparties"],
    queryFn: () => fetchComplianceTable<ComplianceThirdParty>("compliance_thirdparties"),
    staleTime: 30000,
  });
}

// Workflows
export function useComplianceWorkflows() {
  return useQuery({
    queryKey: ["compliance-workflows"],
    queryFn: () => fetchComplianceTable<ComplianceWorkflow>("compliance_workflows"),
    staleTime: 30000,
  });
}

// AI Recommendations
export function useComplianceRecommendations() {
  return useQuery({
    queryKey: ["compliance-recommendations"],
    queryFn: () => fetchComplianceTable<ComplianceAIRecommendation>("compliance_ai_recommendations"),
    staleTime: 30000,
  });
}

// Dashboard Stats
export function useComplianceDashboardStats() {
  return useQuery({
    queryKey: ["compliance-dashboard-stats"],
    queryFn: async (): Promise<ComplianceDashboardStats> => {
      const [rules, risks, evidences, reports, thirdparties, workflows, recommendations] = await Promise.all([
        fetchComplianceTable<ComplianceRule>("compliance_rules"),
        fetchComplianceTable<ComplianceRisk>("compliance_risks"),
        fetchComplianceTable<ComplianceEvidence>("compliance_evidences"),
        fetchComplianceTable<ComplianceReport>("compliance_reports"),
        fetchComplianceTable<ComplianceThirdParty>("compliance_thirdparties"),
        fetchComplianceTable<ComplianceWorkflow>("compliance_workflows"),
        fetchComplianceTable<ComplianceAIRecommendation>("compliance_ai_recommendations"),
      ]);

      const openRisks = risks.filter((r) => r.status === "open");
      const criticalRisks = risks.filter((r) => r.risk_level === "critical");
      const pendingEvidences = evidences.filter((e) => e.status === "pending_review");
      const expiredEvidences = evidences.filter((e) => e.status === "expired");
      const openReports = reports.filter((r) => r.status === "open" || r.status === "investigating");
      const blockedThirdParties = thirdparties.filter((t) => t.is_blocked);
      const highRiskThirdParties = thirdparties.filter((t) => t.risk_level === "high" || t.risk_level === "critical");
      const overdueWorkflows = workflows.filter((w) => w.status === "overdue");
      const pendingRecommendations = recommendations.filter((r) => r.status === "pending");

      // Calculate compliance score (simplified formula)
      const totalItems = rules.length + risks.length + evidences.length;
      const compliantItems = 
        rules.filter((r) => r.status === "active").length +
        risks.filter((r) => r.status === "mitigated" || r.status === "closed").length +
        evidences.filter((e) => e.status === "valid").length;
      
      const complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;

      return {
        totalRules: rules.length,
        activeRules: rules.filter((r) => r.status === "active").length,
        totalRisks: risks.length,
        openRisks: openRisks.length,
        criticalRisks: criticalRisks.length,
        totalEvidences: evidences.length,
        pendingEvidences: pendingEvidences.length,
        expiredEvidences: expiredEvidences.length,
        totalReports: reports.length,
        openReports: openReports.length,
        totalThirdParties: thirdparties.length,
        blockedThirdParties: blockedThirdParties.length,
        highRiskThirdParties: highRiskThirdParties.length,
        totalWorkflows: workflows.length,
        overdueWorkflows: overdueWorkflows.length,
        pendingRecommendations: pendingRecommendations.length,
        complianceScore,
      };
    },
    staleTime: 60000,
  });
}

// Mutations
export function useCreateComplianceRisk() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (risk: Partial<ComplianceRisk>) => {
      const { data, error } = await (supabase
        .from("compliance_risks" as "profiles")
        .insert(risk as never)
        .select()
        .single() as unknown as Promise<{ data: ComplianceRisk | null; error: Error | null }>);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-risks"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-dashboard-stats"] });
      toast.success("Risco registrado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao registrar risco: " + error.message);
    },
  });
}

export function useCreateComplianceReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: Partial<ComplianceReport>) => {
      const { data, error } = await (supabase
        .from("compliance_reports" as "profiles")
        .insert(report as never)
        .select()
        .single() as unknown as Promise<{ data: ComplianceReport | null; error: Error | null }>);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-reports"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-dashboard-stats"] });
      toast.success("Denúncia registrada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao registrar denúncia: " + error.message);
    },
  });
}

export function useApplyRecommendation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback?: string }) => {
      const { data, error } = await (supabase
        .from("compliance_ai_recommendations" as "profiles")
        .update({ 
          status: "applied", 
          applied_at: new Date().toISOString(),
          feedback 
        } as never)
        .eq("id", id)
        .select()
        .single() as unknown as Promise<{ data: ComplianceAIRecommendation | null; error: Error | null }>);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-dashboard-stats"] });
      toast.success("Recomendação aplicada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao aplicar recomendação: " + error.message);
    },
  });
}
