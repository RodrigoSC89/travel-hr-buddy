/**
 * Retry Handler with Exponential Backoff
 * Provides robust retry logic for API calls
 */

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  
  // Add jitter (random delay) to prevent thundering herd
  const jitter = Math.random() * 0.3 * exponentialDelay;
  
  return exponentialDelay + jitter;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.message.includes('NetworkError') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')) {
    return true;
  }
  
  // Timeout errors
  if (error.message.includes('timeout') || 
      error.message.includes('ETIMEDOUT')) {
    return true;
  }
  
  // Rate limit errors (should retry after delay)
  if (error.message.includes('429') || 
      error.message.includes('Too Many Requests')) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.message.includes('500') || 
      error.message.includes('502') || 
      error.message.includes('503') || 
      error.message.includes('504')) {
    return true;
  }
  
  return false;
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === retryConfig.maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error in retry handler');
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), config);
  }) as T;
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests to failing services
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private halfOpenRequests: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should move from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        console.log('Circuit breaker: Moving to HALF_OPEN state');
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      
      // Handle success
      if (this.state === CircuitState.HALF_OPEN) {
        this.successCount++;
        
        if (this.successCount >= this.halfOpenRequests) {
          console.log('Circuit breaker: Moving to CLOSED state');
          this.state = CircuitState.CLOSED;
          this.failureCount = 0;
        }
      } else if (this.state === CircuitState.CLOSED) {
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      // Handle failure
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.threshold) {
        console.log('Circuit breaker: Moving to OPEN state');
        this.state = CircuitState.OPEN;
      }
      
      throw error;
    }
  }

  getState(): string {
    return CircuitState[this.state];
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}
