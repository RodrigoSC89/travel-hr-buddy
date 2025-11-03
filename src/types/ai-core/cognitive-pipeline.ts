/**
 * PATCH 548 - Cognitive Pipeline Types
 * Type definitions for AI cognitive processing pipelines
 */

export type PipelineStage = 
  | "input"
  | "preprocessing"
  | "analysis"
  | "reasoning"
  | "decision"
  | "action"
  | "feedback";

export type PipelineStatus = 
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface CognitivePipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStageConfig[];
  status: PipelineStatus;
  currentStage?: PipelineStage;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageConfig {
  stage: PipelineStage;
  name: string;
  processor: string;
  config: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  input: unknown;
  output?: unknown;
  error?: string;
  stages: StageExecution[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export interface StageExecution {
  stage: PipelineStage;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface ProcessingContext {
  pipelineId: string;
  executionId: string;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
}
