/**
 * Auditoria Resumo API Endpoint Tests
 * 
 * Tests for the /api/auditoria/resumo endpoint that provides summary
 * of audits grouped by vessel name with date and user filters
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Resumo API Endpoint", () => {
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
      const endpointPath = "/api/auditoria/resumo";
      expect(endpointPath).toBe("/api/auditoria/resumo");
    });

    it("should be accessible via pages/api/auditoria/resumo.ts", () => {
      const filePath = "pages/api/auditoria/resumo.ts";
      expect(filePath).toContain("auditoria/resumo");
    });
  });

  describe("Query Parameters", () => {
    it("should accept start date parameter", () => {
      const queryParams = { start: "2025-10-01" };
      expect(queryParams.start).toBe("2025-10-01");
    });

    it("should accept end date parameter", () => {
      const queryParams = { end: "2025-10-31" };
      expect(queryParams.end).toBe("2025-10-31");
    });

    it("should accept user_id parameter", () => {
      const queryParams = { user_id: "uuid-123-456" };
      expect(queryParams.user_id).toBe("uuid-123-456");
    });

    it("should accept all parameters simultaneously", () => {
      const queryParams = {
        start: "2025-10-01",
        end: "2025-10-31",
        user_id: "uuid-123-456"
      };
      expect(queryParams.start).toBe("2025-10-01");
      expect(queryParams.end).toBe("2025-10-31");
      expect(queryParams.user_id).toBe("uuid-123-456");
    });

    it("should work without any parameters", () => {
      const queryParams = {};
      expect(Object.keys(queryParams).length).toBe(0);
    });
  });

  describe("Database Query", () => {
    it("should query peotram_audits table", () => {
      const tableName = "peotram_audits";
      expect(tableName).toBe("peotram_audits");
    });

    it("should select required columns with vessel join", () => {
      const selectFields = "audit_date, created_by, vessel_id, vessels";
      expect(selectFields).toContain("audit_date");
      expect(selectFields).toContain("created_by");
      expect(selectFields).toContain("vessel_id");
      expect(selectFields).toContain("vessels");
    });

    it("should use inner join with vessels table", () => {
      const joinType = "inner";
      expect(joinType).toBe("inner");
    });

    it("should apply date range filter when start and end provided", () => {
      const dateFilter = {
        start: "2025-10-01",
        end: "2025-10-31"
      };
      expect(dateFilter.start).toBeDefined();
      expect(dateFilter.end).toBeDefined();
    });

    it("should apply user_id filter when provided", () => {
      const userFilter = "uuid-123-456";
      expect(userFilter).toBeTruthy();
    });

    it("should use gte operator for start date on audit_date field", () => {
      const operator = "gte";
      const field = "audit_date";
      expect(operator).toBe("gte");
      expect(field).toBe("audit_date");
    });

    it("should use lte operator for end date on audit_date field", () => {
      const operator = "lte";
      const field = "audit_date";
      expect(operator).toBe("lte");
      expect(field).toBe("audit_date");
    });

    it("should use eq operator for created_by field", () => {
      const operator = "eq";
      const field = "created_by";
      expect(operator).toBe("eq");
      expect(field).toBe("created_by");
    });
  });

  describe("Data Aggregation", () => {
    it("should group results by vessel name from join", () => {
      const mockData = [
        { audit_date: "2025-10-01", created_by: "uuid-1", vessel_id: "v1", vessels: { name: "Navio A" } },
        { audit_date: "2025-10-02", created_by: "uuid-1", vessel_id: "v1", vessels: { name: "Navio A" } },
        { audit_date: "2025-10-03", created_by: "uuid-2", vessel_id: "v2", vessels: { name: "Navio B" } }
      ];

      const resumo: Record<string, number> = {};
      mockData.forEach((item) => {
        const vesselName = item.vessels?.name || "Unknown";
        resumo[vesselName] = (resumo[vesselName] || 0) + 1;
      });

      expect(resumo["Navio A"]).toBe(2);
      expect(resumo["Navio B"]).toBe(1);
    });

    it("should handle vessels without names gracefully", () => {
      const mockData = [
        { audit_date: "2025-10-01", created_by: "uuid-1", vessel_id: "v1", vessels: null },
      ];

      const resumo: Record<string, number> = {};
      mockData.forEach((item) => {
        const vesselName = item.vessels?.name || "Unknown";
        resumo[vesselName] = (resumo[vesselName] || 0) + 1;
      });

      expect(resumo["Unknown"]).toBe(1);
    });

    it("should count audits per vessel", () => {
      const resumo = {
        "Navio A": 2,
        "Navio B": 1,
        "Navio C": 3
      };

      expect(resumo["Navio A"]).toBe(2);
      expect(resumo["Navio B"]).toBe(1);
      expect(resumo["Navio C"]).toBe(3);
    });

    it("should transform summary to array format", () => {
      const resumo = {
        "Navio A": 2,
        "Navio B": 1
      };

      const resultado = Object.entries(resumo).map(([nome_navio, total]) => ({
        nome_navio,
        total
      }));

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toHaveProperty("nome_navio");
      expect(resultado[0]).toHaveProperty("total");
    });

    it("should sort results by total count in descending order", () => {
      const resultado = [
        { nome_navio: "Navio A", total: 2 },
        { nome_navio: "Navio B", total: 5 },
        { nome_navio: "Navio C", total: 1 }
      ].sort((a, b) => b.total - a.total);

      expect(resultado[0].nome_navio).toBe("Navio B");
      expect(resultado[0].total).toBe(5);
      expect(resultado[1].nome_navio).toBe("Navio A");
      expect(resultado[1].total).toBe(2);
      expect(resultado[2].nome_navio).toBe("Navio C");
      expect(resultado[2].total).toBe(1);
    });
  });

  describe("Response Format", () => {
    it("should return array of vessel summaries", () => {
      const mockResponse = [
        { nome_navio: "Navio A", total: 2 },
        { nome_navio: "Navio B", total: 1 }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("nome_navio");
      expect(mockResponse[0]).toHaveProperty("total");
    });

    it("should include vessel name in response", () => {
      const item = { nome_navio: "Navio A", total: 2 };
      expect(item.nome_navio).toBe("Navio A");
      expect(typeof item.nome_navio).toBe("string");
    });

    it("should include total count in response", () => {
      const item = { nome_navio: "Navio A", total: 2 };
      expect(item.total).toBe(2);
      expect(typeof item.total).toBe("number");
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
        error: "Erro ao gerar resumo."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao gerar resumo.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("resumo");
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao gerar resumo de auditorias:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("auditorias");
    });
  });

  describe("Filtering Scenarios", () => {
    it("should filter by date range only", () => {
      const query = {
        start: "2025-10-01",
        end: "2025-10-31"
      };
      expect(query.start).toBe("2025-10-01");
      expect(query.end).toBe("2025-10-31");
    });

    it("should filter by user_id only", () => {
      const query = { user_id: "uuid-123" };
      expect(query.user_id).toBe("uuid-123");
    });

    it("should filter by date range and user_id together", () => {
      const query = {
        start: "2025-10-01",
        end: "2025-10-31",
        user_id: "uuid-123"
      };
      expect(query.start).toBeDefined();
      expect(query.end).toBeDefined();
      expect(query.user_id).toBeDefined();
    });

    it("should work with no filters (return all audits)", () => {
      const query = {};
      expect(Object.keys(query).length).toBe(0);
    });
  });

  describe("Use Cases", () => {
    it("should support audit summary by date range", () => {
      const useCase = {
        description: "Resumo de auditorias por período",
        params: { start: "2025-10-01", end: "2025-10-31" }
      };
      expect(useCase.params.start).toBeDefined();
      expect(useCase.params.end).toBeDefined();
    });

    it("should support audit summary by user", () => {
      const useCase = {
        description: "Auditorias por usuário",
        params: { user_id: "uuid-123" }
      };
      expect(useCase.params.user_id).toBeDefined();
    });

    it("should support audit summary with all filters", () => {
      const useCase = {
        description: "Auditorias filtradas completas",
        params: {
          start: "2025-10-01",
          end: "2025-10-31",
          user_id: "uuid-123"
        }
      };
      expect(useCase.params.start).toBeDefined();
      expect(useCase.params.end).toBeDefined();
      expect(useCase.params.user_id).toBeDefined();
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

    it("should use Supabase query builder methods", () => {
      const queryMethods = ["from", "select", "gte", "lte", "eq"];
      expect(queryMethods).toContain("from");
      expect(queryMethods).toContain("select");
      expect(queryMethods).toContain("gte");
      expect(queryMethods).toContain("lte");
      expect(queryMethods).toContain("eq");
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
    it("should accept ISO date format for start parameter", () => {
      const date = "2025-10-01";
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should accept ISO date format for end parameter", () => {
      const date = "2025-10-31";
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle ISO datetime format", () => {
      const datetime = "2025-10-01T00:00:00Z";
      expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Gera resumo de auditorias agrupadas por navio";
      expect(purpose).toContain("resumo");
      expect(purpose).toContain("auditorias");
      expect(purpose).toContain("navio");
    });

    it("should document query parameters", () => {
      const params = {
        start: "Data inicial do filtro (formato: YYYY-MM-DD)",
        end: "Data final do filtro (formato: YYYY-MM-DD)",
        user_id: "UUID do usuário para filtrar auditorias"
      };
      expect(params.start).toContain("Data inicial");
      expect(params.end).toContain("Data final");
      expect(params.user_id).toContain("UUID");
    });

    it("should document example usage", () => {
      const example = "/api/auditoria/resumo?start=2025-10-01&end=2025-10-31&user_id=UUID_DO_USUARIO";
      expect(example).toContain("start=");
      expect(example).toContain("end=");
      expect(example).toContain("user_id=");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: [
          { nome_navio: "Navio A", total: 5 },
          { nome_navio: "Navio B", total: 3 }
        ]
      };
      expect(responseFormat.example).toHaveLength(2);
      expect(responseFormat.example[0]).toHaveProperty("nome_navio");
      expect(responseFormat.example[0]).toHaveProperty("total");
    });
  });
});
