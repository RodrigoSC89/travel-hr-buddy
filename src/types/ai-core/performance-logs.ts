/**
 * PATCH 548 - Performance Logs Types
 * Type definitions for AI performance monitoring and logging
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";
export type LogCategory = "performance" | "error" | "decision" | "learning" | "system";

export interface PerformanceLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  module: string;
  operation: string;
  duration?: number;
  success: boolean;
  error?: ErrorDetails;
  metrics: PerformanceMetrics;
  context: LogContext;
  metadata: Record<string, unknown>;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsed?: number;
  cpuUsage?: number;
  tokensUsed?: number;
  apiCalls?: number;
  cacheHits?: number;
  cacheMisses?: number;
  throughput?: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  recoverable: boolean;
  retryCount?: number;
  relatedErrors?: string[];
}

export interface LogContext {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  requestId?: string;
  agentId?: string;
  pipelineId?: string;
  environment: "development" | "staging" | "production";
}

export interface PerformanceSummary {
  period: {
    start: string;
    end: string;
  };
  totalOperations: number;
  successRate: number;
  averageExecutionTime: number;
  peakExecutionTime: number;
  totalErrors: number;
  criticalErrors: number;
  resourceUsage: ResourceUsage;
  topBottlenecks: Bottleneck[];
}

export interface ResourceUsage {
  avgMemoryMB: number;
  peakMemoryMB: number;
  avgCpuPercent: number;
  peakCpuPercent: number;
  totalTokens: number;
  totalApiCalls: number;
}

export interface Bottleneck {
  operation: string;
  occurrences: number;
  avgDuration: number;
  impact: "low" | "medium" | "high" | "critical";
  suggestion: string;
}

export interface AIOperationMetrics {
  operationType: string;
  moduleId: string;
  executionTimeMs: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  cpuUsagePercent?: number;
  memoryUsedMb?: number;
  modelVersion?: string;
  inputSizeBytes?: number;
  outputSizeBytes?: number;
}
