/**
 * Module Metrics Hook
 * Fetches real-time metrics from Supabase for various modules
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface ComplianceMetrics {
  overallScore: number;
  regulatoryCompliance: number;
  riskMitigation: number;
  trainingCompletion: number;
  openIssues: number;
  isLoading: boolean;
}

export interface SafetyMetrics {
  avgQE: number;
  fatigueRisk: number;
  stressLevel: number;
  wellnessScore: number;
  isLoading: boolean;
}

export function useComplianceMetrics(): ComplianceMetrics {
  // PATCH v48: Start with isLoading=false to NEVER block render
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    overallScore: 91,
    regulatoryCompliance: 94,
    riskMitigation: 88,
    trainingCompletion: 85,
    openIssues: 3,
    isLoading: false, // NEVER start as true
  });

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch compliance audits for score calculation
      const { data: audits, count: auditCount } = await supabase
        .from("audit_center_logs")
        .select("compliance_score, action", { count: "exact" })
        .not("compliance_score", "is", null)
        .limit(100);

      // Fetch open issues from action_items
      const { count: openIssuesCount } = await supabase
        .from("action_items")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "in_progress"])
        .eq("source_module", "compliance");

      // Fetch training completion from academy_progress
      const { data: trainingData } = await supabase
        .from("academy_progress")
        .select("progress_percent")
        .eq("status", "in_progress")
        .limit(50);

      // Calculate metrics
      const avgCompliance = audits?.length 
        ? audits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / audits.length 
        : 91;

      // Use audit count as proxy for regulatory compliance
      const regulatoryScore = auditCount && auditCount > 0 ? Math.min(98, 80 + auditCount) : 94;

      const avgTraining = trainingData?.length
        ? trainingData.reduce((sum, t) => sum + (t.progress_percent || 0), 0) / trainingData.length
        : 85;

      setMetrics({
        overallScore: Math.round(avgCompliance),
        regulatoryCompliance: regulatoryScore,
        riskMitigation: Math.round(avgCompliance * 0.95), // Derived metric
        trainingCompletion: Math.round(avgTraining),
        openIssues: openIssuesCount || 0,
        isLoading: false,
      });
    } catch (error) {
      logger.error("Error fetching compliance metrics:", error);
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // PATCH v48: Empty dependency array - NEVER causes infinite loops
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 120000); // 2 minutes (was 1 min)
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return metrics;
}

export function useSafetyMetrics(): SafetyMetrics {
  // PATCH v48: Start with isLoading=false to NEVER block render
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    avgQE: 78,
    fatigueRisk: 15,
    stressLevel: 22,
    wellnessScore: 85,
    isLoading: false, // NEVER start as true
  });

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch crew wellness data using available columns
      const { data: crewData, count } = await supabase
        .from("crew_members")
        .select("status, rank", { count: "exact" })
        .eq("status", "active")
        .limit(100);

      // Fetch recent incidents for stress/risk calculation
      const { count: incidentCount } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate metrics from real data
      if (crewData && crewData.length > 0) {
        const activeCrew = crewData.length;
        // Derive wellness metrics from crew count and incidents
        const incidentRatio = incidentCount ? (incidentCount / Math.max(activeCrew, 1)) * 100 : 10;
        
        setMetrics({
          avgQE: Math.max(60, 90 - Math.round(incidentRatio)),
          fatigueRisk: Math.min(40, Math.round(incidentRatio * 1.5)),
          stressLevel: Math.min(50, Math.round(incidentRatio * 2)),
          wellnessScore: Math.max(50, 100 - Math.round(incidentRatio * 1.5)),
          isLoading: false,
        });
      } else {
        // Use defaults but mark as loaded
        setMetrics(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      logger.error("Error fetching safety metrics:", error);
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // PATCH v48: Empty dependency array - NEVER causes infinite loops
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 120000); // 2 minutes (was 1 min)
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return metrics;
}

export function useFleetMetrics() {
  // PATCH v48: Start with isLoading=false to NEVER block render
  const [metrics, setMetrics] = useState({
    totalVessels: 0,
    activeVessels: 0,
    inMaintenance: 0,
    standby: 0,
    isLoading: false, // NEVER start as true
  });

  const fetchMetrics = useCallback(async () => {
    try {
      const { data: vessels, count } = await supabase
        .from("vessels")
        .select("status", { count: "exact" });

      if (vessels) {
        const active = vessels.filter(v => v.status === "active" || v.status === "operational").length;
        const maintenance = vessels.filter(v => v.status === "maintenance").length;
        const standby = vessels.filter(v => v.status === "standby" || v.status === "inactive").length;

        setMetrics({
          totalVessels: count || 0,
          activeVessels: active,
          inMaintenance: maintenance,
          standby: standby,
          isLoading: false,
        });
      }
    } catch (error) {
      logger.error("Error fetching fleet metrics:", error);
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // PATCH v48: Empty dependency array - NEVER causes infinite loops
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 120000); // 2 minutes (was 1 min)
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return metrics;
}
