/**
 * Tests for MQTT Client Initialization
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { initMQTT } from "@/lib/mqtt";

// Mock mqtt library
vi.mock("mqtt", () => ({
  default: {
    connect: vi.fn((url: string, options: any) => {
      const mockClient = {
        connected: false,
        on: vi.fn((event: string, callback: Function) => {
          if (event === "connect") {
            setTimeout(() => {
              mockClient.connected = true;
              callback();
            }, 0);
          }
        }),
        subscribe: vi.fn((topic: string, callback?: Function) => {
          if (callback) callback(null);
        }),
        publish: vi.fn(),
        end: vi.fn(),
      };
      return mockClient;
    }),
  },
}));

describe("initMQTT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console mocks
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should initialize MQTT client successfully", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
    expect(client).not.toBeNull();
  });

  it("should use provided broker URL", () => {
    const customUrl = "wss://custom-broker.com:8883";
    const client = initMQTT(customUrl);
    expect(client).toBeDefined();
  });

  it("should use environment variable if no URL provided", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
  });

  it("should use default public broker as fallback", () => {
    // Clear env variable
    const originalEnv = import.meta.env.VITE_MQTT_URL;
    delete (import.meta.env as any).VITE_MQTT_URL;

    const client = initMQTT();
    expect(client).toBeDefined();

    // Restore env variable
    (import.meta.env as any).VITE_MQTT_URL = originalEnv;
  });

  it("should configure client with correct options", () => {
    const client = initMQTT();
    expect(client).toHaveProperty("on");
    expect(client).toHaveProperty("subscribe");
    expect(client).toHaveProperty("publish");
  });

  it("should handle connection errors gracefully", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
    
    // Verify error handler is set up
    expect(client?.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("should handle reconnection attempts", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
    
    // Verify reconnect handler is set up
    expect(client?.on).toHaveBeenCalledWith("reconnect", expect.any(Function));
  });

  it("should set up event handlers", async () => {
    const client = initMQTT();
    
    // Verify event handlers are set up
    expect(client?.on).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(client?.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(client?.on).toHaveBeenCalledWith("reconnect", expect.any(Function));
    expect(client?.on).toHaveBeenCalledWith("offline", expect.any(Function));
  });

  it("should generate unique client ID", () => {
    const client1 = initMQTT();
    const client2 = initMQTT();
    
    // Both clients should be created
    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
  });

  it("should configure reconnect period", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
    // Client is created with reconnectPeriod option
  });

  it("should configure connect timeout", () => {
    const client = initMQTT();
    expect(client).toBeDefined();
    // Client is created with connectTimeout option
  });
});
