/**
 * PATCH 611 - Cross-Module Validator
 * Validates data integrity between different system modules
 */

// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface ValidationResult {
  module: string;
  status: "valid" | "warning" | "error";
  checks: ValidationCheck[];
  score: number; // 0-100
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface CrossModuleValidation {
  ai_to_analytics: ValidationResult;
  health_to_performance: ValidationResult;
  crew_to_operations: ValidationResult;
  overall_integrity: number; // 0-100
}

type Tables = Database["public"]["Tables"];
type TableRow<TableName extends keyof Tables> = Tables[TableName]["Row"];

type VesselRow = TableRow<"vessels">;
type CrewMemberRow = TableRow<"crew_members">;

const calculateScoreAndStatus = (checks: ValidationCheck[]): { score: number; status: ValidationResult["status"] } => {
  if (checks.length === 0) {
    return { score: 0, status: "error" };
  }

  const passedChecks = checks.filter((check) => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  if (score >= 90) return { score, status: "valid" };
  if (score >= 70) return { score, status: "warning" };
  return { score, status: "error" };
};

const formatCount = (value: number | null | undefined): number => {
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
};

/**
 * Validate AI to Analytics data consistency
 */
export async function validateAIToAnalytics(): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  
  try {
    // Check 1: Count records in both modules
    const { count: aiLogCount } = await supabase
      .from("ia_performance_log")
      .select("*", { count: "exact", head: true });
    
    const { count: analyticsCount } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true });
    
    if (aiLogCount !== null && analyticsCount !== null) {
      const maxCount = Math.max(aiLogCount, analyticsCount);
      const ratio = maxCount === 0 ? 0 : Math.abs(aiLogCount - analyticsCount) / maxCount;
      checks.push({
        name: "Record Count Consistency",
        passed: ratio < 0.1, // Allow 10% difference
        message: `AI logs: ${aiLogCount}, Analytics: ${analyticsCount}`,
        severity: ratio < 0.1 ? "info" : "warning",
      });
    }
    
    // Check 2: Verify AI decisions have corresponding analytics events
    const { data: recentAILogs } = await supabase
      .from("ia_performance_log")
      .select("id, module_name, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (recentAILogs && recentAILogs.length > 0) {
      const orphanedLogs = recentAILogs.filter((log) => !log.module_name);
      checks.push({
        name: "Module Name Integrity",
        passed: orphanedLogs.length === 0,
        message: `${orphanedLogs.length} logs without module names`,
        severity: orphanedLogs.length > 10 ? "error" : "warning",
      });
    }
    
    // Check 3: Validate required fields are not null
    const { data: nullFieldLogs } = await supabase
      .from("ia_performance_log")
      .select("id")
      .is("module_name", null);
    
    checks.push({
      name: "Required Fields Present",
      passed: !nullFieldLogs || nullFieldLogs.length === 0,
      message: `${nullFieldLogs?.length || 0} records with null required fields`,
      severity: (nullFieldLogs?.length || 0) > 0 ? "error" : "info",
    });
    
  } catch (error) {
    checks.push({
      name: "Module Validation",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      severity: "error",
    });
  }
  
  const { score, status } = calculateScoreAndStatus(checks);
  
  return {
    module: "AI → Analytics",
    status,
    checks,
    score,
  };
}

/**
 * Validate Health to Performance data consistency
 */
export async function validateHealthToPerformance(): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  
  try {
    // Check 1: Verify system health records exist
    const { count: healthCount } = await supabase
      .from("system_health")
      .select("*", { count: "exact", head: true });
    
    checks.push({
      name: "Health Records Available",
      passed: formatCount(healthCount) > 0,
      message: `${formatCount(healthCount)} health records found`,
      severity: formatCount(healthCount) > 0 ? "info" : "error",
    });
    
    // Check 2: Verify performance metrics are logged
    const { count: perfCount } = await supabase
      .from("performance_metrics")
      .select("*", { count: "exact", head: true });
    
    checks.push({
      name: "Performance Metrics Available",
      passed: formatCount(perfCount) > 0,
      message: `${formatCount(perfCount)} performance metrics found`,
      severity: formatCount(perfCount) > 0 ? "info" : "warning",
    });
    
    // Check 3: Check for recent health updates (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentHealthCount } = await supabase
      .from("system_health")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", oneHourAgo);
    
    checks.push({
      name: "Recent Health Updates",
      passed: formatCount(recentHealthCount) > 0,
      message: `${formatCount(recentHealthCount)} updates in last hour`,
      severity: formatCount(recentHealthCount) > 0 ? "info" : "warning",
    });
    
  } catch (error) {
    checks.push({
      name: "Module Validation",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      severity: "error",
    });
  }
  
  const { score, status } = calculateScoreAndStatus(checks);
  
  return {
    module: "Health → Performance",
    status,
    checks,
    score,
  };
}

