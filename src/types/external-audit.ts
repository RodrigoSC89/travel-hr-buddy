// ETAPA 32: External Audit System Types

export type AuditType = 
  | 'Petrobras_PEODP' 
  | 'IBAMA_SGSO' 
  | 'IMO_ISM' 
  | 'IMO_MODU'
  | 'ISO_9001' 
  | 'ISO_14001' 
  | 'ISO_45001' 
  | 'IMCA';

export type NonConformitySeverity = 'critical' | 'major' | 'minor';
export type EvidenceStatus = 'submitted' | 'validated' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type NormType = 
  | 'ISO_9001' 
  | 'ISO_14001' 
  | 'ISO_45001'
  | 'ISM_CODE' 
  | 'ISPS_CODE' 
  | 'MODU_CODE'
  | 'IBAMA' 
  | 'Petrobras' 
  | 'IMCA';

// Audit Simulation Types
export interface AuditConformity {
  clause: string;
  description: string;
  evidence: string;
}

export interface AuditNonConformity {
  clause: string;
  description: string;
  severity: NonConformitySeverity;
  recommendation: string;
}

export interface AuditActionItem {
  priority: number;
  action: string;
  deadline: string;
  responsible: string;
}

export interface AuditSimulation {
  id: string;
  vessel_id: string;
  vessel_name: string;
  audit_type: AuditType;
  audit_date: string;
  overall_score: number;
  
  conformities: AuditConformity[];
  non_conformities: AuditNonConformity[];
  scores_by_norm: Record<string, number>;
  technical_report: string;
  action_plan: AuditActionItem[];
  
  ai_model: string;
  processing_time_ms: number;
  
  vessel_data: any;
  incidents_analyzed: number;
  practices_analyzed: number;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditSimulateRequest {
  vesselId: string;
  vesselName: string;
  auditType: AuditType;
  auditObjective?: string;
}

// Performance Dashboard Types
export interface VesselPerformanceMetrics {
  id: string;
  vessel_id: string;
  vessel_name: string;
  metric_date: string;
  
  compliance_percentage: number;
  failure_frequency: number;
  mttr_hours: number;
  ai_actions: number;
  human_actions: number;
  training_completions: number;
  
  failures_by_system: Record<string, number>;
  performance_score: number;
  risk_level: RiskLevel;
  
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetricsRequest {
  vesselId: string;
  startDate: string;
  endDate: string;
}

// Evidence Management Types
export interface ComplianceEvidence {
  id: string;
  vessel_id: string;
  vessel_name: string;
  
  norm_type: NormType;
  clause_number: string;
  clause_description: string;
  
  evidence_title: string;
  evidence_description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  
  status: EvidenceStatus;
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditNormTemplate {
  id: string;
  norm_type: NormType;
  clause_number: string;
  clause_title: string;
  clause_description: string;
  requirements: string[];
  category?: string;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface MissingEvidence {
  norm_type: NormType;
  clause_number: string;
  clause_title: string;
  clause_description: string;
  is_mandatory: boolean;
}

export interface EvidenceUploadRequest {
  vesselId: string;
  vesselName: string;
  normType: NormType;
  clauseNumber: string;
  clauseDescription: string;
  evidenceTitle: string;
  evidenceDescription?: string;
  file?: File;
}

// Audit Type Display Names
export const AUDIT_TYPE_NAMES: Record<AuditType, string> = {
  'Petrobras_PEODP': 'Petrobras PEO-DP',
  'IBAMA_SGSO': 'IBAMA SGSO',
  'IMO_ISM': 'IMO ISM Code',
  'IMO_MODU': 'IMO MODU Code',
  'ISO_9001': 'ISO 9001',
  'ISO_14001': 'ISO 14001',
  'ISO_45001': 'ISO 45001',
  'IMCA': 'IMCA Guidelines'
};

// Norm Type Display Names
export const NORM_TYPE_NAMES: Record<NormType, string> = {
  'ISO_9001': 'ISO 9001 - Quality Management',
  'ISO_14001': 'ISO 14001 - Environmental Management',
  'ISO_45001': 'ISO 45001 - Occupational Health & Safety',
  'ISM_CODE': 'ISM Code - International Safety Management',
  'ISPS_CODE': 'ISPS Code - International Ship & Port Security',
  'MODU_CODE': 'MODU Code - Mobile Offshore Drilling Units',
  'IBAMA': 'IBAMA - Brazilian Environmental Regulations',
  'Petrobras': 'Petrobras - PEO-DP Requirements',
  'IMCA': 'IMCA - International Marine Contractors'
};

// Severity Colors
export const SEVERITY_COLORS: Record<NonConformitySeverity, string> = {
  critical: 'destructive',
  major: 'warning',
  minor: 'secondary'
};

// Risk Level Colors
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive'
};
