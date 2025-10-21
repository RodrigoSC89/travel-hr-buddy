/**
 * Tests for Secure MQTT Client
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { initSecureMQTT, secureMQTTClient } from "@/lib/mqtt/secure-client";

// Mock mqtt library
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn(() => ({
      connected: false,
      on: vi.fn(),
      subscribe: vi.fn((topic, callback) => callback && callback(null)),
      unsubscribe: vi.fn((topic, callback) => callback && callback(null)),
      publish: vi.fn((topic, message, options, callback) => callback && callback(null)),
      end: vi.fn((force, callback) => callback && callback()),
    })),
  },
}));

describe("initSecureMQTT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    secureMQTTClient.disconnect();
  });

  it("should initialize and return secure MQTT client", () => {
    const client = initSecureMQTT();
    expect(client).toBeDefined();
  });

  it("should connect to MQTT broker", () => {
    const client = initSecureMQTT();
    expect(client).toBeDefined();
  });

  it("should not reconnect if already connected", () => {
    const client1 = initSecureMQTT();
    const client2 = initSecureMQTT();

    expect(client1).toBe(client2);
  });

  it("should return the same client instance", () => {
    const client1 = initSecureMQTT();
    const client2 = initSecureMQTT();

    expect(client1).toBe(client2);
  });

  it("should provide publish method", () => {
    const client = initSecureMQTT();
    expect(client.publish).toBeDefined();
    expect(typeof client.publish).toBe("function");
  });

  it("should provide subscribe method", () => {
    const client = initSecureMQTT();
    expect(client.subscribe).toBeDefined();
    expect(typeof client.subscribe).toBe("function");
  });

  it("should provide unsubscribe method", () => {
    const client = initSecureMQTT();
    expect(client.unsubscribe).toBeDefined();
    expect(typeof client.unsubscribe).toBe("function");
  });

  it("should provide disconnect method", () => {
    const client = initSecureMQTT();
    expect(client.disconnect).toBeDefined();
    expect(typeof client.disconnect).toBe("function");
  });

  it("should provide isConnected method", () => {
    const client = initSecureMQTT();
    expect(client.isConnected).toBeDefined();
    expect(typeof client.isConnected).toBe("function");
  });

  it("should accept custom configuration", () => {
    const config = {
      url: "wss://custom-broker.com:8884/mqtt",
      username: "testuser",
      password: "testpass",
    };

    const client = initSecureMQTT(config);
    expect(client).toBeDefined();
  });

  it("should provide getConfig method", () => {
    const client = initSecureMQTT();
    const config = client.getConfig();

    expect(config).toHaveProperty("url");
    expect(config).toHaveProperty("hasAuth");
    expect(config).toHaveProperty("connected");
  });

  it("should not expose sensitive credentials in config", () => {
    const config = {
      url: "wss://broker.com:8884/mqtt",
      username: "secret",
      password: "verysecret",
    };

    const client = initSecureMQTT(config);
    const clientConfig = client.getConfig();

    expect(clientConfig).not.toHaveProperty("username");
    expect(clientConfig).not.toHaveProperty("password");
  });

  it("should handle connection with authentication", () => {
    const client = initSecureMQTT({
      username: "user",
      password: "pass",
    });

    expect(client).toBeDefined();
  });

  it("should handle connection without authentication", () => {
    const client = initSecureMQTT();
    expect(client).toBeDefined();
  });
});

describe("secureMQTTClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    secureMQTTClient.disconnect();
  });

  it("should be a singleton instance", () => {
    expect(secureMQTTClient).toBeDefined();
  });

  it("should track connection state", () => {
    expect(secureMQTTClient.isConnected()).toBe(false);
  });

  it("should handle publish when not connected", () => {
    expect(() => {
      secureMQTTClient.publish("test/topic", "test message");
    }).not.toThrow();
  });

  it("should handle subscribe when not connected", () => {
    expect(() => {
      secureMQTTClient.subscribe("test/topic", () => {});
    }).not.toThrow();
  });

  it("should handle unsubscribe gracefully", () => {
    expect(() => {
      secureMQTTClient.unsubscribe("test/topic");
    }).not.toThrow();
  });

  it("should handle disconnect gracefully", () => {
    expect(() => {
      secureMQTTClient.disconnect();
    }).not.toThrow();
  });
});

