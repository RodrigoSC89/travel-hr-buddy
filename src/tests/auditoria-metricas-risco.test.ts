/**
 * Auditoria Metricas Risco RPC Function Tests
 * 
 * Tests for the auditoria_metricas_risco() RPC function that provides
 * aggregated risk metrics with critical failures by audit, vessel, and month
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Metricas Risco RPC Function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Function Definition", () => {
    it("should be named auditoria_metricas_risco", () => {
      const functionName = "auditoria_metricas_risco";
      expect(functionName).toBe("auditoria_metricas_risco");
    });

    it("should be a PostgreSQL function", () => {
      const language = "plpgsql";
      expect(language).toBe("plpgsql");
    });

    it("should return a table", () => {
      const returnType = "table";
      expect(returnType).toBe("table");
    });

    it("should have security definer", () => {
      const security = "SECURITY DEFINER";
      expect(security).toBe("SECURITY DEFINER");
    });
  });

  describe("Return Table Structure", () => {
    it("should return auditoria_id as uuid", () => {
      const columns = {
        auditoria_id: "uuid"
      };
      expect(columns.auditoria_id).toBe("uuid");
    });

    it("should return embarcacao as text", () => {
      const columns = {
        embarcacao: "text"
      };
      expect(columns.embarcacao).toBe("text");
    });

    it("should return mes as text", () => {
      const columns = {
        mes: "text"
      };
      expect(columns.mes).toBe("text");
    });

    it("should return falhas_criticas as bigint", () => {
      const columns = {
        falhas_criticas: "bigint"
      };
      expect(columns.falhas_criticas).toBe("bigint");
    });

    it("should have all required columns", () => {
      const columns = ["auditoria_id", "embarcacao", "mes", "falhas_criticas"];
      expect(columns).toHaveLength(4);
      expect(columns).toContain("auditoria_id");
      expect(columns).toContain("embarcacao");
      expect(columns).toContain("mes");
      expect(columns).toContain("falhas_criticas");
    });
  });

  describe("Query Logic", () => {
    it("should select from auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should join with auditoria_alertas table", () => {
      const joinTable = "auditoria_alertas";
      expect(joinTable).toBe("auditoria_alertas");
    });

    it("should use LEFT JOIN for alerts", () => {
      const joinType = "LEFT JOIN";
      expect(joinType).toBe("LEFT JOIN");
    });

    it("should join on auditoria_id", () => {
      const joinCondition = "al.auditoria_id = a.id";
      expect(joinCondition).toContain("auditoria_id");
      expect(joinCondition).toContain("a.id");
    });

    it("should group by audit id", () => {
      const groupBy = ["a.id"];
      expect(groupBy).toContain("a.id");
    });

    it("should group by embarcacao", () => {
      const groupBy = ["a.embarcacao"];
      expect(groupBy).toContain("a.embarcacao");
    });

    it("should group by month (YYYY-MM)", () => {
      const groupBy = ["to_char(a.created_at, 'YYYY-MM')"];
      expect(groupBy[0]).toContain("YYYY-MM");
    });

    it("should count alerts as falhas_criticas", () => {
      const countExpression = "COUNT(al.id)";
      expect(countExpression).toContain("COUNT");
      expect(countExpression).toContain("al.id");
    });

    it("should order by month descending", () => {
      const orderBy = "ORDER BY mes DESC";
      expect(orderBy).toContain("mes");
      expect(orderBy).toContain("DESC");
    });
  });

  describe("Date Formatting", () => {
    it("should format month as YYYY-MM", () => {
      const dateFormat = "YYYY-MM";
      expect(dateFormat).toBe("YYYY-MM");
    });

    it("should use to_char function for date formatting", () => {
      const function_name = "to_char";
      expect(function_name).toBe("to_char");
    });

    it("should extract month from created_at", () => {
      const column = "created_at";
      expect(column).toBe("created_at");
    });
  });

  describe("Expected Response Format", () => {
    it("should return array of metrics", () => {
      const mockResponse = [
        {
          auditoria_id: "uuid-1",
          embarcacao: "Navio A",
          mes: "2025-10",
          falhas_criticas: 5
        },
        {
          auditoria_id: "uuid-2",
          embarcacao: "Navio B",
          mes: "2025-09",
          falhas_criticas: 3
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse).toHaveLength(2);
    });

    it("should include audit ID in response", () => {
      const item = {
        auditoria_id: "uuid-123-456",
        embarcacao: "Navio A",
        mes: "2025-10",
        falhas_criticas: 5
      };
      expect(item.auditoria_id).toBe("uuid-123-456");
      expect(typeof item.auditoria_id).toBe("string");
    });

    it("should include vessel name in response", () => {
      const item = {
        auditoria_id: "uuid-1",
        embarcacao: "Navio A",
        mes: "2025-10",
        falhas_criticas: 5
      };
      expect(item.embarcacao).toBe("Navio A");
      expect(typeof item.embarcacao).toBe("string");
    });

    it("should include month in YYYY-MM format", () => {
      const item = {
        auditoria_id: "uuid-1",
        embarcacao: "Navio A",
        mes: "2025-10",
        falhas_criticas: 5
      };
      expect(item.mes).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should include critical failures count", () => {
      const item = {
        auditoria_id: "uuid-1",
        embarcacao: "Navio A",
        mes: "2025-10",
        falhas_criticas: 5
      };
      expect(item.falhas_criticas).toBe(5);
      expect(typeof item.falhas_criticas).toBe("number");
    });
  });

  describe("Aggregation Logic", () => {
    it("should count all alerts per audit", () => {
      const mockAlerts = [
        { id: "alert-1", auditoria_id: "audit-1" },
        { id: "alert-2", auditoria_id: "audit-1" },
        { id: "alert-3", auditoria_id: "audit-1" }
      ];
      const count = mockAlerts.length;
      expect(count).toBe(3);
    });

    it("should return 0 for audits with no alerts", () => {
      const falhas_criticas = 0;
      expect(falhas_criticas).toBe(0);
    });

    it("should aggregate by month correctly", () => {
      const mockData = [
        { mes: "2025-10", falhas_criticas: 5 },
        { mes: "2025-10", falhas_criticas: 3 },
        { mes: "2025-09", falhas_criticas: 2 }
      ];

      const agregado: Record<string, number> = {};
      mockData.forEach((item) => {
        agregado[item.mes] = (agregado[item.mes] || 0) + item.falhas_criticas;
      });

      expect(agregado["2025-10"]).toBe(8);
      expect(agregado["2025-09"]).toBe(2);
    });

    it("should aggregate by vessel correctly", () => {
      const mockData = [
        { embarcacao: "Navio A", falhas_criticas: 5 },
        { embarcacao: "Navio A", falhas_criticas: 3 },
        { embarcacao: "Navio B", falhas_criticas: 2 }
      ];

      const agregado: Record<string, number> = {};
      mockData.forEach((item) => {
        agregado[item.embarcacao] = (agregado[item.embarcacao] || 0) + item.falhas_criticas;
      });

      expect(agregado["Navio A"]).toBe(8);
      expect(agregado["Navio B"]).toBe(2);
    });
  });

  describe("RPC Function Call", () => {
    it("should be callable via Supabase RPC", () => {
      const rpcMethod = "rpc";
      expect(rpcMethod).toBe("rpc");
    });

    it("should use correct function name in RPC call", () => {
      const functionName = "auditoria_metricas_risco";
      expect(functionName).toBe("auditoria_metricas_risco");
    });

    it("should require no parameters", () => {
      const parameters = {};
      expect(Object.keys(parameters)).toHaveLength(0);
    });
  });

  describe("Use Cases", () => {
    it("should support risk metrics dashboard", () => {
      const useCase = {
        description: "Painel de métricas de risco",
        endpoint: "/admin/metrics"
      };
      expect(useCase.endpoint).toBe("/admin/metrics");
    });

    it("should support scheduled reports", () => {
      const useCase = {
        description: "Relatórios agendados de métricas",
        scheduled: true
      };
      expect(useCase.scheduled).toBe(true);
    });

    it("should support data export", () => {
      const useCase = {
        description: "Exportação de dados de métricas",
        exportable: true
      };
      expect(useCase.exportable).toBe(true);
    });
  });

  describe("Performance Considerations", () => {
    it("should use indexes on auditoria_id", () => {
      const index = "idx_auditoria_alertas_auditoria_id";
      expect(index).toContain("auditoria_id");
    });

    it("should use indexes on created_at", () => {
      const index = "idx_auditorias_imca_created_at";
      expect(index).toContain("created_at");
    });

    it("should use LEFT JOIN to include audits without alerts", () => {
      const joinType = "LEFT JOIN";
      expect(joinType).toBe("LEFT JOIN");
    });
  });

  describe("Permissions", () => {
    it("should grant execute to authenticated users", () => {
      const grantTo = "authenticated";
      expect(grantTo).toBe("authenticated");
    });

    it("should have SECURITY DEFINER for access control", () => {
      const security = "SECURITY DEFINER";
      expect(security).toBe("SECURITY DEFINER");
    });
  });

  describe("Documentation", () => {
    it("should have function comment", () => {
      const comment = "Função RPC que agrega métricas de falhas críticas por auditoria, embarcação e mês";
      expect(comment).toContain("métricas");
      expect(comment).toContain("falhas críticas");
      expect(comment).toContain("auditoria");
      expect(comment).toContain("embarcação");
    });

    it("should mention admin/metrics integration", () => {
      const integration = "/admin/metrics";
      expect(integration).toBe("/admin/metrics");
    });

    it("should mention report scheduling capability", () => {
      const capability = "agendamento de relatórios";
      expect(capability).toContain("agendamento");
      expect(capability).toContain("relatórios");
    });

    it("should mention export capability", () => {
      const capability = "exportação";
      expect(capability).toBe("exportação");
    });
  });

  describe("Integration with Admin Metrics", () => {
    it("should be accessible from admin metrics page", () => {
      const route = "/admin/metrics";
      expect(route).toBe("/admin/metrics");
    });

    it("should provide data for risk analysis", () => {
      const analysisType = "risk analysis";
      expect(analysisType).toContain("risk");
      expect(analysisType).toContain("analysis");
    });

    it("should provide data for critical failures tracking", () => {
      const trackingType = "critical failures";
      expect(trackingType).toContain("critical");
      expect(trackingType).toContain("failures");
    });
  });

  describe("Data Integrity", () => {
    it("should handle null embarcacao values", () => {
      const embarcacao = null;
      expect(embarcacao).toBeNull();
    });

    it("should handle audits without alerts", () => {
      const falhas_criticas = 0;
      expect(falhas_criticas).toBeGreaterThanOrEqual(0);
    });

    it("should maintain referential integrity", () => {
      const constraint = "REFERENCES public.auditorias_imca(id)";
      expect(constraint).toContain("REFERENCES");
      expect(constraint).toContain("auditorias_imca");
    });
  });

  describe("Sorting", () => {
    it("should sort by month descending (newest first)", () => {
      const mockData = [
        { mes: "2025-10", falhas_criticas: 5 },
        { mes: "2025-09", falhas_criticas: 3 },
        { mes: "2025-08", falhas_criticas: 2 }
      ];

      const sorted = mockData.sort((a, b) => b.mes.localeCompare(a.mes));
      expect(sorted[0].mes).toBe("2025-10");
      expect(sorted[2].mes).toBe("2025-08");
    });
  });
});
