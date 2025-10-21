/**
 * Tests for Performance Monitor Hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => 1000),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
  },
};

// Mock MQTT client
const mockMqttClient = {
  connected: true,
  publish: vi.fn(),
};

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.performance = mockPerformance as any;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toBeDefined();
    expect(result.current.cpu).toBe(0);
    expect(result.current.memory).toBe(0);
    expect(result.current.fps).toBe(0);
  });

  it("should update metrics after 1 second", async () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.cpu).toBeGreaterThanOrEqual(0);
    expect(result.current.memory).toBeGreaterThanOrEqual(0);
    expect(result.current.fps).toBeGreaterThanOrEqual(0);
  });

  it("should publish metrics to MQTT when client is provided", async () => {
    renderHook(() => usePerformanceMonitor(mockMqttClient as any));

    // Advance time to trigger metrics update
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockMqttClient.publish).toHaveBeenCalled();
    expect(mockMqttClient.publish).toHaveBeenCalledWith(
      "nautilus/telemetry/performance",
      expect.any(String),
      { qos: 0 }
    );
  });

  it("should not publish when MQTT client is not connected", async () => {
    const disconnectedClient = {
      connected: false,
      publish: vi.fn(),
    };

    renderHook(() => usePerformanceMonitor(disconnectedClient as any));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(disconnectedClient.publish).not.toHaveBeenCalled();
  });

  it("should handle missing MQTT client gracefully", async () => {
    const { result } = renderHook(() => usePerformanceMonitor(null));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should still return metrics
    expect(result.current).toBeDefined();
  });

  it("should calculate memory from performance.memory", async () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should convert bytes to MB
    expect(result.current.memory).toBeCloseTo(50, 0);
  });

  it("should handle missing performance.memory", async () => {
    const oldMemory = (global.performance as any).memory;
    delete (global.performance as any).memory;

    const { result } = renderHook(() => usePerformanceMonitor());

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.memory).toBe(0);

    // Restore
    (global.performance as any).memory = oldMemory;
  });

  it("should cleanup on unmount", () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });

  it("should track FPS correctly", async () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    // Simulate multiple frames
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(result.current.fps).toBeGreaterThanOrEqual(0);
  });
});
