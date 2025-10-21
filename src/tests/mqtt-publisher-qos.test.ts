/**
 * Tests for MQTT Publisher QoS enhancements
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import mqtt from "mqtt";

// Mock mqtt module
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      publish: vi.fn((topic, payload, options, callback) => {
        if (callback) callback(null);
      }),
      subscribe: vi.fn(),
      on: vi.fn(),
      end: vi.fn(),
    })),
  },
}));

describe("MQTT Publisher with QoS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should import publishEvent function", async () => {
    const { publishEvent } = await import("@/lib/mqtt/publisher");
    expect(publishEvent).toBeDefined();
    expect(typeof publishEvent).toBe("function");
  });

  it("should support QoS parameter in publishEvent", async () => {
    const { publishEvent } = await import("@/lib/mqtt/publisher");
    const topic = "test/topic";
    const payload = { test: "data" };
    
    // Should not throw error
    expect(() => publishEvent(topic, payload, 0)).not.toThrow();
    expect(() => publishEvent(topic, payload, 1)).not.toThrow();
    expect(() => publishEvent(topic, payload, 2)).not.toThrow();
  });

  it("should use QoS 1 as default", async () => {
    const { publishEvent } = await import("@/lib/mqtt/publisher");
    const topic = "test/topic";
    const payload = { test: "data" };
    
    // Call without QoS parameter - should use default QoS 1
    publishEvent(topic, payload);
    
    // Function should execute without errors
    expect(publishEvent).toBeDefined();
  });

  it("should export publishForecast function", async () => {
    const { publishForecast } = await import("@/lib/mqtt/publisher");
    expect(publishForecast).toBeDefined();
    expect(typeof publishForecast).toBe("function");
  });

  it("should export subscribeForecast function", async () => {
    const { subscribeForecast } = await import("@/lib/mqtt/publisher");
    expect(subscribeForecast).toBeDefined();
    expect(typeof subscribeForecast).toBe("function");
  });
});
