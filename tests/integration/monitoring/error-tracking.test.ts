/**
 * PATCH 653 - Integration Tests: Error Tracking System
 * Tests the complete error tracking flow including categorization, storage, and retrieval
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackError, getErrorStats, clearErrors } from '@/lib/error-tracker';

describe('Error Tracking Integration', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Error Tracking Flow', () => {
    it('should track and categorize network errors', () => {
      const networkError = new Error('Failed to fetch');
      
      trackError(networkError, {
        category: 'Network',
        severity: 'high',
        metadata: { endpoint: '/api/data', method: 'GET' }
      });

      const stats = getErrorStats();
      
      expect(stats.total).toBe(1);
      expect(stats.byCategory.Network).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.recent[0]).toMatchObject({
        category: 'Network',
        severity: 'high'
      });
    });

    it('should track multiple errors and maintain stats', () => {
      // Track multiple errors
      trackError(new Error('Auth failed'), {
        category: 'Auth',
        severity: 'critical'
      });

      trackError(new Error('Validation error'), {
        category: 'Validation',
        severity: 'low'
      });

      trackError(new Error('Runtime error'), {
        category: 'Runtime',
        severity: 'medium'
      });

      const stats = getErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.byCategory.Auth).toBe(1);
      expect(stats.byCategory.Validation).toBe(1);
      expect(stats.byCategory.Runtime).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
    });

    it('should store errors in localStorage', () => {
      trackError(new Error('Test error'), {
        category: 'Runtime',
        severity: 'medium'
      });

      const stored = localStorage.getItem('nautilus_errors');
      expect(stored).toBeTruthy();
      
      const errors = JSON.parse(stored!);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
    });

    it('should clear all errors', () => {
      // Track some errors
      trackError(new Error('Error 1'), { category: 'Runtime', severity: 'low' });
      trackError(new Error('Error 2'), { category: 'Network', severity: 'medium' });

      expect(getErrorStats().total).toBe(2);

      // Clear errors
      clearErrors();

      const stats = getErrorStats();
      expect(stats.total).toBe(0);
      expect(stats.byCategory).toEqual({});
      expect(stats.bySeverity).toEqual({});
      expect(stats.recent).toEqual([]);
    });
  });

  describe('Error Severity Levels', () => {
    it('should track critical errors', () => {
      trackError(new Error('Critical system failure'), {
        category: 'Runtime',
        severity: 'critical'
      });

      const stats = getErrorStats();
      expect(stats.bySeverity.critical).toBe(1);
      expect(console.error).toHaveBeenCalled();
    });

    it('should track high severity errors', () => {
      trackError(new Error('High priority error'), {
        category: 'Network',
        severity: 'high'
      });

      const stats = getErrorStats();
      expect(stats.bySeverity.high).toBe(1);
    });

    it('should track medium severity errors', () => {
      trackError(new Error('Medium priority error'), {
        category: 'Validation',
        severity: 'medium'
      });

      const stats = getErrorStats();
      expect(stats.bySeverity.medium).toBe(1);
    });

    it('should track low severity errors', () => {
      trackError(new Error('Low priority error'), {
        category: 'Runtime',
        severity: 'low'
      });

      const stats = getErrorStats();
      expect(stats.bySeverity.low).toBe(1);
    });
  });

  describe('Error Categories', () => {
    it('should categorize network errors', () => {
      trackError(new Error('Network timeout'), {
        category: 'Network',
        severity: 'high'
      });

      const stats = getErrorStats();
      expect(stats.byCategory.Network).toBe(1);
    });

    it('should categorize authentication errors', () => {
      trackError(new Error('Unauthorized'), {
        category: 'Auth',
        severity: 'high'
      });

      const stats = getErrorStats();
      expect(stats.byCategory.Auth).toBe(1);
    });

    it('should categorize validation errors', () => {
      trackError(new Error('Invalid input'), {
        category: 'Validation',
        severity: 'low'
      });

      const stats = getErrorStats();
      expect(stats.byCategory.Validation).toBe(1);
    });

    it('should categorize runtime errors', () => {
      trackError(new Error('Undefined variable'), {
        category: 'Runtime',
        severity: 'medium'
      });

      const stats = getErrorStats();
      expect(stats.byCategory.Runtime).toBe(1);
    });
  });

  describe('Error Metadata', () => {
    it('should store error metadata', () => {
      const metadata = {
        userId: 'user-123',
        action: 'fetch-data',
        endpoint: '/api/users'
      };

      trackError(new Error('API error'), {
        category: 'Network',
        severity: 'high',
        metadata
      });

      const stats = getErrorStats();
      expect(stats.recent[0].metadata).toEqual(metadata);
    });

    it('should store error timestamps', () => {
      const before = Date.now();
      
      trackError(new Error('Test error'), {
        category: 'Runtime',
        severity: 'low'
      });

      const after = Date.now();
      const stats = getErrorStats();
      const errorTimestamp = stats.recent[0].timestamp;

      expect(errorTimestamp).toBeGreaterThanOrEqual(before);
      expect(errorTimestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Error Limits', () => {
    it('should respect maximum error storage limit', () => {
      // Track more errors than the limit (assuming limit of 100)
      for (let i = 0; i < 150; i++) {
        trackError(new Error(`Error ${i}`), {
          category: 'Runtime',
          severity: 'low'
        });
      }

      const stats = getErrorStats();
      // Should not exceed limit
      expect(stats.recent.length).toBeLessThanOrEqual(100);
    });
  });
});
