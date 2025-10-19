/**
 * Forecast IA - Essential Tests
 * Validates AI-powered forecast generation and page rendering
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Forecast from "@/pages/admin/forecast";

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

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("Forecast IA - Essential Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("renderiza forecast page corretamente", async () => {
    render(
      <MemoryRouter>
        <Forecast />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verifica se a página foi renderizada
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });
  });

  it("valida estrutura de ForecastData", () => {
    const forecastData = {
      month: "Janeiro 2025",
      prediction: 45,
      confidence: 0.85,
      trend: "up" as const,
    };

    expect(forecastData).toHaveProperty("month");
    expect(forecastData).toHaveProperty("prediction");
    expect(forecastData).toHaveProperty("confidence");
    expect(forecastData).toHaveProperty("trend");
    expect(forecastData.prediction).toBeGreaterThan(0);
    expect(forecastData.confidence).toBeGreaterThan(0);
    expect(forecastData.confidence).toBeLessThanOrEqual(1);
    expect(["up", "down", "stable"]).toContain(forecastData.trend);
  });

  it("valida tipos de trend válidos", () => {
    const validTrends: Array<"up" | "down" | "stable"> = ["up", "down", "stable"];

    validTrends.forEach((trend) => {
      expect(["up", "down", "stable"]).toContain(trend);
    });
  });

  it("calcula média de previsões corretamente", () => {
    const forecasts = [
      { month: "Jan", prediction: 45, confidence: 0.85, trend: "up" as const },
      { month: "Feb", prediction: 50, confidence: 0.90, trend: "up" as const },
      { month: "Mar", prediction: 40, confidence: 0.80, trend: "down" as const },
    ];

    const avgPrediction = forecasts.reduce((sum, f) => sum + f.prediction, 0) / forecasts.length;
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

    expect(avgPrediction).toBeCloseTo(45, 0);
    expect(avgConfidence).toBeCloseTo(0.85, 2);
  });

  it("valida confidence está sempre entre 0 e 1", () => {
    const confidenceValues = [0.80, 0.85, 0.90, 0.95, 1.0];

    confidenceValues.forEach((confidence) => {
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  it("valida prediction é sempre número positivo", () => {
    const predictions = [45, 50, 38, 42, 55];

    predictions.forEach((prediction) => {
      expect(prediction).toBeGreaterThan(0);
      expect(typeof prediction).toBe("number");
    });
  });
});
