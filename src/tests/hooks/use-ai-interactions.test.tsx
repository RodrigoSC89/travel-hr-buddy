import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAIInteractionStats } from "@/hooks/use-ai-interactions";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useAIInteractionStats", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return initial loading state", () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useAIInteractionStats(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should calculate statistics correctly with data", async () => {
    const mockInteractions = [
      {
        id: "1",
        interaction_type: "chat",
        prompt: "Hello",
        response: "Hi",
        success: true,
        duration_ms: 1000,
        tokens_used: 100,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        interaction_type: "checklist_generation",
        prompt: "Create checklist",
        response: "[\"item1\", \"item2\"]",
        success: true,
        duration_ms: 2000,
        tokens_used: 200,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        interaction_type: "chat",
        prompt: "Error test",
        response: null,
        success: false,
        duration_ms: null,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      },
    ];

    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: mockInteractions,
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useAIInteractionStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalInteractions).toBe(3);
    expect(result.current.data?.successRate).toBe(66.67);
    expect(result.current.data?.averageDuration).toBe(1500); // (1000 + 2000) / 2
    expect(result.current.data?.totalTokensUsed).toBe(300);
    expect(result.current.data?.interactionsByType).toEqual({
      chat: 2,
      checklist_generation: 1,
    });
    expect(result.current.data?.recentInteractions.length).toBe(3);
  });

  it("should handle empty data correctly", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useAIInteractionStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalInteractions).toBe(0);
    expect(result.current.data?.successRate).toBe(0);
    expect(result.current.data?.averageDuration).toBe(0);
    expect(result.current.data?.totalTokensUsed).toBe(0);
    expect(result.current.data?.interactionsByType).toEqual({});
    expect(result.current.data?.recentInteractions).toEqual([]);
  });

  it("should handle errors correctly", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useAIInteractionStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("should not fetch when disabled", () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof supabase.from>);

    renderHook(() => useAIInteractionStats(false), { wrapper });

    expect(mockSelect).not.toHaveBeenCalled();
  });
});
