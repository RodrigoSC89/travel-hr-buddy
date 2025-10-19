// External Audit System TypeScript Types
// Types for AI-powered audit simulation, performance metrics, and evidence management

export interface AuditSimulation {
  id: string;
  vessel_id: string;
  audit_type: AuditType;
  audit_date: string;
  overall_score: number;
  conformities: Conformity[];
  non_conformities: NonConformity[];
  scores_by_norm: Record<string, number>;
  technical_report?: string;
  action_plan: ActionItem[];
  ai_model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  conducted_by?: string;
  status: AuditStatus;
  created_at: string;
  updated_at: string;
}

export type AuditType =
  | "petrobras"
  | "ibama"
  | "imo_ism"
  | "imo_modu"
  | "iso_9001"
  | "iso_14001"
  | "iso_45001"
  | "imca";

export type AuditStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Conformity {
  clause: string;
  description: string;
  evidence?: string;
}

export interface NonConformity {
  clause: string;
  description: string;
  severity: "critical" | "major" | "minor";
  recommendation: string;
}

export interface ActionItem {
  priority: number;
  item: string;
  deadline: string;
  responsible?: string;
}

export interface VesselPerformanceMetrics {
  id: string;
  vessel_id: string;
  metric_date: string;
  compliance_percentage: number;
  failure_count: number;
  failures_by_system: Record<string, number>;
  mttr_hours?: number;
  ai_actions_count: number;
  human_actions_count: number;
  training_completions: number;
  calculated_at: string;
  data_sources: string[];
  created_at: string;
  updated_at: string;
}

export interface ComplianceEvidence {
  id: string;
  vessel_id: string;
  norm_template_id?: string;
  norm_type: NormType;
  clause_number: string;
  clause_title: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  status: EvidenceStatus;
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export type NormType =
  | "iso_9001"
  | "iso_14001"
  | "iso_45001"
  | "ism"
  | "isps"
  | "modu"
  | "ibama"
  | "petrobras"
  | "imca";

export type EvidenceStatus = "submitted" | "validated" | "rejected" | "pending";

export interface AuditNormTemplate {
  id: string;
  norm_type: NormType;
  clause_number: string;
  clause_title: string;
  clause_description?: string;
  requirements: string[];
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

// Form interfaces for creating new records
export interface CreateAuditSimulation {
  vessel_id: string;
  audit_type: AuditType;
}

export interface CreateComplianceEvidence {
  vessel_id: string;
  norm_template_id?: string;
  norm_type: NormType;
  clause_number: string;
  clause_title: string;
  file?: File;
}

export interface UpdateComplianceEvidence {
  status?: EvidenceStatus;
  validation_notes?: string;
}

// Utility types for UI components
export interface AuditTypeOption {
  value: AuditType;
  label: string;
  description: string;
}

export interface NormTypeOption {
  value: NormType;
  label: string;
}

// Constants for audit types
export const AUDIT_TYPE_OPTIONS: AuditTypeOption[] = [
  {
    value: "petrobras",
    label: "Petrobras PEO-DP",
    description: "DP Operations Excellence Program",
  },
  {
    value: "ibama",
    label: "IBAMA SGSO",
    description: "Safety and Environmental Management System",
  },
  {
    value: "imo_ism",
    label: "IMO ISM Code",
    description: "International Safety Management",
  },
  {
    value: "imo_modu",
    label: "IMO MODU Code",
    description: "Mobile Offshore Drilling Units",
  },
  {
    value: "iso_9001",
    label: "ISO 9001:2015",
    description: "Quality Management System",
  },
  {
    value: "iso_14001",
    label: "ISO 14001:2015",
    description: "Environmental Management System",
  },
  {
    value: "iso_45001",
    label: "ISO 45001:2018",
    description: "Occupational Health and Safety Management",
  },
  {
    value: "imca",
    label: "IMCA Guidelines",
    description: "International Marine Contractors Association",
  },
];

// Constants for norm types
export const NORM_TYPE_OPTIONS: NormTypeOption[] = [
  { value: "iso_9001", label: "ISO 9001" },
  { value: "iso_14001", label: "ISO 14001" },
  { value: "iso_45001", label: "ISO 45001" },
  { value: "ism", label: "ISM Code" },
  { value: "isps", label: "ISPS Code" },
  { value: "modu", label: "MODU Code" },
  { value: "ibama", label: "IBAMA" },
  { value: "petrobras", label: "Petrobras" },
  { value: "imca", label: "IMCA" },
];

// Helper functions
export const getSeverityColor = (severity: NonConformity["severity"]): string => {
  switch (severity) {
  case "critical":
    return "text-red-600 bg-red-50";
  case "major":
    return "text-orange-600 bg-orange-50";
  case "minor":
    return "text-yellow-600 bg-yellow-50";
  default:
    return "text-gray-600 bg-gray-50";
  }
};

export const getStatusColor = (status: EvidenceStatus): string => {
  switch (status) {
  case "validated":
    return "text-green-600 bg-green-50";
  case "submitted":
    return "text-blue-600 bg-blue-50";
  case "rejected":
    return "text-red-600 bg-red-50";
  case "pending":
    return "text-yellow-600 bg-yellow-50";
  default:
    return "text-gray-600 bg-gray-50";
  }
};

export const formatAuditType = (auditType: AuditType): string => {
  const option = AUDIT_TYPE_OPTIONS.find((opt) => opt.value === auditType);
  return option ? option.label : auditType;
};

export const formatNormType = (normType: NormType): string => {
  const option = NORM_TYPE_OPTIONS.find((opt) => opt.value === normType);
  return option ? option.label : normType;
};
