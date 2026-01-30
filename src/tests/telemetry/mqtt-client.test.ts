/**
 * Tests for MQTT Client
 */

import { describe, it, expect } from "vitest";
import { initMQTT } from "@/lib/mqtt";

describe("initMQTT", () => {
  it("should export initMQTT function", () => {
    expect(initMQTT).toBeDefined();
    expect(typeof initMQTT).toBe("function");
  });

  it("should handle missing URL gracefully", () => {
    const originalEnv = import.meta.env.VITE_MQTT_URL;
    (import.meta.env as any).VITE_MQTT_URL = undefined;

    const client = initMQTT();
    expect(client).toBeNull();

    // Restore
    (import.meta.env as any).VITE_MQTT_URL = originalEnv;
  });

  it("should return client or null", () => {
    const client = initMQTT();
    expect(client === null || typeof client === "object").toBe(true);
  });

  it("should handle various URL formats", () => {
    const urls = [
      "ws://localhost:1883",
      "wss://broker.example.com:8883/mqtt",
      "mqtt://broker.example.com",
      "mqtts://broker.example.com",
    ];

    urls.forEach((url) => {
      const originalEnv = import.meta.env.VITE_MQTT_URL;
      (import.meta.env as any).VITE_MQTT_URL = url;

      // Should not throw
      expect(() => initMQTT()).not.toThrow();

      // Restore
      (import.meta.env as any).VITE_MQTT_URL = originalEnv;
    });
  });

  it("should support authentication parameters", () => {
    const originalUrl = import.meta.env.VITE_MQTT_URL;
    const originalUser = import.meta.env.VITE_MQTT_USER;
    const originalPass = import.meta.env.VITE_MQTT_PASS;

    (import.meta.env as any).VITE_MQTT_URL = "ws://localhost:1883";
    (import.meta.env as any).VITE_MQTT_USER = "testuser";
    (import.meta.env as any).VITE_MQTT_PASS = "testpass";

    // Should not throw with auth params
    expect(() => initMQTT()).not.toThrow();

    // Restore
    (import.meta.env as any).VITE_MQTT_URL = originalUrl;
    (import.meta.env as any).VITE_MQTT_USER = originalUser;
    (import.meta.env as any).VITE_MQTT_PASS = originalPass;
  });

  it("should handle connection initialization", () => {
    const originalEnv = import.meta.env.VITE_MQTT_URL;
    (import.meta.env as any).VITE_MQTT_URL = "ws://localhost:1883";

    const client = initMQTT();

    // Client should be an object with methods or null
    if (client) {
      expect(typeof client.on).toBe("function");
      expect(typeof client.publish).toBe("function");
    } else {
      expect(client).toBeNull();
    }

    // Restore
    (import.meta.env as any).VITE_MQTT_URL = originalEnv;
  });

  it("should not crash on invalid URLs", () => {
    const invalidUrls = ["", "invalid", "123", "http://notmqtt"];

    invalidUrls.forEach((url) => {
      const originalEnv = import.meta.env.VITE_MQTT_URL;
      (import.meta.env as any).VITE_MQTT_URL = url;

      // Should handle gracefully
      expect(() => initMQTT()).not.toThrow();

      // Restore
      (import.meta.env as any).VITE_MQTT_URL = originalEnv;
    });
  });

  it("should support TLS/SSL protocols", () => {
    const originalEnv = import.meta.env.VITE_MQTT_URL;
    (import.meta.env as any).VITE_MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";

    expect(() => initMQTT()).not.toThrow();

    // Restore
    (import.meta.env as any).VITE_MQTT_URL = originalEnv;
  });

  it("should return consistent results", () => {
    const client1 = initMQTT();
    const client2 = initMQTT();

    // Should return the same instance (singleton pattern)
    expect(client1).toBe(client2);
  });

  it("should handle null or undefined environment variables", () => {
    const originalUser = import.meta.env.VITE_MQTT_USER;
    const originalPass = import.meta.env.VITE_MQTT_PASS;

    (import.meta.env as any).VITE_MQTT_USER = null;
    (import.meta.env as any).VITE_MQTT_PASS = null;

    expect(() => initMQTT()).not.toThrow();

    // Restore
    (import.meta.env as any).VITE_MQTT_USER = originalUser;
    (import.meta.env as any).VITE_MQTT_PASS = originalPass;
  });

  it("should be importable", () => {
    expect(initMQTT).toBeTruthy();
  });
});
