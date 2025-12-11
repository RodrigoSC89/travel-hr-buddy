/**
 * FASE 3.3 - Retry Logic
 * Sistema robusto de retry com exponential backoff
 */

import { RetryOptions } from './types';

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  // Exponential backoff: delay = initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt);
  
  // Add jitter (randomness) to prevent thundering herd
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  // Network errors
  if (!error.response && error.request) {
    return true;
  }
  
  // HTTP status codes
  if (error.response?.status) {
    return retryableStatuses.includes(error.response.status);
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true;
  }
  
  return false;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      if (!isRetryableError(error, config.retryableStatuses || [])) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries - 1) {
        break;
      }
      
      // Calculate delay
      const delay = calculateDelay(
        attempt,
        config.initialDelayMs,
        config.maxDelayMs,
        config.backoffMultiplier
      );
      
      // Call onRetry callback
      if (config.onRetry) {
        config.onRetry(attempt + 1, lastError);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError || new Error('All retries failed');
}

/**
 * Retry with custom condition
 */
export async function retryWithCondition<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check custom condition
      if (!shouldRetry(lastError, attempt)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  
  throw lastError || new Error('All retries failed');
}

/**
 * Safe async wrapper with retry
 */
export async function safeAsyncWithRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await retryWithBackoff(operation, options);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryOptions: Partial<RetryOptions> = {}
): Promise<T> {
  return retryWithBackoff(
    () => withTimeout(operation(), timeoutMs),
    retryOptions
  );
}
