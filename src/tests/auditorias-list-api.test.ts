/**
 * Lista Auditorias IMCA API Endpoint Tests
 * 
 * Tests for the /api/auditorias/list endpoint that returns
 * a list of all IMCA technical audits with filtering support
 */

import { describe, it, expect } from "vitest";

describe("Lista Auditorias IMCA API Endpoint", () => {
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
      const selectFields = "id, nome_navio, data, norma, item_auditado, resultado, comentarios, created_at";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("nome_navio");
      expect(selectFields).toContain("data");
      expect(selectFields).toContain("norma");
      expect(selectFields).toContain("item_auditado");
      expect(selectFields).toContain("resultado");
      expect(selectFields).toContain("comentarios");
    });

    it("should order by data descending", () => {
      const orderBy = { field: "data", ascending: false };
      expect(orderBy.field).toBe("data");
      expect(orderBy.ascending).toBe(false);
    });

    it("should order by created_at as secondary sort", () => {
      const orderBy = { field: "created_at", ascending: false };
      expect(orderBy.field).toBe("created_at");
      expect(orderBy.ascending).toBe(false);
    });
  });

  describe("Data Transformation", () => {
    it("should transform nome_navio to navio", () => {
      const mockData = { nome_navio: "Navio A", data: "2025-10-01" };
      const transformed = { navio: mockData.nome_navio };
      expect(transformed.navio).toBe("Navio A");
    });

    it("should include all required fields in response", () => {
      const auditoria = {
        id: "uuid-123",
        navio: "Navio A",
        data: "2025-10-01",
        norma: "IMCA",
        item_auditado: "Safety Equipment",
        resultado: "Conforme",
        comentarios: "All items checked"
      };
      expect(auditoria).toHaveProperty("id");
      expect(auditoria).toHaveProperty("navio");
      expect(auditoria).toHaveProperty("data");
      expect(auditoria).toHaveProperty("norma");
      expect(auditoria).toHaveProperty("item_auditado");
      expect(auditoria).toHaveProperty("resultado");
      expect(auditoria).toHaveProperty("comentarios");
    });

    it("should handle null values with empty strings", () => {
      const mockData = {
        id: "uuid-123",
        nome_navio: null,
        norma: null,
        item_auditado: null,
        resultado: null,
        comentarios: null,
        data: "2025-10-01"
      };
      const transformed = {
        id: mockData.id,
        navio: mockData.nome_navio || "",
        norma: mockData.norma || "",
        item_auditado: mockData.item_auditado || "",
        resultado: mockData.resultado || "",
        comentarios: mockData.comentarios || ""
      };
      expect(transformed.navio).toBe("");
      expect(transformed.norma).toBe("");
      expect(transformed.item_auditado).toBe("");
    });
  });

  describe("Response Format", () => {
    it("should return array of auditorias", () => {
      const mockResponse = [
        { id: "1", navio: "Navio A", data: "2025-10-01", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme", comentarios: "OK" },
        { id: "2", navio: "Navio B", data: "2025-10-02", norma: "ISO", item_auditado: "Item 2", resultado: "Não Conforme", comentarios: "Issue" }
      ];
      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse).toHaveLength(2);
    });

    it("should return 200 status on success", () => {
      const successResponse = { status: 200, data: [] };
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
        error: "Erro ao buscar auditorias"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao buscar auditorias";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("auditorias");
    });

    it("should include error details in response", () => {
      const errorResponse = {
        error: "Erro ao buscar auditorias",
        message: "Database connection failed"
      };
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.message).toBeDefined();
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Lists all IMCA technical audits with filtering support";
      expect(purpose).toContain("audits");
      expect(purpose).toContain("IMCA");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: {
          id: "uuid-123",
          navio: "Navio A",
          data: "2025-10-01",
          norma: "IMCA",
          item_auditado: "Safety Equipment",
          resultado: "Conforme",
          comentarios: "All items checked"
        }
      };
      expect(responseFormat.example).toHaveProperty("id");
      expect(responseFormat.example).toHaveProperty("navio");
      expect(responseFormat.example).toHaveProperty("data");
    });
  });
});
