import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDocument, updateDocument, fetchDocument, fetchDocuments, deleteDocument } from "@/lib/documents/api";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Documents API", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDocument", () => {
    it("should create a new document successfully", async () => {
      const mockDocument = {
        id: "doc-123",
        title: "Test Document",
        content: "<p>Test content</p>",
        generated_by: "user-123",
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
          }),
        }),
      });

      const result = await createDocument({
        title: "Test Document",
        content: "<p>Test content</p>",
      });

      expect(result).toEqual(mockDocument);
    });

    it("should throw error when user is not authenticated", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      await expect(
        createDocument({
          title: "Test Document",
          content: "<p>Test content</p>",
        })
      ).rejects.toThrow("User not authenticated");
    });

    it("should handle database errors", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error("Database error") }),
          }),
        }),
      });

      await expect(
        createDocument({
          title: "Test Document",
          content: "<p>Test content</p>",
        })
      ).rejects.toThrow();
    });
  });

  describe("updateDocument", () => {
    it("should update a document successfully", async () => {
      const mockDocument = {
        id: "doc-123",
        title: "Updated Document",
        content: "<p>Updated content</p>",
        updated_by: "user-123",
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
            }),
          }),
        }),
      });

      const result = await updateDocument("doc-123", {
        title: "Updated Document",
        content: "<p>Updated content</p>",
      });

      expect(result).toEqual(mockDocument);
    });
  });

  describe("fetchDocument", () => {
    it("should fetch a document by id", async () => {
      const mockDocument = {
        id: "doc-123",
        title: "Test Document",
        content: "<p>Test content</p>",
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
          }),
        }),
      });

      const result = await fetchDocument("doc-123");

      expect(result).toEqual(mockDocument);
    });
  });

  describe("fetchDocuments", () => {
    it("should fetch all documents for the current user", async () => {
      const mockDocuments = [
        { id: "doc-1", title: "Document 1", content: "<p>Content 1</p>" },
        { id: "doc-2", title: "Document 2", content: "<p>Content 2</p>" },
      ];

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null }),
        }),
      });

      const result = await fetchDocuments();

      expect(result).toEqual(mockDocuments);
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document successfully", async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(deleteDocument("doc-123")).resolves.toBeUndefined();
    });

    it("should handle delete errors", async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: new Error("Delete failed") }),
        }),
      });

      await expect(deleteDocument("doc-123")).rejects.toThrow();
    });
  });
});
