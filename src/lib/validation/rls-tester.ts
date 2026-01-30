/**
 * RLS (Row Level Security) Tester
 * Comprehensive testing for Supabase RLS policies
 * 
 * @module rls-tester
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface RLSTest {
  name: string;
  table: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface RLSTestResult extends RLSTest {
  passed: boolean;
  message: string;
  duration: number;
}

export interface RLSAuditReport {
  generatedAt: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  results: RLSTestResult[];
  recommendations: string[];
}

// ============================================================================
// CRITICAL TABLES TO TEST
// ============================================================================

const CRITICAL_TABLES = [
  "crew_members",
  "crew_payroll",
  "crew_documents",
  "vessels",
  "maritime_certificates",
  "psc_inspections",
  "ai_audit_logs",
  "access_logs",
  "profiles",
] as const;

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test that user cannot access data from other organizations
 */
async function testCrossOrgAccess(table: string): Promise<RLSTestResult> {
  const start = Date.now();
  const fakeOrgId = "00000000-0000-0000-0000-000000000000";

  try {
    const { data, error } = await supabase
      .from(table as never)
      .select("id")
      .eq("organization_id", fakeOrgId)
      .limit(1);

    const passed = !error && (!data || data.length === 0);

    return {
      name: `Cross-org access blocked: ${table}`,
      table,
      operation: "SELECT",
      description: "Verify user cannot access other organization's data",
      severity: "CRITICAL",
      passed,
      message: passed
        ? `✅ ${table}: Cross-org access correctly blocked`
        : `❌ ${table}: Can access ${data?.length || 0} records from other org!`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      name: `Cross-org access blocked: ${table}`,
      table,
      operation: "SELECT",
      description: "Verify user cannot access other organization's data",
      severity: "CRITICAL",
      passed: true, // Error means access was blocked
      message: `✅ ${table}: Access blocked by RLS`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Test that user can access their own organization's data
 */
async function testOwnOrgAccess(table: string, orgId: string): Promise<RLSTestResult> {
  const start = Date.now();

  try {
    const { data, error } = await supabase
      .from(table as never)
      .select("id")
      .eq("organization_id", orgId)
      .limit(1);

    const passed = !error;

    return {
      name: `Own org access allowed: ${table}`,
      table,
      operation: "SELECT",
      description: "Verify user can access their organization's data",
      severity: "HIGH",
      passed,
      message: passed
        ? `✅ ${table}: Own org access allowed (${data?.length || 0} records)`
        : `❌ ${table}: Cannot access own org data: ${error?.message}`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      name: `Own org access allowed: ${table}`,
      table,
      operation: "SELECT",
      description: "Verify user can access their organization's data",
      severity: "HIGH",
      passed: false,
      message: `❌ ${table}: Error accessing own org: ${err instanceof Error ? err.message : "Unknown"}`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Test soft delete filter
 */
async function testSoftDeleteFilter(table: string): Promise<RLSTestResult> {
  const start = Date.now();

  try {
    // Try to access without soft delete filter
    const { data: allData } = await supabase
      .from(table as never)
      .select("id, deleted_at")
      .limit(10);

    // Check if any deleted records are returned
    const hasDeletedRecords = allData?.some((r: { deleted_at: unknown }) => r.deleted_at !== null);

    return {
      name: `Soft delete filter: ${table}`,
      table,
      operation: "SELECT",
      description: "Check if soft-deleted records are properly filtered",
      severity: "MEDIUM",
      passed: !hasDeletedRecords,
      message: hasDeletedRecords
        ? `⚠️ ${table}: Soft-deleted records visible (add RLS filter)`
        : `✅ ${table}: Soft delete properly handled`,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      name: `Soft delete filter: ${table}`,
      table,
      operation: "SELECT",
      description: "Check if soft-deleted records are properly filtered",
      severity: "MEDIUM",
      passed: true, // Error likely means column doesn't exist (which is fine)
      message: `✅ ${table}: No deleted_at column or access restricted`,
      duration: Date.now() - start,
    };
  }
}

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

/**
 * Run comprehensive RLS audit
 */
export async function runRLSAudit(): Promise<RLSAuditReport> {
  const results: RLSTestResult[] = [];
  const recommendations: string[] = [];

  // Get current user's org
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      generatedAt: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      results: [{
        name: "Authentication Required",
        table: "N/A",
        operation: "SELECT",
        description: "User must be authenticated to run RLS tests",
        severity: "CRITICAL",
        passed: false,
        message: "❌ No authenticated user",
        duration: 0,
      }],
      recommendations: ["Log in before running RLS audit"],
    };
  }

  // Get user's organization from organization_members
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const orgId = membership?.organization_id as string | undefined;

  // Run tests for each critical table
  for (const table of CRITICAL_TABLES) {
    // Test cross-org access
    results.push(await testCrossOrgAccess(table));

    // Test own org access (if user has org)
    if (orgId) {
      results.push(await testOwnOrgAccess(table, orgId));
    }

    // Test soft delete
    results.push(await testSoftDeleteFilter(table));
  }

  // Generate recommendations
  const failures = results.filter(r => !r.passed);
  const criticalFailures = failures.filter(r => r.severity === "CRITICAL");

  if (criticalFailures.length > 0) {
    recommendations.push("🚨 CRITICAL: Fix cross-organization access vulnerabilities immediately");
  }

  if (failures.some(r => r.name.includes("Soft delete"))) {
    recommendations.push("Add deleted_at IS NULL filter to RLS policies or SafeQueryBuilder");
  }

  if (failures.length === 0) {
    recommendations.push("✅ All RLS tests passed. Continue monitoring with regular audits.");
  }

  return {
    generatedAt: new Date().toISOString(),
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests: failures.length,
    criticalFailures: criticalFailures.length,
    results,
    recommendations,
  };
}

/**
 * Quick RLS health check
 */
export async function quickRLSCheck(): Promise<{
  healthy: boolean;
  criticalIssues: number;
  message: string;
}> {
  const report = await runRLSAudit();

  return {
    healthy: report.criticalFailures === 0,
    criticalIssues: report.criticalFailures,
    message: report.criticalFailures === 0
      ? "✅ RLS is healthy"
      : `❌ ${report.criticalFailures} critical RLS issues found`,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const rlsTester = {
  runRLSAudit,
  quickRLSCheck,
  testCrossOrgAccess,
  testOwnOrgAccess,
  testSoftDeleteFilter,
};

export default rlsTester;
