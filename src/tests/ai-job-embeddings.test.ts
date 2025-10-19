import { describe, it, expect, beforeEach, vi } from "vitest";
import { seedJobsForTraining } from "@/lib/ai/embedding/seedJobsForTraining";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

// Mock dependencies
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

vi.mock("@/lib/ai/openai/createEmbedding", () => ({
  createEmbedding: vi.fn(),
}));

describe("AI Job Embeddings - seedJobsForTraining", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("seedJobsForTraining", () => {
    it("should fetch jobs and create embeddings successfully", async () => {
      const mockJobs = [
        {
          id: "job-1",
          title: "Manutenção do motor principal",
          component_id: "motor-001",
          status: "completed",
          ai_suggestion: "Substituir filtro de óleo",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "job-2",
          title: "Verificação do sistema hidráulico",
          component_id: "hidraulica-002",
          status: "completed",
          ai_suggestion: "Trocar vedações",
          created_at: "2024-01-14T10:00:00Z",
        },
      ];

      const mockEmbedding = new Array(1536).fill(0.1);

      // Mock createEmbedding
      vi.mocked(createEmbedding).mockResolvedValue(mockEmbedding);

      // Mock Supabase client chain
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: mockJobs,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        } else if (table === "job_embeddings") {
          return {
            upsert: mockUpsert,
          };
        }
        return {};
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      const result = await seedJobsForTraining();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("embedding");
      expect(result[0]).toHaveProperty("metadata");
      expect(result[0].metadata).toHaveProperty("component_id");
      expect(result[0].metadata).toHaveProperty("title");
      expect(result[0].metadata).toHaveProperty("created_at");
      expect(createEmbedding).toHaveBeenCalledTimes(2);
      expect(mockUpsert).toHaveBeenCalledTimes(2);
    });

    it("should throw error when no jobs are found", async () => {
      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      await expect(seedJobsForTraining()).rejects.toThrow("Erro ao buscar jobs");
    });

    it("should throw error when database query fails", async () => {
      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: null,
                      error: { message: "Database connection failed" },
                    }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      await expect(seedJobsForTraining()).rejects.toThrow("Erro ao buscar jobs");
    });

    it("should process embedding content correctly", async () => {
      const mockJob = {
        id: "job-1",
        title: "Test Job",
        component_id: "comp-001",
        status: "completed",
        ai_suggestion: "Test suggestion",
        created_at: "2024-01-15T10:00:00Z",
      };

      const mockEmbedding = new Array(1536).fill(0.1);
      vi.mocked(createEmbedding).mockResolvedValue(mockEmbedding);

      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [mockJob],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        } else if (table === "job_embeddings") {
          return {
            upsert: mockUpsert,
          };
        }
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      await seedJobsForTraining();

      expect(createEmbedding).toHaveBeenCalledWith(
        "Job: Test Job\nComponente: comp-001\nSugestão IA: Test suggestion"
      );
    });

    it("should store embeddings with correct structure", async () => {
      const mockJob = {
        id: "job-1",
        title: "Test Job",
        component_id: "comp-001",
        status: "completed",
        ai_suggestion: "Test suggestion",
        created_at: "2024-01-15T10:00:00Z",
      };

      const mockEmbedding = new Array(1536).fill(0.1);
      vi.mocked(createEmbedding).mockResolvedValue(mockEmbedding);

      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [mockJob],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        } else if (table === "job_embeddings") {
          return {
            upsert: mockUpsert,
          };
        }
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      await seedJobsForTraining();

      expect(mockUpsert).toHaveBeenCalledWith({
        job_id: "job-1",
        embedding: mockEmbedding,
        metadata: {
          component_id: "comp-001",
          title: "Test Job",
          created_at: "2024-01-15T10:00:00Z",
        },
      });
    });

    it("should limit to 10 jobs", async () => {
      const mockJobs = Array.from({ length: 15 }, (_, i) => ({
        id: `job-${i}`,
        title: `Job ${i}`,
        component_id: `comp-${i}`,
        status: "completed",
        ai_suggestion: `Suggestion ${i}`,
        created_at: "2024-01-15T10:00:00Z",
      }));

      const mockEmbedding = new Array(1536).fill(0.1);
      vi.mocked(createEmbedding).mockResolvedValue(mockEmbedding);

      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const limitMock = vi.fn().mockResolvedValue({
        data: mockJobs.slice(0, 10), // Only return 10 jobs
        error: null,
      });

      const mockFrom = vi.fn((table: string) => {
        if (table === "jobs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: limitMock,
                  }),
                }),
              }),
            }),
          };
        } else if (table === "job_embeddings") {
          return {
            upsert: mockUpsert,
          };
        }
      });

      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

      const result = await seedJobsForTraining();

      expect(limitMock).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(10);
      expect(createEmbedding).toHaveBeenCalledTimes(10);
      expect(mockUpsert).toHaveBeenCalledTimes(10);
    });
  });
});
