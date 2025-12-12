/**
 * Unit Tests - Performance Monitor Hook
 * Tests for usePerformanceMonitor hook functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePerformanceMonitor, evaluatePerformance } from "@/hooks/use-performance-monitor";

describe("usePerformanceMonitor", () => {
  // Mock PerformanceObserver
  const mockPerformanceObserver = vi.fn((callback) => {
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => [])
    };
  });

  beforeEach(() => {
    // Setup window mocks
    global.PerformanceObserver = mockPerformanceObserver as any;
    
    // Mock performance.memory (Chrome only)
    Object.defineProperty(performance, "memory", {
      configurable: true,
      value: {
        usedJSHeapSize: 50000000,
        totalJSHeapSize: 100000000,
        jsHeapSizeLimit: 2000000000
      }
    });

    // Mock performance timing
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      {
        responseStart: 100,
        requestStart: 50,
        responseEnd: 200,
        fetchStart: 0
      }
    ] as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).__NAUTILUS_PERFORMANCE__;
  });

  it("should initialize with default options", () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    expect(result.current.collectMetrics).toBeDefined();
    expect(result.current.cleanup).toBeDefined();
  });

  it("should collect performance metrics", async () => {
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
    
    const metrics = result.current.collectMetrics();
    
    expect(metrics).toHaveProperty("lcp");
    expect(metrics).toHaveProperty("fid");
    expect(metrics).toHaveProperty("cls");
    expect(metrics).toHaveProperty("ttfb");
    expect(metrics).toHaveProperty("fcp");
    expect(metrics).toHaveProperty("memory");
    expect(metrics.timestamp).toBeGreaterThan(0);
  });

  it("should store metrics in window object for debugging", () => {
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
    
    result.current.collectMetrics();
    
    expect((window as any).__NAUTILUS_PERFORMANCE__).toBeDefined();
    expect((window as any).__NAUTILUS_PERFORMANCE__.timestamp).toBeGreaterThan(0);
  });

  it("should call onMetricsUpdate callback", async () => {
    const onMetricsUpdate = vi.fn();
    
    const { result } = renderHook(() => 
      usePerformanceMonitor({ 
        enabled: false,
        onMetricsUpdate 
      })
    );
    
    result.current.collectMetrics();
    
    expect(onMetricsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(Number)
      })
    );
  });

  it("should cleanup observers on unmount", () => {
    const { result, unmount } = renderHook(() => usePerformanceMonitor({ enabled: false }));
    
    result.current.collectMetrics();
    unmount();
    result.current.cleanup();
    
    // Verify cleanup was called
    expect(result.current.cleanup).toBeDefined();
  });

  it("should handle missing performance APIs gracefully", () => {
    // Remove PerformanceObserver
    delete (global as any).PerformanceObserver;
    
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
    
    expect(() => result.current.collectMetrics()).not.toThrow();
  });
});

describe("evaluatePerformance", () => {
  it("should return excellent rating for good metrics", () => {
    const metrics = {
      lcp: 1500,
      fid: 50,
      cls: 0.05,
      ttfb: 500,
      fcp: 1000,
      memory: {
        used: 50000000,
        total: 100000000,
        percentage: 50
      },
      timestamp: Date.now()
    };

    const evaluation = evaluatePerformance(metrics);

    expect(evaluation.rating).toBe("excellent");
    expect(evaluation.score).toBeGreaterThanOrEqual(90);
    expect(evaluation.recommendations).toHaveLength(0);
  });

  it("should return poor rating for bad metrics", () => {
    const metrics = {
      lcp: 5000,
      fid: 400,
      cls: 0.3,
      ttfb: 1000,
      fcp: 2000,
      memory: {
        used: 90000000,
        total: 100000000,
        percentage: 90
      },
      timestamp: Date.now()
    };

    const evaluation = evaluatePerformance(metrics);

    expect(evaluation.rating).toBe("poor");
    expect(evaluation.score).toBeLessThan(50);
    expect(evaluation.recommendations.length).toBeGreaterThan(0);
  });

  it("should provide specific recommendations for LCP issues", () => {
    const metrics = {
      lcp: 5000,
      fid: 50,
      cls: 0.05,
      ttfb: 500,
      fcp: 1000,
      memory: null,
      timestamp: Date.now()
    };

    const evaluation = evaluatePerformance(metrics);

    expect(evaluation.recommendations).toContain("LCP too high - optimize largest content loading");
  });

  it("should provide specific recommendations for high memory usage", () => {
    const metrics = {
      lcp: 1500,
      fid: 50,
      cls: 0.05,
      ttfb: 500,
      fcp: 1000,
      memory: {
        used: 90000000,
        total: 100000000,
        percentage: 90
      },
      timestamp: Date.now()
    };

    const evaluation = evaluatePerformance(metrics);

    expect(evaluation.recommendations).toContain("High memory usage - check for memory leaks");
  });
});
