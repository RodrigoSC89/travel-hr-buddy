/**
 * External Audit System Types (ETAPA 32)
 * Types for AI-powered audit simulation, performance dashboard, and evidence management
 */

/**
 * Supported audit types from major certification bodies
 */
export type AuditType = 
  | "Petrobras PEO-DP"
  | "IBAMA SGSO"
  | "IMO ISM Code"
  | "IMO MODU Code"
  | "ISO 9001"
  | "ISO 14001"
  | "ISO 45001"
  | "IMCA";

/**
 * Non-conformity severity levels
 */
export type NonConformitySeverity = "critical" | "major" | "minor" | "observation";

/**
 * Evidence validation status
 */
export type EvidenceStatus = "submitted" | "validated" | "rejected";

/**
 * Non-conformity details
 */
export interface NonConformity {
  clause: string;
  description: string;
  severity: NonConformitySeverity;
  recommendation: string;
}

/**
 * Conformity item
 */
export interface Conformity {
  clause: string;
  description: string;
}

/**
 * Norm score result
 */
export interface NormScore {
  norm: string;
  score: number;
  maxScore: number;
}

/**
 * Audit simulation result
 */
export interface AuditSimulation {
  id: string;
  organization_id: string;
  vessel_id?: string;
  audit_type: AuditType;
  execution_date: string;
  conformities: Conformity[];
  non_conformities: NonConformity[];
  scores: NormScore[];
  technical_report: string;
  action_plan: string[];
  created_at: string;
  created_by: string;
}

/**
 * Vessel performance metrics
 */
export interface VesselPerformanceMetrics {
  id: string;
  organization_id: string;
  vessel_id: string;
  metric_date: string;
  compliance_percentage: number;
  failure_frequency_by_system: Record<string, number>;
  mttr_hours: number;
  ai_actions_vs_human: {
    ai: number;
    human: number;
  };
  training_completions: number;
  created_at: string;
}

/**
 * Audit norm template
 */
export interface AuditNormTemplate {
  id: string;
  norm_name: string;
  clause_number: string;
  clause_title: string;
  clause_description: string;
  category: string;
  required_evidence_type: string;
  created_at: string;
}

/**
 * Compliance evidence
 */
export interface ComplianceEvidence {
  id: string;
  organization_id: string;
  vessel_id?: string;
  norm_template_id: string;
  file_url?: string;
  file_name?: string;
  description?: string;
  upload_date: string;
  uploaded_by: string;
  validation_status: EvidenceStatus;
  validated_by?: string;
  validation_date?: string;
  validation_notes?: string;
  created_at: string;
}

/**
 * Request to create audit simulation
 */
export interface CreateAuditSimulationRequest {
  vessel_id?: string;
  audit_type: AuditType;
}

/**
 * Request to upload evidence
 */
export interface UploadEvidenceRequest {
  vessel_id?: string;
  norm_template_id: string;
  file: File;
  description?: string;
}

/**
 * Request to validate evidence
 */
export interface ValidateEvidenceRequest {
  evidence_id: string;
  validation_status: EvidenceStatus;
  validation_notes?: string;
}

/**
 * Performance dashboard filters
 */
export interface PerformanceDashboardFilters {
  vessel_id?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Evidence management filters
 */
export interface EvidenceFilters {
  vessel_id?: string;
  norm_name?: string;
  validation_status?: EvidenceStatus;
  search?: string;
}

/**
 * Missing evidence item
 */
export interface MissingEvidence {
  norm_template_id: string;
  norm_name: string;
  clause_number: string;
  clause_title: string;
  required_evidence_type: string;
}
