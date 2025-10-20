/**
 * Control Hub Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HubCache } from "@/modules/control_hub/hub_cache";

describe("Control Hub - HubCache", () => {
  let cache: HubCache;

  beforeEach(() => {
    localStorage.clear();
    cache = new HubCache();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should add entry to cache", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    const stats = cache.getStats();
    expect(stats.total).toBe(1);
    expect(stats.pending).toBe(1);
  });

  it("should get pending entries", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    await cache.addEntry({
      module: "sgso",
      data: { test: "data2" },
      synchronized: true,
    });

    const pending = cache.getPendingEntries();
    expect(pending).toHaveLength(1);
    expect(pending[0].module).toBe("mmi");
  });

  it("should mark entries as synchronized", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    const pending = cache.getPendingEntries();
    const ids = pending.map(entry => entry.id);
    
    cache.markSynchronized(ids);
    
    const newPending = cache.getPendingEntries();
    expect(newPending).toHaveLength(0);
  });

  it("should get cache statistics", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    const stats = cache.getStats();
    expect(stats.total).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.synchronized).toBe(0);
    expect(stats.size).toBeGreaterThan(0);
    expect(stats.capacity).toBe(104857600); // 100MB
    expect(stats.usagePercent).toBeGreaterThan(0);
  });

  it("should clear synchronized entries", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data1" },
      synchronized: true,
    });

    await cache.addEntry({
      module: "sgso",
      data: { test: "data2" },
      synchronized: false,
    });

    cache.clearSynchronized();
    
    const stats = cache.getStats();
    expect(stats.total).toBe(1);
    expect(stats.pending).toBe(1);
  });

  it("should clear all cache", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    cache.clearAll();
    
    const stats = cache.getStats();
    expect(stats.total).toBe(0);
  });

  it("should calculate cache size in bytes", async () => {
    await cache.addEntry({
      module: "mmi",
      data: { test: "data" },
      synchronized: false,
    });

    const size = cache.getCacheSize();
    expect(size).toBeGreaterThan(0);
  });
});

describe("Control Hub - Module Structure", () => {
  it("should have correct module configuration", async () => {
    const config = await import("@/modules/control_hub/hub_config.json");
    
    expect(config.default.modules).toBeDefined();
    expect(config.default.modules.mmi).toBeDefined();
    expect(config.default.modules["peo-dp"]).toBeDefined();
    expect(config.default.modules["dp-intelligence"]).toBeDefined();
    expect(config.default.modules.bridgelink).toBeDefined();
    expect(config.default.modules.sgso).toBeDefined();
  });

  it("should have cache configuration", async () => {
    const config = await import("@/modules/control_hub/hub_config.json");
    
    expect(config.default.cache).toBeDefined();
    expect(config.default.cache.maxSize).toBe(104857600); // 100MB
    expect(config.default.cache.storageKey).toBe("nautilus_control_hub_cache");
  });

  it("should have sync configuration", async () => {
    const config = await import("@/modules/control_hub/hub_config.json");
    
    expect(config.default.sync).toBeDefined();
    expect(config.default.sync.autoSyncInterval).toBe(300000); // 5 minutes
    expect(config.default.sync.retryAttempts).toBe(3);
  });

  it("should have bridgelink configuration", async () => {
    const config = await import("@/modules/control_hub/hub_config.json");
    
    expect(config.default.bridgelink).toBeDefined();
    expect(config.default.bridgelink.endpoint).toBe("/api/bridgelink/sync");
    expect(config.default.bridgelink.timeout).toBe(30000);
  });
});

describe("Control Hub - Types", () => {
  it("should export required types", async () => {
    const types = await import("@/modules/control_hub/types");
    
    // Check that types module exists and exports
    expect(types).toBeDefined();
  });
});

describe("Control Hub - Integration", () => {
  it("should export all required modules", async () => {
    const hub = await import("@/modules/control_hub");
    
    expect(hub.controlHub).toBeDefined();
    expect(hub.hubMonitor).toBeDefined();
    expect(hub.hubSync).toBeDefined();
    expect(hub.hubCache).toBeDefined();
    expect(hub.hubBridge).toBeDefined();
  });
});
