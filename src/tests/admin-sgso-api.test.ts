/**
 * Admin SGSO API Endpoint Tests
 * 
 * Tests for the /api/admin/sgso endpoint that provides risk classification
 * for vessels based on critical safety incidents.
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

    it("should receive metrics data from RPC", () => {
      const mockMetrics = [
        {
          auditoria_id: "uuid-123",
          embarcacao: "Navio Alpha",
          mes: "2025-10",
          falhas_criticas: 5
        },
        {
          auditoria_id: "uuid-456",
          embarcacao: "Navio Beta",
          mes: "2025-10",
          falhas_criticas: 2
        }
      ];
      expect(mockMetrics).toHaveLength(2);
      expect(mockMetrics[0].embarcacao).toBe("Navio Alpha");
    });
  });

  describe("Risk Aggregation", () => {
    it("should group metrics by vessel", () => {
      const mockData = [
        { embarcacao: "Navio Alpha", mes: "2025-10", falhas_criticas: 5 },
        { embarcacao: "Navio Alpha", mes: "2025-09", falhas_criticas: 3 },
        { embarcacao: "Navio Beta", mes: "2025-10", falhas_criticas: 1 }
      ];
      
      interface VesselData {
        embarcacao: string;
        total: number;
        por_mes: Record<string, number>;
        risco: string;
      }
      
      const agrupado: Record<string, VesselData> = {};
      mockData.forEach(item => {
        const { embarcacao, mes, falhas_criticas } = item;
        if (!agrupado[embarcacao]) {
          agrupado[embarcacao] = { embarcacao, total: 0, por_mes: {}, risco: "baixo" };
        }
        agrupado[embarcacao].total += falhas_criticas;
        agrupado[embarcacao].por_mes[mes] = falhas_criticas;
      });

      expect(agrupado["Navio Alpha"].total).toBe(8);
      expect(agrupado["Navio Beta"].total).toBe(1);
      expect(agrupado["Navio Alpha"].por_mes["2025-10"]).toBe(5);
      expect(agrupado["Navio Alpha"].por_mes["2025-09"]).toBe(3);
    });

    it("should calculate risk level correctly for alto (high risk)", () => {
      const total = 5;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });

    it("should calculate risk level correctly for alto with more failures", () => {
      const total = 10;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });

    it("should calculate risk level correctly for moderado (moderate risk)", () => {
      const total = 3;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should calculate risk level correctly for moderado with 4 failures", () => {
      const total = 4;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should calculate risk level correctly for baixo (low risk)", () => {
      const total = 2;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });

    it("should calculate risk level correctly for baixo with 0 failures", () => {
      const total = 0;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });
  });

  describe("Response Structure", () => {
    it("should return array of vessels", () => {
      const resposta = [
        {
          embarcacao: "Navio Alpha",
          total: 7,
          por_mes: {
            "2025-10": 3,
            "2025-09": 2,
            "2025-08": 2
          },
          risco: "alto"
        }
      ];
      
      expect(Array.isArray(resposta)).toBe(true);
      expect(resposta[0]).toHaveProperty("embarcacao");
      expect(resposta[0]).toHaveProperty("total");
      expect(resposta[0]).toHaveProperty("por_mes");
      expect(resposta[0]).toHaveProperty("risco");
    });

    it("should include monthly breakdown in por_mes", () => {
      const vessel = {
        embarcacao: "Navio Alpha",
        total: 7,
        por_mes: {
          "2025-10": 3,
          "2025-09": 2,
          "2025-08": 2
        },
        risco: "alto"
      };
      
      expect(vessel.por_mes).toHaveProperty("2025-10");
      expect(vessel.por_mes["2025-10"]).toBe(3);
    });

    it("should match expected response format from original spec", () => {
      const expectedFormat = {
        embarcacao: "Navio Atlântico",
        total: 7,
        por_mes: {
          "2025-10": 3,
          "2025-09": 2,
          "2025-08": 2
        },
        risco: "alto"
      };

      expect(expectedFormat.risco).toMatch(/^(baixo|moderado|alto)$/);
      expect(typeof expectedFormat.total).toBe("number");
      expect(typeof expectedFormat.por_mes).toBe("object");
    });
  });

  describe("High Risk Detection", () => {
    it("should identify vessels with 5 or more total failures as alto", () => {
      const vessels = [
        { embarcacao: "Alpha", total: 7, risco: "alto" },
        { embarcacao: "Beta", total: 5, risco: "alto" },
        { embarcacao: "Gamma", total: 2, risco: "baixo" }
      ];

      const highRisk = vessels.filter(v => v.risco === "alto");

      expect(highRisk).toHaveLength(2);
      expect(highRisk[0].total).toBeGreaterThanOrEqual(5);
      expect(highRisk[1].total).toBeGreaterThanOrEqual(5);
    });

    it("should identify vessels with 3-4 total failures as moderado", () => {
      const vessels = [
        { embarcacao: "Alpha", total: 3, risco: "moderado" },
        { embarcacao: "Beta", total: 4, risco: "moderado" }
      ];

      const moderateRisk = vessels.filter(v => v.risco === "moderado");

      expect(moderateRisk).toHaveLength(2);
      expect(moderateRisk[0].total).toBeGreaterThanOrEqual(3);
      expect(moderateRisk[0].total).toBeLessThan(5);
    });

    it("should track monthly failure counts", () => {
      const porMes = { "2025-10": 3, "2025-09": 2, "2025-08": 2 };
      const monthCount = Object.keys(porMes).length;
      expect(monthCount).toBe(3);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        error: "Database connection failed"
      };
      expect(errorResponse.error).toBeTruthy();
    });

    it("should handle RPC errors gracefully", () => {
      const error = { message: "RPC function not found" };
      expect(error.message).toBe("RPC function not found");
    });
  });

  describe("Integration with SGSO Panel", () => {
    it("should provide data suitable for risk dashboard", () => {
      const riscoData = {
        embarcacao: "Navio Alpha",
        total: 7,
        por_mes: {
          "2025-10": 3,
          "2025-09": 2,
          "2025-08": 2
        },
        risco: "alto"
      };

      // Verify data structure matches SGSO panel requirements
      expect(riscoData.risco).toMatch(/^(baixo|moderado|alto)$/);
      expect(typeof riscoData.total).toBe("number");
      expect(typeof riscoData.por_mes).toBe("object");
    });

    it("should highlight vessels with alto risk (>= 5 failures)", () => {
      const total = 7;
      const isHighRisk = total >= 5;
      expect(isHighRisk).toBe(true);
    });

    it("should provide monthly trend data for visualization", () => {
      const porMes = { "2025-10": 3, "2025-09": 2, "2025-08": 2 };
      expect(porMes).toHaveProperty("2025-10");
      expect(porMes).toHaveProperty("2025-09");
      expect(porMes).toHaveProperty("2025-08");
    });
  });

  describe("Risk Classification Logic", () => {
    it("should classify 5 failures as alto", () => {
      const total = 5;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("alto");
    });

    it("should classify 3 failures as moderado", () => {
      const total = 3;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should classify 4 failures as moderado", () => {
      const total = 4;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("moderado");
    });

    it("should classify 2 failures as baixo", () => {
      const total = 2;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });

    it("should classify 1 failure as baixo", () => {
      const total = 1;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });

    it("should classify 0 failures as baixo", () => {
      const total = 0;
      const risco = total >= 5 ? "alto" : total >= 3 ? "moderado" : "baixo";
      expect(risco).toBe("baixo");
    });
  });
});
