/**
 * PATCH 348: Mission Control v2 - Autonomy Layer Type Definitions
 * PATCH 661: Types aligned with Supabase schema
 */

import type { Json } from "@/integrations/supabase/types";

export type TaskType = "maintenance" | "logistics" | "satellite" | "mission" | string;
export type TaskStatus = "pending" | "approved" | "executing" | "completed" | "failed" | "cancelled" | string;
export type TaskPriority = "low" | "medium" | "high" | "critical" | string;
export type RuleType = "threshold" | "pattern" | "prediction" | "schedule" | "condition" | string;
export type DecisionType = "create" | "approve" | "reject" | "execute" | "complete";
export type DecisionMaker = "system" | "user" | "ai";
export type EntityType = "mission" | "equipment" | "satellite" | "global";

/**
 * Autonomous Task - Aligned with Supabase schema
 */
export interface AutonomousTask {
  id: string;
  name: string;
  task_name?: string | null;
  task_type: string;
  description?: string | null;
  status: string;
  priority: string;
  actions?: Json | null;
  trigger_conditions?: Json | null;
  result?: Json | null;
  error_message?: string | null;
  mission_id?: string | null;
  equipment_id?: string | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  organization_id?: string | null;
  created_by?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
  // Optional extended fields for UI compatibility
  autonomy_level?: number;
  requires_approval?: boolean;
  approved_by?: string;
  approved_at?: string;
  satellite_id?: string;
  decision_logic?: Record<string, unknown>;
  decision_confidence?: number;
  predicted_outcome?: Record<string, unknown>;
  actual_outcome?: Record<string, unknown>;
  execution_plan?: ExecutionStep[];
  execution_logs?: ExecutionLog[];
}

export interface ExecutionStep {
  step_number: number;
  action: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  started_at?: string;
  completed_at?: string;
  result?: Record<string, unknown>;
}

export interface ExecutionLog {
  timestamp: string;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Autonomy Rule - Aligned with Supabase schema
 */
export interface AutonomyRule {
  id: string;
  name: string;
  description?: string | null;
  rule_type: string;
  conditions: Json;
  actions: Json;
  priority: number;
  is_active?: boolean | null;
  organization_id?: string | null;
  created_by?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
  // Optional extended fields for UI compatibility
  task_type?: string;
  autonomy_level?: number;
  is_enabled?: boolean;
  requires_approval?: boolean;
  success_count?: number;
  failure_count?: number;
  last_triggered_at?: string;
}

export interface RuleConditions {
  metric?: string;
  operator?: "greater_than" | "less_than" | "equals" | "not_equals" | "between";
  value?: number | string;
  event?: string;
  duration_minutes?: number;
  pattern?: string;
  additional?: Json;
}

export interface RuleActions {
  action?: string;
  priority?: TaskPriority;
  parameters?: Json;
  notify?: string[];
}

export interface AutonomyDecisionLog {
  id: string;
  task_id?: string;
  rule_id?: string;
  decision_type: DecisionType;
  decision_maker: DecisionMaker;
  decision_data: Record<string, unknown>;
  reasoning?: string;
  confidence_score?: number;
  user_id?: string;
  timestamp: string;
}

export interface AutonomyConfig {
  id: string;
  config_key: string;
  config_value: Json;
  description?: string | null;
  organization_id?: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields for UI compatibility
  entity_type?: EntityType;
  entity_id?: string;
  is_enabled?: boolean;
  autonomy_level?: number;
  allowed_task_types?: TaskType[];
  require_approval_threshold?: number;
  auto_approve_low_risk?: boolean;
  safety_constraints?: SafetyConstraints;
  notification_channels?: string[];
  created_by?: string;
}

export interface SafetyConstraints {
  max_concurrent_tasks?: number;
  blackout_periods?: BlackoutPeriod[];
  restricted_actions?: string[];
  approval_required_for?: string[];
  emergency_stop_enabled?: boolean;
}

export interface BlackoutPeriod {
  start_time: string;
  end_time: string;
  days?: number[];
  reason?: string;
}

export interface AutonomyMetrics {
  id: string;
  metric_date: string;
  tasks_created: number;
  tasks_completed: number;
  tasks_failed: number;
  tasks_requiring_approval: number;
  tasks_auto_approved: number;
  avg_completion_time_minutes?: number;
  avg_confidence_score?: number;
  success_rate?: number;
  created_at: string;
}

export interface AutonomyDashboardStats {
  active_tasks: number;
  pending_approval: number;
  completed_today: number;
  success_rate: number;
  avg_confidence: number;
  recent_tasks: AutonomousTask[];
  recent_decisions: AutonomyDecisionLog[];
}

export interface CreateTaskRequest {
  task_type: TaskType;
  task_name: string;
  description?: string;
  decision_logic: Record<string, unknown>;
  autonomy_level?: number;
  mission_id?: string;
  equipment_id?: string;
}

export interface ApproveTaskRequest {
  task_id: string;
  approved: boolean;
  notes?: string;
}
