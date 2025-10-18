// Types for ETAPA 32: External Audit System

export type AuditType =
  | "Petrobras-PEO-DP"
  | "IBAMA-SGSO"
  | "IMO-ISM"
  | "IMO-MODU"
  | "ISO-9001"
  | "ISO-14001"
  | "ISO-45001"
  | "IMCA";

export type AuditStatus = "completed" | "in_progress" | "failed";

export type ValidationStatus = "submitted" | "validated" | "rejected";

export type Severity = "critical" | "major" | "minor";

export interface Conformity {
  clause: string;
  description: string;
  status: string;
}

export interface NonConformity {
  clause: string;
  description: string;
  severity: Severity;
  recommendation: string;
}

export interface ActionPlan {
  priority: number;
  action: string;
  deadline: string;
  responsible: string;
}

export interface AuditSimulation {
  id: string;
  vessel_id: string;
  audit_type: AuditType;
  audit_date: string;
  conformities: Conformity[];
  non_conformities: NonConformity[];
  scores_by_norm: Record<string, number>;
  technical_report: string;
  action_plan: ActionPlan[];
  pdf_url?: string;
  status: AuditStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VesselPerformanceMetrics {
  id: string;
  vessel_id: string;
  calculation_date: string;
  compliance_percentage: number;
  failure_frequency: Record<string, number>;
  mttr_hours: number;
  ai_vs_human_actions: {
    ai: number;
    human: number;
  };
  training_completion_rate: number;
  recent_audits_count: number;
  recent_incidents_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuditNormTemplate {
  id: string;
  norm_name: string;
  clause_number: string;
  clause_title: string;
  clause_description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceEvidence {
  id: string;
  vessel_id: string;
  norm_template_id: string;
  evidence_title: string;
  evidence_description?: string;
  file_path?: string;
  file_url?: string;
  validation_status: ValidationStatus;
  validator_notes?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined fields
  norm_template?: AuditNormTemplate;
}

// UI State interfaces
export interface AuditSimulationRequest {
  vesselId: string;
  auditType: AuditType;
}

export interface AuditSimulationResponse {
  success: boolean;
  audit: AuditSimulation;
  result: {
    conformities: Conformity[];
    nonConformities: NonConformity[];
    scoresByNorm: Record<string, number>;
    technicalReport: string;
    actionPlan: ActionPlan[];
  };
}

export interface MissingEvidence {
  norm_name: string;
  clause_number: string;
  clause_title: string;
  clause_description?: string;
  category?: string;
}

export interface PerformanceCalculation {
  compliance_percentage: number;
  failure_frequency: Record<string, number>;
  mttr_hours: number;
  ai_vs_human_actions: {
    ai: number;
    human: number;
  };
  training_completion_rate: number;
  recent_audits_count: number;
  recent_incidents_count: number;
}

// Chart data interfaces
export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: number;
}

export interface BarChartData {
  system: string;
  failures: number;
}

export interface KPICardData {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ComponentType;
}

// Filter interfaces
export interface EvidenceFilters {
  norm?: string;
  status?: ValidationStatus;
  search?: string;
}

export interface AuditFilters {
  auditType?: AuditType;
  dateRange?: {
    start: string;
    end: string;
  };
}
