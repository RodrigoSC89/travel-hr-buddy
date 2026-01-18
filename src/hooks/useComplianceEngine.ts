/**
 * Hook for Compliance as Code Engine
 * Automated compliance checking with MLC 2006, STCW, LGPD, ISM rules
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { complianceEngine } from "@/lib/compliance-as-code/compliance-engine";

export interface ComplianceViolation {
  id: string;
  rule_id: string;
  regulation: string;
  severity: string;
  entity_type: string;
  entity_id: string;
  message: string;
  detected_at: string;
  status: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface ComplianceStats {
  totalRules: number;
  activeRules: number;
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
  complianceRate: number;
}

export function useComplianceEngine() {
  const queryClient = useQueryClient();
  const [isAuditing, setIsAuditing] = useState(false);

  // Fetch all violations
  const { data: violations = [], isLoading: loadingViolations } = useQuery({
    queryKey: ["compliance-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_violations")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ComplianceViolation[];
    }
  });

  // Get active (unresolved) violations
  const activeViolations = violations.filter(v => v.status === "open" || v.status === "in_progress");

  // Calculate stats
  const rules = complianceEngine.rules;
  const stats: ComplianceStats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.enabled).length,
    criticalViolations: activeViolations.filter(v => v.severity === "CRITICAL").length,
    highViolations: activeViolations.filter(v => v.severity === "HIGH").length,
    mediumViolations: activeViolations.filter(v => v.severity === "MEDIUM").length,
    lowViolations: activeViolations.filter(v => v.severity === "LOW").length,
    complianceRate: violations.length > 0 
      ? Math.round((1 - activeViolations.length / Math.max(violations.length, 1)) * 100)
      : 100
  };

  // Run full audit
  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    try {
      // Fetch crews for audit
      const { data: crews } = await supabase
        .from("crew_members")
        .select("*")
        .limit(500);

      if (!crews) return [];

      const allViolations: ComplianceViolation[] = [];

      for (const crew of crews) {
        const crewViolations = await complianceEngine.audit(crew, "crew");
        allViolations.push(...crewViolations);
      }

      // Refresh violations list
      await queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });

      return allViolations;
    } finally {
      setIsAuditing(false);
    }
  }, [queryClient]);

  // Resolve violation
  const resolveViolation = useMutation({
    mutationFn: async ({ 
      violationId, 
      resolution 
    }: { 
      violationId: string; 
      resolution: string;
    }) => {
      const { error } = await supabase
        .from("compliance_violations")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes: resolution
        })
        .eq("id", violationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });
    }
  });

  // Acknowledge violation (mark as in progress)
  const acknowledgeViolation = useMutation({
    mutationFn: async (violationId: string) => {
      const { error } = await supabase
        .from("compliance_violations")
        .update({
          status: "acknowledged"
        })
        .eq("id", violationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });
    }
  });

  // Get rules
  const getRules = useCallback(() => {
    return complianceEngine.rules;
  }, []);

  // Toggle rule
  const toggleRule = useCallback((ruleId: string) => {
    const rule = complianceEngine.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
    }
  }, []);

  return {
    violations,
    activeViolations,
    stats,
    isAuditing,
    loadingViolations,
    runAudit,
    resolveViolation,
    acknowledgeViolation,
    getRules,
    toggleRule
  };
}
