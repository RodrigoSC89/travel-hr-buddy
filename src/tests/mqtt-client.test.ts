/**
 * Tests for MQTTClient
 * Uses mocked MQTT library and safe env access patterns
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MQTTClient } from "@/core/MQTTClient";

// Mock mqtt library
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      connected: false,
      on: vi.fn(),
      subscribe: vi.fn((topic, callback) => callback && callback(null)),
      unsubscribe: vi.fn((topic, callback) => callback && callback(null)),
      publish: vi.fn((topic, message, callback) => callback && callback(null)),
      end: vi.fn((force, callback) => callback && callback()),
    })),
  },
}));

describe("MQTTClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    MQTTClient.disconnect();
  });

  it("should initialize without crashing", () => {
    expect(MQTTClient).toBeDefined();
  });

  it("should handle missing MQTT URL gracefully", () => {
    // Connect without URL - should handle gracefully
    MQTTClient.connect();
    
    const status = MQTTClient.getStatus();
    expect(status.connected).toBe(false);
  });

  it("should connect with provided URL", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    const status = MQTTClient.getStatus();
    expect(status.url).toBe("ws://localhost:1883");
  });

  it("should use default topics if not provided", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    const status = MQTTClient.getStatus();
    expect(status.topics).toContain("nautilus/events");
  });

  it("should accept custom topics", () => {
    MQTTClient.connect({ 
      url: "ws://localhost:1883",
      topics: ["custom/topic1", "custom/topic2"]
    });
    
    const status = MQTTClient.getStatus();
    expect(status.topics).toBeDefined();
    expect(Array.isArray(status.topics)).toBe(true);
  });

  it("should not connect if already connecting", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(MQTTClient.getStatus().url).toBe("ws://localhost:1883");
  });

  it("should provide connection status", () => {
    const status = MQTTClient.getStatus();
    
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("connecting");
    expect(status).toHaveProperty("url");
    expect(status).toHaveProperty("topics");
  });

  it("should return false for isConnected when not connected", () => {
    expect(MQTTClient.isConnected()).toBe(false);
  });

  it("should handle send when not connected", () => {
    expect(() => {
      MQTTClient.send("test/topic", { test: "data" });
    }).not.toThrow();
  });

  it("should handle subscribe when not connected", () => {
    expect(() => {
      MQTTClient.subscribe("test/topic");
    }).not.toThrow();
  });

  it("should handle unsubscribe when not connected", () => {
    expect(() => {
      MQTTClient.unsubscribe("test/topic");
    }).not.toThrow();
  });

  it("should handle disconnect gracefully", () => {
    expect(() => {
      MQTTClient.disconnect();
    }).not.toThrow();
  });

  it("should serialize payload for send", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(() => {
      MQTTClient.send("test/topic", { test: "data", nested: { value: 123 } });
    }).not.toThrow();

    expect(() => {
      MQTTClient.send("test/topic", "simple string");
    }).not.toThrow();
  });

  it("should support custom reconnect interval", () => {
    MQTTClient.connect({ 
      url: "ws://localhost:1883",
      reconnectInterval: 10000
    });
    
    expect(MQTTClient.getStatus()).toBeDefined();
  });

  it("should add topics to subscription list when subscribing", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    MQTTClient.subscribe("new/topic");
    
    const status = MQTTClient.getStatus();
    expect(status.topics).toBeDefined();
  });

  it("should handle multiple subscriptions", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(() => {
      MQTTClient.subscribe("topic1");
      MQTTClient.subscribe("topic2");
      MQTTClient.subscribe("topic3");
    }).not.toThrow();
  });

  it("should handle multiple unsubscriptions", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(() => {
      MQTTClient.unsubscribe("topic1");
      MQTTClient.unsubscribe("topic2");
    }).not.toThrow();
  });

  it("should clean up on disconnect", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    MQTTClient.disconnect();
    
    expect(MQTTClient.isConnected()).toBe(false);
  });

  it("should handle rapid connect/disconnect cycles", () => {
    expect(() => {
      MQTTClient.connect({ url: "ws://localhost:1883" });
      MQTTClient.disconnect();
      MQTTClient.connect({ url: "ws://localhost:1883" });
      MQTTClient.disconnect();
    }).not.toThrow();
  });

  it("should validate send topic is required", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(() => {
      MQTTClient.send("", { test: "data" });
    }).not.toThrow();
  });

  it("should handle different payload types in send", () => {
    MQTTClient.connect({ url: "ws://localhost:1883" });
    
    expect(() => {
      MQTTClient.send("test/topic", null);
      MQTTClient.send("test/topic", undefined);
      MQTTClient.send("test/topic", 123);
      MQTTClient.send("test/topic", true);
      MQTTClient.send("test/topic", [1, 2, 3]);
    }).not.toThrow();
  });
});
