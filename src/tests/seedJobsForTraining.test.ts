import { describe, it, expect, vi, beforeEach } from "vitest";
import { seedJobsForTraining } from "@/lib/ai/embedding/seedJobsForTraining";

// Mock the dependencies
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          not: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({
                data: [
                  {
                    id: "test-job-1",
                    title: "Test Job 1",
                    component_id: "comp-1",
                    status: "completed",
                    ai_suggestion: "Test suggestion 1",
                    created_at: "2025-10-15T12:00:00Z",
                  },
                  {
                    id: "test-job-2",
                    title: "Test Job 2",
                    component_id: "comp-2",
                    status: "completed",
                    ai_suggestion: "Test suggestion 2",
                    created_at: "2025-10-15T11:00:00Z",
                  },
                ],
                error: null,
              })),
            })),
          })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

vi.mock("@/lib/ai/openai/createEmbedding", () => ({
  createEmbedding: vi.fn(() => {
    // Mock embedding generation - return a simple vector
    return Promise.resolve(Array.from({ length: 1536 }, (_, i) => i * 0.001));
  }),
}));

describe("seedJobsForTraining", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully fetch and process jobs", async () => {
    const result = await seedJobsForTraining();

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
  });

  it("should return jobs with embeddings and metadata", async () => {
    const result = await seedJobsForTraining();
    const firstJob = result[0];

    expect(firstJob).toHaveProperty("id");
    expect(firstJob).toHaveProperty("embedding");
    expect(firstJob).toHaveProperty("metadata");

    expect(firstJob.embedding).toBeInstanceOf(Array);
    expect(firstJob.embedding.length).toBe(1536);

    expect(firstJob.metadata).toHaveProperty("component_id");
    expect(firstJob.metadata).toHaveProperty("title");
    expect(firstJob.metadata).toHaveProperty("created_at");
  });

  it("should generate embeddings from job content", async () => {
    const result = await seedJobsForTraining();

    // Verify that embeddings were generated
    for (const job of result) {
      expect(job.embedding).toBeDefined();
      expect(job.embedding.length).toBe(1536);
      expect(typeof job.embedding[0]).toBe("number");
    }
  });

  it("should preserve job metadata", async () => {
    const result = await seedJobsForTraining();

    expect(result[0].id).toBe("test-job-1");
    expect(result[0].metadata.title).toBe("Test Job 1");
    expect(result[0].metadata.component_id).toBe("comp-1");
    expect(result[0].metadata.created_at).toBe("2025-10-15T12:00:00Z");

    expect(result[1].id).toBe("test-job-2");
    expect(result[1].metadata.title).toBe("Test Job 2");
    expect(result[1].metadata.component_id).toBe("comp-2");
    expect(result[1].metadata.created_at).toBe("2025-10-15T11:00:00Z");
  });
});
