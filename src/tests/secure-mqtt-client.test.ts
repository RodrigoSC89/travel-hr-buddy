/**
 * Tests for Secure MQTT Client
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";
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

describe("initSecureMQTT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize and return MQTT client", () => {
    const client = initSecureMQTT();
    expect(client).toBeDefined();
  });

  it("should connect to MQTT if not already connected", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(false);

    initSecureMQTT();

    expect(mqttClient.connect).toHaveBeenCalled();
  });

  it("should not connect if already connected", () => {
    vi.mocked(mqttClient.isConnected).mockReturnValue(true);

    initSecureMQTT();

    expect(mqttClient.connect).not.toHaveBeenCalled();
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
});
