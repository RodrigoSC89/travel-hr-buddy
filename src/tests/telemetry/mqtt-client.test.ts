/**
 * Tests for MQTT Client Wrapper
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { initMQTT } from "@/lib/mqtt";
import { mqttClient } from "@/utils/mqttClient";

// Mock mqttClient
vi.mock("@/utils/mqttClient", () => ({
  mqttClient: {
    connect: vi.fn(),
    isConnected: vi.fn(() => false),
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe("initMQTT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize and return MQTT client", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
  });

  it("should connect to MQTT if not already connected", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(false);

    initMQTT();

    expect(mqttClient.connect).toHaveBeenCalled();
  });

  it("should not connect if already connected", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(true);

    initMQTT();

    expect(mqttClient.connect).not.toHaveBeenCalled();
  });

  it("should use custom broker URL when provided", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(false);

    const customUrl = "wss://custom-broker.com:8884/mqtt";
    initMQTT(customUrl);

    expect(mqttClient.connect).toHaveBeenCalledWith(customUrl);
  });

  it("should use environment variable when no URL provided", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(false);

    initMQTT();

    expect(mqttClient.connect).toHaveBeenCalled();
  });

  it("should return the same client instance", () => {
    const client1 = initMQTT();
    const client2 = initMQTT();

    expect(client1).toBe(client2);
  });

  it("should provide publish method", () => {
    const client = initMQTT();
    expect(client.publish).toBeDefined();
    expect(typeof client.publish).toBe("function");
  });

  it("should provide subscribe method", () => {
    const client = initMQTT();
    expect(client.subscribe).toBeDefined();
    expect(typeof client.subscribe).toBe("function");
  });

  it("should provide unsubscribe method", () => {
    const client = initMQTT();
    expect(client.unsubscribe).toBeDefined();
    expect(typeof client.unsubscribe).toBe("function");
  });

  it("should provide disconnect method", () => {
    const client = initMQTT();
    expect(client.disconnect).toBeDefined();
    expect(typeof client.disconnect).toBe("function");
  });

  it("should provide isConnected method", () => {
    const client = initMQTT();
    expect(client.isConnected).toBeDefined();
    expect(typeof client.isConnected).toBe("function");
  });
});
