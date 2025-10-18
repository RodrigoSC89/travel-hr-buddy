/**
 * Cron Job Types
 * Types for monitoring automated system tasks
 */

export type CronJobStatus = "active" | "inactive" | "error";
export type CronJobExecutionStatus = "success" | "failed" | "running" | "cancelled";

export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression (e.g., "0 7 * * *")
  status: CronJobStatus;
  last_run?: string; // ISO timestamp
  next_run?: string; // ISO timestamp
  execution_count: number;
  success_count: number;
  error_count: number;
  average_duration_ms?: number;
  created_at: string;
  updated_at?: string;
}

export interface CronJobExecution {
  id: string;
  job_id: string;
  status: CronJobExecutionStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  error_message?: string;
  logs?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CronJobStats {
  total_jobs: number;
  active_jobs: number;
  inactive_jobs: number;
  error_jobs: number;
  total_executions_today: number;
  success_rate: number;
}

export interface CronJobWithExecutions extends CronJob {
  recent_executions: CronJobExecution[];
}
