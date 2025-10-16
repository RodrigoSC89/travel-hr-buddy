/**
 * IMCA DP Technical Audit Type Definitions
 * Comprehensive type definitions for Dynamic Positioning vessel audits
 */

// ===========================
// Core Audit Types
// ===========================

export interface IMCAAudit {
  id?: string;
  user_id?: string;
  vessel_name: string;
  dp_class: 'DP1' | 'DP2' | 'DP3';
  location: string;
  audit_objective: string;
  operational_context?: string;
  incident_details?: string;
  environmental_conditions?: string;
  system_status?: string;
  audit_date?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
  score?: number;
  findings?: IMCAAuditResult;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface IMCAAuditResult {
  context: AuditContext;
  standards_compliance: StandardsCompliance;
  modules_evaluation: ModuleEvaluation[];
  non_conformities: NonConformity[];
  action_plan: ActionItem[];
  overall_score: number;
  summary: string;
}

// ===========================
// Audit Context
// ===========================

export interface AuditContext {
  vessel_name: string;
  dp_class: 'DP1' | 'DP2' | 'DP3';
  location: string;
  audit_date: string;
  audit_objective: string;
  operational_context?: string;
  incident_details?: string;
  environmental_conditions?: string;
  system_status?: string;
}

// ===========================
// Standards Compliance
// ===========================

export interface StandardsCompliance {
  standards: StandardEvaluation[];
  overall_compliance_level: 'full' | 'partial' | 'non-compliant';
  summary: string;
}

export interface StandardEvaluation {
  code: string;
  name: string;
  description: string;
  compliance_level: 'compliant' | 'partial' | 'non-compliant';
  findings: string;
}

// IMCA and IMO Standards
export type IMCAStandard =
  | 'IMCA M103'
  | 'IMCA M117'
  | 'IMCA M190'
  | 'IMCA M166'
  | 'IMCA M109'
  | 'IMCA M220'
  | 'IMCA M140'
  | 'MSF 182'
  | 'MTS DP Operations'
  | 'IMO MSC.1/Circ.1580';

// ===========================
// Module Evaluation
// ===========================

export interface ModuleEvaluation {
  module_name: string;
  module_code: ModuleCode;
  score: number;
  status: 'adequate' | 'attention' | 'critical';
  findings: string;
  recommendations: string[];
}

export type ModuleCode =
  | 'dp_control'
  | 'propulsion'
  | 'positioning_sensors'
  | 'network_communications'
  | 'dp_personnel'
  | 'logs_history'
  | 'fmea'
  | 'annual_trials'
  | 'documentation'
  | 'power_management'
  | 'capability_plots'
  | 'operational_planning';

// ===========================
// Non-Conformities
// ===========================

export interface NonConformity {
  id: string;
  title: string;
  description: string;
  risk_level: 'alto' | 'medio' | 'baixo';
  affected_module: ModuleCode;
  related_standards: IMCAStandard[];
  evidence?: string;
}

// ===========================
// Action Plan
// ===========================

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critico' | 'alto' | 'medio' | 'baixo';
  deadline_days: number;
  responsible?: string;
  related_non_conformities: string[];
  status?: 'pending' | 'in_progress' | 'completed';
}

// ===========================
// Service Request/Response Types
// ===========================

export interface GenerateAuditRequest {
  vessel_name: string;
  dp_class: 'DP1' | 'DP2' | 'DP3';
  location: string;
  audit_objective: string;
  operational_context?: string;
  incident_details?: string;
  environmental_conditions?: string;
  system_status?: string;
}

export interface GenerateAuditResponse {
  success: boolean;
  audit?: IMCAAuditResult;
  error?: string;
  message?: string;
}

export interface SaveAuditRequest {
  audit_data: IMCAAudit;
}

export interface SaveAuditResponse {
  success: boolean;
  audit_id?: string;
  error?: string;
  message?: string;
}

// ===========================
// UI State Types
// ===========================

