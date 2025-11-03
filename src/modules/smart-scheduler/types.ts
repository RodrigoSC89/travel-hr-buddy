/**
 * PATCH 597 - Smart Scheduler Types
 */

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "overdue";
export type TaskSource = "manual" | "ai_generated" | "inspection" | "watchdog" | "scheduled";

export interface ScheduledTask {
  id: string;
  module: string;
  relatedEntity?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date;
  createdBy?: string;
  assignedTo?: string;
  aiGenerated: boolean;
  status: TaskStatus;
  source: TaskSource;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface TaskRecommendation {
  title: string;
  description: string;
  priority: TaskPriority;
  suggestedDueDate: Date;
  justification: string;
  riskScore: number;
  module: string;
  relatedEntity?: string;
  tags?: string[];
}

export interface SchedulerConfig {
  autoGenerateTasks: boolean;
  notifyAssignees: boolean;
  integrateWatchdog: boolean;
  enablePredictive: boolean;
  defaultPriority: TaskPriority;
  defaultDueDays: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority: TaskPriority;
  status: TaskStatus;
  task: ScheduledTask;
}

export interface ModuleInspectionContext {
  moduleName: string;
  vesselId?: string;
  lastInspection?: Date;
  score?: number;
  findings?: string[];
  history?: any[];
}
