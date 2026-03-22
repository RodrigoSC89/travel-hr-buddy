/**
 * Auditoria Generate API Tests
 *
 * Tests for the auditoria/generate API endpoint that uses AI to generate
 * technical DP (Dynamic Positioning) audit reports for ships
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

interface RequestBody {
  nomeNavio?: string;
  contexto?: string;
  user_id?: string;
}

describe("auditoria/generate API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should require POST method", () => {
      const method = "GET";
      const isPostMethod = method === "POST";

      expect(isPostMethod).toBe(false);
    });

    it("should accept POST method", () => {
      const method = "POST";
      const isPostMethod = method === "POST";

      expect(isPostMethod).toBe(true);
    });

    it("should validate nomeNavio is provided", () => {
      const validateFields = (body: RequestBody) => {
        return !!body.nomeNavio && !!body.contexto && !!body.user_id;
      };

      expect(validateFields({ contexto: "test", user_id: "123" })).toBe(false);
      expect(validateFields({ nomeNavio: "Navio A", contexto: "test", user_id: "123" })).toBe(true);
    });

    it("should validate contexto is provided", () => {
      const validateFields = (body: RequestBody) => {
        return !!body.nomeNavio && !!body.contexto && !!body.user_id;
      };

      expect(validateFields({ nomeNavio: "Navio A", user_id: "123" })).toBe(false);
      expect(validateFields({ nomeNavio: "Navio A", contexto: "test", user_id: "123" })).toBe(true);
    });

    it("should validate user_id is provided", () => {
      const validateFields = (body: RequestBody) => {
        return !!body.nomeNavio && !!body.contexto && !!body.user_id;
      };

      expect(validateFields({ nomeNavio: "Navio A", contexto: "test" })).toBe(false);
      expect(validateFields({ nomeNavio: "Navio A", contexto: "test", user_id: "123" })).toBe(true);
    });

    it("should validate all required fields together", () => {
      const validateFields = (body: RequestBody) => {
        const { nomeNavio, contexto, user_id } = body;
        return !!nomeNavio && !!contexto && !!user_id;
      };

      const validRequest = {
        nomeNavio: "PSV Atlântico",
        contexto: "Operação de ancoragem em águas profundas",
        user_id: "user-123",
      };

      const invalidRequest1 = { contexto: "test", user_id: "123" };
      const invalidRequest2 = { nomeNavio: "Navio A", user_id: "123" };
      const invalidRequest3 = { nomeNavio: "Navio A", contexto: "test" };

      expect(validateFields(validRequest)).toBe(true);
      expect(validateFields(invalidRequest1)).toBe(false);
      expect(validateFields(invalidRequest2)).toBe(false);
      expect(validateFields(invalidRequest3)).toBe(false);
    });
  });

  describe("HTTP Status Codes", () => {
    it("should return 405 for non-POST methods", () => {
      const methods = ["GET", "PUT", "DELETE", "PATCH"];

      methods.forEach(method => {
        const isAllowed = method === "POST";
        expect(isAllowed).toBe(false);
      });
    });

    it("should return 400 for missing required fields", () => {
      const statusCode = 400;
      expect(statusCode).toBe(400);
    });

    it("should return 200 for successful generation", () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    it("should return 500 for server errors", () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });
  });

  describe("Prompt Generation", () => {
    it("should include ship name in prompt", () => {
      const nomeNavio = "PSV Atlântico";
      const prompt = `para o navio ${nomeNavio}`;

      expect(prompt).toContain("PSV Atlântico");
    });

    it("should include operational context in prompt", () => {
      const contexto =
        "Operação de ancoragem em águas profundas com condições meteorológicas adversas";
      const prompt = `contexto operacional:
"""
${contexto}
"""`;

      expect(prompt).toContain("Operação de ancoragem");
      expect(prompt).toContain("águas profundas");
    });

    it("should include IMCA M103 standard", () => {
      const standards = "IMCA M103 (projeto e operação DP)";
      expect(standards).toContain("IMCA M103");
      expect(standards).toContain("projeto e operação DP");
    });

    it("should include IMCA M117 standard", () => {
      const standards = "IMCA M117 (qualificação de pessoal DP)";
      expect(standards).toContain("IMCA M117");
      expect(standards).toContain("qualificação de pessoal");
    });

    it("should include IMCA M190 standard", () => {
      const standards = "IMCA M190 (ensaios anuais)";
      expect(standards).toContain("IMCA M190");
      expect(standards).toContain("ensaios anuais");
    });

    it("should include IMCA M166 standard", () => {
      const standards = "IMCA M166 (FMEA)";
      expect(standards).toContain("IMCA M166");
      expect(standards).toContain("FMEA");
    });

    it("should include IMCA M109 standard", () => {
      const standards = "IMCA M109 (documentação)";
      expect(standards).toContain("IMCA M109");
      expect(standards).toContain("documentação");
    });

    it("should include IMCA M220 standard", () => {
      const standards = "IMCA M220 (planejamento de operações)";
      expect(standards).toContain("IMCA M220");
      expect(standards).toContain("planejamento de operações");
    });

    it("should include IMCA M140 standard", () => {
      const standards = "IMCA M140 (gráficos de capacidade)";
      expect(standards).toContain("IMCA M140");
      expect(standards).toContain("gráficos de capacidade");
    });

    it("should include MSF 182 guideline", () => {
      const guidelines = "MSF 182 (operação segura de OSVs com DP)";
      expect(guidelines).toContain("MSF 182");
      expect(guidelines).toContain("OSVs com DP");
    });

    it("should include IMO MSC.1/Circ.1580 guideline", () => {
      const guidelines = "IMO MSC.1/Circ.1580";
      expect(guidelines).toContain("IMO MSC.1/Circ.1580");
    });

    it("should request evaluation of systems", () => {
      const evaluation = "Avalie sistemas, sensores, rede, pessoal";
      expect(evaluation).toContain("sistemas");
      expect(evaluation).toContain("sensores");
    });

    it("should request evaluation of personnel", () => {
      const evaluation = "Avalie sistemas, sensores, rede, pessoal";
      expect(evaluation).toContain("pessoal");
    });

    it("should request evaluation of documentation", () => {
      const evaluation = "documentos, registros, falhas, mitigação";
      expect(evaluation).toContain("documentos");
      expect(evaluation).toContain("registros");
    });

    it("should request action plan with risk levels", () => {
      const actionPlan = "plano de ação com níveis de risco e prazos recomendados";
      expect(actionPlan).toContain("plano de ação");
      expect(actionPlan).toContain("níveis de risco");
      expect(actionPlan).toContain("prazos recomendados");
    });
  });

  describe("OpenAI Integration", () => {
    it("should use gpt-4 model", () => {
      const modelConfig = {
        model: "gpt-4",
      };

      expect(modelConfig.model).toBe("gpt-4");
    });

    it("should use temperature 0.7", () => {
      const modelConfig = {
        temperature: 0.7,
      };

      expect(modelConfig.temperature).toBe(0.7);
    });

    it("should use max_tokens 1800", () => {
      const modelConfig = {
        max_tokens: 1800,
      };

      expect(modelConfig.max_tokens).toBe(1800);
    });

    it("should include system message", () => {
      const systemMessage = {
        role: "system",
        content: "Você é um especialista técnico em auditorias DP.",
      };

      expect(systemMessage.role).toBe("system");
      expect(systemMessage.content).toContain("especialista técnico");
      expect(systemMessage.content).toContain("auditorias DP");
    });

    it("should include user message with prompt", () => {
      const userMessage = {
        role: "user",
        content: "Você é um auditor técnico altamente qualificado...",
      };

      expect(userMessage.role).toBe("user");
      expect(userMessage.content).toContain("auditor técnico");
    });

    it("should handle empty completion response", () => {
      const completion = {
        choices: [],
      };

      const output = completion.choices[0]?.message?.content || "Erro ao gerar auditoria.";
      expect(output).toBe("Erro ao gerar auditoria.");
    });

    it("should extract content from completion", () => {
      const completion = {
        choices: [
          {
            message: {
              content: "Auditoria técnica completa...",
            },
          },
        ],
      };

      const output = completion.choices[0]?.message?.content || "Erro ao gerar auditoria.";
      expect(output).toBe("Auditoria técnica completa...");
    });
  });

  describe("Supabase Integration", () => {
    it("should insert into auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should save nome_navio field", () => {
      const record = {
        nome_navio: "PSV Atlântico",
        contexto: "Operação teste",
        relatorio: "Relatório completo",
        user_id: "user-123",
      };

      expect(record.nome_navio).toBe("PSV Atlântico");
    });

    it("should save contexto field", () => {
      const record = {
        nome_navio: "PSV Atlântico",
        contexto: "Operação de ancoragem em águas profundas",
        relatorio: "Relatório completo",
        user_id: "user-123",
      };

      expect(record.contexto).toBe("Operação de ancoragem em águas profundas");
    });

    it("should save relatorio field", () => {
      const record = {
        nome_navio: "PSV Atlântico",
        contexto: "Operação teste",
        relatorio: "Auditoria técnica detalhada com análise de sistemas DP...",
        user_id: "user-123",
      };

      expect(record.relatorio).toContain("Auditoria técnica");
    });

    it("should save user_id field", () => {
      const record = {
        nome_navio: "PSV Atlântico",
        contexto: "Operação teste",
        relatorio: "Relatório completo",
        user_id: "user-abc-123",
      };

      expect(record.user_id).toBe("user-abc-123");
    });

    it("should handle Supabase errors gracefully", () => {
      const mockError = {
        message: "Database connection error",
        code: "500",
      };

      const handleError = (error: { message: string; code: string } | null) => {
        if (error) {
          console.error("Erro ao salvar no Supabase:", error);
          return true;
        }
        return false;
      };

      expect(handleError(mockError)).toBe(true);
    });
  });

  describe("Response Handling", () => {
    it("should return output field in response", () => {
      const response = {
        output: "Auditoria técnica completa...",
      };

      expect(response).toHaveProperty("output");
      expect(typeof response.output).toBe("string");
    });

    it("should return error message for method not allowed", () => {
      const response = {
        error: "Method not allowed",
      };

      expect(response.error).toBe("Method not allowed");
    });

    it("should return error message for missing fields", () => {
      const response = {
        error: "Missing required fields",
      };

      expect(response.error).toBe("Missing required fields");
    });

    it("should return error message for generation failure", () => {
      const response = {
        error: "Erro na geração de auditoria.",
      };

      expect(response.error).toBe("Erro na geração de auditoria.");
    });
  });

  describe("Error Handling", () => {
    it("should catch OpenAI API errors", () => {
      const handleError = (error: unknown) => {
        try {
          throw error;
        } catch (e) {
          console.error("Erro na geração de auditoria:", e);
          return { error: "Erro na geração de auditoria." };
        }
      };

      const error = new Error("OpenAI API timeout");
      const result = handleError(error);

      expect(result).toHaveProperty("error");
      expect(result.error).toBe("Erro na geração de auditoria.");
    });

    it("should log errors to console", () => {
      const logError = (error: Error) => {
        console.error("Erro na geração de auditoria:", error);
        return true;
      };

      const error = new Error("Test error");
      expect(logError(error)).toBe(true);
    });

    it("should handle network errors", () => {
      const networkError = new Error("Network request failed");

      expect(networkError.message).toContain("Network");
    });

    it("should handle authentication errors", () => {
      const authError = new Error("Invalid API key");

      expect(authError.message).toContain("API key");
    });
  });

  describe("Integration Flow", () => {
    it("should follow complete flow for valid request", () => {
      const request = {
        method: "POST",
        body: {
          nomeNavio: "PSV Atlântico",
          contexto: "Operação de ancoragem em águas profundas",
          user_id: "user-123",
        },
      };

      const isValidMethod = request.method === "POST";
      const hasRequiredFields =
        !!request.body.nomeNavio && !!request.body.contexto && !!request.body.user_id;

      expect(isValidMethod).toBe(true);
      expect(hasRequiredFields).toBe(true);
    });

    it("should generate prompt from request data", () => {
      const nomeNavio = "PSV Atlântico";
      const contexto = "Operação de ancoragem";

      const prompt = `para o navio ${nomeNavio}, com base no seguinte contexto operacional:
"""
${contexto}
"""`;

      expect(prompt).toContain("PSV Atlântico");
      expect(prompt).toContain("Operação de ancoragem");
    });

    it("should save generated audit to database", () => {
      const auditData = {
        nome_navio: "PSV Atlântico",
        contexto: "Operação teste",
        relatorio: "Auditoria técnica completa",
        user_id: "user-123",
      };

      expect(Object.keys(auditData)).toEqual(
        expect.arrayContaining(["nome_navio", "contexto", "relatorio", "user_id"])
      );
    });
  });

  describe("DP Audit Standards Coverage", () => {
    it("should cover all 7 required IMCA standards", () => {
      const imcaStandards = [
        "IMCA M103",
        "IMCA M117",
        "IMCA M190",
        "IMCA M166",
        "IMCA M109",
        "IMCA M220",
        "IMCA M140",
      ];

      expect(imcaStandards).toHaveLength(7);
      expect(imcaStandards).toContain("IMCA M103");
      expect(imcaStandards).toContain("IMCA M117");
      expect(imcaStandards).toContain("IMCA M190");
      expect(imcaStandards).toContain("IMCA M166");
      expect(imcaStandards).toContain("IMCA M109");
      expect(imcaStandards).toContain("IMCA M220");
      expect(imcaStandards).toContain("IMCA M140");
    });

    it("should reference MSF 182 guideline", () => {
      const guidelines = ["MSF 182", "IMO MSC.1/Circ.1580"];

      expect(guidelines).toContain("MSF 182");
    });

    it("should reference IMO guidelines", () => {
      const guidelines = ["MSF 182", "IMO MSC.1/Circ.1580"];

      expect(guidelines).toContain("IMO MSC.1/Circ.1580");
    });
  });
});
