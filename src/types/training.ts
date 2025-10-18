/**
 * Training and HR Integration Type Definitions
 * 
 * Types for managing crew training records and certifications
 */

export type TrainingStatus = "scheduled" | "in_progress" | "completed" | "failed" | "expired";

export type TrainingCategory = 
  | "Safety" 
  | "Technical" 
  | "DP Operations" 
  | "Emergency Response" 
  | "SGSO Compliance"
  | "Equipment Operation"
  | "Other";

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  category: TrainingCategory;
  duration_hours: number;
  validity_days?: number; // Days until retraining required
  required_for_positions?: string[];
  normative_reference?: string;
  content_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CrewTrainingRecord {
  id: string;
  crew_id: string; // References crew_members.id
  training_module_id: string;
  date_completed?: string;
  result?: string; // Pass/Fail, Score, etc
  cert_url?: string; // PDF certificate
  valid_until?: string;
  notes?: string;
  instructor?: string;
  linked_incident_id?: string; // If training was result of incident
  status: TrainingStatus;
  created_at: string;
  updated_at: string;
}

export interface TrainingFormData {
  crew_id: string;
  training_module_id: string;
  date_completed?: string;
  result?: string;
  notes?: string;
  instructor?: string;
  linked_incident_id?: string;
}

export interface TrainingCertificate {
  crew_name: string;
  module_title: string;
  date_completed: string;
  result: string;
  valid_until?: string;
  cert_number: string;
  qr_code_data: string;
  instructor?: string;
}

export interface TrainingStats {
  total_records: number;
  completed: number;
  in_progress: number;
  expired: number;
  compliance_rate: number;
}

export interface CrewTrainingStatus {
  crew_id: string;
  crew_name: string;
  position: string;
  total_trainings: number;
  completed_trainings: number;
  expired_trainings: number;
  upcoming_expirations: number;
  compliance_percentage: number;
}
