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

  it("should return disabled state with empty data", () => {
    const { result } = renderHook(() => useRestoreLogsSummary(null));

    // Check that hook returns disabled state
    expect(result.current.loading).toBe(false);
    expect(result.current.data).not.toBe(null);
    expect(result.current.data?.summary.total).toBe(0);
    expect(result.current.data?.summary.unique_docs).toBe(0);
    expect(result.current.data?.summary.avg_per_day).toBe(0);
    expect(result.current.data?.byDay).toHaveLength(0);
    expect(result.current.data?.byStatus).toHaveLength(0);
  });

  it("should return error indicating database schema not configured", () => {
    const { result } = renderHook(() => useRestoreLogsSummary(null));

    expect(result.current.error).not.toBe(null);
    expect(result.current.error?.message).toContain("Database schema not configured");
    expect(result.current.error?.message).toContain("document_restore_logs");
  });

  it("should provide a refetch function that does nothing", async () => {
    const { result } = renderHook(() => useRestoreLogsSummary(null));

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe("function");
    
    // Should not throw when called
    await expect(result.current.refetch()).resolves.not.toThrow();
  });

  it("should accept email filter parameter without error", () => {
    const testEmail = "test@example.com";
    
    // Should not throw when called with email
    expect(() => renderHook(() => useRestoreLogsSummary(testEmail))).not.toThrow();
  });

  it("should work with null email parameter", () => {
    // Should not throw when called with null
    expect(() => renderHook(() => useRestoreLogsSummary(null))).not.toThrow();
  });
});
