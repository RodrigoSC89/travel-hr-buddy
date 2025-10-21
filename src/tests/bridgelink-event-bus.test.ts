/**
 * Tests for BridgeLink Event Bus
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { BridgeLink } from "@/core/BridgeLink";

describe("BridgeLink Event Bus", () => {
  beforeEach(() => {
    // Clear history before each test
    BridgeLink.clearHistory();
  });

  it("should register and trigger event listeners", () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("telemetry:log", mockCallback);

    BridgeLink.emit("telemetry:log", "TestModule", { test: "data" });

    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "telemetry:log",
        source: "TestModule",
        data: { test: "data" }
      })
    );

    unsubscribe();
  });

  it("should unsubscribe listeners correctly", () => {
    const mockCallback = vi.fn();
    const unsubscribe = BridgeLink.on("telemetry:log", mockCallback);

    BridgeLink.emit("telemetry:log", "TestModule", { test: "data" });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    unsubscribe();
    BridgeLink.emit("telemetry:log", "TestModule", { test: "data2" });
    
    // Should still be 1 after unsubscribe
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple listeners for the same event", () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    BridgeLink.on("mmi:forecast:update", mockCallback1);
    BridgeLink.on("mmi:forecast:update", mockCallback2);

    BridgeLink.emit("mmi:forecast:update", "MMI", { forecast: "data" });

    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalled();
  });

  it("should maintain event history", () => {
    BridgeLink.emit("dp:incident:reported", "DPModule", { incident: "test" });
    BridgeLink.emit("fmea:risk:identified", "FMEAModule", { risk: "high" });

    const history = BridgeLink.getHistory();
    
    expect(history.length).toBeGreaterThanOrEqual(2);
    // Find the events we emitted (ignoring telemetry:log events)
    const dpEvent = history.find(e => e.type === "dp:incident:reported");
    const fmeaEvent = history.find(e => e.type === "fmea:risk:identified");
    expect(dpEvent).toBeDefined();
    expect(fmeaEvent).toBeDefined();
  });

  it("should limit history size", () => {
    // Emit more than maxHistorySize events
    for (let i = 0; i < 600; i++) {
      BridgeLink.emit("telemetry:log", "TestModule", { index: i });
    }

    const history = BridgeLink.getHistory();
    
    // Should not exceed max size (500)
    expect(history.length).toBeLessThanOrEqual(500);
  });

  it("should clear history when requested", () => {
    BridgeLink.emit("telemetry:log", "TestModule", { test: "data" });
    
    expect(BridgeLink.getHistory().length).toBeGreaterThan(0);
    
    BridgeLink.clearHistory();
    
    expect(BridgeLink.getHistory().length).toBe(0);
  });

  it("should provide stats about the event bus", () => {
    const unsubscribe1 = BridgeLink.on("mmi:forecast:update", () => {});
    const unsubscribe2 = BridgeLink.on("dp:incident:reported", () => {});
    const unsubscribe3 = BridgeLink.on("dp:incident:reported", () => {});

    BridgeLink.emit("mmi:forecast:update", "MMI", {});
    BridgeLink.emit("dp:incident:reported", "DP", {});

    const stats = BridgeLink.getStats();

    expect(stats.activeListeners).toBeGreaterThanOrEqual(3);
    expect(stats.totalEvents).toBeGreaterThan(0);

    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  });

  it("should handle errors in listeners gracefully", () => {
    const errorCallback = vi.fn(() => {
      throw new Error("Test error");
    });
    const normalCallback = vi.fn();

    BridgeLink.on("telemetry:log", errorCallback);
    BridgeLink.on("telemetry:log", normalCallback);

    // Should not throw
    expect(() => {
      BridgeLink.emit("telemetry:log", "TestModule", { test: "data" });
    }).not.toThrow();

    // Normal callback should still be called
    expect(normalCallback).toHaveBeenCalled();
  });

  it("should include timestamp and id in events", () => {
    const mockCallback = vi.fn();
    BridgeLink.on("telemetry:log", mockCallback);

    const beforeTimestamp = Date.now();
    BridgeLink.emit("telemetry:log", "TestModule", { test: "data" });
    const afterTimestamp = Date.now();

    expect(mockCallback).toHaveBeenCalled();
    const event = mockCallback.mock.calls[0][0];
    
    expect(event.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    expect(event.timestamp).toBeLessThanOrEqual(afterTimestamp);
    expect(event.id).toBeDefined();
    expect(typeof event.id).toBe("string");
  });

  it("should allow getting limited history", () => {
    for (let i = 0; i < 10; i++) {
      BridgeLink.emit("telemetry:log", "TestModule", { index: i });
    }

    const limitedHistory = BridgeLink.getHistory(5);
    
    expect(limitedHistory.length).toBe(5);
  });

  it("should support different event types", () => {
    const events = [
      "mmi:forecast:update",
      "mmi:job:created",
      "dp:incident:reported",
      "dp:intelligence:alert",
      "fmea:risk:identified",
      "asog:procedure:activated",
      "wsog:checklist:completed",
      "ai:analysis:complete",
      "system:module:loaded",
    ] as const;

    events.forEach((eventType) => {
      const mockCallback = vi.fn();
      const unsubscribe = BridgeLink.on(eventType, mockCallback);
      
      BridgeLink.emit(eventType, "TestModule", { test: eventType });
      
      expect(mockCallback).toHaveBeenCalled();
      unsubscribe();
    });
  });

  it("should maintain listener isolation between event types", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    BridgeLink.on("mmi:forecast:update", callback1);
    BridgeLink.on("dp:incident:reported", callback2);

    BridgeLink.emit("mmi:forecast:update", "MMI", {});

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
