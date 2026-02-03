/**
 * Unit Tests - Rate Limiter
 * Tests for client-side rate limiting functionality
 * FIXED: Updated to match actual API implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimiter, withRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      const key = 'test-action';
      const config = { maxRequests: 5, windowMs: 60000 };
      
      expect(rateLimiter.check(key, config).allowed).toBe(true);
      expect(rateLimiter.check(key, config).allowed).toBe(true);
      expect(rateLimiter.check(key, config).allowed).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-action';
      const config = { maxRequests: 3, windowMs: 60000 };
      
      // Make 3 requests (should all succeed)
      expect(rateLimiter.check(key, config).allowed).toBe(true);
      expect(rateLimiter.check(key, config).allowed).toBe(true);
      expect(rateLimiter.check(key, config).allowed).toBe(true);
      
      // 4th request should be blocked
      const result = rateLimiter.check(key, config);
      expect(result.allowed).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reset after window expires', () => {
      const key = 'test-action';
      const window = 60000; // 1 minute
      const config = { maxRequests: 3, windowMs: window };
      
      // Fill the limit
      rateLimiter.check(key, config);
      rateLimiter.check(key, config);
      rateLimiter.check(key, config);
      
      // Next request should be blocked
      expect(rateLimiter.check(key, config).allowed).toBe(false);
      
      // Advance time past window
      vi.advanceTimersByTime(window + 1000);
      
      // Should allow requests again
      expect(rateLimiter.check(key, config).allowed).toBe(true);
    });

    it('should handle different keys independently', () => {
      const key1 = 'action-1';
      const key2 = 'action-2';
      const config = { maxRequests: 2, windowMs: 60000 };
      
      // Fill limit for key1
      expect(rateLimiter.check(key1, config).allowed).toBe(true);
      expect(rateLimiter.check(key1, config).allowed).toBe(true);
      expect(rateLimiter.check(key1, config).allowed).toBe(false);
      
      // key2 should still work
      expect(rateLimiter.check(key2, config).allowed).toBe(true);
      expect(rateLimiter.check(key2, config).allowed).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return null for non-existent key', () => {
      const status = rateLimiter.getStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return status for existing key', () => {
      const key = 'test-action';
      const config = { maxRequests: 5, windowMs: 60000 };
      
      rateLimiter.check(key, config);
      
      const status = rateLimiter.getStatus(key);
      expect(status).not.toBeNull();
      expect(status?.resetTime).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should clear specific key', () => {
      const key = 'action-1';
      const config = { maxRequests: 5, windowMs: 60000 };
      
      rateLimiter.check(key, config);
      expect(rateLimiter.getStatus(key)).not.toBeNull();
      
      rateLimiter.reset(key);
      expect(rateLimiter.getStatus(key)).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all rate limit data', () => {
      const key1 = 'action-1';
      const key2 = 'action-2';
      const config = { maxRequests: 5, windowMs: 60000 };
      
      rateLimiter.check(key1, config);
      rateLimiter.check(key2, config);
      
      rateLimiter.clearAll();
      
      expect(rateLimiter.getStatus(key1)).toBeNull();
      expect(rateLimiter.getStatus(key2)).toBeNull();
    });
  });
});

describe('withRateLimit', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  it('should execute function when within limit', () => {
    const mockFn = vi.fn().mockReturnValue('success');
    
    const rateLimitedFn = withRateLimit(mockFn, {
      maxRequests: 5,
      windowMs: 60000
    });

    const result = rateLimitedFn('arg1', 'arg2');
    
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result).toBe('success');
  });

  it('should throw error when rate limit exceeded', () => {
    const mockFn = vi.fn().mockReturnValue('success');
    
    const rateLimitedFn = withRateLimit(mockFn, {
      maxRequests: 2,
      windowMs: 60000
    });

    // First 2 calls should succeed
    rateLimitedFn();
    rateLimitedFn();
    
    // 3rd call should throw
    expect(() => rateLimitedFn()).toThrow('Rate limit exceeded');
  });

  it('should preserve function arguments and return value', () => {
    const mockFn = vi.fn().mockImplementation((a: number, b: number) => a + b);
    
    const rateLimitedFn = withRateLimit(mockFn, {
      maxRequests: 5,
      windowMs: 60000
    });

    const result = rateLimitedFn(2, 3);
    
    expect(mockFn).toHaveBeenCalledWith(2, 3);
    expect(result).toBe(5);
  });
});

describe('RATE_LIMITS presets', () => {
  it('should have LOGIN preset', () => {
    expect(RATE_LIMITS.LOGIN).toBeDefined();
    expect(RATE_LIMITS.LOGIN.maxRequests).toBe(5);
    expect(RATE_LIMITS.LOGIN.windowMs).toBe(60 * 1000);
  });

  it('should have API_CALL preset', () => {
    expect(RATE_LIMITS.API_CALL).toBeDefined();
    expect(RATE_LIMITS.API_CALL.maxRequests).toBe(100);
  });
});

describe('Debug Tool', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  it('should expose rateLimiter globally for debugging', () => {
    expect((window as any).__NAUTILUS_RATE_LIMITER__).toBeDefined();
    expect((window as any).__NAUTILUS_RATE_LIMITER__).toBe(rateLimiter);
  });
});
