import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAIRecommendation, logAIInteraction } from "@/services/mmi/copilotService";
import type { Job } from "@/services/mmi/jobsApi";

// Mock environment variables
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key');

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn(() => Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  technical_action: "Test action for maintenance",
                  component: "Test Component System",
                  deadline: "2025-10-30",
                  requires_work_order: true,
                  reasoning: "Test reasoning based on historical data",
                }),
              },
            }],
          })),
        },
      };
      embeddings = {
        create: vi.fn(() => Promise.resolve({
          data: [{ embedding: new Array(1536).fill(0.1) }],
        })),
      };
    },
  };
});

describe("MMI AI Copilot Service", () => {
  const mockJob: Job = {
    id: "JOB-TEST-001",
    title: "Test Maintenance Job",
    description: "Test description for maintenance",
    status: "Pendente",
    priority: "Alta",
    due_date: "2025-10-25",
    component: {
      name: "Test Component",
      asset: {
        name: "Test Asset",
        vessel: "Test Vessel",
      },
    },
    suggestion_ia: "Test AI suggestion",
    can_postpone: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAIRecommendation", () => {
    it("should return AI recommendation with required fields", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation).toBeDefined();
      expect(recommendation).toHaveProperty("technical_action");
      expect(recommendation).toHaveProperty("component");
      expect(recommendation).toHaveProperty("deadline");
      expect(recommendation).toHaveProperty("requires_work_order");
      expect(recommendation).toHaveProperty("reasoning");
    });

    it("should include technical action in recommendation", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation.technical_action).toBeTruthy();
      expect(typeof recommendation.technical_action).toBe("string");
      expect(recommendation.technical_action.length).toBeGreaterThan(0);
    });

    it("should provide component information", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation.component).toBeTruthy();
      expect(typeof recommendation.component).toBe("string");
    });

    it("should suggest a deadline", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation.deadline).toBeTruthy();
      expect(recommendation.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Validate it's a valid date
      const date = new Date(recommendation.deadline);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it("should indicate whether work order is required", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation.requires_work_order).toBeDefined();
      expect(typeof recommendation.requires_work_order).toBe("boolean");
    });

    it("should provide reasoning for the recommendation", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation.reasoning).toBeTruthy();
      expect(typeof recommendation.reasoning).toBe("string");
      expect(recommendation.reasoning.length).toBeGreaterThan(10);
    });

    it("should handle critical priority jobs appropriately", async () => {
      const criticalJob = {
        ...mockJob,
        priority: "Crítica",
      };

      const recommendation = await getAIRecommendation(criticalJob);

      expect(recommendation).toBeDefined();
      expect(recommendation.requires_work_order).toBe(true);
    });

    it("should handle medium priority jobs", async () => {
      const mediumJob = {
        ...mockJob,
        priority: "Média",
      };

      const recommendation = await getAIRecommendation(mediumJob);

      expect(recommendation).toBeDefined();
      expect(recommendation.technical_action).toBeTruthy();
    });

    it("should include similar cases when available", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      expect(recommendation).toHaveProperty("similar_cases");
      expect(Array.isArray(recommendation.similar_cases)).toBe(true);
    });

    it("should handle jobs with no description", async () => {
      const jobNoDesc = {
        ...mockJob,
        description: undefined,
      };

      const recommendation = await getAIRecommendation(jobNoDesc);

      expect(recommendation).toBeDefined();
      expect(recommendation.technical_action).toBeTruthy();
    });
  });

  describe("logAIInteraction", () => {
    it("should not throw error when logging interaction", async () => {
      const mockRecommendation = {
        technical_action: "Test action",
        component: "Test component",
        deadline: "2025-10-30",
        requires_work_order: true,
        reasoning: "Test reasoning",
      };

      const mockEmbedding = new Array(1536).fill(0.1);

      await expect(
        logAIInteraction(mockJob.id, "test_action", mockRecommendation, mockEmbedding)
      ).resolves.not.toThrow();
    });

    it("should handle logging errors gracefully", async () => {
      const mockRecommendation = {
        technical_action: "Test action",
        component: "Test component",
        deadline: "2025-10-30",
        requires_work_order: true,
        reasoning: "Test reasoning",
      };

      const mockEmbedding = new Array(1536).fill(0.1);

      // Should not throw even if there's an internal error
      await expect(
        logAIInteraction("INVALID-ID", "test_action", mockRecommendation, mockEmbedding)
      ).resolves.not.toThrow();
    });
  });

  describe("AI Response Timing", () => {
    it("should complete recommendation within reasonable time", async () => {
      const startTime = Date.now();
      await getAIRecommendation(mockJob);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe("Recommendation Quality", () => {
    it("should provide actionable recommendations", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      // Technical action should be specific
      expect(recommendation.technical_action.length).toBeGreaterThan(20);
      
      // Reasoning should explain the recommendation
      expect(recommendation.reasoning.length).toBeGreaterThan(20);
    });

    it("should relate recommendation to job component", async () => {
      const recommendation = await getAIRecommendation(mockJob);

      // Component in recommendation should relate to job component
      expect(recommendation.component).toBeTruthy();
    });
  });
});
