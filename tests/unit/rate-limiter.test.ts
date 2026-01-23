/**
 * Unit Tests - Rate Limiter
 * PATCH: Audit Sprint 3 - Test coverage improvement
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter, RATE_LIMITS, useRateLimit } from '@/lib/security/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.check('test-key', config);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const config = { maxRequests: 3, windowMs: 60000 };
      
      // Use up all requests
      for (let i = 0; i < 3; i++) {
        rateLimiter.check('test-key', config);
      }
      
      // This should be blocked
      const result = rateLimiter.check('test-key', config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should provide custom message when blocked', () => {
      const config = { 
        maxRequests: 1, 
        windowMs: 60000,
        message: 'Custom limit message'
      };
      
      rateLimiter.check('msg-key', config);
      const result = rateLimiter.check('msg-key', config);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Custom limit message');
    });

    it('should use separate limits for different keys', () => {
      const config = { maxRequests: 2, windowMs: 60000 };
      
      rateLimiter.check('key-a', config);
      rateLimiter.check('key-a', config);
      rateLimiter.check('key-b', config);
      
      // key-a should be at limit
      expect(rateLimiter.check('key-a', config).allowed).toBe(false);
      // key-b should still have room
      expect(rateLimiter.check('key-b', config).allowed).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset limit for a key', () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      
      rateLimiter.check('reset-key', config);
      expect(rateLimiter.check('reset-key', config).allowed).toBe(false);
      
      rateLimiter.reset('reset-key');
      expect(rateLimiter.check('reset-key', config).allowed).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return null for unknown keys', () => {
      expect(rateLimiter.getStatus('unknown-key')).toBeNull();
    });

    it('should return remaining time for tracked keys', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      rateLimiter.check('status-key', config);
      
      const status = rateLimiter.getStatus('status-key');
      expect(status).not.toBeNull();
      expect(status?.remaining).toBeGreaterThan(0);
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have LOGIN preset', () => {
      expect(RATE_LIMITS.LOGIN).toBeDefined();
      expect(RATE_LIMITS.LOGIN.maxRequests).toBe(5);
    });

    it('should have API_CALL preset', () => {
      expect(RATE_LIMITS.API_CALL).toBeDefined();
      expect(RATE_LIMITS.API_CALL.maxRequests).toBe(100);
    });

    it('should have FILE_UPLOAD preset', () => {
      expect(RATE_LIMITS.FILE_UPLOAD).toBeDefined();
      expect(RATE_LIMITS.FILE_UPLOAD.maxRequests).toBe(10);
    });
  });
});
