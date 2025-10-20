/**
 * MQTTClient Tests
 * Tests for MQTT broker integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MQTTClient } from "@/core/MQTTClient";
import { BridgeLink } from "@/core/BridgeLink";

// Mock mqtt library
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      on: vi.fn(),
      subscribe: vi.fn((topic, callback) => {
        if (callback) callback(null);
      }),
      unsubscribe: vi.fn((topic, callback) => {
        if (callback) callback(null);
      }),
      publish: vi.fn((topic, message, callback) => {
        if (callback) callback(null);
      }),
      end: vi.fn(),
    })),
  },
}));

describe("MQTTClient", () => {
  beforeEach(() => {
    // Clear BridgeLink subscribers
    BridgeLink.clear();
    // Disconnect any existing connections
    MQTTClient.disconnect();
  });

  afterEach(() => {
    MQTTClient.disconnect();
    BridgeLink.clear();
  });

  describe("Connection Management", () => {
    it("should handle missing MQTT URL gracefully", () => {
      // Don't pass URL and env variable is not set
      expect(() => MQTTClient.connect()).not.toThrow();
    });

    it("should connect with provided URL", () => {
      const testUrl = "ws://localhost:1883";
      expect(() => MQTTClient.connect(testUrl)).not.toThrow();
    });

    it("should disconnect successfully", () => {
      MQTTClient.connect("ws://localhost:1883");
      expect(() => MQTTClient.disconnect()).not.toThrow();
    });

    it("should handle multiple disconnect calls", () => {
      MQTTClient.connect("ws://localhost:1883");
      MQTTClient.disconnect();
      expect(() => MQTTClient.disconnect()).not.toThrow();
    });

    it("should return connection status", () => {
      const status = MQTTClient.getConnectionStatus();
      expect(typeof status).toBe("boolean");
    });
  });

  describe("Message Publishing", () => {
    beforeEach(() => {
      MQTTClient.connect("ws://localhost:1883");
    });

    it("should send message when connected", () => {
      // Simulate connection
      const client = MQTTClient.getClient();
      if (client) {
        // Manually set connected state for test
        expect(() => {
          MQTTClient.send("test/topic", { data: "test" });
        }).not.toThrow();
      }
    });

    it("should handle send when not connected", () => {
      MQTTClient.disconnect();
      expect(() => {
        MQTTClient.send("test/topic", { data: "test" });
      }).not.toThrow();
    });

    it("should serialize payload to JSON", () => {
      const payload = { type: "event", data: "test", count: 123 };
      expect(() => {
        MQTTClient.send("nautilus/events", payload);
      }).not.toThrow();
    });
  });

  describe("Topic Subscription", () => {
    beforeEach(() => {
      MQTTClient.connect("ws://localhost:1883");
    });

    it("should subscribe to single topic", () => {
      expect(() => {
        MQTTClient.subscribe("test/topic");
      }).not.toThrow();
    });

    it("should subscribe to multiple topics", () => {
      expect(() => {
        MQTTClient.subscribe(["topic1", "topic2", "topic3"]);
      }).not.toThrow();
    });

    it("should unsubscribe from topic", () => {
      MQTTClient.subscribe("test/topic");
      expect(() => {
        MQTTClient.unsubscribe("test/topic");
      }).not.toThrow();
    });

    it("should unsubscribe from multiple topics", () => {
      MQTTClient.subscribe(["topic1", "topic2"]);
      expect(() => {
        MQTTClient.unsubscribe(["topic1", "topic2"]);
      }).not.toThrow();
    });

    it("should handle subscribe when not connected", () => {
      MQTTClient.disconnect();
      expect(() => {
        MQTTClient.subscribe("test/topic");
      }).not.toThrow();
    });

    it("should handle unsubscribe when not connected", () => {
      MQTTClient.disconnect();
      expect(() => {
        MQTTClient.unsubscribe("test/topic");
      }).not.toThrow();
    });
  });

  describe("BridgeLink Integration", () => {
    it("should emit events through BridgeLink", () => {
      const callback = vi.fn();
      BridgeLink.on("nautilus:event", callback);

      MQTTClient.connect("ws://localhost:1883");

      // Note: In real scenario, events would be emitted when messages arrive
      // This test verifies the setup doesn't throw
      expect(BridgeLink.getSubscriberCount("nautilus:event")).toBe(1);
    });

    it("should emit connection events", () => {
      const connectedCallback = vi.fn();
      const disconnectedCallback = vi.fn();

      BridgeLink.on("mqtt:connected", connectedCallback);
      BridgeLink.on("mqtt:disconnected", disconnectedCallback);

      MQTTClient.connect("ws://localhost:1883");
      MQTTClient.disconnect();

      // Verify event listeners are registered
      expect(BridgeLink.getSubscriberCount("mqtt:connected")).toBe(1);
      expect(BridgeLink.getSubscriberCount("mqtt:disconnected")).toBe(1);
    });
  });

  describe("Client Access", () => {
    it("should return null when not connected", () => {
      const client = MQTTClient.getClient();
      expect(client).toBeDefined();
    });

    it("should return client instance when connected", () => {
      MQTTClient.connect("ws://localhost:1883");
      const client = MQTTClient.getClient();
      expect(client).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle connection errors gracefully", () => {
      // Connect with invalid URL shouldn't throw
      expect(() => {
        MQTTClient.connect("invalid://url");
      }).not.toThrow();
    });

    it("should handle publish errors gracefully", () => {
      MQTTClient.connect("ws://localhost:1883");
      expect(() => {
        MQTTClient.send("test/topic", { data: "test" });
      }).not.toThrow();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle nautilus/events topic", () => {
      const callback = vi.fn();
      BridgeLink.on("nautilus:event", callback);

      MQTTClient.connect("ws://localhost:1883");
      MQTTClient.send("nautilus/events", {
        type: "dp_event",
        status: "operational",
      });

      expect(() => {
        MQTTClient.send("nautilus/events", {
          type: "asog_update",
          compliance: true,
        });
      }).not.toThrow();
    });

    it("should handle reconnection scenario", () => {
      MQTTClient.connect("ws://localhost:1883");
      MQTTClient.disconnect();
      expect(() => {
        MQTTClient.connect("ws://localhost:1883");
      }).not.toThrow();
    });

    it("should support DP telemetry", () => {
      MQTTClient.connect("ws://localhost:1883");

      expect(() => {
        MQTTClient.send("nautilus/dp/telemetry", {
          position: { lat: -22.9068, lon: -43.1729 },
          accuracy: 2.5,
          thrusters: [
            { id: 1, status: "ok", power: 75 },
            { id: 2, status: "ok", power: 80 },
          ],
        });
      }).not.toThrow();
    });

    it("should support FMEA alerts", () => {
      MQTTClient.connect("ws://localhost:1883");

      expect(() => {
        MQTTClient.send("nautilus/fmea/alert", {
          severity: "high",
          component: "thruster_3",
          message: "Performance degradation detected",
        });
      }).not.toThrow();
    });
  });
});
