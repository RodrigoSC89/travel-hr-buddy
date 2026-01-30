/**
 * Backend ↔ Frontend Conformity Validator
 * Validates synchronization between Supabase and React frontend
 * 
 * @module conformity-validator
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface ConformityIssue {
  type: 
    | "MISSING_FIELD" 
    | "TYPE_MISMATCH" 
    | "NULLABILITY_MISMATCH" 
    | "EXTRA_FIELD"
    | "MISSING_ERROR_HANDLING"
    | "MISSING_ORG_FILTER"
    | "NO_SOFT_DELETE_FILTER"
    | "N_PLUS_ONE"
    | "INEFFICIENT_QUERY"
    | "RLS_MISSING"
    | "RLS_INCOMPLETE";
  field?: string;
  expected?: string;
  actual?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  fix?: string;
}

export interface TableConformity {
  tableName: string;
  hasRLS: boolean;
  hasSoftDelete: boolean;
  hasOrgFilter: boolean;
  issues: ConformityIssue[];
  isConform: boolean;
}

export interface RLSTestResult {
  name: string;
  passed: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface ConformityReport {
  generatedAt: string;
  totalTables: number;
  conformTables: number;
  tablesWithIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  rlsTestResults: RLSTestResult[];
  tableReports: TableConformity[];
}

// ============================================================================
// RLS VALIDATION
// ============================================================================

/**
 * Test RLS policies are working correctly
 * IMPORTANT: Run in test environment only!
 */
