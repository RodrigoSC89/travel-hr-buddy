/**
 * DEPRECATED: Use @/lib/unified instead
 * This file re-exports from the unified module for backward compatibility
 */

export {
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  errorTracker,
  handleApiError,
  getErrorMessage,
  isRetryableError,
  normalizeError,
  logError,
  logErrorOnce,
} from "@/lib/unified/error-handling.unified";

// Legacy ErrorHandler class - re-implemented using unified module
import { errorTracker, handleApiError, getErrorMessage, normalizeError, logError } from "@/lib/unified/error-handling.unified";
import { toast } from "@/hooks/use-toast";

export interface AppError {
  message: string;
  code?: string;
  severity: "info" | "warning" | "error" | "critical";
  details?: unknown;
}

export class ErrorHandler {
  static handle(error: AppError | Error | unknown, showToastNotification = true) {
    const normalized = normalizeError(error);
    logError(normalized);
    
    if (showToastNotification) {
      toast({
        title: normalized.name || "Erro",
        description: getErrorMessage(normalized),
        variant: "destructive",
      });
    }
    
    return {
      message: getErrorMessage(normalized),
      severity: "error" as const,
      details: error,
    };
  }

  static handleSupabaseError(error: unknown, context?: string) {
    return this.handle(error, true);
  }

  static handleNetworkError(error: unknown, context?: string) {
    return this.handle(error, true);
  }

  static handleValidationError(message: string, details?: unknown) {
    return this.handle({ message, severity: "warning", details }, true);
  }

  static async wrap<T>(fn: () => Promise<T>, context?: string): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleSupabaseError(error, context);
      return null;
    }
  }
}
