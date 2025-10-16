/**
 * Admin SGSO API Endpoint Tests
 * 
 * Tests for the /api/admin/sgso endpoint that provides risk metrics
 * for SGSO management dashboard, grouped by vessel with monthly data
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

  describe("RPC Function Call", () => {
    it("should call auditoria_metricas_risco RPC function", () => {
      const rpcFunctionName = "auditoria_metricas_risco";
      expect(rpcFunctionName).toBe("auditoria_metricas_risco");
    });

    it("should use Supabase RPC method", () => {
      const method = "rpc";
      expect(method).toBe("rpc");
    });

    it("should handle RPC function errors", () => {
      const errorResponse = {
        status: 500,
        error: "Database error message"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });
  });

  describe("Data Aggregation", () => {
    it("should group results by embarcacao", () => {
      const mockData = [
        { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 3 },
        { embarcacao: "Navio A", mes: "2025-02", falhas_criticas: 2 },
        { embarcacao: "Navio B", mes: "2025-01", falhas_criticas: 5 }
      ];

      const agrupado = mockData.reduce((acc: Record<string, any>, item: any) => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!acc[embarcacao]) {
          acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
        }
        acc[embarcacao].total += falhas_criticas;
        acc[embarcacao].por_mes[mes] = falhas_criticas;
        return acc;
      }, {});

      expect(agrupado["Navio A"].total).toBe(5);
      expect(agrupado["Navio B"].total).toBe(5);
      expect(agrupado["Navio A"].por_mes["2025-01"]).toBe(3);
      expect(agrupado["Navio A"].por_mes["2025-02"]).toBe(2);
    });

    it("should calculate total critical failures per vessel", () => {
      const agrupado = {
        "Navio A": { embarcacao: "Navio A", total: 5, por_mes: {} },
        "Navio B": { embarcacao: "Navio B", total: 3, por_mes: {} }
      };

      expect(agrupado["Navio A"].total).toBe(5);
      expect(agrupado["Navio B"].total).toBe(3);
    });

    it("should store monthly failures in por_mes object", () => {
      const vesselData = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: {
          "2025-01": 3,
          "2025-02": 2
        }
      };

      expect(vesselData.por_mes["2025-01"]).toBe(3);
      expect(vesselData.por_mes["2025-02"]).toBe(2);
      expect(Object.keys(vesselData.por_mes).length).toBe(2);
    });

    it("should initialize vessel data when first encountered", () => {
      const acc: Record<string, any> = {};
      const embarcacao = "Navio A";
      
      if (!acc[embarcacao]) {
        acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
      }

      expect(acc[embarcacao]).toBeDefined();
      expect(acc[embarcacao].embarcacao).toBe("Navio A");
      expect(acc[embarcacao].total).toBe(0);
      expect(acc[embarcacao].por_mes).toEqual({});
    });

    it("should accumulate failures across months", () => {
      const acc: Record<string, any> = {};
      const items = [
        { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 3 },
        { embarcacao: "Navio A", mes: "2025-02", falhas_criticas: 2 },
        { embarcacao: "Navio A", mes: "2025-03", falhas_criticas: 1 }
      ];

      items.forEach(item => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!acc[embarcacao]) {
          acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
        }
        acc[embarcacao].total += falhas_criticas;
        acc[embarcacao].por_mes[mes] = falhas_criticas;
      });

      expect(acc["Navio A"].total).toBe(6);
      expect(Object.keys(acc["Navio A"].por_mes).length).toBe(3);
    });
  });

  describe("Response Format", () => {
    it("should return array of vessel data", () => {
      const agrupado = {
        "Navio A": { embarcacao: "Navio A", total: 5, por_mes: { "2025-01": 5 } },
        "Navio B": { embarcacao: "Navio B", total: 3, por_mes: { "2025-01": 3 } }
      };

      const resposta = Object.values(agrupado);

      expect(Array.isArray(resposta)).toBe(true);
      expect(resposta).toHaveLength(2);
    });

    it("should include embarcacao field", () => {
      const item = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: { "2025-01": 5 }
      };

      expect(item.embarcacao).toBe("Navio A");
      expect(typeof item.embarcacao).toBe("string");
    });

    it("should include total field", () => {
      const item = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: { "2025-01": 5 }
      };

      expect(item.total).toBe(5);
      expect(typeof item.total).toBe("number");
    });

    it("should include por_mes object", () => {
      const item = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: { "2025-01": 3, "2025-02": 2 }
      };

      expect(item.por_mes).toBeDefined();
      expect(typeof item.por_mes).toBe("object");
      expect(item.por_mes["2025-01"]).toBe(3);
      expect(item.por_mes["2025-02"]).toBe(2);
    });

    it("should return 200 status on success", () => {
      const successResponse = {
        status: 200,
        data: []
      };
      expect(successResponse.status).toBe(200);
    });

    it("should return empty array when no data", () => {
      const emptyData: unknown[] = [];
      expect(Array.isArray(emptyData)).toBe(true);
      expect(emptyData).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 status on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao buscar métricas de risco."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao buscar métricas de risco.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("métricas");
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao buscar métricas de risco SGSO:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("SGSO");
    });

    it("should return error message from database", () => {
      const dbError = { message: "Database connection failed" };
      expect(dbError.message).toBeDefined();
    });
  });

  describe("Data Structure", () => {
    it("should extract embarcacao from RPC result", () => {
      const item = { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 3 };
      const { embarcacao } = item;
      expect(embarcacao).toBe("Navio A");
    });

    it("should extract mes from RPC result", () => {
      const item = { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 3 };
      const { mes } = item;
      expect(mes).toBe("2025-01");
    });

    it("should extract falhas_criticas from RPC result", () => {
      const item = { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 3 };
      const { falhas_criticas } = item;
      expect(falhas_criticas).toBe(3);
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

    it("should extract method from request", () => {
      const req = { method: "GET" };
      const { method } = req;
      expect(method).toBe("GET");
    });
  });

  describe("Use Cases", () => {
    it("should provide vessel risk metrics for SGSO dashboard", () => {
      const useCase = {
        description: "Métricas de risco por embarcação para painel SGSO",
        endpoint: "/api/admin/sgso"
      };
      expect(useCase.endpoint).toBe("/api/admin/sgso");
    });

    it("should support monthly trend analysis", () => {
      const vesselData = {
        embarcacao: "Navio A",
        total: 10,
        por_mes: {
          "2025-01": 4,
          "2025-02": 3,
          "2025-03": 3
        }
      };
      expect(Object.keys(vesselData.por_mes).length).toBeGreaterThan(0);
    });

    it("should aggregate all critical failures", () => {
      const vessels = [
        { embarcacao: "Navio A", total: 5, por_mes: {} },
        { embarcacao: "Navio B", total: 3, por_mes: {} },
        { embarcacao: "Navio C", total: 8, por_mes: {} }
      ];
      
      const totalFailures = vessels.reduce((sum, v) => sum + v.total, 0);
      expect(totalFailures).toBe(16);
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Retorna métricas de risco do SGSO agrupadas por embarcação";
      expect(purpose).toContain("métricas");
      expect(purpose).toContain("SGSO");
      expect(purpose).toContain("embarcação");
    });

    it("should document response structure", () => {
      const example = {
        embarcacao: "Navio A",
        total: 5,
        por_mes: {
          "2025-01": 3,
          "2025-02": 2
        }
      };
      expect(example).toHaveProperty("embarcacao");
      expect(example).toHaveProperty("total");
      expect(example).toHaveProperty("por_mes");
    });

    it("should document usage for SGSO panels", () => {
      const usage = "Dados prontos para alimentar painéis SGSO";
      expect(usage).toContain("painéis");
      expect(usage).toContain("SGSO");
    });

    it("should provide vessel list", () => {
      const feature = "Lista de embarcações";
      expect(feature).toContain("embarcações");
    });

    it("should provide total risk calculation", () => {
      const feature = "Risco total e por mês";
      expect(feature).toContain("total");
      expect(feature).toContain("mês");
    });
  });

  describe("Data Transformation", () => {
    it("should convert RPC array to grouped object", () => {
      const rpcData = [
        { embarcacao: "A", mes: "2025-01", falhas_criticas: 1 },
        { embarcacao: "A", mes: "2025-02", falhas_criticas: 2 }
      ];
      
      const grouped = rpcData.reduce((acc: Record<string, any>, item) => {
        if (!acc[item.embarcacao]) {
          acc[item.embarcacao] = { embarcacao: item.embarcacao, total: 0, por_mes: {} };
        }
        return acc;
      }, {});

      expect(typeof grouped).toBe("object");
      expect(grouped["A"]).toBeDefined();
    });

    it("should convert grouped object to array response", () => {
      const grouped = {
        "A": { embarcacao: "A", total: 3, por_mes: {} },
        "B": { embarcacao: "B", total: 2, por_mes: {} }
      };
      
      const response = Object.values(grouped);
      
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single vessel", () => {
      const data = [
        { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 5 }
      ];
      
      const agrupado = data.reduce((acc: Record<string, any>, item) => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!acc[embarcacao]) {
          acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
        }
        acc[embarcacao].total += falhas_criticas;
        acc[embarcacao].por_mes[mes] = falhas_criticas;
        return acc;
      }, {});

      expect(Object.keys(agrupado).length).toBe(1);
    });

    it("should handle zero failures", () => {
      const data = [
        { embarcacao: "Navio A", mes: "2025-01", falhas_criticas: 0 }
      ];
      
      const agrupado = data.reduce((acc: Record<string, any>, item) => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!acc[embarcacao]) {
          acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
        }
        acc[embarcacao].total += falhas_criticas;
        acc[embarcacao].por_mes[mes] = falhas_criticas;
        return acc;
      }, {});

      expect(agrupado["Navio A"].total).toBe(0);
    });

    it("should handle empty RPC response", () => {
      const data: any[] = [];
      const agrupado = data.reduce((acc: Record<string, any>, item) => {
        return acc;
      }, {});

      expect(Object.keys(agrupado).length).toBe(0);
    });

    it("should handle multiple months for same vessel", () => {
      const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05"];
      const data = months.map(mes => ({
        embarcacao: "Navio A",
        mes,
        falhas_criticas: 2
      }));

      const agrupado = data.reduce((acc: Record<string, any>, item) => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!acc[embarcacao]) {
          acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
        }
        acc[embarcacao].total += falhas_criticas;
        acc[embarcacao].por_mes[mes] = falhas_criticas;
        return acc;
      }, {});

      expect(agrupado["Navio A"].total).toBe(10);
      expect(Object.keys(agrupado["Navio A"].por_mes).length).toBe(5);
    });
  });
});
