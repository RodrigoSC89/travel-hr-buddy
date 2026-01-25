/**
 * SGSO Audit Types
 * Type definitions for SGSO audit system
 */

export interface AuditArea {
  id: string;
  name: string;
  criteria: string[];
}

export interface AuditResult {
  area: string;
  criterion: string;
  status: AuditStatus;
  comments: string;
  evidence: string[];
}

export type AuditStatus = "compliant" | "non_compliant" | "partial" | "not_applicable";

export type AuditType = "internal" | "external" | "certification";

export interface AuditSummary {
  compliant: number;
  nonCompliant: number;
  partial: number;
  notApplicable: number;
  total: number;
}

export type SeverityLevel = "low" | "medium" | "high" | "critical";