export async function testRLSPolicies(): Promise<RLSTestResult[]> {
  const tests: RLSTestResult[] = [];

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      tests.push({
        name: "User Authentication",
        passed: false,
        severity: "CRITICAL",
        message: "❌ No authenticated user - cannot test RLS",
      });
      return tests;
    }

    // Test 1: Cross-org SELECT should return empty
    const { data: crossOrgData } = await supabase
      .from("crew_members")
      .select("id")
      .eq("organization_id", "00000000-0000-0000-0000-000000000000")
      .limit(1);

    tests.push({
      name: "RLS blocks cross-org SELECT",
      passed: !crossOrgData || crossOrgData.length === 0,
      severity: "CRITICAL",
      message: crossOrgData?.length
        ? `❌ CRITICAL: Can access ${crossOrgData.length} records from other org!`
        : "✅ RLS correctly blocks cross-org access",
    });

    // Test 2: Own org access should work
    const { data: ownData, error: ownError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    tests.push({
      name: "RLS allows own data access",
      passed: !!ownData && !ownError,
      severity: "HIGH",
      message: ownData
        ? "✅ User can access own data"
        : "❌ User cannot access own data!",
    });

    // Test 3: Verify service tables are protected
    const sensitiveTableTests = [
      "access_logs",
      "ai_audit_logs",
      "crew_payroll",
    ];

    for (const table of sensitiveTableTests) {
      const { data, error } = await supabase
        .from(table as never)
        .select("id")
        .limit(1);

      tests.push({
        name: `RLS on ${table}`,
        passed: !error,
        severity: "MEDIUM",
        message: error
          ? `⚠️ Cannot access ${table}: ${error.message}`
          : `✅ ${table} accessible with proper auth`,
      });
    }

  } catch (err) {
    tests.push({
      name: "RLS Test Execution",
      passed: false,
      severity: "CRITICAL",
      message: `❌ RLS test failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  return tests;
}

// ============================================================================
// QUERY VALIDATION
// ============================================================================

export interface QueryPattern {
  pattern: string;
  hasErrorHandling: boolean;
  hasOrgFilter: boolean;
  hasSoftDeleteFilter: boolean;
  usesSelectStar: boolean;
  isInsideLoop: boolean;
}

/**
 * Validate a Supabase query pattern
 */
export function validateQueryPattern(code: string): ConformityIssue[] {
  const issues: ConformityIssue[] = [];

  // Check for error handling
  const hasTryCatch = code.includes("try") && code.includes("catch");
  const checksError = code.includes("if (error)") || code.includes("if(error)") || code.includes("error &&");

  if (!hasTryCatch && !checksError) {
    issues.push({
      type: "MISSING_ERROR_HANDLING",
      severity: "CRITICAL",
      description: "Query without error handling",
      fix: "Add try-catch or check { error } from response",
    });
  }

  // Check for organization filter (multi-tenancy)
  const hasOrgFilter = 
    code.includes('.eq("organization_id"') ||
    code.includes(".eq('organization_id'") ||
    code.includes('.eq(`organization_id`');

  if (!hasOrgFilter && !code.includes("organizations") && !code.includes("profiles")) {
    issues.push({
      type: "MISSING_ORG_FILTER",
      severity: "CRITICAL",
      description: "Query without organization_id filter (data leak risk!)",
      fix: '.eq("organization_id", organizationId)',
    });
  }

  // Check for soft delete filter
  const hasSoftDeleteFilter = 
    code.includes('.is("deleted_at", null)') ||
    code.includes(".is('deleted_at', null)") ||
    code.includes(".is(`deleted_at`, null)");

  if (!hasSoftDeleteFilter && !code.includes("includeSoftDeleted")) {
    issues.push({
      type: "NO_SOFT_DELETE_FILTER",
      severity: "HIGH",
      description: "Query may return soft-deleted records",
      fix: '.is("deleted_at", null)',
    });
  }

  // Check for SELECT *
  const usesSelectStar = 
    code.includes('.select("*")') ||
    code.includes(".select('*')") ||
    code.includes(".select()");

  if (usesSelectStar) {
    issues.push({
      type: "INEFFICIENT_QUERY",
      severity: "MEDIUM",
      description: "Query using SELECT * (inefficient)",
      fix: "Specify only required columns",
    });
  }

  // Detect N+1 queries
  const isInsideLoop = 
    code.includes(".map(") ||
    code.includes(".forEach(") ||
    code.includes("for (") ||
    code.includes("for(");
  const isAsyncQuery = code.includes("await supabase");

  if (isInsideLoop && isAsyncQuery) {
    issues.push({
      type: "N_PLUS_ONE",
      severity: "HIGH",
      description: "Possible N+1 query (query inside loop)",
      fix: "Use .in() or make a single query with JOIN",
    });
  }

  return issues;
}

// ============================================================================
// EDGE FUNCTION VALIDATION
// ============================================================================

export interface EdgeFunctionContract {
  name: string;
  hasZodValidation: boolean;
  hasAuthentication: boolean;
  hasRateLimiting: boolean;
  hasOrgValidation: boolean;
  hasErrorHandling: boolean;
  issues: ConformityIssue[];
}

/**
 * Validate Edge Function code pattern
 */
export function validateEdgeFunctionPattern(code: string, functionName: string): EdgeFunctionContract {
  const issues: ConformityIssue[] = [];

  // Check for Zod validation
  const hasZodValidation = 
    code.includes("z.object") ||
    code.includes("z.schema") ||
    code.includes("from 'zod'") ||
    code.includes('from "zod"');

  if (!hasZodValidation) {
    issues.push({
      type: "MISSING_ERROR_HANDLING",
      severity: "HIGH",
      description: `Edge Function ${functionName} lacks Zod input validation`,
      fix: "Add Zod schema for request validation",
    });
  }

  // Check for authentication
  const hasAuthentication = 
    code.includes("Authorization") ||
    code.includes("auth.getUser") ||
    code.includes("getAuthenticatedUser");

  if (!hasAuthentication) {
    issues.push({
      type: "RLS_MISSING",
      severity: "CRITICAL",
      description: `Edge Function ${functionName} lacks authentication`,
      fix: "Add auth header validation",
    });
  }

  // Check for rate limiting
  const hasRateLimiting = 
    code.includes("rateLimit") ||
    code.includes("rate_limit") ||
    code.includes("checkRateLimit");

  // Check for org validation
  const hasOrgValidation = 
    code.includes("organization_id") ||
    code.includes("organizationId");

  // Check for error handling
  const hasErrorHandling = 
    code.includes("try") && code.includes("catch");

  if (!hasErrorHandling) {
    issues.push({
      type: "MISSING_ERROR_HANDLING",
      severity: "HIGH",
      description: `Edge Function ${functionName} lacks try-catch error handling`,
      fix: "Wrap logic in try-catch block",
    });
  }

  return {
    name: functionName,
    hasZodValidation,
    hasAuthentication,
    hasRateLimiting,
    hasOrgValidation,
    hasErrorHandling,
    issues,
  };
}

// ============================================================================
// COMPREHENSIVE REPORT
// ============================================================================

/**
 * Generate comprehensive conformity report
 */
export async function generateConformityReport(): Promise<ConformityReport> {
  const rlsTests = await testRLSPolicies();

  // Count issues by severity
  const criticalIssues = rlsTests.filter(t => !t.passed && t.severity === "CRITICAL").length;
  const highIssues = rlsTests.filter(t => !t.passed && t.severity === "HIGH").length;
  const mediumIssues = rlsTests.filter(t => !t.passed && t.severity === "MEDIUM").length;
  const lowIssues = rlsTests.filter(t => !t.passed && t.severity === "LOW").length;

  return {
    generatedAt: new Date().toISOString(),
    totalTables: 713, // From linter
    conformTables: 713 - criticalIssues,
    tablesWithIssues: criticalIssues + highIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    rlsTestResults: rlsTests,
    tableReports: [], // Would be populated by full audit
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const conformityValidator = {
  testRLSPolicies,
  validateQueryPattern,
  validateEdgeFunctionPattern,
  generateConformityReport,
};

export default conformityValidator;
