/**
 * Tests for Performance Monitor Hook
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

// Mock requestAnimationFrame and performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  },
};

global.performance = mockPerformance as any;
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16); // ~60fps
  return 1;
}) as any;
global.cancelAnimationFrame = vi.fn();

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toHaveProperty("cpu");
    expect(result.current).toHaveProperty("memory");
    expect(result.current).toHaveProperty("fps");
    expect(result.current).toHaveProperty("timestamp");
  });

  it("should start with zero metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.cpu).toBe(0);
    expect(result.current.memory).toBe(0);
    expect(result.current.fps).toBe(0);
  });

  it("should include timestamp in metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.timestamp).toBeDefined();
    expect(typeof result.current.timestamp).toBe("string");
    expect(() => new Date(result.current.timestamp)).not.toThrow();
  });

  it("should accept MQTT client parameter", () => {
    const mockMqttClient = {
      connected: true,
      publish: vi.fn(),
    };

    const { result } = renderHook(() => usePerformanceMonitor(mockMqttClient));

    expect(result.current).toBeDefined();
  });

  it("should cleanup on unmount", () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("should handle missing performance.memory gracefully", () => {
    const originalMemory = (global.performance as any).memory;
    delete (global.performance as any).memory;

    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.memory).toBe(0);

    (global.performance as any).memory = originalMemory;
  });

  it("should format CPU as number", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(typeof result.current.cpu).toBe("number");
  });

  it("should format memory as number", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(typeof result.current.memory).toBe("number");
  });

  it("should format FPS as number", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(typeof result.current.fps).toBe("number");
  });
});
