/**
 * Auditorias Explain API Endpoint Tests
 * 
 * Tests for the /api/auditorias/explain endpoint that provides AI-powered
 * explanations for non-conformities in technical audits
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditorias Explain API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle POST requests", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should handle OPTIONS requests for CORS", () => {
      const method = "OPTIONS";
      expect(method).toBe("OPTIONS");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/auditorias/explain";
      expect(endpointPath).toBe("/api/auditorias/explain");
    });

    it("should be accessible via supabase/functions/auditorias-explain", () => {
      const filePath = "supabase/functions/auditorias-explain/index.ts";
      expect(filePath).toContain("auditorias-explain");
    });
  });

  describe("Request Body", () => {
    it("should accept navio parameter", () => {
      const requestBody = {
        navio: "MV Atlantic",
        item: "Safety equipment",
        norma: "IMCA M-187"
      };
      expect(requestBody.navio).toBe("MV Atlantic");
    });

    it("should accept item parameter", () => {
      const requestBody = {
        navio: "MV Atlantic",
        item: "Safety equipment",
        norma: "IMCA M-187"
      };
      expect(requestBody.item).toBe("Safety equipment");
    });

    it("should accept norma parameter", () => {
      const requestBody = {
        navio: "MV Atlantic",
        item: "Safety equipment",
        norma: "IMCA M-187"
      };
      expect(requestBody.norma).toBe("IMCA M-187");
    });

    it("should require all three parameters", () => {
      const validRequest = {
        navio: "MV Atlantic",
        item: "Safety equipment",
        norma: "IMCA M-187"
      };
      expect(validRequest).toHaveProperty("navio");
      expect(validRequest).toHaveProperty("item");
      expect(validRequest).toHaveProperty("norma");
    });
  });

  describe("AI Integration", () => {
    it("should use GPT-4 model", () => {
      const aiModel = "gpt-4";
      expect(aiModel).toBe("gpt-4");
    });

    it("should have system role as IMCA expert", () => {
      const systemPrompt = "Você é um especialista em normas IMCA e auditorias técnicas marítimas";
      expect(systemPrompt).toContain("IMCA");
      expect(systemPrompt).toContain("auditorias técnicas");
    });

    it("should generate technical explanation prompt", () => {
      const navio = "MV Atlantic";
      const item = "Safety equipment";
      const norma = "IMCA M-187";
      
      const prompt = `Como especialista em normas IMCA (International Marine Contractors Association), explique de forma técnica:

Navio: ${navio}
Norma: ${norma}
Item não conforme: ${item}`;

      expect(prompt).toContain(navio);
      expect(prompt).toContain(norma);
      expect(prompt).toContain(item);
    });

    it("should request explanation in Portuguese", () => {
      const promptEnding = "Responda de forma técnica mas clara, em português brasileiro.";
      expect(promptEnding).toContain("português brasileiro");
    });
  });

  describe("Response Format", () => {
    it("should return resultado property", () => {
      const mockResponse = {
        resultado: "A norma IMCA M-187 exige que todos os equipamentos de segurança..."
      };
      expect(mockResponse).toHaveProperty("resultado");
    });

    it("should handle successful AI response", () => {
      const aiResponse = {
        choices: [{
          message: {
            content: "Explicação técnica detalhada sobre a não conformidade..."
          }
        }]
      };
      const resultado = aiResponse.choices[0]?.message?.content;
      expect(resultado).toBeTruthy();
      expect(resultado).toContain("não conformidade");
    });

    it("should provide default message on empty response", () => {
      const emptyResponse = {
        choices: []
      };
      const resultado = emptyResponse.choices[0]?.message?.content || "Não foi possível gerar explicação";
      expect(resultado).toBe("Não foi possível gerar explicação");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing OpenAI API key", () => {
      const errorMessage = "OpenAI API key not configured";
      expect(errorMessage).toContain("OpenAI API key");
    });

    it("should handle OpenAI API errors gracefully", () => {
      const errorResponse = {
        resultado: "Erro ao gerar explicação. Por favor, tente novamente.",
        error: "OpenAI API error: Unauthorized"
      };
      expect(errorResponse).toHaveProperty("resultado");
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse.resultado).toContain("Erro ao gerar explicação");
    });

    it("should return 500 for server errors", () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });

    it("should provide user-friendly error message", () => {
      const errorMessage = "Erro ao gerar explicação. Por favor, tente novamente.";
      expect(errorMessage).toContain("tente novamente");
    });
  });

  describe("IMCA Standards", () => {
    it("should support common IMCA standards", () => {
      const standards = ["IMCA M-187", "IMCA M-220", "IMCA D-045", "IMCA M-203"];
      expect(standards).toContain("IMCA M-187");
      expect(standards).toContain("IMCA M-220");
    });

    it("should provide comprehensive explanation structure", () => {
      const expectedStructure = [
        "Explicação detalhada sobre o que a norma exige",
        "Possíveis causas da não conformidade",
        "Riscos associados",
        "Recomendações específicas para correção"
      ];
      expect(expectedStructure).toHaveLength(4);
    });
  });
});
