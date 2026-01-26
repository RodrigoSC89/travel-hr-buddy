/**
 * Centralized Error Handling Utilities - PATCH 901.1
 * 
 * AUDIT FIX: Provides type-safe error handling for catch blocks
 * Replace `catch (error: any)` with `catch (error: unknown)` pattern
 */

import { logger } from '@/lib/logger';

/**
 * Type guard to check if value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Extract error message from unknown error type
 * Use this in catch blocks instead of (error: any).message
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * Extract full error details for logging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
  code?: string | number;
} {
  if (isError(error)) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: (error as Error & { code?: string | number }).code,
    };
  }
  
  return {
    message: getErrorMessage(error),
  };
}

/**
 * Convert unknown error to Error instance
 */
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }
  return new Error(getErrorMessage(error));
}

/**
 * Check if error is a specific type (e.g., rate limit)
 */
export function isRateLimitError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('429') || 
         message.includes('rate limit') || 
         message.includes('too many requests');
}

/**
 * Check if error is a network/connectivity error
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') || 
         message.includes('fetch') ||
         message.includes('timeout') ||
         message.includes('aborted') ||
         message.includes('connection');
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('401') || 
         message.includes('403') ||
         message.includes('unauthorized') ||
         message.includes('forbidden') ||
         message.includes('authentication');
}

/**
 * Safe error handler for async functions
 * Usage: const [data, error] = await safeAsync(myAsyncFn());
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, toError(error)];
  }
}

/**
 * Log and rethrow error with additional context
 */
export function logAndRethrow(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
): never {
  logger.error(context, error, additionalInfo);
  throw toError(error);
}

/**
 * Create a typed error with code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromUnknown(error: unknown, defaultCode = 'UNKNOWN_ERROR'): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError(getErrorMessage(error), defaultCode);
  }
}

/**
 * Standard error codes for the application
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Data errors
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  OPERATION_CANCELLED: 'OPERATION_CANCELLED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
