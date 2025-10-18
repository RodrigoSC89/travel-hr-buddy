/**
 * Training Module Types
 * Types for the micro training system based on audit gaps
 */

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number // Index of correct answer (0, 1, or 2)
}

export interface TrainingModule {
  id: string
  title: string
  gap_detected: string
  norm_reference: string
  training_content: string
  quiz: QuizQuestion[]
  vessel_id?: string
  audit_id?: string
  status: "active" | "archived" | "draft"
  created_by?: string
  created_at: string
  updated_at: string
}

export interface TrainingCompletion {
  id: string
  training_module_id: string
  user_id: string
  vessel_id?: string
  completed_at: string
  quiz_score: number
  quiz_answers: number[] // Array of selected answer indices
  passed: boolean
  notes?: string
  created_at: string
}

export interface GenerateTrainingModuleRequest {
  auditId?: string
  gapDetected: string
  normReference: string
  vessel?: string
}

export interface GenerateTrainingModuleResponse {
  success: boolean
  module: {
    id?: string
    title: string
    gap_detected: string
    norm_reference: string
    training_content: string
    quiz: QuizQuestion[]
  }
}

/**
 * Audit Export Types
 * Types for external audit bundle export (IBAMA, Petrobras, etc.)
 */

export interface AuditLog {
  id: string
  title: string
  navio: string
  norma: string
  item_auditado: string
  resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável"
  comentarios: string
  data: string
  score?: number
  user_id: string
}

export interface AuditBundleMetadata {
  vessel_name: string
  vessel_id?: string
  report_generated_at: string
  generated_by: string
  norms_covered: string[]
  date_range: {
    start: string
    end: string
  }
}

export interface AuditBundleSummary {
  total_audits: number
  compliance_rate: string
  breakdown: {
    conforme: number
    nao_conforme: number
    parcialmente_conforme: number
    nao_aplicavel: number
  }
}

export interface AuditBundle {
  metadata: AuditBundleMetadata
  summary: AuditBundleSummary
  audits_by_norm: Record<string, AuditLog[]>
  audit_logs: AuditLog[]
  training_modules: TrainingModule[]
  non_conformities: AuditLog[]
}

export interface ExportAuditBundleRequest {
  vesselId?: string
  vesselName: string
  norms: string[]
  startDate?: string
  endDate?: string
  format?: "json" | "pdf"
}

export interface ExportAuditBundleResponse {
  success: boolean
  bundle?: AuditBundle
  format?: string
  message?: string
}

/**
 * Crew Training Records Types (Stage 31)
 * Types for tracking crew training, certifications, and compliance
 */

export type TrainingCategory = 
  | "DP Operations"
  | "Emergency Response"
  | "Fire Fighting"
  | "Blackout Recovery"
  | "MOB Response"
  | "SGSO Compliance"
  | "Technical";

export interface CrewTrainingRecord {
  id: string
  crew_id: string
  training_module_id: string
  date_completed: string
  result: string
  cert_url?: string // PDF certificate URL
  valid_until?: string
  category?: TrainingCategory
  incident_id?: string // Link to technical failure that motivated training
  created_at: string
  updated_at?: string
}

export interface TrainingModuleExtended extends TrainingModule {
  category?: TrainingCategory
  duration_hours?: number
  expiration_months?: number
}

export interface CrewTrainingStats {
  crew_id: string
  crew_name?: string
  total_trainings: number
  active_certifications: number
  expired_certifications: number
  upcoming_expirations: number
  compliance_rate: number
}
