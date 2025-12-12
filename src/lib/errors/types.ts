/**
 * FASE 3.3 - Error Types
 * Tipos e interfaces para error handling
 */

export type ErrorSeverity = "info" | "warning" | "error" | "critical";
export type ErrorCategory = 
  | "network" 
  | "validation" 
  | "authentication" 
  | "authorization"
  | "runtime" 
  | "api"
  | "unknown";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  tenantId?: string;
  route?: string;
  timestamp?: number;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  isRetryable: boolean;
  retryCount?: number;
}

export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  recent: ErrorLog[];
  lastError?: ErrorLog;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  sentryDsn?: string;
  environment: "development" | "staging" | "production";
  sampleRate: number;
  maxErrors: number;
  enableConsoleLogging: boolean;
}

/**
 * Custom Error Classes
 */

export class AppError extends Error {
  constructor(
    message: string,
    public severity: ErrorSeverity = "error",
    public category: ErrorCategory = "unknown",
    public context?: ErrorContext,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "error", "network", context, true);
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "warning", "validation", context, false);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "error", "authentication", context, false);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "error", "authorization", context, false);
    this.name = "AuthorizationError";
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    public statusCode?: number,
    context?: ErrorContext
  ) {
    const isRetryable = statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false;
    super(message, "error", "api", context, isRetryable);
    this.name = "APIError";
  }
}
