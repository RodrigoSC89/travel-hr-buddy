/**
 * SGSO Audit Utilities
 * Helper functions for audit calculations and operations
 */

import { AuditResult, AuditSummary, SeverityLevel } from "./types";

/**
 * Calculate audit summary from results
 */
export function calculateSummary(results: AuditResult[]): AuditSummary {
  return {
    compliant: results.filter((r) => r.status === "compliant").length,
    nonCompliant: results.filter((r) => r.status === "non_compliant").length,
    partial: results.filter((r) => r.status === "partial").length,
    notApplicable: results.filter((r) => r.status === "not_applicable").length,
    total: results.length,
  };
}

/**
 * Calculate overall severity based on non-compliance ratio
 */
export function calculateOverallSeverity(results: AuditResult[]): SeverityLevel {
  const total = results.length;
  if (total === 0) return "low";

  const nonCompliances = results.filter(
    (r) => r.status === "non_compliant"
  ).length;
  const ratio = nonCompliances / total;

  if (ratio > 0.5) return "critical";
  if (ratio > 0.3) return "high";
  if (ratio > 0.1) return "medium";
  return "low";
}

/**
 * Get non-compliant results
 */
export function getNonCompliances(results: AuditResult[]): AuditResult[] {
  return results.filter((r) => r.status === "non_compliant");
}

/**
 * Calculate compliance percentage
 */
export function calculateCompliancePercentage(results: AuditResult[]): number {
  const applicableResults = results.filter(
    (r) => r.status !== "not_applicable"
  );
  if (applicableResults.length === 0) return 100;

  const compliant = applicableResults.filter(
    (r) => r.status === "compliant"
  ).length;
  return Math.round((compliant / applicableResults.length) * 100);
}

/**
 * Status display configuration
 */
export const statusConfig = {
  compliant: {
    label: "Conforme",
    color: "bg-success/10 text-success",
    icon: "CheckCircle",
  },
  non_compliant: {
    label: "Não Conforme",
    color: "bg-destructive/10 text-destructive",
    icon: "XCircle",
  },
  partial: {
    label: "Parcialmente Conforme",
    color: "bg-warning/10 text-warning",
    icon: "AlertTriangle",
  },
  not_applicable: {
    label: "Não Aplicável",
    color: "bg-muted text-muted-foreground",
    icon: "FileText",
  },
} as const;

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  return statusConfig[status as keyof typeof statusConfig]?.label || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  return (
    statusConfig[status as keyof typeof statusConfig]?.color ||
    "bg-muted text-muted-foreground"
  );
}
