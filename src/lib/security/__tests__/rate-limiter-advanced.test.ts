/**
 * Rate Limiter Advanced - Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  SlidingWindowRateLimiter, 
  rateLimiters, 
  createRateLimiter,
  withRateLimit 
} from "@/lib/security/rate-limiter-advanced";

describe("SlidingWindowRateLimiter", () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new SlidingWindowRateLimiter({
      maxRequests: 5,
      windowMs: 60000,
      burstLimit: 2,
    });
  });

  describe("check", () => {
    it("should allow requests within limit", () => {
      const result = limiter.check("user1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should calculate remaining correctly", () => {
      limiter.record("user1");
      limiter.record("user1");
      
      const result = limiter.check("user1");
      expect(result.remaining).toBe(2);
    });

    it("should set resetAt correctly", () => {
      const now = Date.now();
      limiter.record("user1");
      
      const result = limiter.check("user1");
      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + 60000);
    });
  });

  describe("record", () => {
    it("should record request and update stats", () => {
      const result = limiter.record("user1");
      expect(result.allowed).toBe(true);
      
      const stats = limiter.getStats("user1");
      expect(stats.used).toBe(1);
    });

    it("should block when limit exceeded", () => {
      for (let i = 0; i < 5; i++) {
        limiter.record("user1");
      }
      
      const result = limiter.record("user1");
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe("burst limit", () => {
    it("should enforce burst limit", () => {
      // Burst limit is 2 - try 3 in quick succession
      limiter.record("user1");
      limiter.record("user1");
      
      const result = limiter.record("user1");
      expect(result.allowed).toBe(false);
    });

    it("should allow more after burst window passes", () => {
      limiter.record("user1");
      limiter.record("user1");
      
      // Wait for burst window to pass (1 second)
      vi.advanceTimersByTime(1100);
      
      const result = limiter.record("user1");
      expect(result.allowed).toBe(true);
    });
  });

  describe("sliding window", () => {
    it("should allow requests after window expires", () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.record("user1");
        vi.advanceTimersByTime(1100); // Wait between to avoid burst
      }
      
      // Should be blocked
      expect(limiter.check("user1").allowed).toBe(false);
      
      // Advance past window
      vi.advanceTimersByTime(60000);
      
      // Should be allowed again
      expect(limiter.check("user1").allowed).toBe(true);
    });
  });

  describe("reset", () => {
    it("should reset rate limit for key", () => {
      for (let i = 0; i < 5; i++) {
        limiter.record("user1");
        vi.advanceTimersByTime(1100);
      }
      
      limiter.reset("user1");
      
      const result = limiter.record("user1");
      expect(result.allowed).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all rate limits", () => {
      limiter.record("user1");
      limiter.record("user2");
      
      limiter.clear();
      
      expect(limiter.getStats("user1").used).toBe(0);
      expect(limiter.getStats("user2").used).toBe(0);
    });
  });

  describe("getStats", () => {
    it("should return correct usage statistics", () => {
      limiter.record("user1");
      vi.advanceTimersByTime(1100);
      limiter.record("user1");
      
      const stats = limiter.getStats("user1");
      expect(stats.used).toBe(2);
      expect(stats.limit).toBe(5);
      expect(stats.percentage).toBe(40);
    });
  });

  describe("weighted requests", () => {
    it("should handle weighted requests", () => {
      const result = limiter.record("user1", 3); // Weight of 3
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      
      const result2 = limiter.record("user1", 3); // Would exceed limit
      expect(result2.allowed).toBe(false);
    });
  });
});

describe("Pre-configured Rate Limiters", () => {
  it("should have auth limiter configured", () => {
    expect(rateLimiters.auth).toBeDefined();
  });

  it("should have ai limiter configured", () => {
    expect(rateLimiters.ai).toBeDefined();
  });

  it("should have api limiter configured", () => {
    expect(rateLimiters.api).toBeDefined();
  });

  it("should have form limiter configured", () => {
    expect(rateLimiters.form).toBeDefined();
  });

  it("should have upload limiter configured", () => {
    expect(rateLimiters.upload).toBeDefined();
  });
});

describe("createRateLimiter", () => {
  it("should create custom rate limiter", () => {
    const customLimiter = createRateLimiter({
      maxRequests: 100,
      windowMs: 30000,
      burstLimit: 20,
      identifier: "custom",
    });

    expect(customLimiter).toBeDefined();
    expect(customLimiter.check("test").allowed).toBe(true);
  });
});

describe("withRateLimit decorator", () => {
  it("should wrap function with rate limiting", async () => {
    vi.useFakeTimers();
    
    const limiter = new SlidingWindowRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
      burstLimit: 2,
    });

    const mockFn = vi.fn().mockResolvedValue("result");
    const limitedFn = withRateLimit(mockFn, limiter);

    await expect(limitedFn()).resolves.toBe("result");
    await expect(limitedFn()).resolves.toBe("result");
    await expect(limitedFn()).rejects.toThrow("Rate limit exceeded");
  });
});
