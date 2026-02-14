/**
 * Tests for Control Hub subsystems
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before imports
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe("Control Hub Core", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports controlHub singleton", async () => {
    const { controlHub } = await import("@/modules/control/control-hub");
    expect(controlHub).toBeDefined();
    expect(typeof controlHub.iniciar).toBe("function");
    expect(typeof controlHub.parar).toBe("function");
    expect(typeof controlHub.getState).toBe("function");
    expect(typeof controlHub.getHealth).toBe("function");
    expect(typeof controlHub.isInitialized).toBe("function");
  });

  it("hubCache exports correctly", async () => {
    const { hubCache } = await import("@/modules/control/control-hub");
    expect(hubCache).toBeDefined();
    expect(typeof hubCache.getStats).toBe("function");
    expect(typeof hubCache.clearSynchronized).toBe("function");
  });

  it("hubBridge exports correctly", async () => {
    const { hubBridge } = await import("@/modules/control/control-hub");
    expect(hubBridge).toBeDefined();
    expect(typeof hubBridge.getConnectionQuality).toBe("function");
  });

  it("hubMonitor exports correctly", async () => {
    const { hubMonitor } = await import("@/modules/control/control-hub");
    expect(hubMonitor).toBeDefined();
    expect(typeof hubMonitor.initialize).toBe("function");
    expect(typeof hubMonitor.stop).toBe("function");
    expect(typeof hubMonitor.getModulesState).toBe("function");
  });

  it("hubSync exports correctly", async () => {
    const { hubSync } = await import("@/modules/control/control-hub");
    expect(hubSync).toBeDefined();
    expect(typeof hubSync.startAutoSync).toBe("function");
    expect(typeof hubSync.stopAutoSync).toBe("function");
    expect(typeof hubSync.synchronize).toBe("function");
    expect(typeof hubSync.getLastSync).toBe("function");
  });
});
