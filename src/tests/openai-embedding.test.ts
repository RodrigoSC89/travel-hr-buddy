// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";
import { setupMockEnv, setMockEnvVar, isApiKeyConfigured } from "./helpers/test-env";

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
    setupMockEnv({ VITE_OPENAI_API_KEY: "test-api-key" });
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

    it("should validate API key configuration", async () => {
      // Test the validation logic
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(true);
      
      setMockEnvVar("VITE_OPENAI_API_KEY", "");
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(false);
      
      setMockEnvVar("VITE_OPENAI_API_KEY", "your_openai_api_key_here");
      expect(isApiKeyConfigured("VITE_OPENAI_API_KEY")).toBe(false);
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
