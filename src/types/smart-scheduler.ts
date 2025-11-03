// PATCH 597: Smart Scheduler + Task Engine Types

export type TaskModule = 'PSC' | 'MLC' | 'LSA' | 'OVID';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'quarterly' | null;

export interface ScheduledTask {
  id: string;
  title: string;
  description: string | null;
  module: TaskModule;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  assigned_to: string | null;
  vessel_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  metadata: Record<string, any>;
  ai_generated: boolean;
  recurrence_pattern: RecurrencePattern;
  parent_task_id: string | null;
}

export interface TaskFilter {
  module?: TaskModule;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  vessel_id?: string;
  date_from?: string;
  date_to?: string;
  ai_generated?: boolean;
}

export interface TaskGenerationRequest {
  module: TaskModule;
  vessel_id?: string;
  context?: string;
  historical_data?: any[];
}

export interface TaskGenerationResponse {
  tasks: Partial<ScheduledTask>[];
  confidence: number;
  reasoning: string;
}
