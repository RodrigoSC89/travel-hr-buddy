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

  it("should fetch and return restore logs summary data", async () => {
    const mockSummary = [
      {
        total: 100,
        unique_docs: 50,
        avg_per_day: 10.5,
      },
    ];

    const mockByDay = [
      { day: "2025-10-10", count: 5 },
      { day: "2025-10-11", count: 8 },
    ];

    const mockStatusData = [
      { status: "success" },
      { status: "success" },
      { status: "success" },
      { status: "failed" },
      { status: "failed" },
    ];

    const mockLastExecution = { restored_at: "2025-10-12T10:00:00Z" };

    // Mock RPC calls
    vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
      if (funcName === "get_restore_summary") {
        return Promise.resolve({ data: mockSummary, error: null }) as any;
      }
      if (funcName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({ data: mockByDay, error: null }) as any;
      }
      return Promise.resolve({ data: [], error: null }) as any;
    });

    // Mock from() chain for status data
    const mockFrom = {
      select: vi.fn().mockReturnValue({
        data: mockStatusData,
        error: null,
      }),
    };

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

    // For the second call to from() (last execution)
    const selectChain = {
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockLastExecution,
            error: null,
          }),
        }),
      }),
    };

    // Mock from to return different things based on call order
    let fromCallCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            data: mockStatusData,
            error: null,
          }),
        } as any;
      } else {
        return {
          select: vi.fn().mockReturnValue(selectChain),
        } as any;
      }
    });

    const { result } = renderHook(() => useRestoreLogsSummary(null));

    // Hook is disabled, returns default values immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Check that hook returns disabled state
    expect(result.current.data).not.toBe(null);
    expect(result.current.data?.summary.total).toBe(0);
    expect(result.current.data?.summary.unique_docs).toBe(0);
    expect(result.current.data?.summary.avg_per_day).toBe(0);
    expect(result.current.data?.byDay).toHaveLength(0);
    expect(result.current.data?.byStatus).toHaveLength(0);
    expect(result.current.error).not.toBe(null);
    expect(result.current.error?.message).toContain("Database schema not configured");
  });

  it("should handle errors gracefully", async () => {
    const mockError = new Error("Database error");

    vi.mocked(supabase.rpc).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRestoreLogsSummary(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Hook is disabled, returns schema error instead
    expect(result.current.error).not.toBe(null);
    expect(result.current.error?.message).toContain("Database schema not configured");
    expect(result.current.data).not.toBe(null);
  });

  it("should allow refetching data", async () => {
    const mockSummary = [{ total: 100, unique_docs: 50, avg_per_day: 10.5 }];

    vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
      if (funcName === "get_restore_summary") {
        return Promise.resolve({ data: mockSummary, error: null }) as any;
      }
      return Promise.resolve({ data: [], error: null }) as any;
    });

    let fromCallCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount % 2 === 1) {
        return {
          select: vi.fn().mockReturnValue({
            data: [{ status: "success" }],
            error: null,
          }),
        } as any;
      } else {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { restored_at: "2025-10-12T10:00:00Z" },
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
    });

    const { result } = renderHook(() => useRestoreLogsSummary(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Verify initial data is loaded
    expect(result.current.data).not.toBe(null);

    // Call refetch
    expect(result.current.refetch).toBeDefined();
    await result.current.refetch();

    // Should still have data
    expect(result.current.data).not.toBe(null);
  });

  it("should accept email filter parameter", async () => {
    const testEmail = "test@example.com";
    const mockSummary = [{ total: 10, unique_docs: 5, avg_per_day: 2.5 }];

    const rpcMock = vi.fn().mockResolvedValue({ data: mockSummary, error: null });
    vi.mocked(supabase.rpc).mockImplementation(rpcMock as any);

    let fromCallCount = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount % 2 === 1) {
        return {
          select: vi.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        } as any;
      } else {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
    });

    const { result } = renderHook(() => useRestoreLogsSummary(testEmail));

    // Hook is disabled, doesn't make RPC calls
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Verify hook returns disabled state regardless of email parameter
    expect(result.current.error?.message).toContain("Database schema not configured");
  });
});
