/**
 * Tests for Control Hub Core
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { controlHub } from "@/modules/control/control-hub/hub_core";

// Mock subsystems
vi.mock("@/modules/control/control-hub/hub_monitor", () => ({
  hubMonitor: {
    initialize: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    getModulesState: vi.fn().mockReturnValue({
      crew: { status: "healthy", lastCheck: new Date() },
      fleet: { status: "healthy", lastCheck: new Date() },
    }),
  },
}));

vi.mock("@/modules/control/control-hub/hub_sync", () => ({
  hubSync: {
    startAutoSync: vi.fn(),
    stopAutoSync: vi.fn(),
    synchronize: vi.fn().mockResolvedValue({ success: true }),
    getLastSync: vi.fn().mockReturnValue(new Date()),
  },
}));

vi.mock("@/modules/control/control-hub/hub_cache", () => ({
  hubCache: {
    getStats: vi.fn().mockReturnValue({
      size: 10,
      capacity: 100,
      pending: 2,
    }),
    addEntry: vi.fn().mockResolvedValue(undefined),
    clearSynchronized: vi.fn(),
  },
}));

vi.mock("@/modules/control/control-hub/hub_bridge", () => ({
  hubBridge: {
    getConnectionQuality: vi.fn().mockReturnValue("good"),
  },
}));

describe("Control Hub Core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (controlHub.isInitialized()) {
      controlHub.parar();
    }
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await controlHub.iniciar();
      expect(controlHub.isInitialized()).toBe(true);
    });

    it("should not initialize twice", async () => {
      await controlHub.iniciar();
      await controlHub.iniciar();
      expect(controlHub.isInitialized()).toBe(true);
    });

    it("should initialize all subsystems", async () => {
      const { hubMonitor } = await import("@/modules/control/control-hub/hub_monitor");
      const { hubSync } = await import("@/modules/control/control-hub/hub_sync");

      await controlHub.iniciar();

      expect(hubMonitor.initialize).toHaveBeenCalledTimes(1);
      expect(hubSync.startAutoSync).toHaveBeenCalledTimes(1);
    });
  });

  describe("State Management", () => {
    it("should return current state", async () => {
      await controlHub.iniciar();
      const state = controlHub.getState();

      expect(state).toBeDefined();
      expect(state.modules).toBeDefined();
      expect(state.connectionQuality).toBe("good");
      expect(state.cacheSize).toBe(10);
      expect(state.systemHealth).toBeDefined();
    });

    it("should calculate system health correctly", async () => {
      await controlHub.iniciar();
      const state = controlHub.getState();

      expect(["healthy", "degraded", "critical"]).toContain(state.systemHealth);
    });
  });

  describe("Synchronization", () => {
    it("should trigger manual sync", async () => {
      await controlHub.iniciar();
      const { hubSync } = await import("@/modules/control/control-hub/hub_sync");

      await controlHub.sincronizar();

      expect(hubSync.synchronize).toHaveBeenCalledTimes(1);
    });

    it("should return sync result", async () => {
      await controlHub.iniciar();
      const result = await controlHub.sincronizar();

      expect(result).toEqual({ success: true });
    });
  });

  describe("Cache Operations", () => {
    it("should add data to cache", async () => {
      await controlHub.iniciar();
      const { hubCache } = await import("@/modules/control/control-hub/hub_cache");

      await controlHub.addToCache("crew", { id: "test" });

      expect(hubCache.addEntry).toHaveBeenCalledWith({
        module: "crew",
        data: { id: "test" },
        synchronized: false,
      });
    });

    it("should get cache statistics", async () => {
      await controlHub.iniciar();
      const stats = controlHub.getCacheStats();

      expect(stats).toEqual({
        size: 10,
        capacity: 100,
        pending: 2,
      });
    });

    it("should clear synchronized cache", async () => {
      await controlHub.iniciar();
      const { hubCache } = await import("@/modules/control/control-hub/hub_cache");

      controlHub.clearSynchronizedCache();

      expect(hubCache.clearSynchronized).toHaveBeenCalledTimes(1);
    });
  });

  describe("Health Monitoring", () => {
    it("should return health check result", async () => {
      await controlHub.iniciar();
      const health = await controlHub.getHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(health.modules).toBeDefined();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should track uptime correctly", async () => {
      await controlHub.iniciar();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const health = await controlHub.getHealth();
      expect(health.uptime).toBeGreaterThan(0);
    });
  });

  describe("Shutdown", () => {
    it("should stop gracefully", async () => {
      await controlHub.iniciar();
      controlHub.parar();

      expect(controlHub.isInitialized()).toBe(false);
    });

    it("should stop all subsystems", async () => {
      await controlHub.iniciar();
      const { hubMonitor } = await import("@/modules/control/control-hub/hub_monitor");
      const { hubSync } = await import("@/modules/control/control-hub/hub_sync");

      controlHub.parar();

      expect(hubMonitor.stop).toHaveBeenCalledTimes(1);
      expect(hubSync.stopAutoSync).toHaveBeenCalledTimes(1);
    });

    it("should handle stop when not initialized", () => {
      expect(() => controlHub.parar()).not.toThrow();
    });
  });
});
