import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useDocumentComments } from "@/hooks/use-document-comments";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe("useDocumentComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock channel subscription
    const mockSubscription = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    };
    (supabase.channel as any).mockReturnValue(mockSubscription);
  });

  it("should fetch document comments successfully", async () => {
    const mockComments = [
      {
        id: "comment-1",
        document_id: "doc-1",
        user_id: "user-1",
        content: "Great document!",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockComments, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useDocumentComments("doc-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(mockComments);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors when fetching comments", async () => {
    const mockError = new Error("Failed to fetch");

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    };

    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useDocumentComments("doc-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });
});
