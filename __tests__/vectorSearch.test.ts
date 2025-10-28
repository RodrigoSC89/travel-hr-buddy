/**
 * Vector Search Service Tests
 * Tests for Vault AI semantic search functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { vectorSearch } from "@/modules/vault_ai/services/vectorSearch";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
    }),
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "test-doc-id" },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    }),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock fetch for OpenAI API
global.fetch = vi.fn();

describe("Vector Search Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock OpenAI embedding response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          embedding: new Array(1536).fill(0.1), // Mock embedding vector
        }],
      }),
    });
  });

  describe("searchDocuments", () => {
    it("should search documents with default parameters", async () => {
      const mockResults = [
        {
          id: "1",
          title: "Safety Procedures",
          content: "Safety procedures for offshore operations",
          similarity: 0.85,
          created_at: new Date().toISOString(),
        },
      ];

      const { supabase } = await import("@/integrations/supabase/client");
      (supabase.rpc as any).mockReturnValueOnce({
        eq: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        then: async (callback: any) => callback({ data: mockResults, error: null }),
      });

      const results = await vectorSearch.searchDocuments("safety procedures");

      expect(results).toEqual(mockResults);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("openai.com"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should apply filters when provided", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const mockRpc = {
        eq: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        then: async (callback: any) => callback({ data: [], error: null }),
      };

      (supabase.rpc as any).mockReturnValueOnce(mockRpc);

      await vectorSearch.searchDocuments("test query", {
        documentType: "policy",
        category: "safety",
        tags: ["offshore"],
        matchThreshold: 0.8,
      });

      expect(mockRpc.eq).toHaveBeenCalled();
      expect(mockRpc.contains).toHaveBeenCalled();
    });

    it("should handle search errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("API Error"));

      await expect(
        vectorSearch.searchDocuments("test query")
      ).rejects.toThrow("API Error");
    });
  });

  describe("indexDocument", () => {
    it("should index document with metadata", async () => {
      const documentId = await vectorSearch.indexDocument(
        "Test Document",
        "Test content",
        {
          documentType: "policy",
          category: "safety",
          tags: ["test"],
        }
      );

      expect(documentId).toBe("test-doc-id");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should handle indexing errors", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Insert failed"),
            }),
          }),
        }),
      });

      await expect(
        vectorSearch.indexDocument("Test", "Content")
      ).rejects.toThrow();
    });
  });

  describe("updateDocumentEmbedding", () => {
    it("should update document embedding", async () => {
      await expect(
        vectorSearch.updateDocumentEmbedding("doc-id", "Title", "Content")
      ).resolves.not.toThrow();

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("batchIndexDocuments", () => {
    it("should index multiple documents", async () => {
      const documents = [
        { title: "Doc 1", content: "Content 1" },
        { title: "Doc 2", content: "Content 2" },
      ];

      const ids = await vectorSearch.batchIndexDocuments(documents);

      expect(ids).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should continue on individual failures", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      let callCount = 0;
      
      (supabase.from as any).mockImplementation(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => {
              const isSuccess = callCount === 0;
              callCount++;
              return Promise.resolve({
                data: isSuccess ? { id: `success-${callCount}` } : null,
                error: isSuccess ? null : new Error("Failed"),
              });
            }),
          }),
        }),
      }));

      const documents = [
        { title: "Doc 1", content: "Content 1" },
        { title: "Doc 2", content: "Content 2" },
      ];

      const ids = await vectorSearch.batchIndexDocuments(documents);

      // Should continue even if one fails (first succeeds, second fails)
      expect(ids.length).toBe(1);
      expect(ids[0]).toContain("success");
    });
  });
});
