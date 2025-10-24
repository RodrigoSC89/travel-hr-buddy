import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      embeddings: {
        create: vi.fn(),
      },
    })),
  };
});

describe("OpenAI Embedding Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    import.meta.env.VITE_OPENAI_API_KEY = "test-api-key";
  });

  describe("createEmbedding", () => {
    it("should create embedding successfully with valid API key", async () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockResponse = {
        data: [{ embedding: mockEmbedding }],
      };

      const OpenAI = (await import("openai")).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      vi.mocked(OpenAI).mockImplementation(() => ({
        embeddings: {
          create: mockCreate,
        },
      }) as unknown);

      const result = await createEmbedding("Test text for embedding");

      expect(result).toEqual(mockEmbedding);
      expect(mockCreate).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "Test text for embedding",
        dimensions: 1536,
      });
    });

    it("should throw error when API key is not configured", async () => {
      import.meta.env.VITE_OPENAI_API_KEY = "";

      await expect(createEmbedding("Test text")).rejects.toThrow(
        "OpenAI API key not configured"
      );
    });

    it("should throw error when API key is placeholder", async () => {
      import.meta.env.VITE_OPENAI_API_KEY = "your_openai_api_key_here";

      await expect(createEmbedding("Test text")).rejects.toThrow(
        "OpenAI API key not configured"
      );
    });

    it("should throw error when OpenAI API call fails", async () => {
      const OpenAI = (await import("openai")).default;
      const mockCreate = vi.fn().mockRejectedValue(new Error("API call failed"));
      vi.mocked(OpenAI).mockImplementation(() => ({
        embeddings: {
          create: mockCreate,
        },
      }) as unknown);

      await expect(createEmbedding("Test text")).rejects.toThrow();
    });

    it("should use correct model and dimensions", async () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockResponse = {
        data: [{ embedding: mockEmbedding }],
      };

      const OpenAI = (await import("openai")).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      vi.mocked(OpenAI).mockImplementation(() => ({
        embeddings: {
          create: mockCreate,
        },
      }) as unknown);

      await createEmbedding("Test text");

      expect(mockCreate).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "Test text",
        dimensions: 1536,
      });
    });

    it("should handle empty text input", async () => {
      const mockEmbedding = new Array(1536).fill(0);
      const mockResponse = {
        data: [{ embedding: mockEmbedding }],
      };

      const OpenAI = (await import("openai")).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      vi.mocked(OpenAI).mockImplementation(() => ({
        embeddings: {
          create: mockCreate,
        },
      }) as unknown);

      const result = await createEmbedding("");

      expect(result).toEqual(mockEmbedding);
      expect(mockCreate).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "",
        dimensions: 1536,
      });
    });

    it("should return array of correct length (1536)", async () => {
      const mockEmbedding = new Array(1536).fill(0.5);
      const mockResponse = {
        data: [{ embedding: mockEmbedding }],
      };

      const OpenAI = (await import("openai")).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      vi.mocked(OpenAI).mockImplementation(() => ({
        embeddings: {
          create: mockCreate,
        },
      }) as unknown);

      const result = await createEmbedding("Test text");

      expect(result).toHaveLength(1536);
    });
  });
});
