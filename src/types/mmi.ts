/**
 * MMI (Manutenção e Manutenibilidade Industrial) Type Definitions
 * 
 * Types for the MMI Business Intelligence Dashboard and v1.1.0 AI features
 */

/**
 * Failure by system data point
 */
export interface FailureBySystem {
  system: string;
  count: number;
}

/**
 * Jobs by vessel data point
 */
export interface JobsByVessel {
  vessel: string;
  jobs: number;
}

/**
 * Postponement status data point
 */
export interface Postponement {
  status: string;
  count: number;
}

/**
 * Complete MMI BI Summary response
 */
export interface MMIBISummary {
  failuresBySystem: FailureBySystem[];
  jobsByVessel: JobsByVessel[];
  postponements: Postponement[];
}

/**
 * MMI v1.1.0 - AI Recommendation with Historical Learning
 */
export interface AIRecommendation {
  technical_action: string;
  component: string;
  deadline: string;
  requires_work_order: boolean;
  reasoning: string;
  similar_cases: SimilarCase[];
}

/**
 * Similar historical case for AI learning
 */
export interface SimilarCase {
  job_id: string;
  similarity: number;
  action: string;
  outcome: string;
  date?: string;
}

/**
 * Enhanced Job with vector embeddings support
 */
export interface MMIJob {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component_name: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
  can_postpone?: boolean;
  ai_recommendation?: AIRecommendation;
  created_at?: string;
  updated_at?: string;
  embedding?: number[];
}

/**
 * Job history entry for learning
 */
export interface JobHistory {
  id: number;
  job_id: string;
  action: string;
  ai_recommendation?: string;
  outcome: string;
  created_at: string;
  embedding?: number[];
}

/**
 * MMI System - Ship systems catalog
 */
export interface MMISystem {
  id: string;
  vessel_id?: string;
  system_name: string;
  system_type: "propulsion" | "electrical" | "navigation" | "safety" | "auxiliary";
  criticality: "critical" | "high" | "medium" | "low";
  description?: string;
  compliance_metadata?: {
    normam?: string[];
    solas?: string[];
    marpol?: string[];
    inspection_required?: boolean;
    next_inspection?: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * MMI Component - Components with hourometer tracking
 */
export interface MMIComponent {
  id: string;
  system_id?: string;
  component_name: string;
  current_hours: number;
  maintenance_interval_hours: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  is_operational: boolean;
  component_type?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  installation_date?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * MMI Work Order (OS)
 */
export interface MMIOS {
  id: string;
  job_id?: string;
  forecast_id?: string;
  os_number?: string;
  status: "open" | "in_progress" | "completed" | "cancelled" | "pendente" | "executado" | "atrasado";
  assigned_to?: string;
  start_date?: string;
  completion_date?: string;
  work_description?: string;
  descricao?: string;
  parts_used?: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  labor_hours?: number;
  parts_cost?: number;
  labor_cost?: number;
  total_cost?: number;
  effectiveness_rating?: number;
  feedback?: string;
  notes?: string;
  executed_at?: string;
  technician_comment?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * MMI Hourometer Log
 */
export interface MMIHourometerLog {
  id: string;
  component_id: string;
  previous_hours: number;
  new_hours: number;
  hours_added?: number;
  recorded_by: string;
  source: "automated" | "manual" | "sensor";
  notes?: string;
  created_at: string;
}

/**
 * Enhanced MMI Job with full schema support
 */
export interface MMIJobEnhanced {
  id: string;
  component_id?: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "postponed";
  priority: "critical" | "high" | "medium" | "low";
  due_date?: string;
  completed_date?: string;
  embedding?: number[];
  suggestion_ia?: string;
  can_postpone: boolean;
  postponement_count: number;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // Relations
  component?: MMIComponent;
  ai_recommendation?: AIRecommendation;
}

/**
 * MMI History - Historical maintenance records
 */
export interface MMIHistory {
  id: string;
  vessel_id?: string;
  system_name: string;
  task_description: string;
  executed_at?: string;
  status: "executado" | "pendente" | "atrasado";
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  vessel?: {
    id: string;
    name: string;
  };
}

/**
 * MMI Task - Automatically generated maintenance tasks from forecasts
 */
export interface MMITask {
  id: string;
  title: string;
  description: string;
  forecast_date?: string;
  vessel_id?: string;
  system_name?: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  assigned_to?: string;
  created_by?: string;
  priority: "low" | "medium" | "high" | "critical";
  ai_reasoning?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  vessel?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
}

/**
 * AI Forecast Response with technical details
 */
export interface AIForecast {
  next_intervention: string;
  reasoning: string;
  impact: string;
  priority: "low" | "medium" | "high" | "critical";
  suggested_date: string;
  hourometer_current: number;
  maintenance_history: Array<{
    date: string;
    action: string;
  }>;
}
