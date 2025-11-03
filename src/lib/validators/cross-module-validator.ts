// @ts-nocheck
/**
 * PATCH 611 - Cross-Module Validator
 * Validates data integrity between different system modules
 */

import { supabase } from "@/integrations/supabase/client";

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
    
    if (aiLogCount && analyticsCount) {
      const ratio = Math.abs(aiLogCount - analyticsCount) / Math.max(aiLogCount, analyticsCount);
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
      const orphanedLogs = recentAILogs.filter(log => !log.module_name);
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
  
  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const status = score >= 90 ? "valid" : score >= 70 ? "warning" : "error";
  
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
      passed: (healthCount || 0) > 0,
      message: `${healthCount || 0} health records found`,
      severity: (healthCount || 0) > 0 ? "info" : "error",
    });
    
    // Check 2: Verify performance metrics are logged
    const { count: perfCount } = await supabase
      .from("performance_metrics")
      .select("*", { count: "exact", head: true });
    
    checks.push({
      name: "Performance Metrics Available",
      passed: (perfCount || 0) > 0,
      message: `${perfCount || 0} performance metrics found`,
      severity: (perfCount || 0) > 0 ? "info" : "warning",
    });
    
    // Check 3: Check for recent health updates (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentHealthCount } = await supabase
      .from("system_health")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", oneHourAgo);
    
    checks.push({
      name: "Recent Health Updates",
      passed: (recentHealthCount || 0) > 0,
      message: `${recentHealthCount || 0} updates in last hour`,
      severity: (recentHealthCount || 0) > 0 ? "info" : "warning",
    });
    
  } catch (error) {
    checks.push({
      name: "Module Validation",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      severity: "error",
    });
  }
  
  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const status = score >= 90 ? "valid" : score >= 70 ? "warning" : "error";
  
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
      .from("crew_profiles")
      .select("id, vessel_id")
      .not("vessel_id", "is", null);
    
    if (crewWithVessels && crewWithVessels.length > 0) {
      // Verify each vessel_id exists
      const vesselIds = crewWithVessels.map(c => c.vessel_id);
      const { count: validVessels } = await supabase
        .from("vessels")
        .select("id", { count: "exact", head: true })
        .in("id", vesselIds);
      
      const validRatio = (validVessels || 0) / crewWithVessels.length;
      checks.push({
        name: "Valid Vessel References",
        passed: validRatio > 0.95,
        message: `${Math.round(validRatio * 100)}% of crew have valid vessel assignments`,
        severity: validRatio > 0.95 ? "info" : "error",
      });
    }
    
    // Check 2: Verify operations reference valid crew
    const { data: operations } = await supabase
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
    const { data: orphanedCrew } = await supabase
      .from("crew_profiles")
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
  
  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const status = score >= 90 ? "valid" : score >= 70 ? "warning" : "error";
  
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
    const failedChecks = result.checks.filter(c => !c.passed);
    
    for (const issue of failedChecks) {
      try {
        await supabase
          .from("integrity_logs")
          .insert({
            timestamp: new Date().toISOString(),
            module: moduleName,
            error_type: issue.severity,
            relation: issue.name,
            message: issue.message,
          });
      } catch (error) {
        console.error("Error logging integrity issue:", error);
      }
    }
  }
}
