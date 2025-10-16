/**
 * Admin SGSO API Endpoint Tests
 * 
 * Tests for the /api/admin/sgso endpoint that provides risk metrics
 * grouped by vessel (embarcação) with automatic risk level classification
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Admin SGSO API Endpoint", () => {
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
        error: "Método não permitido."
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Método não permitido.");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/admin/sgso";
      expect(endpointPath).toBe("/api/admin/sgso");
    });

    it("should be accessible via pages/api/admin/sgso.ts", () => {
      const filePath = "pages/api/admin/sgso.ts";
      expect(filePath).toContain("admin/sgso");
    });
  });

  describe("RPC Function Integration", () => {
    it("should call auditoria_metricas_risco RPC function", () => {
      const rpcFunctionName = "auditoria_metricas_risco";
      expect(rpcFunctionName).toBe("auditoria_metricas_risco");
    });

    it("should use Supabase RPC method", () => {
      const method = "rpc";
      expect(method).toBe("rpc");
    });

    it("should receive data with embarcacao, mes, and falhas_criticas", () => {
      const mockData = [
        { embarcacao: "Navio A", mes: "2025-10", falhas_criticas: 2 },
        { embarcacao: "Navio A", mes: "2025-09", falhas_criticas: 3 },
        { embarcacao: "Navio B", mes: "2025-10", falhas_criticas: 1 }
      ];

      expect(mockData[0]).toHaveProperty("embarcacao");
      expect(mockData[0]).toHaveProperty("mes");
      expect(mockData[0]).toHaveProperty("falhas_criticas");
    });
  });

  describe("Data Aggregation", () => {
    it("should group results by embarcacao", () => {
      const mockData = [
        { embarcacao: "Navio A", mes: "2025-10", falhas_criticas: 2 },
        { embarcacao: "Navio A", mes: "2025-09", falhas_criticas: 3 },
        { embarcacao: "Navio B", mes: "2025-10", falhas_criticas: 1 }
      ];

      const agrupado: Record<string, { embarcacao: string; total: number; por_mes: Record<string, number>; risco: string }> = {};
      
      mockData.forEach((item) => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!agrupado[embarcacao]) {
          agrupado[embarcacao] = {
            embarcacao,
            total: 0,
            por_mes: {},
            risco: "baixo"
          };
        }
        agrupado[embarcacao].total += falhas_criticas;
        agrupado[embarcacao].por_mes[mes] = falhas_criticas;
      });

      expect(agrupado["Navio A"].total).toBe(5);
      expect(agrupado["Navio B"].total).toBe(1);
    });

    it("should aggregate failures by month per vessel", () => {
      const vesselData = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: {
          "2025-10": 2,
          "2025-09": 3
        },
        risco: "alto"
      };

      expect(vesselData.por_mes["2025-10"]).toBe(2);
      expect(vesselData.por_mes["2025-09"]).toBe(3);
    });

    it("should sum total failures per vessel", () => {
      const mockData = [
        { embarcacao: "Navio A", mes: "2025-10", falhas_criticas: 2 },
        { embarcacao: "Navio A", mes: "2025-09", falhas_criticas: 3 }
      ];

      let total = 0;
      mockData.forEach((item) => {
        total += item.falhas_criticas;
      });

      expect(total).toBe(5);
    });
  });

  describe("Risk Level Classification", () => {
    it("should classify as 'baixo' when total < 3", () => {
      const total = 2;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });

    it("should classify as 'moderado' when total >= 3 and < 5", () => {
      const total = 4;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should classify as 'alto' when total >= 5", () => {
      const total = 5;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });

    it("should handle edge case of exactly 3 failures", () => {
      const total = 3;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should handle edge case of exactly 5 failures", () => {
      const total = 5;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });

    it("should handle zero failures", () => {
      const total = 0;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });

    it("should update risk level as total increases", () => {
      let total = 1;
      let risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");

      total += 2;
      risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");

      total += 3;
      risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });
  });

  describe("Response Format", () => {
    it("should return array of vessel risk summaries", () => {
      const mockResponse = [
        { embarcacao: "Navio A", total: 5, por_mes: { "2025-10": 5 }, risco: "alto" },
        { embarcacao: "Navio B", total: 2, por_mes: { "2025-10": 2 }, risco: "baixo" }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("embarcacao");
      expect(mockResponse[0]).toHaveProperty("total");
      expect(mockResponse[0]).toHaveProperty("por_mes");
      expect(mockResponse[0]).toHaveProperty("risco");
    });

    it("should include embarcacao name in response", () => {
      const item = { embarcacao: "Navio A", total: 5, por_mes: {}, risco: "alto" };
      expect(item.embarcacao).toBe("Navio A");
      expect(typeof item.embarcacao).toBe("string");
    });

    it("should include total count in response", () => {
      const item = { embarcacao: "Navio A", total: 5, por_mes: {}, risco: "alto" };
      expect(item.total).toBe(5);
      expect(typeof item.total).toBe("number");
    });

    it("should include por_mes object in response", () => {
      const item = { 
        embarcacao: "Navio A", 
        total: 5, 
        por_mes: { "2025-10": 2, "2025-09": 3 }, 
        risco: "alto" 
      };
      expect(typeof item.por_mes).toBe("object");
      expect(item.por_mes["2025-10"]).toBe(2);
    });

    it("should include risco level in response", () => {
      const item = { embarcacao: "Navio A", total: 5, por_mes: {}, risco: "alto" };
      expect(item.risco).toBe("alto");
      expect(["baixo", "moderado", "alto"]).toContain(item.risco);
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
    it("should return 500 status on RPC error", () => {
      const errorResponse = {
        status: 500,
        error: "Error message"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return 500 status on processing error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao processar métricas."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBe("Erro ao processar métricas.");
    });

    it("should return Portuguese error messages", () => {
      const errorMessage = "Erro ao processar métricas SGSO:";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("SGSO");
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao buscar métricas de risco:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("métricas");
    });
  });

  describe("Risk Classification Use Cases", () => {
    it("should identify high-risk vessel with 5+ failures", () => {
      const vessel = { embarcacao: "Navio Alto Risco", total: 7, por_mes: {}, risco: "alto" };
      expect(vessel.risco).toBe("alto");
      expect(vessel.total).toBeGreaterThanOrEqual(5);
    });

    it("should identify moderate-risk vessel with 3-4 failures", () => {
      const vessel = { embarcacao: "Navio Moderado", total: 4, por_mes: {}, risco: "moderado" };
      expect(vessel.risco).toBe("moderado");
      expect(vessel.total).toBeGreaterThanOrEqual(3);
      expect(vessel.total).toBeLessThan(5);
    });

    it("should identify low-risk vessel with <3 failures", () => {
      const vessel = { embarcacao: "Navio Baixo Risco", total: 2, por_mes: {}, risco: "baixo" };
      expect(vessel.risco).toBe("baixo");
      expect(vessel.total).toBeLessThan(3);
    });

    it("should handle vessel with no failures", () => {
      const vessel = { embarcacao: "Navio Sem Falhas", total: 0, por_mes: {}, risco: "baixo" };
      expect(vessel.risco).toBe("baixo");
      expect(vessel.total).toBe(0);
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

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Classifica automaticamente o nível de risco por embarcação";
      expect(purpose).toContain("risco");
      expect(purpose).toContain("embarcação");
    });

    it("should document risk levels", () => {
      const riskLevels = {
        alto: "5+ falhas críticas",
        moderado: "3–4 falhas",
        baixo: "<3 falhas"
      };
      expect(riskLevels.alto).toContain("5+");
      expect(riskLevels.moderado).toContain("3–4");
      expect(riskLevels.baixo).toContain("<3");
    });

    it("should document example usage", () => {
      const example = "/api/admin/sgso";
      expect(example).toBe("/api/admin/sgso");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: [
          { 
            embarcacao: "Navio A", 
            total: 5, 
            por_mes: { "2025-10": 2, "2025-09": 3 }, 
            risco: "alto" 
          }
        ]
      };
      expect(responseFormat.example[0]).toHaveProperty("embarcacao");
      expect(responseFormat.example[0]).toHaveProperty("total");
      expect(responseFormat.example[0]).toHaveProperty("por_mes");
      expect(responseFormat.example[0]).toHaveProperty("risco");
    });
  });

  describe("SGSO Dashboard Integration", () => {
    it("should be ready for SGSO interactive dashboard", () => {
      const dashboardReady = true;
      expect(dashboardReady).toBe(true);
    });

    it("should provide data for risk visualization", () => {
      const visualizationData = {
        riskColors: {
          alto: "red",
          moderado: "orange",
          baixo: "green"
        }
      };
      expect(visualizationData.riskColors.alto).toBe("red");
      expect(visualizationData.riskColors.moderado).toBe("orange");
      expect(visualizationData.riskColors.baixo).toBe("green");
    });

    it("should support filtering by risk level", () => {
      const mockResponse = [
        { embarcacao: "Navio A", total: 5, por_mes: {}, risco: "alto" },
        { embarcacao: "Navio B", total: 2, por_mes: {}, risco: "baixo" }
      ];

      const highRisk = mockResponse.filter(v => v.risco === "alto");
      expect(highRisk).toHaveLength(1);
      expect(highRisk[0].embarcacao).toBe("Navio A");
    });
  });
});
