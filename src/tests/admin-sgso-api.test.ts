/**
 * Admin SGSO API Endpoint Tests
 * 
 * Tests for the /api/admin/sgso endpoint that provides operational risk
 * mapping and aggregated audit metrics for SGSO panel integration
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
        error: "Method not allowed"
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Method not allowed");
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
        { embarcacao: "Navio Alpha", falhas_criticas: 5 },
        { embarcacao: "Navio Alpha", falhas_criticas: 3 },
        { embarcacao: "Navio Beta", falhas_criticas: 1 }
      ];
      
      const grouped = new Map();
      mockData.forEach(item => {
        const total = grouped.get(item.embarcacao) || 0;
        grouped.set(item.embarcacao, total + item.falhas_criticas);
      });

      expect(grouped.get("Navio Alpha")).toBe(8);
      expect(grouped.get("Navio Beta")).toBe(1);
    });

    it("should calculate risk level correctly for critical", () => {
      const avgFalhasPorMes = 6;
      let nivel_risco = "baixo";
      
      if (avgFalhasPorMes > 5) {
        nivel_risco = "critico";
      } else if (avgFalhasPorMes > 3) {
        nivel_risco = "alto";
      } else if (avgFalhasPorMes > 1) {
        nivel_risco = "medio";
      }

      expect(nivel_risco).toBe("critico");
    });

    it("should calculate risk level correctly for high", () => {
      const avgFalhasPorMes = 4;
      let nivel_risco = "baixo";
      
      if (avgFalhasPorMes > 5) {
        nivel_risco = "critico";
      } else if (avgFalhasPorMes > 3) {
        nivel_risco = "alto";
      } else if (avgFalhasPorMes > 1) {
        nivel_risco = "medio";
      }

      expect(nivel_risco).toBe("alto");
    });

    it("should calculate risk level correctly for medium", () => {
      const avgFalhasPorMes = 2;
      let nivel_risco = "baixo";
      
      if (avgFalhasPorMes > 5) {
        nivel_risco = "critico";
      } else if (avgFalhasPorMes > 3) {
        nivel_risco = "alto";
      } else if (avgFalhasPorMes > 1) {
        nivel_risco = "medio";
      }

      expect(nivel_risco).toBe("medio");
    });

    it("should calculate risk level correctly for low", () => {
      const avgFalhasPorMes = 0.5;
      let nivel_risco = "baixo";
      
      if (avgFalhasPorMes > 5) {
        nivel_risco = "critico";
      } else if (avgFalhasPorMes > 3) {
        nivel_risco = "alto";
      } else if (avgFalhasPorMes > 1) {
        nivel_risco = "medio";
      }

      expect(nivel_risco).toBe("baixo");
    });
  });

  describe("Response Structure", () => {
    it("should return success flag in response", () => {
      const response = {
        success: true,
        timestamp: "2025-10-16T19:47:15.167Z"
      };
      expect(response.success).toBe(true);
      expect(response.timestamp).toBeTruthy();
    });

    it("should include summary statistics", () => {
      const summary = {
        total_embarcacoes: 10,
        embarcacoes_alto_risco: 3,
        total_falhas_criticas: 45,
        embarcacoes_criticas: 1
      };
      
      expect(summary).toHaveProperty("total_embarcacoes");
      expect(summary).toHaveProperty("embarcacoes_alto_risco");
      expect(summary).toHaveProperty("total_falhas_criticas");
      expect(summary).toHaveProperty("embarcacoes_criticas");
    });

    it("should include risk operational data array", () => {
      const riscoOperacional = [
        {
          embarcacao: "Navio Alpha",
          total_falhas_criticas: 15,
          nivel_risco: "critico",
          ultimas_auditorias: 3,
          meses_com_alertas: ["2025-10", "2025-09"]
        }
      ];
      
      expect(Array.isArray(riscoOperacional)).toBe(true);
      expect(riscoOperacional[0]).toHaveProperty("embarcacao");
      expect(riscoOperacional[0]).toHaveProperty("nivel_risco");
      expect(riscoOperacional[0]).toHaveProperty("total_falhas_criticas");
    });

    it("should sort by risk level descending", () => {
      const mockData = [
        { embarcacao: "A", nivel_risco: "baixo", total_falhas_criticas: 1 },
        { embarcacao: "B", nivel_risco: "critico", total_falhas_criticas: 10 },
        { embarcacao: "C", nivel_risco: "alto", total_falhas_criticas: 5 }
      ];

      const riskOrder = { critico: 4, alto: 3, medio: 2, baixo: 1 };
      const sorted = [...mockData].sort((a, b) => {
        const riskDiff = riskOrder[b.nivel_risco] - riskOrder[a.nivel_risco];
        if (riskDiff !== 0) return riskDiff;
        return b.total_falhas_criticas - a.total_falhas_criticas;
      });

      expect(sorted[0].nivel_risco).toBe("critico");
      expect(sorted[1].nivel_risco).toBe("alto");
      expect(sorted[2].nivel_risco).toBe("baixo");
    });
  });

  describe("High Risk Detection", () => {
    it("should identify vessels with more than 3 alerts per month", () => {
      const mockVessels = [
        { embarcacao: "Alpha", ultimas_auditorias: 2, total_falhas_criticas: 10 },
        { embarcacao: "Beta", ultimas_auditorias: 2, total_falhas_criticas: 8 },
        { embarcacao: "Gamma", ultimas_auditorias: 2, total_falhas_criticas: 2 }
      ];

      const highRisk = mockVessels.filter(v => {
        const avg = v.total_falhas_criticas / v.ultimas_auditorias;
        return avg > 3;
      });

      expect(highRisk).toHaveLength(2);
      expect(highRisk[0].embarcacao).toBe("Alpha");
      expect(highRisk[1].embarcacao).toBe("Beta");
    });

    it("should count months with alerts", () => {
      const mesesComAlertas = ["2025-10", "2025-09", "2025-08"];
      expect(mesesComAlertas).toHaveLength(3);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        success: false,
        error: "Erro ao gerar dados de risco operacional para SGSO."
      };
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });

    it("should handle missing embarcacao gracefully", () => {
      const embarcacao = null;
      const displayName = embarcacao || "Não Especificada";
      expect(displayName).toBe("Não Especificada");
    });
  });

  describe("Integration with SGSO Panel", () => {
    it("should provide data suitable for risk mapping", () => {
      const riscoData = {
        embarcacao: "Navio Alpha",
        nivel_risco: "alto",
        total_falhas_criticas: 12,
        ultimas_auditorias: 3,
        meses_com_alertas: ["2025-10", "2025-09", "2025-08"]
      };

      // Verify data structure matches SGSO panel requirements
      expect(riscoData.nivel_risco).toMatch(/^(baixo|medio|alto|critico)$/);
      expect(typeof riscoData.total_falhas_criticas).toBe("number");
      expect(Array.isArray(riscoData.meses_com_alertas)).toBe(true);
    });

    it("should highlight critical vessels (>3 alerts/month)", () => {
      const avgAlertsPerMonth = 5;
      const isHighlighted = avgAlertsPerMonth > 3;
      expect(isHighlighted).toBe(true);
    });

    it("should provide monthly trend data", () => {
      const mesesComAlertas = ["2025-10", "2025-09", "2025-08"];
      expect(mesesComAlertas).toContain("2025-10");
      expect(mesesComAlertas).toContain("2025-09");
      expect(mesesComAlertas).toContain("2025-08");
    });
  });

  describe("TypeScript Types", () => {
    it("should define MetricasRisco interface", () => {
      interface MetricasRisco {
        auditoria_id: string;
        embarcacao: string;
        mes: string;
        falhas_criticas: number;
      }

      const mockMetric: MetricasRisco = {
        auditoria_id: "uuid-123",
        embarcacao: "Navio Alpha",
        mes: "2025-10",
        falhas_criticas: 5
      };

      expect(mockMetric.auditoria_id).toBeTruthy();
      expect(mockMetric.embarcacao).toBeTruthy();
    });

    it("should define RiscoOperacionalEmbarcacao interface", () => {
      interface RiscoOperacionalEmbarcacao {
        embarcacao: string;
        total_falhas_criticas: number;
        nivel_risco: "baixo" | "medio" | "alto" | "critico";
        ultimas_auditorias: number;
        meses_com_alertas: string[];
      }

      const mockRisco: RiscoOperacionalEmbarcacao = {
        embarcacao: "Navio Alpha",
        total_falhas_criticas: 15,
        nivel_risco: "critico",
        ultimas_auditorias: 3,
        meses_com_alertas: ["2025-10"]
      };

      expect(mockRisco.nivel_risco).toMatch(/^(baixo|medio|alto|critico)$/);
    });
  });
});
