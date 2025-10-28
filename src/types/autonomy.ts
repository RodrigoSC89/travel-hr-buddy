/**
 * PATCH 348: Mission Control v2 - Autonomy Layer Type Definitions
 * Types for autonomous task management and decision engine
 */

export type TaskType = 'maintenance' | 'logistics' | 'satellite' | 'mission';
export type TaskStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type RuleType = 'threshold' | 'pattern' | 'prediction' | 'schedule';
export type DecisionType = 'create' | 'approve' | 'reject' | 'execute' | 'complete';
export type DecisionMaker = 'system' | 'user' | 'ai';
export type EntityType = 'mission' | 'equipment' | 'satellite' | 'global';

export interface AutonomousTask {
  id: string;
  task_type: TaskType;
  task_name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  autonomy_level: number; // 1-5
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  mission_id?: string;
  equipment_id?: string;
  satellite_id?: string;
  decision_logic: Record<string, unknown>;
  decision_confidence?: number; // 0-1
  predicted_outcome?: Record<string, unknown>;
  actual_outcome?: Record<string, unknown>;
  execution_plan?: ExecutionStep[];
  execution_logs?: ExecutionLog[];
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionStep {
  step_number: number;
  action: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  result?: Record<string, unknown>;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface AutonomyRule {
  id: string;
  name: string;
  description?: string;
  rule_type: RuleType;
  task_type: TaskType;
  conditions: RuleConditions;
  actions: RuleActions;
  autonomy_level: number;
  is_enabled: boolean;
  priority: number;
  requires_approval: boolean;
  success_count: number;
  failure_count: number;
  last_triggered_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RuleConditions {
  metric?: string;
  operator?: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between';
  value?: number | string;
  event?: string;
  duration_minutes?: number;
  pattern?: string;
  additional?: Record<string, unknown>;
}

export interface RuleActions {
  action: string;
  priority: TaskPriority;
  parameters?: Record<string, unknown>;
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
  entity_type: EntityType;
  entity_id?: string;
  is_enabled: boolean;
  autonomy_level: number; // Max allowed level
  allowed_task_types: TaskType[];
  require_approval_threshold: number;
  auto_approve_low_risk: boolean;
  safety_constraints?: SafetyConstraints;
  notification_channels?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyConstraints {
  max_concurrent_tasks?: number;
  blackout_periods?: BlackoutPeriod[];
  restricted_actions?: string[];
  approval_required_for?: string[];
  emergency_stop_enabled?: boolean;
}

export interface BlackoutPeriod {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  days?: number[]; // 0-6 (Sunday-Saturday)
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
