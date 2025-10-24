import { describe, it, expect, vi, beforeEach } from "vitest";
import { querySimilarJobs } from "@/lib/ai/copilot/querySimilarJobs";
import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "@/services/mmi/embeddingService";

// Mock the dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("@/services/mmi/embeddingService", () => ({
  generateEmbedding: vi.fn(),
}));

describe("querySimilarJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query similar jobs successfully", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    const mockJobs = [
      {
        id: "test-id-1",
        title: "Falha no gerador",
        description: "Gerador com problema",
        component: "Gerador Diesel",
        asset_name: "Gerador STBD",
        created_at: "2024-01-01T00:00:00Z",
        status: "completed",
        priority: "high",
        similarity: 0.85,
      },
      {
        id: "test-id-2",
        title: "Manutenção bomba",
        description: "Bomba com vibração",
        component: "Sistema Hidráulico",
        asset_name: "Bomba #3",
        created_at: "2024-01-02T00:00:00Z",
        status: "completed",
        priority: "medium",
        similarity: 0.78,
      },
    ];

    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockJobs,
      error: null,
    });

    const input = "Gerador com ruído incomum";
    const result = await querySimilarJobs(input);

    expect(generateEmbedding).toHaveBeenCalledWith(input);
    expect(supabase.rpc).toHaveBeenCalledWith("match_mmi_jobs", {
      query_embedding: mockEmbedding,
      match_threshold: 0.7,
      match_count: 5,
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("test-id-1");
    expect(result[0].metadata.title).toBe("Falha no gerador");
    expect(result[0].metadata.component_id).toBe("Gerador Diesel");
    expect(result[0].similarity).toBe(0.85);
  });

  it("should handle custom threshold and count", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    await querySimilarJobs("test input", 0.8, 3);

    expect(supabase.rpc).toHaveBeenCalledWith("match_mmi_jobs", {
      query_embedding: mockEmbedding,
      match_threshold: 0.8,
      match_count: 3,
    });
  });

  it("should handle database errors and return mock data", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    const result = await querySimilarJobs("test input");

    // Should return mock data on error
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("mock-1");
    expect(result[0].metadata.title).toBe("Falha no gerador STBD");
  });

  it("should handle empty results", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await querySimilarJobs("test input");

    expect(result).toEqual([]);
  });

  it("should transform job data correctly", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    const mockJob = {
      id: "test-id",
      title: "Test Job",
      description: "Test Description",
      component: null,
      asset_name: "Test Asset",
      created_at: "2024-01-01T00:00:00Z",
      status: "pending",
      priority: "low",
      similarity: 0.75,
    };

    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [mockJob],
      error: null,
    });

    const result = await querySimilarJobs("test");

    expect(result[0].metadata.component_id).toBe("Test Asset");
    expect(result[0].metadata.ai_suggestion).toBe("Test Description");
  });

  it("should handle missing optional fields", async () => {
    const mockEmbedding = Array.from({ length: 1536 }, () => 0.1);
    const mockJob = {
      id: "test-id",
      title: null,
      description: null,
      component: null,
      asset_name: null,
      created_at: null,
      status: null,
      priority: null,
      similarity: null,
    };

    vi.mocked(generateEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [mockJob],
      error: null,
    });

    const result = await querySimilarJobs("test");

    expect(result[0].metadata.title).toBe("Sem título");
    expect(result[0].metadata.component_id).toBe("Componente não especificado");
    expect(result[0].metadata.ai_suggestion).toBe("N/A");
    expect(result[0].similarity).toBe(0);
  });
});
