/**
 * BridgeLink Event Bus Tests
 * Tests for inter-module communication system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { BridgeLink } from "@/core/BridgeLink";

describe("BridgeLink Event Bus", () => {
  beforeEach(() => {
    // Clear all subscribers before each test
    BridgeLink.clear();
  });

  describe("Event Subscription", () => {
    it("should subscribe to an event", () => {
      const callback = vi.fn();
      const unsubscribe = BridgeLink.on("test:event", callback);

      expect(BridgeLink.getSubscriberCount("test:event")).toBe(1);
      expect(typeof unsubscribe).toBe("function");
    });

    it("should handle multiple subscribers for same event", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      BridgeLink.on("test:event", callback1);
      BridgeLink.on("test:event", callback2);

      expect(BridgeLink.getSubscriberCount("test:event")).toBe(2);
    });

    it("should unsubscribe from event", () => {
      const callback = vi.fn();
      const unsubscribe = BridgeLink.on("test:event", callback);

      expect(BridgeLink.getSubscriberCount("test:event")).toBe(1);

      unsubscribe();

      expect(BridgeLink.getSubscriberCount("test:event")).toBe(0);
    });
  });

  describe("Event Emission", () => {
    it("should emit event to all subscribers", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      BridgeLink.on("test:event", callback1);
      BridgeLink.on("test:event", callback2);

      const testData = { message: "test" };
      BridgeLink.emit("test:event", testData);

      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledWith(testData);
    });

    it("should not call callback after unsubscribe", () => {
      const callback = vi.fn();
      const unsubscribe = BridgeLink.on("test:event", callback);

      unsubscribe();

      BridgeLink.emit("test:event", { message: "test" });

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle emit to event with no subscribers", () => {
      expect(() => {
        BridgeLink.emit("nonexistent:event", { message: "test" });
      }).not.toThrow();
    });

    it("should handle errors in callbacks gracefully", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Callback error");
      });
      const normalCallback = vi.fn();

      BridgeLink.on("test:event", errorCallback);
      BridgeLink.on("test:event", normalCallback);

      expect(() => {
        BridgeLink.emit("test:event", { message: "test" });
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe("Event Management", () => {
    it("should return correct subscriber count", () => {
      expect(BridgeLink.getSubscriberCount("test:event")).toBe(0);

      BridgeLink.on("test:event", vi.fn());
      expect(BridgeLink.getSubscriberCount("test:event")).toBe(1);

      BridgeLink.on("test:event", vi.fn());
      expect(BridgeLink.getSubscriberCount("test:event")).toBe(2);
    });

    it("should return registered events", () => {
      BridgeLink.on("event1", vi.fn());
      BridgeLink.on("event2", vi.fn());

      const events = BridgeLink.getRegisteredEvents();

      expect(events).toContain("event1");
      expect(events).toContain("event2");
      expect(events.length).toBe(2);
    });

    it("should clear all subscribers", () => {
      BridgeLink.on("event1", vi.fn());
      BridgeLink.on("event2", vi.fn());

      expect(BridgeLink.getRegisteredEvents().length).toBe(2);

      BridgeLink.clear();

      expect(BridgeLink.getRegisteredEvents().length).toBe(0);
    });

    it("should remove all listeners for specific event", () => {
      BridgeLink.on("event1", vi.fn());
      BridgeLink.on("event1", vi.fn());
      BridgeLink.on("event2", vi.fn());

      expect(BridgeLink.getSubscriberCount("event1")).toBe(2);
      expect(BridgeLink.getSubscriberCount("event2")).toBe(1);

      BridgeLink.removeAllListeners("event1");

      expect(BridgeLink.getSubscriberCount("event1")).toBe(0);
      expect(BridgeLink.getSubscriberCount("event2")).toBe(1);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle nautilus:event pattern", () => {
      const callback = vi.fn();
      BridgeLink.on("nautilus:event", callback);

      const eventData = {
        message: "[MQTT] Test message",
        topic: "nautilus/events",
        timestamp: new Date().toISOString(),
      };

      BridgeLink.emit("nautilus:event", eventData);

      expect(callback).toHaveBeenCalledWith(eventData);
    });

    it("should handle multiple event types simultaneously", () => {
      const mqttCallback = vi.fn();
      const dpCallback = vi.fn();
      const asogCallback = vi.fn();

      BridgeLink.on("mqtt:connected", mqttCallback);
      BridgeLink.on("dp:event", dpCallback);
      BridgeLink.on("asog:event", asogCallback);

      BridgeLink.emit("mqtt:connected", { timestamp: new Date().toISOString() });
      BridgeLink.emit("dp:event", { type: "thruster_fault" });
      BridgeLink.emit("asog:event", { status: "compliant" });

      expect(mqttCallback).toHaveBeenCalledTimes(1);
      expect(dpCallback).toHaveBeenCalledTimes(1);
      expect(asogCallback).toHaveBeenCalledTimes(1);
    });
  });
});
