/**
 * Advanced Rate Limiter with Sliding Window Algorithm
 * Production-grade rate limiting for frontend
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstLimit?: number;
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface RequestRecord {
  timestamp: number;
  weight: number;
}

class SlidingWindowRateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      burstLimit: config.burstLimit ?? Math.ceil(config.maxRequests * 0.3),
      identifier: config.identifier ?? 'default'
    };
  }

  /**
   * Check if request is allowed
   */
  check(key: string, weight: number = 1): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests
    const records = this.requests.get(key) ?? [];
    
    // Filter to current window
    const validRecords = records.filter(r => r.timestamp > windowStart);
    
    // Calculate total weight in window
    const totalWeight = validRecords.reduce((sum, r) => sum + r.weight, 0);
    
    // Check burst (last second)
    const burstStart = now - 1000;
    const burstWeight = validRecords
      .filter(r => r.timestamp > burstStart)
      .reduce((sum, r) => sum + r.weight, 0);
    
    const allowed = totalWeight + weight <= this.config.maxRequests &&
                    burstWeight + weight <= this.config.burstLimit;
    
    const resetAt = validRecords.length > 0 
      ? validRecords[0].timestamp + this.config.windowMs
      : now + this.config.windowMs;
    
    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - totalWeight - (allowed ? weight : 0)),
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil((resetAt - now) / 1000)
    };
  }

  /**
   * Record a request
   */
  record(key: string, weight: number = 1): RateLimitResult {
    const result = this.check(key, weight);
    
    if (result.allowed) {
      const now = Date.now();
      const windowStart = now - this.config.windowMs;
      
      const records = this.requests.get(key) ?? [];
      const validRecords = records.filter(r => r.timestamp > windowStart);
      
      validRecords.push({ timestamp: now, weight });
      this.requests.set(key, validRecords);
      
      // Update remaining after recording
      result.remaining = Math.max(0, result.remaining - weight);
    }
    
    return result;
  }

  /**
   * Reset rate limit for key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Get current usage stats
   */
  getStats(key: string): { used: number; limit: number; percentage: number } {
    const result = this.check(key, 0);
    const used = this.config.maxRequests - result.remaining;
    
    return {
      used,
      limit: this.config.maxRequests,
      percentage: Math.round((used / this.config.maxRequests) * 100)
    };
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // Authentication: 5 attempts per 15 minutes
  auth: new SlidingWindowRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    burstLimit: 2,
    identifier: 'auth'
  }),
  
  // AI requests: 20 per minute
  ai: new SlidingWindowRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 1000,
    burstLimit: 5,
    identifier: 'ai'
  }),
  
  // API requests: 100 per minute
  api: new SlidingWindowRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000,
    burstLimit: 20,
    identifier: 'api'
  }),
  
  // Form submissions: 10 per minute
  form: new SlidingWindowRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 1000,
    burstLimit: 3,
    identifier: 'form'
  }),
  
  // File uploads: 20 per hour
  upload: new SlidingWindowRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
    burstLimit: 5,
    identifier: 'upload'
  })
};

/**
 * Create custom rate limiter
 */
export function createRateLimiter(config: RateLimitConfig): SlidingWindowRateLimiter {
  return new SlidingWindowRateLimiter(config);
}

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  limiter: SlidingWindowRateLimiter,
  keyFn: (...args: Parameters<T>) => string = () => 'default'
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const result = limiter.record(key);
    
    if (!result.allowed) {
      throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter} seconds.`);
    }
    
    return fn(...args);
  }) as T;
}

export { SlidingWindowRateLimiter };
