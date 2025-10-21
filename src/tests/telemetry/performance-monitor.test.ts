/**
 * Tests for Performance Monitor Hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  writable: true,
  configurable: true,
  value: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 200 * 1024 * 1024,
  },
});

// Mock MQTT client
const mockMQTTClient = {
  publish: vi.fn(),
  isConnected: vi.fn(() => true),
};

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should return initial metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toHaveProperty("cpu");
    expect(result.current).toHaveProperty("memory");
    expect(result.current).toHaveProperty("fps");
    expect(result.current).toHaveProperty("timestamp");
  });

  it("should handle missing MQTT client gracefully", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toBeDefined();
    expect(result.current.cpu).toBeGreaterThanOrEqual(0);
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());

    expect(() => unmount()).not.toThrow();
  });

  it("should provide metrics object with correct properties", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toMatchObject({
      cpu: expect.any(Number),
      memory: expect.any(Number),
      fps: expect.any(Number),
      timestamp: expect.any(Number),
    });
  });

  it("should initialize with MQTT client", () => {
    const { result } = renderHook(() => usePerformanceMonitor(mockMQTTClient as any));

    expect(result.current).toBeDefined();
  });

  it("should not crash with disconnected MQTT client", () => {
    const disconnectedClient = {
      ...mockMQTTClient,
      isConnected: vi.fn(() => false),
    };

    const { result } = renderHook(() => usePerformanceMonitor(disconnectedClient as any));

    expect(result.current).toBeDefined();
  });

  it("should have non-negative CPU values", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.cpu).toBeGreaterThanOrEqual(0);
    expect(result.current.cpu).toBeLessThanOrEqual(100);
  });

  it("should have non-negative memory values", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.memory).toBeGreaterThanOrEqual(0);
  });

  it("should have non-negative FPS values", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.fps).toBeGreaterThanOrEqual(0);
  });
});
