import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDocumentVersions } from "@/hooks/use-document-versions";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useDocumentVersions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch document versions successfully", async () => {
    const mockVersions = [
      {
        id: "version-1",
        document_id: "doc-1",
        content: "Version 1 content",
        created_at: "2024-01-01T00:00:00Z",
        updated_by: "user-1",
      },
      {
        id: "version-2",
        document_id: "doc-1",
        content: "Version 2 content",
        created_at: "2024-01-02T00:00:00Z",
        updated_by: "user-1",
      },
    ];

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockVersions, error: null }),
    };

    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useDocumentVersions("doc-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.versions).toEqual(mockVersions);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors when fetching versions", async () => {
    const mockError = new Error("Failed to fetch");

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    };

    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useDocumentVersions("doc-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.versions).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it("should not fetch when documentId is undefined", () => {
    const mockFrom = vi.fn();
    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useDocumentVersions(undefined));

    expect(result.current.loading).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
