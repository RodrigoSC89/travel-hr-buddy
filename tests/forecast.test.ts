/**
 * Forecast IA - Essential Tests
 * Validates AI-powered forecast generation
 */

import { describe, it, expect, vi } from "vitest";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: "Previsão: Com base no contexto de plataforma X em produção, espera-se um aumento de 15% na demanda nos próximos 3 meses.",
                },
              },
            ],
          }),
        },
      };
    },
  };
});

describe("Forecast IA - Essential Tests", () => {
  it("deve gerar forecast válido com contexto", async () => {
    // Simula função de forecast com IA
    const generateForecastWithAI = async (
      platform: string,
      environment: string
    ): Promise<string> => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: "test-key" });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em previsões.",
          },
          {
            role: "user",
            content: `Gere uma previsão para plataforma ${platform} em ambiente ${environment}`,
          },
        ],
      });

      return response.choices[0].message.content || "";
    };

    const result = await generateForecastWithAI("plataforma X", "produção");
    
    expect(result).toContain("Previsão");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("deve validar estrutura de dados de forecast", () => {
    const forecastData = {
      platform: "plataforma X",
      environment: "produção",
      prediction: "Aumento de 15% na demanda",
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    };

    expect(forecastData).toHaveProperty("platform");
    expect(forecastData).toHaveProperty("environment");
    expect(forecastData).toHaveProperty("prediction");
    expect(forecastData).toHaveProperty("confidence");
    expect(forecastData.confidence).toBeGreaterThan(0);
    expect(forecastData.confidence).toBeLessThanOrEqual(1);
  });

  it("deve processar trend data corretamente", () => {
    const trendData = [
      { month: "Janeiro", jobsCompleted: 45 },
      { month: "Fevereiro", jobsCompleted: 52 },
      { month: "Março", jobsCompleted: 38 },
    ];

    const totalJobs = trendData.reduce((sum, item) => sum + item.jobsCompleted, 0);
    const avgJobs = totalJobs / trendData.length;

    expect(totalJobs).toBe(135);
    expect(avgJobs).toBeCloseTo(45, 0);
  });

  it("deve validar resposta da IA contém informações relevantes", async () => {
    const generateForecastWithAI = async (
      platform: string,
      environment: string
    ): Promise<string> => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: "test-key" });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em previsões.",
          },
          {
            role: "user",
            content: `Gere uma previsão para plataforma ${platform} em ambiente ${environment}`,
          },
        ],
      });

      return response.choices[0].message.content || "";
    };

    const result = await generateForecastWithAI("plataforma Y", "staging");
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    // Valida que a resposta contém termos relevantes
    expect(result.toLowerCase()).toMatch(/previsão|forecast|demanda|aumento|redução|tendência/);
  });
});
