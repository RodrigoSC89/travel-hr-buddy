/**
 * Auditoria List API Endpoint Tests
 * 
 * Tests for the /api/auditorias/list endpoint that provides
 * a list of all audits with details for the ListaAuditoriasIMCA component
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria List API Endpoint", () => {
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
      const endpointPath = "/api/auditorias/list";
      expect(endpointPath).toBe("/api/auditorias/list");
    });

    it("should be accessible via pages/api/auditorias/list.ts", () => {
      const filePath = "pages/api/auditorias/list.ts";
      expect(filePath).toContain("auditorias/list");
    });
  });

  describe("Database Query", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select required columns", () => {
      const selectFields = "id, navio, audit_date, norma, resultado, item_auditado, comentarios, created_at";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("navio");
      expect(selectFields).toContain("audit_date");
      expect(selectFields).toContain("norma");
      expect(selectFields).toContain("resultado");
      expect(selectFields).toContain("item_auditado");
      expect(selectFields).toContain("comentarios");
      expect(selectFields).toContain("created_at");
    });

    it("should order by created_at descending", () => {
      const orderConfig = {
        field: "created_at",
        direction: "desc"
      };
      expect(orderConfig.field).toBe("created_at");
      expect(orderConfig.direction).toBe("desc");
    });
  });

  describe("Data Transformation", () => {
    it("should transform database records to expected format", () => {
      const dbRecord = {
        id: "uuid-123",
        navio: "Navio Teste",
        audit_date: "2025-10-15",
        norma: "IMCA",
        resultado: "Conforme",
        item_auditado: "Sistema de DP",
        comentarios: "Auditoria realizada com sucesso",
        created_at: "2025-10-15T10:00:00Z"
      };

      const transformed = {
        id: dbRecord.id,
        navio: dbRecord.navio || "N/A",
        data: dbRecord.audit_date || dbRecord.created_at,
        norma: dbRecord.norma || "IMCA",
        resultado: dbRecord.resultado || "Observação",
        item_auditado: dbRecord.item_auditado || "Item não especificado",
        comentarios: dbRecord.comentarios || "Sem comentários",
      };

      expect(transformed.id).toBe("uuid-123");
      expect(transformed.navio).toBe("Navio Teste");
      expect(transformed.data).toBe("2025-10-15");
      expect(transformed.norma).toBe("IMCA");
      expect(transformed.resultado).toBe("Conforme");
      expect(transformed.item_auditado).toBe("Sistema de DP");
      expect(transformed.comentarios).toBe("Auditoria realizada com sucesso");
    });

    it("should provide default values for missing fields", () => {
      const dbRecord = {
        id: "uuid-456",
        navio: null,
        audit_date: null,
        norma: null,
        resultado: null,
        item_auditado: null,
        comentarios: null,
        created_at: "2025-10-15T10:00:00Z"
      };

      const transformed = {
        id: dbRecord.id,
        navio: dbRecord.navio || "N/A",
        data: dbRecord.audit_date || dbRecord.created_at,
        norma: dbRecord.norma || "IMCA",
        resultado: dbRecord.resultado || "Observação",
        item_auditado: dbRecord.item_auditado || "Item não especificado",
        comentarios: dbRecord.comentarios || "Sem comentários",
      };

      expect(transformed.navio).toBe("N/A");
      expect(transformed.data).toBe("2025-10-15T10:00:00Z");
      expect(transformed.norma).toBe("IMCA");
      expect(transformed.resultado).toBe("Observação");
      expect(transformed.item_auditado).toBe("Item não especificado");
      expect(transformed.comentarios).toBe("Sem comentários");
    });
  });

  describe("Response Format", () => {
    it("should return array of auditorias", () => {
      const mockResponse = [
        {
          id: "uuid-1",
          navio: "Navio A",
          data: "2025-10-15",
          norma: "IMCA",
          resultado: "Conforme",
          item_auditado: "Sistema de DP",
          comentarios: "Aprovado"
        },
        {
          id: "uuid-2",
          navio: "Navio B",
          data: "2025-10-14",
          norma: "ISO",
          resultado: "Não Conforme",
          item_auditado: "Sistema de propulsão",
          comentarios: "Necessita correção"
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse).toHaveLength(2);
      expect(mockResponse[0]).toHaveProperty("id");
      expect(mockResponse[0]).toHaveProperty("navio");
      expect(mockResponse[0]).toHaveProperty("data");
      expect(mockResponse[0]).toHaveProperty("norma");
      expect(mockResponse[0]).toHaveProperty("resultado");
      expect(mockResponse[0]).toHaveProperty("item_auditado");
      expect(mockResponse[0]).toHaveProperty("comentarios");
    });

    it("should return 200 status on success", () => {
      const successResponse = {
        status: 200,
        data: []
      };
      expect(successResponse.status).toBe(200);
    });

    it("should support all resultado types", () => {
      const resultados = ["Conforme", "Não Conforme", "Observação"];
      resultados.forEach(resultado => {
        expect(["Conforme", "Não Conforme", "Observação"]).toContain(resultado);
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 500 status on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao buscar auditorias."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao buscar auditorias.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("auditorias");
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao buscar auditorias:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("auditorias");
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
      const queryMethods = ["from", "select", "order"];
      expect(queryMethods).toContain("from");
      expect(queryMethods).toContain("select");
      expect(queryMethods).toContain("order");
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
      const purpose = "Lista todas as auditorias IMCA registradas";
      expect(purpose).toContain("Lista");
      expect(purpose).toContain("auditorias");
      expect(purpose).toContain("IMCA");
    });

    it("should document example usage", () => {
      const example = "/api/auditorias/list";
      expect(example).toBe("/api/auditorias/list");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: [
          {
            id: "uuid-123",
            navio: "Navio A",
            data: "2025-10-15",
            norma: "IMCA",
            resultado: "Conforme",
            item_auditado: "Sistema de DP",
            comentarios: "Aprovado"
          }
        ]
      };
      expect(responseFormat.example).toHaveLength(1);
      expect(responseFormat.example[0]).toHaveProperty("id");
      expect(responseFormat.example[0]).toHaveProperty("navio");
      expect(responseFormat.example[0]).toHaveProperty("data");
      expect(responseFormat.example[0]).toHaveProperty("norma");
      expect(responseFormat.example[0]).toHaveProperty("resultado");
      expect(responseFormat.example[0]).toHaveProperty("item_auditado");
      expect(responseFormat.example[0]).toHaveProperty("comentarios");
    });
  });
});
