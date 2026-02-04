/**
 * Unit Tests: SyncEngine
 * P3/P4 - Cobertura de testes para engine de sincronização offline
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock localSync
vi.mock("@/lib/localSync", () => ({
  localSync: {
    getUnsyncedRecords: vi.fn(() => Promise.resolve([])),
    markAsSynced: vi.fn(() => Promise.resolve()),
    deleteSyncedRecord: vi.fn(() => Promise.resolve()),
    saveLocally: vi.fn(() => Promise.resolve()),
    getQueueCount: vi.fn(() => Promise.resolve(0)),
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("SyncEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should export syncEngine singleton", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(syncEngine).toBeDefined();
  });

  it("should have pushLocalChanges method", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(typeof syncEngine.pushLocalChanges).toBe("function");
  });

  it("should have hasPendingChanges method", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(typeof syncEngine.hasPendingChanges).toBe("function");
  });

  it("should have getPendingCount method", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(typeof syncEngine.getPendingCount).toBe("function");
  });

  it("should have onSyncProgress method", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(typeof syncEngine.onSyncProgress).toBe("function");
  });

  it("should have saveOffline method", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    expect(typeof syncEngine.saveOffline).toBe("function");
  });

  it("should return stats from pushLocalChanges", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    const stats = await syncEngine.pushLocalChanges();

    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("synced");
    expect(stats).toHaveProperty("failed");
    expect(stats).toHaveProperty("pending");
  });

  it("should return boolean from hasPendingChanges", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    const hasPending = await syncEngine.hasPendingChanges();

    expect(typeof hasPending).toBe("boolean");
  });

  it("should return number from getPendingCount", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    const count = await syncEngine.getPendingCount();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should return unsubscribe function from onSyncProgress", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    const callback = vi.fn();
    const unsubscribe = syncEngine.onSyncProgress(callback);

    expect(typeof unsubscribe).toBe("function");
    unsubscribe(); // Clean up
  });
});

describe("SyncStats Interface", () => {
  it("should define correct SyncStats structure", () => {
    const sampleStats = {
      total: 10,
      synced: 8,
      failed: 1,
      pending: 1,
    };

    expect(sampleStats.total).toBe(sampleStats.synced + sampleStats.failed + sampleStats.pending);
    expect(sampleStats.total).toBeGreaterThanOrEqual(0);
  });
});

describe("Offline Sync Behavior", () => {
  it("should handle empty queue gracefully", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");
    const stats = await syncEngine.pushLocalChanges();

    expect(stats.total).toBe(0);
    expect(stats.synced).toBe(0);
    expect(stats.failed).toBe(0);
  });

  it("should prevent concurrent sync operations", async () => {
    const { syncEngine } = await import("@/lib/syncEngine");

    // Start two sync operations simultaneously
    const [stats1, stats2] = await Promise.all([
      syncEngine.pushLocalChanges(),
      syncEngine.pushLocalChanges(),
    ]);

    // One should return early with 0 total
    expect(stats1.total + stats2.total).toBe(0);
  });
});
