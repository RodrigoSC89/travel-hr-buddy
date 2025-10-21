import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

describe("Performance Monitor", () => {
  it("should initialize with default metrics", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current).toHaveProperty("cpu");
    expect(result.current).toHaveProperty("memory");
    expect(result.current).toHaveProperty("fps");
    expect(result.current).toHaveProperty("timestamp");
  });

  it("should have valid initial values", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.cpu).toBeGreaterThanOrEqual(0);
    expect(result.current.memory).toBeGreaterThanOrEqual(0);
    expect(result.current.fps).toBeGreaterThanOrEqual(0);
    expect(result.current.timestamp).toBeTruthy();
  });

  it("should not crash when MQTT client is not provided", () => {
    expect(() => {
      renderHook(() => usePerformanceMonitor());
    }).not.toThrow();
  });

  it("should accept MQTT client as parameter", () => {
    const mockMqttClient = {
      connected: true,
      publish: vi.fn(),
    };

    expect(() => {
      renderHook(() => usePerformanceMonitor(mockMqttClient));
    }).not.toThrow();
  });
});
