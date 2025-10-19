import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDocument, getDocument, updateDocument, deleteDocument, listDocuments } from "@/lib/documents/api";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("Documents API", () => {
  const mockUser = { id: "user-123" };
  const mockDocument = {
    id: "doc-123",
    content: "Test content",
    updated_by: "user-123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDocument", () => {
    it("should create a document successfully", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockDocument,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await createDocument({ content: "Test content" });

      expect(result).toEqual(mockDocument);
      expect(mockInsert).toHaveBeenCalledWith({
        content: "Test content",
        updated_by: mockUser.id,
      });
    });

    it("should return null when user is not authenticated", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await createDocument({ content: "Test content" });

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("User not authenticated");
    });

    it("should return null on database error", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await createDocument({ content: "Test content" });

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getDocument", () => {
    it("should fetch a document successfully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockDocument,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await getDocument("doc-123");

      expect(result).toEqual(mockDocument);
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    it("should return null on error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await getDocument("doc-123");

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateDocument", () => {
    it("should update a document successfully", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockDocument,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      const result = await updateDocument("doc-123", "Updated content");

      expect(result).toEqual(mockDocument);
      expect(mockUpdate).toHaveBeenCalledWith({
        content: "Updated content",
        updated_by: mockUser.id,
      });
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document successfully", async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any);

      const result = await deleteDocument("doc-123");

      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: "Error deleting" },
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any);

      const result = await deleteDocument("doc-123");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("listDocuments", () => {
    it("should list all documents", async () => {
      const mockDocuments = [mockDocument, { ...mockDocument, id: "doc-456" }];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockDocuments,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await listDocuments();

      expect(result).toEqual(mockDocuments);
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    it("should return empty array on error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Error" },
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await listDocuments();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
