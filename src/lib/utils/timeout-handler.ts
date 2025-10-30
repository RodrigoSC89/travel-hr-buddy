/**
 * Timeout Handler Utilities
 * PATCH 621: Add timeout protection to async operations
 */

export interface TimeoutOptions {
  timeout?: number;
  signal?: AbortSignal;
  onTimeout?: () => void;
}

export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Wrap a promise with timeout protection
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = "Operation timed out"
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Create an AbortController with automatic timeout
 */
export function createTimeoutController(timeoutMs: number = 10000): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return { controller, timeoutId };
}

/**
 * Fetch with timeout protection
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const { controller, timeoutId } = createTimeoutController(timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Async operation with retry and timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeout = 10000,
    retryDelay = 1000,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeout, `Operation timed out on attempt ${attempt + 1}`);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("Operation failed after all retries");
}

/**
 * Debounced promise executor with timeout
 */
export function createDebouncedTimeout<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300,
  timeout: number = 10000
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let abortController: AbortController | null = null;

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel previous call
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await withTimeout(
            fn(...args),
            timeout,
            "Debounced operation timed out"
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}
