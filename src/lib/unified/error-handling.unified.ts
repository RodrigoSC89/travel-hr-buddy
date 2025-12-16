/**
 * UNIFIED Error Handling
 * 
 * Unifica:
 * - src/components/ErrorBoundary.tsx (logError, handleApiError, logErrorOnce, cleanupErrorCache)
 * - src/lib/error-tracker.ts
 * - src/lib/error-tracking/error-tracker.ts
 * - src/lib/monitoring/error-tracker.ts
 * - src/lib/api-manager.ts (APIError)
 * - src/utils/error-handler.ts
 * - src/lib/security/input-validator.ts (ValidationError)
 * - src/lib/offline/circuit-breaker.ts (CircuitOpenError)
 * 
 * Centraliza toda lógica de tratamento de erros.
 */

import { logger } from "./logger.unified";

// ==================== CUSTOM ERROR TYPES ====================

/**
 * API Error with status code and response details
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
    public endpoint?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Validation Error for form/input validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Circuit Breaker Open Error
 */
export class CircuitOpenError extends Error {
  constructor(
    public service: string,
    public retryAfterMs?: number
  ) {
    super(`Circuit breaker open for service: ${service}`);
    this.name = "CircuitOpenError";
  }
}

/**
 * Network Error for connectivity issues
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public isOffline: boolean = false
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Auth Error for authentication/authorization issues
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "UNAUTHORIZED" | "SESSION_EXPIRED" | "INVALID_TOKEN"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// ==================== ERROR CONTEXT ====================

export interface ErrorContext {
  module?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ==================== ERROR TRACKER ====================

interface ErrorRecord {
  error: Error;
  context?: ErrorContext;
  timestamp: number;
  count: number;
}

interface ErrorStats {
  totalErrors: number;
  uniqueErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: Array<{
    message: string;
    type: string;
    timestamp: number;
  }>;
}

class ErrorTracker {
  private errors: Map<string, ErrorRecord> = new Map();
  private readonly maxErrors = 100;
  private readonly cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  private getErrorKey(error: Error): string {
    return `${error.name}:${error.message}`;
  }

  /**
   * Track an error
   */
  track(error: Error, context?: ErrorContext): void {
    const key = this.getErrorKey(error);
    const existing = this.errors.get(key);

    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      if (this.errors.size >= this.maxErrors) {
        const oldestKey = this.getOldestErrorKey();
        if (oldestKey) this.errors.delete(oldestKey);
      }

      this.errors.set(key, {
        error,
        context,
        timestamp: Date.now(),
        count: 1,
      });
    }

    // Log the error
    logger.error(error.message, error, context as Record<string, unknown>);
  }

  /**
   * Get error by key
   */
  get(error: Error): ErrorRecord | undefined {
    return this.errors.get(this.getErrorKey(error));
  }

  /**
   * Check if error was already tracked recently
   */
  wasRecentlyTracked(error: Error): boolean {
    const record = this.get(error);
    if (!record) return false;
    return Date.now() - record.timestamp < this.cacheExpiryMs;
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    const errorsByType: Record<string, number> = {};
    const recentErrors: ErrorStats["recentErrors"] = [];

    for (const [, record] of this.errors) {
      const type = record.error.name;
      errorsByType[type] = (errorsByType[type] || 0) + record.count;

      recentErrors.push({
        message: record.error.message,
        type,
        timestamp: record.timestamp,
      });
    }

    recentErrors.sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalErrors: Array.from(this.errors.values()).reduce((sum, r) => sum + r.count, 0),
      uniqueErrors: this.errors.size,
      errorsByType,
      recentErrors: recentErrors.slice(0, 10),
    };
  }

  /**
   * Get errors by category/type
   */
  getByType(type: string): ErrorRecord[] {
    return Array.from(this.errors.values()).filter(
      (record) => record.error.name === type
    );
  }

  /**
   * Clear all tracked errors
   */
  clear(): void {
    this.errors.clear();
  }

  /**
   * Cleanup expired errors
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.errors) {
      if (now - record.timestamp > this.cacheExpiryMs) {
        this.errors.delete(key);
      }
    }
  }

  private getOldestErrorKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, record] of this.errors) {
      if (record.timestamp < oldestTime) {
        oldestTime = record.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// ==================== HELPER FUNCTIONS ====================

/**
 * Log an error with context
 */
