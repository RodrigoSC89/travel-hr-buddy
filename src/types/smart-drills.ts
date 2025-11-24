// PATCH 599: Smart Drills Types

export type DrillType = 
  | "fire"
  | "man_overboard"
  | "abandon_ship"
  | "collision"
  | "flooding"
  | "medical_emergency"
  | "pollution"
  | "security_breach"
  | "other";

export type DrillStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type ActionStatus = "pending" | "in_progress" | "completed";
export type ActionPriority = "low" | "medium" | "high" | "critical";

export interface SmartDrill {
  id: string;
  title: string;
  description: string | null;
  drill_type: DrillType;
  scenario: string;
  objectives: string[];
  vessel_id: string | null;
  scheduled_date: string;
  duration_minutes: number;
  status: DrillStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  ai_generated: boolean;
  metadata: Record<string, unknown>;
  recurrence_pattern: string | null;
}

export interface DrillResponse {
  id: string;
  drill_id: string;
  crew_member_id: string;
  response_time_seconds: number | null;
  actions_taken: string[];
  score: number | null;
  feedback: string | null;
  observations: string | null;
  created_at: string;
}

export interface DrillEvaluation {
  id: string;
  drill_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  corrective_plan: string | null;
  ai_analysis: Record<string, unknown>;
  evaluator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DrillCorrectiveAction {
  id: string;
  drill_id: string;
  evaluation_id: string;
  action: string;
  priority: ActionPriority;
  responsible_person: string | null;
  due_date: string | null;
  status: ActionStatus;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface DrillScenarioRequest {
  drill_type: DrillType;
  vessel_id?: string;
  context?: string;
  difficulty?: "basic" | "intermediate" | "advanced";
}

export interface DrillScenarioResponse {
  title: string;
  description: string;
  scenario: string;
  objectives: string[];
  duration_minutes: number;
  roles_involved: string[];
  equipment_needed: string[];
  success_criteria: string[];
}

export interface DrillEvaluationRequest {
  drill_id: string;
  responses: DrillResponse[];
  observations?: string;
}

export interface DrillEvaluationResponse {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  corrective_plan: string;
  detailed_analysis: Record<string, unknown>;
}

export interface DrillStatistics {
  total_drills: number;
  completed_drills: number;
  scheduled_drills: number;
  average_score: number;
  drills_by_type: Record<DrillType, number>;
}
