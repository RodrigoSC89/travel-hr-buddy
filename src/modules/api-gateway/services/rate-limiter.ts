/**
 * PATCH 100.0 - Rate Limiting Service
 */

import { RateLimitConfig } from "../types";

class RateLimiterService {
  private limits: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default rate limits
    this.setLimit("/api/auth", 100, 60000); // 100 requests per minute
    this.setLimit("/api/documents", 50, 60000); // 50 requests per minute
    this.setLimit("/api/analytics", 30, 60000); // 30 requests per minute
  }

  setLimit(endpoint: string, maxRequests: number, windowMs: number) {
    this.limits.set(endpoint, {
      endpoint,
      maxRequests,
      windowMs,
      currentCount: 0,
      resetAt: new Date(Date.now() + windowMs)
    });
  }

  checkLimit(endpoint: string): { allowed: boolean; remaining: number; resetAt: Date } {
    const config = this.limits.get(endpoint);
    
    if (!config) {
      // No limit configured, allow by default
      return {
        allowed: true,
        remaining: 999,
        resetAt: new Date(Date.now() + 60000)
      };
    }

    // Reset if window has passed
    if (Date.now() >= config.resetAt.getTime()) {
      config.currentCount = 0;
      config.resetAt = new Date(Date.now() + config.windowMs);
    }

    const allowed = config.currentCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - config.currentCount);

    if (allowed) {
      config.currentCount++;
    }

    return {
      allowed,
      remaining,
      resetAt: config.resetAt
    };
  }

  getAllLimits(): RateLimitConfig[] {
    return Array.from(this.limits.values());
  }

  resetLimit(endpoint: string) {
    const config = this.limits.get(endpoint);
    if (config) {
      config.currentCount = 0;
      config.resetAt = new Date(Date.now() + config.windowMs);
    }
  }
}

export const rateLimiter = new RateLimiterService();
