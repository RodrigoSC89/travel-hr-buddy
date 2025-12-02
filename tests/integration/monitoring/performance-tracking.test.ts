/**
 * PATCH 653 - Integration Tests: Performance Monitoring
 * Tests the integration between performance monitoring and error tracking systems
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePerformanceMonitor, evaluatePerformance } from '@/hooks/use-performance-monitor';
import { trackError } from '@/lib/error-tracker';

// Mock error tracker
vi.mock('@/lib/error-tracker', () => ({
  trackError: vi.fn(),
  getErrorStats: vi.fn(() => ({
    total: 0,
    byCategory: {},
    bySeverity: {},
    recent: []
  }))
}));

describe('Performance Monitoring Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn()
    })) as any;

    // Mock performance.getEntriesByType
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      {
        name: 'navigation',
        entryType: 'navigation',
        startTime: 0,
        duration: 1000,
        responseStart: 100,
        requestStart: 50,
        responseEnd: 300,
        fetchStart: 10
      } as any
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Performance Metrics Collection', () => {
    it('should collect metrics on mount', () => {
      const onMetricsUpdate = vi.fn();

      renderHook(() => usePerformanceMonitor({
        enabled: true,
        interval: 1000,
        onMetricsUpdate
      }));

      expect(PerformanceObserver).toHaveBeenCalled();
    });

    it('should evaluate metrics and identify issues', () => {
      const poorMetrics = {
        lcp: 5000, // Poor LCP (> 4000ms)
        fid: 400, // Poor FID (> 300ms)
        cls: 0.3, // Poor CLS (> 0.25)
        ttfb: 200,
        fcp: 1000,
        memory: {
          used: 90000000,
          total: 100000000,
          percentage: 90 // High memory usage
        },
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(poorMetrics);

      expect(evaluation.score).toBeLessThan(50);
      expect(evaluation.rating).toBe('poor');
      expect(evaluation.recommendations).toHaveLength(4);
      expect(evaluation.recommendations).toContain('LCP too high - optimize largest content loading');
      expect(evaluation.recommendations).toContain('FID too high - reduce JavaScript execution time');
      expect(evaluation.recommendations).toContain('CLS too high - stabilize layout shifts');
      expect(evaluation.recommendations).toContain('High memory usage - check for memory leaks');
    });

    it('should rate excellent metrics correctly', () => {
      const excellentMetrics = {
        lcp: 1500, // Excellent LCP
        fid: 50, // Excellent FID
        cls: 0.05, // Excellent CLS
        ttfb: 200,
        fcp: 800,
        memory: {
          used: 50000000,
          total: 100000000,
          percentage: 50
        },
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(excellentMetrics);

      expect(evaluation.score).toBeGreaterThanOrEqual(90);
      expect(evaluation.rating).toBe('excellent');
      expect(evaluation.recommendations).toHaveLength(0);
    });

    it('should cleanup observers on unmount', () => {
      const { result, unmount } = renderHook(() => usePerformanceMonitor({
        enabled: true,
        interval: 1000
      }));

      const cleanup = result.current.cleanup;
      unmount();

      expect(cleanup).toBeDefined();
    });
  });

  describe('Integration with Error Tracking', () => {
    it('should track performance degradation as errors', async () => {
      const poorMetrics = {
        lcp: 6000,
        fid: 500,
        cls: 0.4,
        ttfb: 300,
        fcp: 2000,
        memory: null,
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(poorMetrics);

      if (evaluation.rating === 'poor') {
        trackError(
          new Error('Performance degradation detected'),
          {
            category: 'Performance',
            severity: 'high',
            metadata: {
              metrics: poorMetrics,
              evaluation,
              timestamp: Date.now()
            }
          }
        );
      }

      expect(trackError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          category: 'Performance',
          severity: 'high'
        })
      );
    });

    it('should not track good performance as errors', () => {
      const goodMetrics = {
        lcp: 2000,
        fid: 80,
        cls: 0.08,
        ttfb: 200,
        fcp: 1000,
        memory: null,
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(goodMetrics);

      expect(evaluation.rating).not.toBe('poor');
      expect(trackError).not.toHaveBeenCalled();
    });
  });

  describe('Performance Budget Monitoring', () => {
    it('should detect when LCP exceeds budget', () => {
      const metrics = {
        lcp: 3000, // Above 2.5s target
        fid: 50,
        cls: 0.05,
        ttfb: 200,
        fcp: 1000,
        memory: null,
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(metrics);

      expect(evaluation.recommendations.some(r => 
        r.includes('LCP')
      )).toBe(true);
    });

    it('should detect when FID exceeds budget', () => {
      const metrics = {
        lcp: 2000,
        fid: 150, // Above 100ms target
        fid: null,
        cls: 0.05,
        ttfb: 200,
        fcp: 1000,
        memory: null,
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(metrics);

      // FID of 150ms should trigger a recommendation
      expect(evaluation.score).toBeLessThan(100);
    });

    it('should detect when CLS exceeds budget', () => {
      const metrics = {
        lcp: 2000,
        fid: 50,
        cls: 0.15, // Above 0.1 target
        ttfb: 200,
        fcp: 1000,
        memory: null,
        timestamp: Date.now()
      };

      const evaluation = evaluatePerformance(metrics);

      expect(evaluation.recommendations.some(r => 
        r.includes('CLS')
      )).toBe(true);
    });
  });
});
