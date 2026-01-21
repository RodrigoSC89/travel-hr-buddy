/**
 * AI Rate Limiter - PATCH v26
 * Production-grade rate limiting for AI requests
 * Prevents cost overruns and ensures fair usage
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxTokensPerMinute: number;
  maxTokensPerHour: number;
  burstAllowance: number; // Extra requests allowed in burst
}

interface RateLimitState {
  requestsThisMinute: number;
  requestsThisHour: number;
  tokensThisMinute: number;
  tokensThisHour: number;
  minuteStart: number;
  hourStart: number;
  burstUsed: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 20,
  maxRequestsPerHour: 200,
  maxTokensPerMinute: 50000,
  maxTokensPerHour: 500000,
  burstAllowance: 10,
};

const TIER_CONFIGS: Record<string, RateLimitConfig> = {
  free: {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 60,
    maxTokensPerMinute: 20000,
    maxTokensPerHour: 100000,
    burstAllowance: 5,
  },
  pro: {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 500,
    maxTokensPerMinute: 100000,
    maxTokensPerHour: 1000000,
    burstAllowance: 20,
  },
  enterprise: {
    maxRequestsPerMinute: 100,
    maxRequestsPerHour: 2000,
    maxTokensPerMinute: 500000,
    maxTokensPerHour: 5000000,
    burstAllowance: 50,
  },
};

class AIRateLimiter {
  private states = new Map<string, RateLimitState>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
    this.config = config;
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed for user
   */
  checkLimit(userId: string): {
    allowed: boolean;
    reason?: string;
    retryAfterMs?: number;
    remaining: {
      requestsMinute: number;
      requestsHour: number;
      tokensMinute: number;
      tokensHour: number;
    };
  } {
    const state = this.getOrCreateState(userId);
    const now = Date.now();

    // Reset minute counter if needed
    if (now - state.minuteStart > 60000) {
      state.requestsThisMinute = 0;
      state.tokensThisMinute = 0;
      state.minuteStart = now;
      state.burstUsed = 0;
    }

    // Reset hour counter if needed
    if (now - state.hourStart > 3600000) {
      state.requestsThisHour = 0;
      state.tokensThisHour = 0;
      state.hourStart = now;
    }

    const remaining = {
      requestsMinute: Math.max(0, this.config.maxRequestsPerMinute - state.requestsThisMinute),
      requestsHour: Math.max(0, this.config.maxRequestsPerHour - state.requestsThisHour),
      tokensMinute: Math.max(0, this.config.maxTokensPerMinute - state.tokensThisMinute),
      tokensHour: Math.max(0, this.config.maxTokensPerHour - state.tokensThisHour),
    };

    // Check minute limit
    if (state.requestsThisMinute >= this.config.maxRequestsPerMinute) {
      // Check burst allowance
      if (state.burstUsed < this.config.burstAllowance) {
        // Allow burst
        return { allowed: true, remaining };
      }
      return {
        allowed: false,
        reason: 'Rate limit exceeded (per minute)',
        retryAfterMs: 60000 - (now - state.minuteStart),
        remaining,
      };
    }

    // Check hour limit
    if (state.requestsThisHour >= this.config.maxRequestsPerHour) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded (per hour)',
        retryAfterMs: 3600000 - (now - state.hourStart),
        remaining,
      };
    }

    return { allowed: true, remaining };
  }

  /**
   * Record a request
   */
  recordRequest(userId: string, tokensUsed: number = 0): void {
    const state = this.getOrCreateState(userId);
    const now = Date.now();

    // Reset if needed
    if (now - state.minuteStart > 60000) {
      state.requestsThisMinute = 0;
      state.tokensThisMinute = 0;
      state.minuteStart = now;
      state.burstUsed = 0;
    }

    if (now - state.hourStart > 3600000) {
      state.requestsThisHour = 0;
      state.tokensThisHour = 0;
      state.hourStart = now;
    }

    // Check if using burst
    if (state.requestsThisMinute >= this.config.maxRequestsPerMinute) {
      state.burstUsed++;
    }

    state.requestsThisMinute++;
    state.requestsThisHour++;
    state.tokensThisMinute += tokensUsed;
    state.tokensThisHour += tokensUsed;
  }

  /**
   * Get user's current usage stats
   */
  getUsageStats(userId: string): {
    requestsThisMinute: number;
    requestsThisHour: number;
    tokensThisMinute: number;
    tokensThisHour: number;
    limits: RateLimitConfig;
    utilizationPercent: number;
  } {
    const state = this.getOrCreateState(userId);
    const utilizationPercent = Math.max(
      (state.requestsThisMinute / this.config.maxRequestsPerMinute) * 100,
      (state.requestsThisHour / this.config.maxRequestsPerHour) * 100,
      (state.tokensThisMinute / this.config.maxTokensPerMinute) * 100,
      (state.tokensThisHour / this.config.maxTokensPerHour) * 100
    );

    return {
      requestsThisMinute: state.requestsThisMinute,
      requestsThisHour: state.requestsThisHour,
      tokensThisMinute: state.tokensThisMinute,
      tokensThisHour: state.tokensThisHour,
      limits: this.config,
      utilizationPercent: Math.round(utilizationPercent),
    };
  }

  /**
   * Update config (e.g., for tier change)
   */
  setConfig(tier: 'free' | 'pro' | 'enterprise' | RateLimitConfig): void {
    if (typeof tier === 'string') {
      this.config = TIER_CONFIGS[tier] || DEFAULT_CONFIG;
    } else {
      this.config = tier;
    }
  }

  /**
   * Reset user's rate limit state
   */
  resetUser(userId: string): void {
    this.states.delete(userId);
  }

  private getOrCreateState(userId: string): RateLimitState {
    if (!this.states.has(userId)) {
      const now = Date.now();
      this.states.set(userId, {
        requestsThisMinute: 0,
        requestsThisHour: 0,
        tokensThisMinute: 0,
        tokensThisHour: 0,
        minuteStart: now,
        hourStart: now,
        burstUsed: 0,
      });
    }
    return this.states.get(userId)!;
  }

  private cleanup(): void {
    const now = Date.now();
    const oldHourThreshold = now - 3600000 * 2; // 2 hours

    for (const [userId, state] of this.states) {
      if (state.hourStart < oldHourThreshold) {
        this.states.delete(userId);
      }
    }
  }
}

// Singleton instance
export const aiRateLimiter = new AIRateLimiter();

// Hook for React components
import { useState, useCallback } from 'react';

export function useAIRateLimit(userId: string) {
  const [isLimited, setIsLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const checkAndRecord = useCallback((tokensUsed: number = 0): boolean => {
    const check = aiRateLimiter.checkLimit(userId);
    
    if (!check.allowed) {
      setIsLimited(true);
      setRetryAfter(check.retryAfterMs || null);
      return false;
    }

    aiRateLimiter.recordRequest(userId, tokensUsed);
    setIsLimited(false);
    setRetryAfter(null);
    return true;
  }, [userId]);

  const getStats = useCallback(() => {
    return aiRateLimiter.getUsageStats(userId);
  }, [userId]);

  return {
    isLimited,
    retryAfter,
    checkAndRecord,
    getStats,
  };
}

export { TIER_CONFIGS, DEFAULT_CONFIG };
export type { RateLimitConfig, RateLimitState };
