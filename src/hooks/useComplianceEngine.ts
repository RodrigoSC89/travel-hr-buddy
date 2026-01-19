/**
 * Hook for Compliance as Code Engine
 * Automated compliance checking with MLC 2006, STCW, LGPD, ISM rules
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { complianceEngine, MARITIME_COMPLIANCE_RULES } from "@/lib/compliance-as-code/compliance-engine";

export interface ComplianceViolation {
  id: string;
  rule_id: string;
  entity_type: string;
  entity_id: string;
  severity: string;
  status: string;
  detected_at: string;
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
      
      return (data || []).map(row => ({
        id: row.id,
        rule_id: row.rule_id,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        severity: row.severity,
        status: row.status,
        detected_at: row.detected_at || new Date().toISOString(),
        resolved_at: row.resolved_at || undefined,
        resolution_notes: row.resolution_notes || undefined
      })) as ComplianceViolation[];
    }
  });

  // Get active (unresolved) violations
  const activeViolations = violations.filter(v => v.status === "open" || v.status === "in_progress");

  // Use the predefined rules from the compliance engine
  const rules = MARITIME_COMPLIANCE_RULES;
  
  const stats: ComplianceStats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.is_active).length,
    criticalViolations: activeViolations.filter(v => v.severity === "critical").length,
    highViolations: activeViolations.filter(v => v.severity === "high").length,
    mediumViolations: activeViolations.filter(v => v.severity === "medium").length,
    lowViolations: activeViolations.filter(v => v.severity === "low").length,
    complianceRate: violations.length > 0 
      ? Math.round((1 - activeViolations.length / Math.max(violations.length, 1)) * 100)
      : 100
  };

  // Run full audit
  const runAudit = useCallback(async (organizationId: string) => {
    setIsAuditing(true);
    try {
      const result = await complianceEngine.runFullAudit(organizationId);
      
      // Refresh violations list
      await queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });

      return result;
    } finally {
      setIsAuditing(false);
    }
  }, [queryClient]);

  // Resolve violation
  const resolveViolation = useMutation({
    mutationFn: async ({ 
      violationId, 
      resolution,
      userId
    }: { 
      violationId: string; 
      resolution: string;
      userId: string;
    }) => {
      const success = await complianceEngine.resolveViolation(violationId, userId, resolution);
      if (!success) throw new Error("Failed to resolve violation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });
    }
  });

  // Acknowledge violation (mark as in progress)
  const acknowledgeViolation = useMutation({
    mutationFn: async ({ violationId, userId }: { violationId: string; userId: string }) => {
      const success = await complianceEngine.acknowledgeViolation(violationId, userId);
      if (!success) throw new Error("Failed to acknowledge violation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-violations"] });
    }
  });

  // Get rules
  const getRules = useCallback(() => {
    return MARITIME_COMPLIANCE_RULES;
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
    getRules
  };
}
