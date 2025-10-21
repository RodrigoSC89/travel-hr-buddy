import { describe, it, expect, vi } from "vitest";
import { generateAIInsight, generateSystemInsight } from "@/lib/AI/telemetryBridge";

// Mock OpenAI client
vi.mock("@/lib/ai/openai-client", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Test AI insight response",
              },
            },
          ],
        }),
      },
    },
  },
}));

describe("AI Telemetry Bridge", () => {
  describe("generateAIInsight", () => {
    it("should generate AI insight from prompt", async () => {
      const result = await generateAIInsight("Test prompt");
      expect(result).toBe("Test AI insight response");
    });

    it("should handle API errors gracefully", async () => {
      const { openai } = await import("@/lib/ai/openai-client");
      vi.mocked(openai.chat.completions.create).mockRejectedValueOnce(
        new Error("API Error")
      );

      await expect(generateAIInsight("Test")).rejects.toThrow();
    });
  });

  describe("generateSystemInsight", () => {
    it("should generate system insight from metrics", async () => {
      const metrics = {
        cpu: 45.5,
        memory: 128.3,
        fps: 60,
      };

      const result = await generateSystemInsight(metrics);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should return fallback message on error", async () => {
      const { openai } = await import("@/lib/ai/openai-client");
      vi.mocked(openai.chat.completions.create).mockRejectedValueOnce(
        new Error("API Error")
      );

      const metrics = { cpu: 50, memory: 100, fps: 60 };
      const result = await generateSystemInsight(metrics);
      
      expect(result).toBe("Falha ao gerar insight de performance.");
    });
  });
});