export interface IMCAAuditFormState {
  vessel_name: string;
  dp_class: 'DP1' | 'DP2' | 'DP3' | '';
  location: string;
  audit_objective: string;
  operational_context: string;
  incident_details: string;
  environmental_conditions: string;
  system_status: string;
}

export interface IMCAAuditUIState {
  isGenerating: boolean;
  isSaving: boolean;
  currentStep: 'form' | 'generating' | 'results';
  generatedAudit: IMCAAuditResult | null;
  error: string | null;
}

// ===========================
// Reference Data
// ===========================

export const DP_CLASSES = ['DP1', 'DP2', 'DP3'] as const;

export const IMCA_STANDARDS: Record<IMCAStandard, { name: string; description: string }> = {
  'IMCA M103': {
    name: 'IMCA M103',
    description: 'Guidelines for Design and Operation of DP Vessels',
  },
  'IMCA M117': {
    name: 'IMCA M117',
    description: 'Training and Experience of Key DP Personnel',
  },
  'IMCA M190': {
    name: 'IMCA M190',
    description: 'DP Annual Trials Programmes',
  },
  'IMCA M166': {
    name: 'IMCA M166',
    description: 'Failure Modes and Effects Analysis',
  },
  'IMCA M109': {
    name: 'IMCA M109',
    description: 'DP-related Documentation',
  },
  'IMCA M220': {
    name: 'IMCA M220',
    description: 'Operational Activity Planning',
  },
  'IMCA M140': {
    name: 'IMCA M140',
    description: 'DP Capability Plots',
  },
  'MSF 182': {
    name: 'MSF 182',
    description: 'Safe Operation of DP Offshore Supply Vessels',
  },
  'MTS DP Operations': {
    name: 'MTS DP Operations',
    description: 'Marine Technology Society DP Operations Guidance',
  },
  'IMO MSC.1/Circ.1580': {
    name: 'IMO MSC.1/Circ.1580',
    description: 'IMO Guidelines for DP Systems',
  },
};

export const DP_MODULES: Record<ModuleCode, { name: string; description: string }> = {
  dp_control: {
    name: 'Sistema de Controle DP',
    description: 'DP Control System',
  },
  propulsion: {
    name: 'Sistema de Propulsão',
    description: 'Propulsion System',
  },
  positioning_sensors: {
    name: 'Sensores de Posicionamento',
    description: 'Positioning Sensors',
  },
  network_communications: {
    name: 'Rede e Comunicações',
    description: 'Network and Communications',
  },
  dp_personnel: {
    name: 'Pessoal DP',
    description: 'DP Personnel',
  },
  logs_history: {
    name: 'Logs e Históricos',
    description: 'Logs and History',
  },
  fmea: {
    name: 'FMEA',
    description: 'Failure Modes and Effects Analysis',
  },
  annual_trials: {
    name: 'Testes Anuais',
    description: 'Annual Trials',
  },
  documentation: {
    name: 'Documentação',
    description: 'Documentation',
  },
  power_management: {
    name: 'Gestão de Energia',
    description: 'Power Management System',
  },
  capability_plots: {
    name: 'Capability Plots',
    description: 'Capability Plots',
  },
  operational_planning: {
    name: 'Planejamento Operacional',
    description: 'Operational Planning',
  },
};

// ===========================
// Validation Helpers
// ===========================

export function isValidDPClass(value: string): value is 'DP1' | 'DP2' | 'DP3' {
  return DP_CLASSES.includes(value as typeof DP_CLASSES[number]);
}

export function getRiskLevelColor(risk: string): string {
  switch (risk) {
    case 'alto':
      return 'text-red-600 bg-red-100';
    case 'medio':
      return 'text-orange-600 bg-orange-100';
    case 'baixo':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critico':
      return 'text-red-600 bg-red-100';
    case 'alto':
      return 'text-orange-600 bg-orange-100';
    case 'medio':
      return 'text-blue-600 bg-blue-100';
    case 'baixo':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
