import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCopilotSuggestion } from "@/services/mmi/jobsApi";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("MMI Copilot AI Suggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCopilotSuggestion", () => {
    it("should return AI suggestion for a component with historical data", async () => {
      const mockResponse = {
        data: {
          suggestion: "Com base no histórico, recomenda-se substituição da válvula e recalibração.",
          has_historical_data: true,
          similar_cases_count: 4,
          most_effective_action: "Substituição da válvula e recalibração da linha hidráulica",
          average_duration_hours: 3.5,
          success_rate: 80,
          ai_generated: true,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Válvula de Controle Hidráulico");

      expect(result).toBeDefined();
      expect(result.has_historical_data).toBe(true);
      expect(result.suggestion).toBeTruthy();
      expect(result.similar_cases_count).toBeGreaterThan(0);
    });

    it("should return message when no historical data exists", async () => {
      const mockResponse = {
        data: {
          message: "Não há histórico de resoluções anteriores para este componente.",
          has_historical_data: false,
          componente: "Componente Novo",
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Componente Novo");

      expect(result).toBeDefined();
      expect(result.has_historical_data).toBe(false);
    });

    it("should include effectiveness statistics when available", async () => {
      const mockResponse = {
        data: {
          suggestion: "Ação recomendada com alta taxa de sucesso.",
          has_historical_data: true,
          similar_cases_count: 5,
          success_rate: 85.5,
          average_duration_hours: 2.75,
          most_effective_action: "Substituição completa do componente",
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Motor Principal");

      expect(result.success_rate).toBeDefined();
      expect(result.success_rate).toBeGreaterThan(0);
      expect(result.average_duration_hours).toBeDefined();
    });

    it("should handle API errors gracefully", async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: "Service unavailable" },
      });

      await expect(getCopilotSuggestion("Sistema Teste")).rejects.toThrow(
        "Erro ao obter sugestão da IA"
      );
    });

    it("should pass job description and ID to the API", async () => {
      const mockResponse = {
        data: {
          suggestion: "Sugestão específica para o job.",
          has_historical_data: true,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      await getCopilotSuggestion(
        "Válvula de Controle",
        "Falha intermitente no controle de posição",
        "JOB-001"
      );

      expect(supabase.functions.invoke).toHaveBeenCalledWith("mmi-copilot", {
        body: {
          componente: "Válvula de Controle",
          job_description: "Falha intermitente no controle de posição",
          job_id: "JOB-001",
        },
      });
    });
  });

  describe("Copilot Integration with Jobs", () => {
    it("should provide contextual suggestions based on component type", async () => {
      const mockResponse = {
        data: {
          suggestion: "Para válvulas hidráulicas, a causa mais comum é contaminação no óleo.",
          has_historical_data: true,
          similar_cases_count: 3,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Válvula Hidráulica");

      expect(result.suggestion).toContain("válvula" || "Válvula");
    });

    it("should return timestamp with suggestions", async () => {
      const mockResponse = {
        data: {
          suggestion: "Sugestão da IA",
          has_historical_data: true,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Teste");

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe("Copilot Response Format", () => {
    it("should return structured response with all required fields", async () => {
      const mockResponse = {
        data: {
          suggestion: "Ação recomendada",
          has_historical_data: true,
          similar_cases_count: 2,
          most_effective_action: "Substituição",
          average_duration_hours: 4.0,
          success_rate: 75.0,
          ai_generated: true,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Componente");

      // Verify all expected fields are present
      expect(result).toHaveProperty("suggestion");
      expect(result).toHaveProperty("has_historical_data");
      expect(result).toHaveProperty("timestamp");
      
      // Optional fields when historical data exists
      if (result.has_historical_data) {
        expect(result).toHaveProperty("similar_cases_count");
        expect(result).toHaveProperty("most_effective_action");
        expect(result).toHaveProperty("average_duration_hours");
      }
    });

    it("should handle response without AI generation", async () => {
      const mockResponse = {
        data: {
          suggestion: "Sugestão baseada apenas em dados históricos",
          has_historical_data: true,
          similar_cases_count: 1,
          most_effective_action: "Ação padrão",
          average_duration_hours: 2.5,
          success_rate: null,
          ai_generated: false,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await getCopilotSuggestion("Componente");

      expect(result.has_historical_data).toBe(true);
      expect(result.ai_generated).toBe(false);
    });
  });
});
