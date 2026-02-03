/**
 * Unit Tests: Integration Status Library
 * Core R02 Compliance - Data Visibility Guards
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("integration-status library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export IntegrationStatus type values", async () => {
    const module = await import("@/lib/integration-status");
    
    // Core functions should be exported
    expect(module.canShowData).toBeDefined();
    expect(module.getStatusMessage).toBeDefined();
    expect(module.getStatusColor).toBeDefined();
    expect(module.createInitialState).toBeDefined();
  });

  describe("canShowData", () => {
    it("should return true for CONNECTED status", async () => {
      const { canShowData } = await import("@/lib/integration-status");
      expect(canShowData("CONNECTED")).toBe(true);
    });

    it("should return true for DEGRADED status", async () => {
      const { canShowData } = await import("@/lib/integration-status");
      expect(canShowData("DEGRADED")).toBe(true);
    });

    it("should return false for DISCONNECTED status", async () => {
      const { canShowData } = await import("@/lib/integration-status");
      expect(canShowData("DISCONNECTED")).toBe(false);
    });

    it("should return false for NOT_CONFIGURED status", async () => {
      const { canShowData } = await import("@/lib/integration-status");
      expect(canShowData("NOT_CONFIGURED")).toBe(false);
    });

    it("should return false for ERROR status", async () => {
      const { canShowData } = await import("@/lib/integration-status");
      expect(canShowData("ERROR")).toBe(false);
    });
  });

  describe("getStatusMessage", () => {
    it("should return Portuguese messages for all statuses", async () => {
      const { getStatusMessage } = await import("@/lib/integration-status");
      
      const statuses = ["CONNECTED", "DEGRADED", "DISCONNECTED", "NOT_CONFIGURED", "ERROR"] as const;
      
      statuses.forEach((status) => {
        const message = getStatusMessage(status);
        expect(typeof message).toBe("string");
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it("should return correct message for CONNECTED", async () => {
      const { getStatusMessage } = await import("@/lib/integration-status");
      expect(getStatusMessage("CONNECTED")).toContain("Conectado");
    });

    it("should return correct message for NOT_CONFIGURED", async () => {
      const { getStatusMessage } = await import("@/lib/integration-status");
      expect(getStatusMessage("NOT_CONFIGURED")).toContain("não configurad");
    });
  });

  describe("getStatusColor", () => {
    it("should return Tailwind color classes for all statuses", async () => {
      const { getStatusColor } = await import("@/lib/integration-status");
      
      const statuses = ["CONNECTED", "DEGRADED", "DISCONNECTED", "NOT_CONFIGURED", "ERROR"] as const;
      
      statuses.forEach((status) => {
        const color = getStatusColor(status);
        expect(typeof color).toBe("string");
        expect(color).toContain("bg-");
      });
    });

    it("should return green for CONNECTED", async () => {
      const { getStatusColor } = await import("@/lib/integration-status");
      expect(getStatusColor("CONNECTED")).toContain("green");
    });

    it("should return red for ERROR", async () => {
      const { getStatusColor } = await import("@/lib/integration-status");
      expect(getStatusColor("ERROR")).toContain("red");
    });
  });

  describe("createInitialState", () => {
    it("should create state with default NOT_CONFIGURED status", async () => {
      const { createInitialState } = await import("@/lib/integration-status");
      
      const state = createInitialState();
      expect(state.status).toBe("NOT_CONFIGURED");
      expect(state.lastCheck).toBeInstanceOf(Date);
    });

    it("should accept custom initial status", async () => {
      const { createInitialState } = await import("@/lib/integration-status");
      
      const state = createInitialState("CONNECTED");
      expect(state.status).toBe("CONNECTED");
    });
  });
});

describe("IntegrationRegistry", () => {
  it("should export registry getter if available", async () => {
    const module = await import("@/lib/integration-status");
    
    // Registry may or may not be exported - just check module loads
    expect(module).toBeDefined();
    expect(module.canShowData).toBeDefined();
  });
});
