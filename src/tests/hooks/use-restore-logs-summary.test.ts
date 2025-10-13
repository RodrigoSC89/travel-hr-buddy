import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRestoreLogsSummary } from "@/hooks/use-restore-logs-summary";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe("useRestoreLogsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mock data with database configuration error", () => {
    const { result } = renderHook(() => useRestoreLogsSummary(null));

    // Hook now returns mock data with an error about missing schema
    expect(result.current.loading).toBe(false);
    expect(result.current.data).not.toBe(null);
    expect(result.current.data?.summary.total).toBe(0);
    expect(result.current.data?.summary.unique_docs).toBe(0);
    expect(result.current.data?.summary.avg_per_day).toBe(0);
    expect(result.current.data?.byDay).toHaveLength(0);
    expect(result.current.data?.byStatus).toHaveLength(0);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("Database schema not configured");
  });

  it("should handle email filter parameter gracefully", () => {
    const testEmail = "test@example.com";
    const { result } = renderHook(() => useRestoreLogsSummary(testEmail));

    // Even with email parameter, returns same mock data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).not.toBe(null);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("Database schema not configured");
  });

  it("should provide a no-op refetch function", async () => {
    const { result } = renderHook(() => useRestoreLogsSummary(null));

    expect(result.current.refetch).toBeDefined();
    
    // Refetch should not throw but is a no-op
    await expect(result.current.refetch()).resolves.toBeUndefined();
    
    // Data should remain the same
    expect(result.current.data?.summary.total).toBe(0);
  });
});
