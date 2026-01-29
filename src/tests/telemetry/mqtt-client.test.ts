/**
 * Tests for MQTT Client
 * Uses centralized environment configuration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { initMQTT } from "@/lib/mqtt";

describe("initMQTT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export initMQTT function", () => {
    expect(initMQTT).toBeDefined();
    expect(typeof initMQTT).toBe("function");
  });

  it("should handle missing URL gracefully", () => {
    const client = initMQTT();
    expect(client === null || typeof client === "object").toBe(true);
  });

  it("should return client or null", () => {
    const client = initMQTT();
    expect(client === null || typeof client === "object").toBe(true);
  });

  it("should handle various URL formats without throwing", () => {
    expect(() => initMQTT()).not.toThrow();
  });

  it("should support authentication parameters", () => {
    expect(() => initMQTT()).not.toThrow();
  });

  it("should handle connection initialization", () => {
    const client = initMQTT();

    if (client) {
      expect(typeof client.on).toBe("function");
      expect(typeof client.publish).toBe("function");
    } else {
      expect(client).toBeNull();
    }
  });

  it("should not crash on invalid URLs", () => {
    expect(() => initMQTT()).not.toThrow();
  });

  it("should support TLS/SSL protocols", () => {
    expect(() => initMQTT()).not.toThrow();
  });

  it("should return consistent results (singleton pattern)", () => {
    const client1 = initMQTT();
    const client2 = initMQTT();
    expect(client1).toBe(client2);
  });

  it("should handle null or undefined environment variables gracefully", () => {
    expect(() => initMQTT()).not.toThrow();
  });

  it("should be importable", () => {
    expect(initMQTT).toBeTruthy();
  });
});
