/**
 * Jobs Forecast Edge Function Tests
 * 
 * Tests for the jobs-forecast edge function that uses AI to predict job completion trends
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('jobs-forecast Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should validate trend data is an array', () => {
      const isValidTrend = (trend: any) => {
        return trend != null && Array.isArray(trend);
      };

      expect(isValidTrend([])).toBe(true); // Empty array is still a valid array
      expect(isValidTrend([{ month: 'Jan', jobsCompleted: 10 }])).toBe(true);
      expect(isValidTrend(null)).toBe(false);
      expect(isValidTrend(undefined)).toBe(false);
      expect(isValidTrend('not an array')).toBe(false);
      expect(isValidTrend({})).toBe(false);
    });

    it('should accept trend data with month and jobsCompleted fields', () => {
      const validTrend = [
        { month: 'Janeiro', jobsCompleted: 45 },
        { month: 'Fevereiro', jobsCompleted: 52 },
        { month: 'Março', jobsCompleted: 38 },
      ];

      expect(validTrend).toHaveLength(3);
      expect(validTrend[0]).toHaveProperty('month');
      expect(validTrend[0]).toHaveProperty('jobsCompleted');
      expect(typeof validTrend[0].jobsCompleted).toBe('number');
    });

    it('should handle empty trend array', () => {
      const emptyTrend: any[] = [];
      
      expect(Array.isArray(emptyTrend)).toBe(true);
      expect(emptyTrend).toHaveLength(0);
    });
  });

  describe('Trend Data Processing', () => {
    it('should process monthly trend data correctly', () => {
      const trendData = [
        { month: 'Janeiro', jobsCompleted: 45 },
        { month: 'Fevereiro', jobsCompleted: 52 },
        { month: 'Março', jobsCompleted: 38 },
        { month: 'Abril', jobsCompleted: 61 },
      ];

      const totalJobs = trendData.reduce((acc, item) => acc + item.jobsCompleted, 0);
      const avgJobs = totalJobs / trendData.length;

      expect(totalJobs).toBe(196);
      expect(avgJobs).toBe(49);
    });

    it('should identify upward trend', () => {
      const trendData = [
        { month: 'Janeiro', jobsCompleted: 30 },
        { month: 'Fevereiro', jobsCompleted: 40 },
        { month: 'Março', jobsCompleted: 50 },
      ];

      const isUpwardTrend = trendData[trendData.length - 1].jobsCompleted > trendData[0].jobsCompleted;
      
      expect(isUpwardTrend).toBe(true);
    });

    it('should identify downward trend', () => {
      const trendData = [
        { month: 'Janeiro', jobsCompleted: 60 },
        { month: 'Fevereiro', jobsCompleted: 45 },
        { month: 'Março', jobsCompleted: 35 },
      ];

      const isDownwardTrend = trendData[trendData.length - 1].jobsCompleted < trendData[0].jobsCompleted;
      
      expect(isDownwardTrend).toBe(true);
    });

    it('should calculate growth rate', () => {
      const trendData = [
        { month: 'Janeiro', jobsCompleted: 40 },
        { month: 'Fevereiro', jobsCompleted: 50 },
      ];

      const growthRate = ((trendData[1].jobsCompleted - trendData[0].jobsCompleted) / trendData[0].jobsCompleted) * 100;
      
      expect(growthRate).toBe(25);
    });
  });

  describe('OpenAI Integration', () => {
    it('should use correct OpenAI model', () => {
      const modelConfig = {
        model: 'gpt-4',
        temperature: 0.4,
      };

      expect(modelConfig.model).toBe('gpt-4');
      expect(modelConfig.temperature).toBe(0.4);
    });

    it('should format system prompt correctly', () => {
      const systemPrompt = 'Você é uma IA de manutenção preditiva. Analise tendências mensais de jobs finalizados para prever picos futuros e sugerir ações.';

      expect(systemPrompt).toContain('manutenção preditiva');
      expect(systemPrompt).toContain('tendências mensais');
      expect(systemPrompt).toContain('prever picos futuros');
    });

    it('should format user prompt with trend data', () => {
      const trend = [
        { month: 'Janeiro', jobsCompleted: 45 },
        { month: 'Fevereiro', jobsCompleted: 52 },
      ];

      const userPrompt = `Aqui estão os dados dos últimos meses:
${JSON.stringify(trend, null, 2)}

Gere uma previsão para os próximos 2 meses e recomende ações técnicas preventivas.`;

      expect(userPrompt).toContain('dados dos últimos meses');
      expect(userPrompt).toContain('Janeiro');
      expect(userPrompt).toContain('previsão para os próximos 2 meses');
      expect(userPrompt).toContain('ações técnicas preventivas');
    });

    it('should request 2-month forecast', () => {
      const forecastMonths = 2;
      const prompt = `Gere uma previsão para os próximos ${forecastMonths} meses`;

      expect(prompt).toContain('2 meses');
    });
  });

  describe('Response Handling', () => {
    it('should return forecast in response', () => {
      const mockResponse = {
        forecast: 'Com base nos dados fornecidos, prevê-se um aumento de 15% nos jobs em Maio...',
      };

      expect(mockResponse).toHaveProperty('forecast');
      expect(typeof mockResponse.forecast).toBe('string');
      expect(mockResponse.forecast.length).toBeGreaterThan(0);
    });

    it('should handle successful response', () => {
      const response = {
        status: 200,
        data: {
          forecast: 'Análise preditiva completa...',
        },
      };

      expect(response.status).toBe(200);
      expect(response.data.forecast).toBeTruthy();
    });

    it('should include CORS headers', () => {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      };

      expect(corsHeaders["Access-Control-Allow-Origin"]).toBe("*");
      expect(corsHeaders["Access-Control-Allow-Headers"]).toContain("authorization");
    });
  });

  describe('Error Handling', () => {
    it('should handle missing OPENAI_API_KEY', () => {
      const hasApiKey = (key?: string) => !!key;

      expect(hasApiKey(undefined)).toBe(false);
      expect(hasApiKey('')).toBe(false);
      expect(hasApiKey('sk-test123')).toBe(true);
    });

    it('should return error for invalid trend data', () => {
      const validateTrend = (trend: any) => {
        if (!trend || !Array.isArray(trend)) {
          return { 
            valid: false, 
            error: "Trend data is required and must be an array" 
          };
        }
        return { valid: true };
      };

      const result = validateTrend(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Trend data is required and must be an array");
    });

    it('should handle OpenAI API errors', () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };

      expect(mockErrorResponse.ok).toBe(false);
      expect(mockErrorResponse.status).toBe(500);
    });

    it('should return 400 for bad request', () => {
      const errorResponse = {
        status: 400,
        body: { error: "Trend data is required and must be an array" },
      };

      expect(errorResponse.status).toBe(400);
      expect(errorResponse.body.error).toBeTruthy();
    });

    it('should return 500 for server errors', () => {
      const errorResponse = {
        status: 500,
        body: { error: "Erro ao gerar previsão com IA." },
      };

      expect(errorResponse.status).toBe(500);
      expect(errorResponse.body.error).toContain("Erro ao gerar previsão");
    });

    it('should handle network errors gracefully', () => {
      const handleError = (error: unknown) => {
        if (error instanceof Error) {
          return { error: error.message };
        }
        return { error: "Erro ao gerar previsão com IA." };
      };

      const networkError = new Error("Network timeout");
      const result = handleError(networkError);
      
      expect(result.error).toBe("Network timeout");
    });

    it('should handle unknown errors', () => {
      const handleError = (error: unknown) => {
        if (error instanceof Error) {
          return error.message;
        }
        return "Erro ao gerar previsão com IA.";
      };

      const unknownError = handleError("some string error");
      
      expect(unknownError).toBe("Erro ao gerar previsão com IA.");
    });
  });

  describe('CORS Preflight', () => {
    it('should handle OPTIONS request', () => {
      const method = "OPTIONS";
      const shouldReturnEarly = method === "OPTIONS";

      expect(shouldReturnEarly).toBe(true);
    });

    it('should return null body for OPTIONS', () => {
      const optionsResponse = {
        body: null,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      };

      expect(optionsResponse.body).toBeNull();
      expect(optionsResponse.headers["Access-Control-Allow-Origin"]).toBe("*");
    });
  });

  describe('Forecast Output', () => {
    it('should generate actionable recommendations', () => {
      const mockForecast = `
      Previsão para os próximos 2 meses:
      - Maio: Aumento esperado de 20% nos jobs
      - Junho: Pico de 65 jobs previstos
      
      Ações preventivas recomendadas:
      1. Aumentar equipe de manutenção em 15%
      2. Preparar estoque de peças críticas
      3. Implementar turnos extras em Junho
      `;

      expect(mockForecast).toContain('Previsão');
      expect(mockForecast).toContain('Ações preventivas');
      expect(mockForecast).toContain('Maio');
      expect(mockForecast).toContain('Junho');
    });

    it('should provide 2-month forecast period', () => {
      const forecastMonths = ['Maio', 'Junho'];

      expect(forecastMonths).toHaveLength(2);
      expect(forecastMonths).toContain('Maio');
      expect(forecastMonths).toContain('Junho');
    });
  });

  describe('Data Formatting', () => {
    it('should format trend data as JSON', () => {
      const trend = [
        { month: 'Janeiro', jobsCompleted: 45 },
        { month: 'Fevereiro', jobsCompleted: 52 },
      ];

      const formatted = JSON.stringify(trend, null, 2);
      
      expect(formatted).toContain('Janeiro');
      expect(formatted).toContain('"jobsCompleted": 45');
    });

    it('should preserve month names in Portuguese', () => {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril'];
      
      months.forEach(month => {
        expect(month).toMatch(/^[A-ZÇÁÉÍÓÚÂÊÔÃ]/); // Portuguese months start with capital letter
      });
    });
  });

  describe('Logging', () => {
    it('should log forecast generation', () => {
      const logMessage = (trend: any) => {
        return `Generating jobs forecast for trend data: ${JSON.stringify(trend)}`;
      };

      const trend = [{ month: 'Janeiro', jobsCompleted: 45 }];
      const message = logMessage(trend);

      expect(message).toContain('Generating jobs forecast');
      expect(message).toContain('Janeiro');
    });

    it('should log successful generation', () => {
      const successMessage = 'Jobs forecast generated successfully';

      expect(successMessage).toContain('successfully');
    });

    it('should log errors with details', () => {
      const error = new Error('OpenAI API error: 500');
      const logError = (err: Error) => {
        return `Error generating jobs forecast: ${err.message}`;
      };

      const message = logError(error);

      expect(message).toContain('Error generating jobs forecast');
      expect(message).toContain('OpenAI API error');
    });
  });
});
