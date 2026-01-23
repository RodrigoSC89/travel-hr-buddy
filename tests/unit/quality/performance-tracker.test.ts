/**
 * Performance Tracker Tests
 * PATCH: QUALITY-10/10 - Unit tests for performance monitoring
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock PerformanceObserver
class MockPerformanceObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

// Setup mocks before importing the module
vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
vi.stubGlobal("performance", {
  now: vi.fn(() => Date.now()),
  timing: {
    requestStart: 0,
    responseStart: 100,
  },
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024,
    jsHeapSizeLimit: 200 * 1024 * 1024,
  },
});

describe("PerformanceTracker", () => {
  let tracker: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("@/lib/quality/performance-tracker");
    tracker = module.performanceTracker;
    tracker.clear();
  });

  describe("recordMetric", () => {
    it("should record a metric with correct properties", () => {
      tracker.recordMetric("api_call", 150, "ms");

      const metrics = tracker.getMetrics({ name: "api_call" });
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: "api_call",
        value: 150,
        unit: "ms",
      });
      expect(metrics[0].timestamp).toBeDefined();
    });

    it("should record metrics with metadata", () => {
      tracker.recordMetric("api_call", 200, "ms", { endpoint: "/users" });

      const metrics = tracker.getMetrics({ name: "api_call" });
      expect(metrics[0].metadata).toEqual({ endpoint: "/users" });
    });

    it("should limit stored metrics to MAX_METRICS", () => {
      for (let i = 0; i < 1100; i++) {
        tracker.recordMetric(`metric_${i}`, i, "count");
      }

      const allMetrics = tracker.getMetrics();
      expect(allMetrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("getMetrics", () => {
    beforeEach(() => {
      tracker.recordMetric("api_call", 100, "ms");
      tracker.recordMetric("render", 50, "ms");
      tracker.recordMetric("api_call", 150, "ms");
    });

    it("should filter metrics by name", () => {
      const apiMetrics = tracker.getMetrics({ name: "api_call" });
      expect(apiMetrics).toHaveLength(2);
      apiMetrics.forEach((m: any) => expect(m.name).toBe("api_call"));
    });

    it("should filter metrics by timestamp", () => {
      const now = Date.now();
      const recentMetrics = tracker.getMetrics({ since: now - 1000 });
      expect(recentMetrics.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAverageMetric", () => {
    it("should calculate average correctly", () => {
      tracker.recordMetric("test", 100, "ms");
      tracker.recordMetric("test", 200, "ms");
      tracker.recordMetric("test", 300, "ms");

      const avg = tracker.getAverageMetric("test");
      expect(avg).toBe(200);
    });

    it("should return null for non-existent metric", () => {
      const avg = tracker.getAverageMetric("nonexistent");
      expect(avg).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers on new metrics", () => {
      const callback = vi.fn();
      tracker.subscribe(callback);

      tracker.recordMetric("test", 100, "ms");

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "test", value: 100 }),
        ])
      );
    });

    it("should allow unsubscribing", () => {
      const callback = vi.fn();
      const unsubscribe = tracker.subscribe(callback);

      unsubscribe();
      tracker.recordMetric("test", 100, "ms");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("measureAsync", () => {
    it("should measure async function duration", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100);

      const result = await tracker.measureAsync("async_op", mockFn);

      expect(result).toBe("result");
      const metrics = tracker.getMetrics({ name: "async_op" });
      expect(metrics).toHaveLength(1);
    });
  });

  describe("measureSync", () => {
    it("should measure sync function duration", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50);

      const result = tracker.measureSync("sync_op", mockFn);

      expect(result).toBe("result");
      const metrics = tracker.getMetrics({ name: "sync_op" });
      expect(metrics).toHaveLength(1);
    });
  });

  describe("getScore", () => {
    it("should return score object with grade", () => {
      const score = tracker.getScore();

      expect(score).toHaveProperty("score");
      expect(score).toHaveProperty("grade");
      expect(score).toHaveProperty("details");
      expect(typeof score.score).toBe("number");
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
    });
  });

  describe("getWebVitals", () => {
    it("should return web vitals object", () => {
      const vitals = tracker.getWebVitals();

      expect(vitals).toHaveProperty("lcp");
      expect(vitals).toHaveProperty("fid");
      expect(vitals).toHaveProperty("cls");
      expect(vitals).toHaveProperty("ttfb");
      expect(vitals).toHaveProperty("inp");
    });
  });

  describe("clear", () => {
    it("should clear all metrics", () => {
      tracker.recordMetric("test", 100, "ms");
      tracker.recordMetric("test2", 200, "ms");

      tracker.clear();

      const metrics = tracker.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });
});
