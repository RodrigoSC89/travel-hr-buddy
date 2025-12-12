/**
 * PATCH 652 - Rate Limiter
 * Client-side rate limiting to prevent abuse
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();

  /**
   * Check if request is allowed
   */
  check(key: string, config: RateLimitConfig): { allowed: boolean; message?: string; retryAfter?: number } {
    const now = Date.now();
    const record = this.limits.get(key);

    // No record or window expired - allow request
    if (!record || now >= record.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        message: config.message || `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      };
    }

    // Increment count
    record.count++;
    this.limits.set(key, record);
    return { allowed: true };
  }

  /**
   * Reset limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Get current limit status
   */
  getStatus(key: string): { remaining: number; resetTime: number } | null {
    const record = this.limits.get(key);
    if (!record) return null;

    return {
      remaining: Math.max(0, record.resetTime - Date.now()),
      resetTime: record.resetTime
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many login attempts. Please try again in 1 minute."
  },
  SIGNUP: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many signup attempts. Please try again later."
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset attempts. Please try again later."
  },

  // API calls
  API_CALL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "API rate limit exceeded. Please slow down."
  },

  // File operations
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "File upload limit exceeded. Please try again later."
  },
  FILE_DOWNLOAD: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "File download limit exceeded. Please try again later."
  },

  // Search and queries
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Search rate limit exceeded. Please slow down."
  },

  // Export operations
  EXPORT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Export limit exceeded. Please try again later."
  },
} as const;

/**
 * Rate limit middleware function
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  config: RateLimitConfig,
  keyGenerator: (...args: Parameters<T>) => string = () => "default"
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const result = rateLimiter.check(key, config);

    if (!result.allowed) {
      throw new Error(result.message || "Rate limit exceeded");
    }

    return fn(...args);
  }) as T;
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  return {
    check: () => rateLimiter.check(key, config),
    reset: () => rateLimiter.reset(key),
    getStatus: () => rateLimiter.getStatus(key),
  };
}

// Export for debugging
if (typeof window !== "undefined") {
  (window as any).__NAUTILUS_RATE_LIMITER__ = rateLimiter;
}
