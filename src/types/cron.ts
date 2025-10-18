/**
 * Cron Job Type Definitions
 * 
 * Types for managing scheduled tasks and automated jobs
 */

export type CronJobStatus = "OK" | "FAILED" | "RUNNING" | "PENDING";

export interface CronJob {
  id: string;
  name: string;
  description?: string;
  schedule: string; // Cron expression
  last_run?: string; // ISO datetime string
  next_run?: string; // ISO datetime string
  status: CronJobStatus;
  log_url?: string;
  execution_count: number;
  success_count: number;
  failure_count: number;
  average_duration_ms?: number;
  created_at: string;
  updated_at: string;
}

export interface CronJobExecution {
  id: string;
  job_id: string;
  started_at: string;
  completed_at?: string;
  status: CronJobStatus;
  duration_ms?: number;
  error_message?: string;
  log_output?: string;
  created_at: string;
}

export interface CronJobStats {
  total_jobs: number;
  running_jobs: number;
  failed_jobs: number;
  success_rate: number;
  avg_execution_time_ms: number;
}

export interface CronJobLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}
