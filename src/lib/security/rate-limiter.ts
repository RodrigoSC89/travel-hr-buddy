/**
 * Rate Limiter Implementation
 * Provides client-side rate limiting for API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();

  /**
   * Check if request is allowed under rate limit
   */
  public checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    // No existing record or reset time passed
    if (!record || now >= record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if under limit
    if (record.count < config.maxRequests) {
      record.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get time until rate limit resets
   */
  public getResetTime(key: string): number {
    const record = this.requests.get(key);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  /**
   * Clear rate limit for a key
   */
  public clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  public clearAll(): void {
    this.requests.clear();
  }

  /**
   * Cleanup expired records
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup expired records every minute
setInterval(() => rateLimiter.cleanup(), 60000);

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  API_CALL: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 calls per minute
  AI_CHAT: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 messages per minute
  FILE_UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
};
