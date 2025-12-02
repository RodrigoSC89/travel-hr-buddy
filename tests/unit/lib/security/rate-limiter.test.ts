/**
 * Unit Tests - Rate Limiter
 * Tests for client-side rate limiting functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimiter, withRateLimit } from '@/lib/security/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter state
    rateLimiter.reset();
    
    // Mock Date.now()
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const key = 'test-action';
      
      expect(rateLimiter.checkLimit(key, 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key, 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key, 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-action';
      const maxRequests = 3;
      
      // Make 3 requests (should all succeed)
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(true);
      
      // 4th request should be blocked
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(false);
    });

    it('should reset after window expires', () => {
      const key = 'test-action';
      const maxRequests = 3;
      const window = 60000; // 1 minute
      
      // Fill the limit
      rateLimiter.checkLimit(key, maxRequests, window);
      rateLimiter.checkLimit(key, maxRequests, window);
      rateLimiter.checkLimit(key, maxRequests, window);
      
      // Next request should be blocked
      expect(rateLimiter.checkLimit(key, maxRequests, window)).toBe(false);
      
      // Advance time past window
      vi.advanceTimersByTime(window + 1000);
      
      // Should allow requests again
      expect(rateLimiter.checkLimit(key, maxRequests, window)).toBe(true);
    });

    it('should handle different keys independently', () => {
      const key1 = 'action-1';
      const key2 = 'action-2';
      const maxRequests = 2;
      
      // Fill limit for key1
      expect(rateLimiter.checkLimit(key1, maxRequests, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key1, maxRequests, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key1, maxRequests, 60000)).toBe(false);
      
      // key2 should still work
      expect(rateLimiter.checkLimit(key2, maxRequests, 60000)).toBe(true);
      expect(rateLimiter.checkLimit(key2, maxRequests, 60000)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const key = 'test-action';
      const maxRequests = 5;
      
      rateLimiter.checkLimit(key, maxRequests, 60000);
      rateLimiter.checkLimit(key, maxRequests, 60000);
      
      const stats = rateLimiter.getStats(key);
      
      expect(stats.requestCount).toBe(2);
      expect(stats.remaining).toBe(3);
      expect(stats.resetAt).toBeGreaterThan(Date.now());
    });

    it('should return null for non-existent key', () => {
      const stats = rateLimiter.getStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear all rate limit data', () => {
      const key1 = 'action-1';
      const key2 = 'action-2';
      
      rateLimiter.checkLimit(key1, 5, 60000);
      rateLimiter.checkLimit(key2, 5, 60000);
      
      rateLimiter.reset();
      
      expect(rateLimiter.getStats(key1)).toBeNull();
      expect(rateLimiter.getStats(key2)).toBeNull();
    });

    it('should allow requests after reset', () => {
      const key = 'test-action';
      const maxRequests = 2;
      
      // Fill the limit
      rateLimiter.checkLimit(key, maxRequests, 60000);
      rateLimiter.checkLimit(key, maxRequests, 60000);
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(false);
      
      // Reset
      rateLimiter.reset();
      
      // Should allow requests again
      expect(rateLimiter.checkLimit(key, maxRequests, 60000)).toBe(true);
    });
  });
});

describe('withRateLimit', () => {
  beforeEach(() => {
    rateLimiter.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute function when within limit', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    
    const rateLimitedFn = withRateLimit(mockFn, {
      key: 'test-fn',
      maxRequests: 5,
      windowMs: 60000
    });

    const result = await rateLimitedFn('arg1', 'arg2');
    
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result).toBe('success');
  });

  it('should throw error when rate limit exceeded', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    
    const rateLimitedFn = withRateLimit(mockFn, {
      key: 'test-fn',
      maxRequests: 2,
      windowMs: 60000
    });

    // First 2 calls should succeed
    await rateLimitedFn();
    await rateLimitedFn();
    
    // 3rd call should throw
    await expect(rateLimitedFn()).rejects.toThrow('Rate limit exceeded');
  });

  it('should use custom error message', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    
    const rateLimitedFn = withRateLimit(mockFn, {
      key: 'test-fn',
      maxRequests: 1,
      windowMs: 60000,
      errorMessage: 'Custom error'
    });

    await rateLimitedFn();
    
    await expect(rateLimitedFn()).rejects.toThrow('Custom error');
  });

  it('should preserve function arguments and return value', async () => {
    const mockFn = vi.fn().mockImplementation((a: number, b: number) => a + b);
    
    const rateLimitedFn = withRateLimit(mockFn, {
      key: 'test-fn',
      maxRequests: 5,
      windowMs: 60000
    });

    const result = await rateLimitedFn(2, 3);
    
    expect(mockFn).toHaveBeenCalledWith(2, 3);
    expect(result).toBe(5);
  });
});

describe('Debug Tool', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it('should expose rateLimiter globally for debugging', () => {
    expect((window as any).__NAUTILUS_RATE_LIMITER__).toBeDefined();
    expect((window as any).__NAUTILUS_RATE_LIMITER__).toBe(rateLimiter);
  });
});