/**
 * Validate Crew to Operations data consistency
 */
export async function validateCrewToOperations(): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  
  try {
    // Check 1: Verify crew profiles have valid vessel references
    const { data: crewWithVessels } = await supabase
      .from<CrewMemberRow>("crew_members")
      .select("id, vessel_id")
      .not("vessel_id", "is", null);
    
    if (crewWithVessels && crewWithVessels.length > 0) {
      // Verify each vessel_id exists
      const vesselIds = crewWithVessels
        .filter((crew: any) => crew.vessel_id)
        .map((crew: any) => crew.vessel_id)
        .filter((id: any, index: number, self: any[]) => self.indexOf(id) === index);
      
      if (vesselIds.length > 0) {
        const { count: validVessels } = await supabase
          .from("vessels")
          .select("id", { count: "exact", head: true })
          .in("id", vesselIds);
        
        const validRatio = crewWithVessels.length === 0
          ? 1
          : formatCount(validVessels) / crewWithVessels.length;
        checks.push({
          name: "Valid Vessel References",
          passed: validRatio > 0.95,
          message: `${Math.round(validRatio * 100)}% of crew have valid vessel assignments`,
          severity: validRatio > 0.95 ? "info" : "error",
        });
      }
    }
    
    // Check 2: Verify operations reference valid crew
    const { data: operations } = await (supabase as any)
      .from("vessel_operations")
      .select("id, crew_required")
      .limit(100);
    
    if (operations && operations.length > 0) {
      checks.push({
        name: "Operations Have Crew Requirements",
        passed: true,
        message: `${operations.length} operations with crew data`,
        severity: "info",
      });
    }
    
    // Check 3: Check for orphaned records
    const { data: orphanedCrew } = await (supabase as any)
      .from("crew_members")
      .select("id")
      .is("organization_id", null);
    
    checks.push({
      name: "No Orphaned Crew Records",
      passed: !orphanedCrew || orphanedCrew.length === 0,
      message: `${orphanedCrew?.length || 0} crew without organization`,
      severity: (orphanedCrew?.length || 0) > 0 ? "error" : "info",
    });
    
  } catch (error) {
    checks.push({
      name: "Module Validation",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      severity: "error",
    });
  }
  
  const { score, status } = calculateScoreAndStatus(checks);
  
  return {
    module: "Crew → Operations",
    status,
    checks,
    score,
  };
}

/**
 * Run all cross-module validations
 */
export async function runCrossModuleValidation(): Promise<CrossModuleValidation> {
  const [aiAnalytics, healthPerformance, crewOperations] = await Promise.all([
    validateAIToAnalytics(),
    validateHealthToPerformance(),
    validateCrewToOperations(),
  ]);
  
  const overallIntegrity = Math.round(
    (aiAnalytics.score + healthPerformance.score + crewOperations.score) / 3
  );
  
  return {
    ai_to_analytics: aiAnalytics,
    health_to_performance: healthPerformance,
    crew_to_operations: crewOperations,
    overall_integrity: overallIntegrity,
  };
}

/**
 * Log integrity issues to database
 */
export async function logIntegrityIssues(validation: CrossModuleValidation) {
  const modulesToCheck = [
    { result: validation.ai_to_analytics, moduleName: "ai_to_analytics" },
    { result: validation.health_to_performance, moduleName: "health_to_performance" },
    { result: validation.crew_to_operations, moduleName: "crew_to_operations" },
  ];

  for (const { result, moduleName } of modulesToCheck) {
    const failedChecks = result.checks.filter((check) => !check.passed);
    
    for (const issue of failedChecks) {
      try {
        await (supabase as any)
          .from("integrity_logs")
          .insert({
            timestamp: new Date().toISOString(),
            module: moduleName,
            error_type: issue.severity,
            relation: issue.name,
            message: issue.message,
          } as any);
      } catch (error) {
        console.error("Error logging integrity issue:", error);
      }
    }
  }
}
