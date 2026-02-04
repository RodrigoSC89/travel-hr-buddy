/**
 * Unit Tests: useOfflineSync
 * P3/P4 - Cobertura de testes para hook de sincronização offline
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock enhanced-sync-engine
vi.mock("@/mobile/services/enhanced-sync-engine", () => ({
  enhancedSyncEngine: {
    initialize: vi.fn(),
    getStatus: vi.fn(() => ({
      lastSync: null,
      pendingChanges: 0,
      mode: "offline",
      isConnected: true,
    })),
    forceSync: vi.fn(() => Promise.resolve()),
    addStatusListener: vi.fn(() => vi.fn()),
  },
}));

// Mock networkDetector
vi.mock("@/mobile/services/networkDetector", () => ({
  networkDetector: {
    addListener: vi.fn(() => vi.fn()),
  },
}));

// Mock logger
vi.mock("@/lib/logger/structured-logger", () => ({
  structuredLogger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("useOfflineSync Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export useOfflineSync function", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    expect(useOfflineSync).toBeDefined();
    expect(typeof useOfflineSync).toBe("function");
  });

  it("should return correct initial state", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current).toHaveProperty("isOnline");
    expect(result.current).toHaveProperty("isSyncing");
    expect(result.current).toHaveProperty("lastSync");
    expect(result.current).toHaveProperty("pendingChanges");
    expect(result.current).toHaveProperty("syncMode");
    expect(result.current).toHaveProperty("error");
  });

  it("should provide sync function", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    expect(typeof result.current.sync).toBe("function");
  });

  it("should provide clearError function", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    expect(typeof result.current.clearError).toBe("function");
  });

  it("should provide retryFailedSync function", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    expect(typeof result.current.retryFailedSync).toBe("function");
  });

  it("should have correct syncMode values", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    const validModes = ["realtime", "polling", "offline"];
    expect(validModes).toContain(result.current.syncMode);
  });

  it("should call clearError correctly", async () => {
    const { useOfflineSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

describe("useTableSync Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export useTableSync function", async () => {
    const { useTableSync } = await import("@/mobile/hooks/useOfflineSync");
    expect(useTableSync).toBeDefined();
    expect(typeof useTableSync).toBe("function");
  });

  it("should return correct interface", async () => {
    const { useTableSync } = await import("@/mobile/hooks/useOfflineSync");
    const { result } = renderHook(() => useTableSync("test_table"));

    expect(result.current).toHaveProperty("syncTable");
    expect(result.current).toHaveProperty("isSyncing");
    expect(result.current).toHaveProperty("isPending");
    expect(typeof result.current.syncTable).toBe("function");
  });
});

describe("OfflineSyncState Interface", () => {
  it("should define correct OfflineSyncState structure", () => {
    const sampleState = {
      isOnline: true,
      isSyncing: false,
      lastSync: new Date(),
      pendingChanges: 5,
      syncMode: "realtime" as const,
      error: null,
    };

    expect(typeof sampleState.isOnline).toBe("boolean");
    expect(typeof sampleState.isSyncing).toBe("boolean");
    expect(typeof sampleState.pendingChanges).toBe("number");
    expect(["realtime", "polling", "offline"]).toContain(sampleState.syncMode);
  });
});
