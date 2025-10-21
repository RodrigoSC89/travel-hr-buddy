/**
 * Tests for AI Telemetry Bridge
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateSystemInsight, generateAIInsight } from "@/lib/AI/telemetryBridge";

// Mock OpenAI client
vi.mock("@/lib/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("AI Telemetry Bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("generateSystemInsight", () => {
    it("should generate insights from telemetry data", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Sistema operando normalmente. CPU e memória dentro dos limites aceitáveis.",
            },
          },
        ],
      });

      const metrics = {
        cpu: 45.5,
        memory: 128.3,
        fps: 60,
      };

      const insight = await generateSystemInsight(metrics);
      
      expect(insight).toBeDefined();
      expect(typeof insight).toBe("string");
      expect(insight).not.toBe("");
    });

    it("should handle OpenAI API errors gracefully", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockRejectedValue(
        new Error("API Error")
      );

      const metrics = {
        cpu: 45.5,
        memory: 128.3,
        fps: 60,
      };

      const insight = await generateSystemInsight(metrics);
      
      expect(insight).toContain("Falha ao gerar insight");
      expect(console.error).toHaveBeenCalled();
    });

    it("should format metrics correctly in prompt", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: "Test response" } }],
      });

      const metrics = {
        cpu: 75.2,
        memory: 256.8,
        fps: 30,
      };

      await generateSystemInsight(metrics);
      
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-3.5-turbo",
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("CPU: 75.2%"),
            }),
          ]),
        })
      );
    });

    it("should return fallback message when no content", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const metrics = {
        cpu: 45.5,
        memory: 128.3,
        fps: 60,
      };

      const insight = await generateSystemInsight(metrics);
      
      expect(insight).toBe("Sem insights disponíveis");
    });
  });

  describe("generateAIInsight", () => {
    it("should generate AI insights from text prompt", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Análise concluída com sucesso.",
            },
          },
        ],
      });

      const prompt = "Analise o desempenho do sistema";
      const insight = await generateAIInsight(prompt);
      
      expect(insight).toBeDefined();
      expect(typeof insight).toBe("string");
      expect(insight).not.toBe("");
    });

    it("should handle API errors", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockRejectedValue(
        new Error("API Error")
      );

      const prompt = "Test prompt";
      const insight = await generateAIInsight(prompt);
      
      expect(insight).toContain("Falha ao gerar insight");
    });

    it("should call OpenAI with correct parameters", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: "Test" } }],
      });

      const prompt = "Analyze this data";
      await generateAIInsight(prompt);
      
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-3.5-turbo",
          max_tokens: 200,
          temperature: 0.7,
        })
      );
    });

    it("should return fallback when no content available", async () => {
      const { openai } = await import("@/lib/openai");
      
      (openai.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: "" } }],
      });

      const insight = await generateAIInsight("test");
      
      expect(insight).toBe("Sem resposta disponível");
    });
  });
});
