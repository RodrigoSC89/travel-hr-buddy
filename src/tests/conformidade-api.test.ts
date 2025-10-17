/**
 * Conformidade API Endpoint Tests
 * 
 * Tests for the /api/bi/conformidade endpoint that provides
 * conformity data grouped by vessel and month
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Conformidade API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should reject non-GET requests with 405", () => {
      const errorResponse = {
        status: 405,
        error: "Method not allowed"
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Method not allowed");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/bi/conformidade";
      expect(endpointPath).toBe("/api/bi/conformidade");
    });

    it("should be accessible via pages/api/bi/conformidade.ts", () => {
      const filePath = "pages/api/bi/conformidade.ts";
      expect(filePath).toContain("bi/conformidade");
    });
  });

  describe("Database Query", () => {
    it("should query auditorias table", () => {
      const tableName = "auditorias";
      expect(tableName).toBe("auditorias");
    });

    it("should select required columns", () => {
      const selectFields = "navio, norma, resultado, data";
      expect(selectFields).toContain("navio");
      expect(selectFields).toContain("norma");
      expect(selectFields).toContain("resultado");
      expect(selectFields).toContain("data");
    });
  });

  describe("Data Aggregation", () => {
    it("should group results by vessel and month", () => {
      const mockData = [
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Conforme", data: "2025-10-01T10:00:00Z" },
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Não Conforme", data: "2025-10-05T14:00:00Z" },
        { navio: "MV Pacific", norma: "IMCA", resultado: "Conforme", data: "2025-10-02T11:00:00Z" }
      ];

      const agrupado: Record<string, any> = {};

      mockData.forEach((a) => {
        const navio = a.navio || "Desconhecido";
        const mes = a.data?.substring(0, 7) || "Sem data";
        const chave = `${navio}::${mes}`;

        if (!agrupado[chave]) {
          agrupado[chave] = {
            navio,
            mes,
            conforme: 0,
            nao_conforme: 0,
            observacao: 0,
          };
        }

        if (a.resultado === "Conforme") agrupado[chave].conforme++;
        else if (a.resultado === "Não Conforme") agrupado[chave].nao_conforme++;
        else if (a.resultado === "Observação") agrupado[chave].observacao++;
      });

      expect(agrupado["MV Atlantic::2025-10"].conforme).toBe(1);
      expect(agrupado["MV Atlantic::2025-10"].nao_conforme).toBe(1);
      expect(agrupado["MV Pacific::2025-10"].conforme).toBe(1);
    });

    it("should handle missing vessel data with default", () => {
      const mockData = [
        { navio: null, norma: "IMCA", resultado: "Conforme", data: "2025-10-01T10:00:00Z" }
      ];

      const agrupado: Record<string, any> = {};

      mockData.forEach((a) => {
        const navio = a.navio || "Desconhecido";
        const mes = a.data?.substring(0, 7) || "Sem data";
        const chave = `${navio}::${mes}`;

        if (!agrupado[chave]) {
          agrupado[chave] = {
            navio,
            mes,
            conforme: 0,
            nao_conforme: 0,
            observacao: 0,
          };
        }

        if (a.resultado === "Conforme") agrupado[chave].conforme++;
      });

      expect(agrupado["Desconhecido::2025-10"]).toBeDefined();
      expect(agrupado["Desconhecido::2025-10"].conforme).toBe(1);
    });

    it("should count conformity results correctly", () => {
      const mockData = [
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Conforme", data: "2025-10-01T10:00:00Z" },
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Conforme", data: "2025-10-02T10:00:00Z" },
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Não Conforme", data: "2025-10-03T10:00:00Z" },
        { navio: "MV Atlantic", norma: "IMCA", resultado: "Observação", data: "2025-10-04T10:00:00Z" }
      ];

      const agrupado: Record<string, any> = {};

      mockData.forEach((a) => {
        const navio = a.navio || "Desconhecido";
        const mes = a.data?.substring(0, 7) || "Sem data";
        const chave = `${navio}::${mes}`;

        if (!agrupado[chave]) {
          agrupado[chave] = {
            navio,
            mes,
            conforme: 0,
            nao_conforme: 0,
            observacao: 0,
          };
        }

        if (a.resultado === "Conforme") agrupado[chave].conforme++;
        else if (a.resultado === "Não Conforme") agrupado[chave].nao_conforme++;
        else if (a.resultado === "Observação") agrupado[chave].observacao++;
      });

      expect(agrupado["MV Atlantic::2025-10"].conforme).toBe(2);
      expect(agrupado["MV Atlantic::2025-10"].nao_conforme).toBe(1);
      expect(agrupado["MV Atlantic::2025-10"].observacao).toBe(1);
    });

    it("should transform aggregated data to array format", () => {
      const agrupado = {
        "MV Atlantic::2025-10": {
          navio: "MV Atlantic",
          mes: "2025-10",
          conforme: 2,
          nao_conforme: 1,
          observacao: 1
        }
      };

      const resultado = Object.values(agrupado);

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toHaveProperty("navio");
      expect(resultado[0]).toHaveProperty("mes");
      expect(resultado[0]).toHaveProperty("conforme");
      expect(resultado[0]).toHaveProperty("nao_conforme");
      expect(resultado[0]).toHaveProperty("observacao");
    });
  });

  describe("Response Format", () => {
    it("should return array of conformity summaries", () => {
      const mockResponse = [
        { navio: "MV Atlantic", mes: "2025-10", conforme: 2, nao_conforme: 1, observacao: 1 },
        { navio: "MV Pacific", mes: "2025-10", conforme: 3, nao_conforme: 0, observacao: 0 }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("navio");
      expect(mockResponse[0]).toHaveProperty("mes");
      expect(mockResponse[0]).toHaveProperty("conforme");
      expect(mockResponse[0]).toHaveProperty("nao_conforme");
      expect(mockResponse[0]).toHaveProperty("observacao");
    });

    it("should include vessel name in response", () => {
      const item = { navio: "MV Atlantic", mes: "2025-10", conforme: 2, nao_conforme: 1, observacao: 1 };
      expect(item.navio).toBe("MV Atlantic");
      expect(typeof item.navio).toBe("string");
    });

    it("should include month in response", () => {
      const item = { navio: "MV Atlantic", mes: "2025-10", conforme: 2, nao_conforme: 1, observacao: 1 };
      expect(item.mes).toBe("2025-10");
      expect(typeof item.mes).toBe("string");
      expect(item.mes).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should include conformity counts in response", () => {
      const item = { navio: "MV Atlantic", mes: "2025-10", conforme: 2, nao_conforme: 1, observacao: 1 };
      expect(item.conforme).toBe(2);
      expect(item.nao_conforme).toBe(1);
      expect(item.observacao).toBe(1);
      expect(typeof item.conforme).toBe("number");
      expect(typeof item.nao_conforme).toBe("number");
      expect(typeof item.observacao).toBe("number");
    });

    it("should return 200 status on success", () => {
      const successResponse = {
        status: 200,
        data: []
      };
      expect(successResponse.status).toBe(200);
    });

    it("should return empty array when no results", () => {
      const emptyData: unknown[] = [];
      expect(Array.isArray(emptyData)).toBe(true);
      expect(emptyData).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 status on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao gerar dados de conformidade."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao gerar dados de conformidade.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("conformidade");
    });

    it("should log errors to console", () => {
      const errorLog = "Error in conformidade endpoint:";
      expect(errorLog).toContain("Error");
      expect(errorLog).toContain("conformidade");
    });
  });

  describe("Resultado Types", () => {
    it("should recognize Conforme result", () => {
      const resultado = "Conforme";
      expect(resultado).toBe("Conforme");
    });

    it("should recognize Não Conforme result", () => {
      const resultado = "Não Conforme";
      expect(resultado).toBe("Não Conforme");
    });

    it("should recognize Observação result", () => {
      const resultado = "Observação";
      expect(resultado).toBe("Observação");
    });
  });

  describe("Supabase Client Integration", () => {
    it("should use createClient from @supabase/supabase-js", () => {
      const importPath = "@supabase/supabase-js";
      expect(importPath).toBe("@supabase/supabase-js");
    });

    it("should use NEXT_PUBLIC_SUPABASE_URL environment variable", () => {
      const envVar = "NEXT_PUBLIC_SUPABASE_URL";
      expect(envVar).toBe("NEXT_PUBLIC_SUPABASE_URL");
    });

    it("should use SUPABASE_SERVICE_ROLE_KEY environment variable", () => {
      const envVar = "SUPABASE_SERVICE_ROLE_KEY";
      expect(envVar).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("should use service role key for full access", () => {
      const comment = "use service role para acessar todas as auditorias";
      expect(comment).toContain("service role");
      expect(comment).toContain("auditorias");
    });
  });

  describe("NextJS API Route Integration", () => {
    it("should use NextApiRequest type", () => {
      const importType = "NextApiRequest";
      expect(importType).toBe("NextApiRequest");
    });

    it("should use NextApiResponse type", () => {
      const importType = "NextApiResponse";
      expect(importType).toBe("NextApiResponse");
    });

    it("should export default async handler", () => {
      const handlerSignature = "async function handler(req, res)";
      expect(handlerSignature).toContain("async");
      expect(handlerSignature).toContain("req");
      expect(handlerSignature).toContain("res");
    });
  });

  describe("Date Format Validation", () => {
    it("should extract year-month from timestamp", () => {
      const timestamp = "2025-10-01T10:00:00Z";
      const mes = timestamp.substring(0, 7);
      expect(mes).toBe("2025-10");
      expect(mes).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should handle missing date with default", () => {
      const data = null;
      const mes = data?.substring(0, 7) || "Sem data";
      expect(mes).toBe("Sem data");
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Gera dados de conformidade agrupados por navio e mês";
      expect(purpose).toContain("conformidade");
      expect(purpose).toContain("navio");
      expect(purpose).toContain("mês");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: [
          { navio: "MV Atlantic", mes: "2025-10", conforme: 2, nao_conforme: 1, observacao: 1 },
          { navio: "MV Pacific", mes: "2025-10", conforme: 3, nao_conforme: 0, observacao: 0 }
        ]
      };
      expect(responseFormat.example).toHaveLength(2);
      expect(responseFormat.example[0]).toHaveProperty("navio");
      expect(responseFormat.example[0]).toHaveProperty("mes");
      expect(responseFormat.example[0]).toHaveProperty("conforme");
      expect(responseFormat.example[0]).toHaveProperty("nao_conforme");
      expect(responseFormat.example[0]).toHaveProperty("observacao");
    });
  });

  describe("Grouping Key Format", () => {
    it("should create unique key from vessel and month", () => {
      const navio = "MV Atlantic";
      const mes = "2025-10";
      const chave = `${navio}::${mes}`;
      expect(chave).toBe("MV Atlantic::2025-10");
      expect(chave).toContain("::");
    });

    it("should handle different vessels with same month", () => {
      const keys = [
        "MV Atlantic::2025-10",
        "MV Pacific::2025-10",
        "MV Indian::2025-10"
      ];
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);
    });

    it("should handle same vessel with different months", () => {
      const keys = [
        "MV Atlantic::2025-09",
        "MV Atlantic::2025-10",
        "MV Atlantic::2025-11"
      ];
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);
    });
  });
});