export function logError(error: Error, context?: ErrorContext): void {
  errorTracker.track(error, context);
}

/**
 * Log an error only once (deduplication)
 */
export function logErrorOnce(error: Error, context?: ErrorContext): void {
  if (!errorTracker.wasRecentlyTracked(error)) {
    errorTracker.track(error, context);
  }
}

/**
 * Clean up expired errors from cache
 */
export function cleanupErrorCache(): void {
  errorTracker.cleanup();
}

/**
 * Handle API error and return user-friendly message
 */
export function handleApiError(error: unknown, context?: ErrorContext): {
  message: string;
  code: string;
  canRetry: boolean;
} {
  // Log the error
  if (error instanceof Error) {
    logError(error, context);
  }

  // Handle APIError
  if (error instanceof APIError) {
    const canRetry = error.statusCode >= 500 || error.statusCode === 429;
    
    if (error.statusCode === 401) {
      return {
        message: "Sessão expirada. Por favor, faça login novamente.",
        code: "AUTH_EXPIRED",
        canRetry: false,
      };
    }
    
    if (error.statusCode === 403) {
      return {
        message: "Você não tem permissão para realizar esta ação.",
        code: "FORBIDDEN",
        canRetry: false,
      };
    }
    
    if (error.statusCode === 404) {
      return {
        message: "Recurso não encontrado.",
        code: "NOT_FOUND",
        canRetry: false,
      };
    }
    
    if (error.statusCode === 429) {
      return {
        message: "Muitas requisições. Por favor, aguarde um momento.",
        code: "RATE_LIMITED",
        canRetry: true,
      };
    }
    
    if (error.statusCode >= 500) {
      return {
        message: "Erro no servidor. Por favor, tente novamente.",
        code: "SERVER_ERROR",
        canRetry: true,
      };
    }
    
    return {
      message: error.message || "Erro na requisição.",
      code: "API_ERROR",
      canRetry: canRetry,
    };
  }

  // Handle NetworkError
  if (error instanceof NetworkError) {
    return {
      message: error.isOffline 
        ? "Sem conexão com a internet. Verifique sua conexão."
        : "Erro de conexão. Por favor, tente novamente.",
      code: "NETWORK_ERROR",
      canRetry: true,
    };
  }

  // Handle ValidationError
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: error.code || "VALIDATION_ERROR",
      canRetry: false,
    };
  }

  // Handle CircuitOpenError
  if (error instanceof CircuitOpenError) {
    return {
      message: "Serviço temporariamente indisponível. Tente novamente em breve.",
      code: "SERVICE_UNAVAILABLE",
      canRetry: true,
    };
  }

  // Handle AuthError
  if (error instanceof AuthError) {
    return {
      message: error.message,
      code: error.code,
      canRetry: error.code === "SESSION_EXPIRED",
    };
  }

  // Generic error
  const message = error instanceof Error 
    ? error.message 
    : "Ocorreu um erro inesperado.";

  return {
    message,
    code: "UNKNOWN_ERROR",
    canRetry: false,
  };
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Ocorreu um erro inesperado.";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  if (error instanceof NetworkError) {
    return true;
  }
  if (error instanceof CircuitOpenError) {
    return true;
  }
  return false;
}

/**
 * Create a standardized error from unknown
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new Error("Unknown error occurred");
}

// ==================== REACT HOOK ====================

/**
 * Hook for error tracking in React components
 */
export function useErrorTracking(componentName?: string) {
  return {
    trackError: (error: Error, context?: Omit<ErrorContext, "module">) => {
      errorTracker.track(error, { ...context, module: componentName });
    },
    getStats: () => errorTracker.getStats(),
    clearErrors: () => errorTracker.clear(),
  };
}
