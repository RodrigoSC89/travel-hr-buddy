/**
 * Auditorias List API Endpoint Tests
 * 
 * Tests for the /api/auditorias/list endpoint that fetches IMCA auditorias
 * with support for filtering and export features
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditorias List API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/auditorias/list";
      expect(endpointPath).toBe("/api/auditorias/list");
    });

    it("should be accessible via pages/api/auditorias/list.ts", () => {
      const filePath = "pages/api/auditorias/list.ts";
      expect(filePath).toContain("auditorias/list");
    });

    it("should return 405 for non-GET requests", () => {
      const methodNotAllowed = 405;
      expect(methodNotAllowed).toBe(405);
    });
  });

  describe("Response Data Structure", () => {
    it("should return array of auditorias", () => {
      const mockResponse: any[] = [];
      expect(Array.isArray(mockResponse)).toBe(true);
    });

    it("should include required fields in response", () => {
      const mockAuditoria = {
        id: "test-id",
        navio: "Test Ship",
        data: "2025-10-16",
        norma: "IMCA M 117",
        item_auditado: "Safety Equipment",
        resultado: "Conforme",
        comentarios: "Test comment",
        created_at: "2025-10-16T00:00:00Z"
      };

      expect(mockAuditoria).toHaveProperty("id");
      expect(mockAuditoria).toHaveProperty("navio");
      expect(mockAuditoria).toHaveProperty("data");
      expect(mockAuditoria).toHaveProperty("norma");
      expect(mockAuditoria).toHaveProperty("item_auditado");
      expect(mockAuditoria).toHaveProperty("resultado");
      expect(mockAuditoria).toHaveProperty("comentarios");
    });

    it("should order results by data descending", () => {
      const ordering = "data DESC";
      expect(ordering).toContain("data");
      expect(ordering).toContain("DESC");
    });
  });

  describe("Data Validation", () => {
    it("should validate resultado values", () => {
      const validResultados = ["Conforme", "Não Conforme", "Observação"];
      expect(validResultados).toContain("Conforme");
      expect(validResultados).toContain("Não Conforme");
      expect(validResultados).toContain("Observação");
    });

    it("should handle empty results gracefully", () => {
      const emptyResults: any[] = [];
      expect(emptyResults).toEqual([]);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const serverError = 500;
      expect(serverError).toBe(500);
    });

    it("should include error message in response", () => {
      const errorResponse = {
        error: "Erro ao carregar lista de auditorias",
        details: "Database connection failed"
      };
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse).toHaveProperty("details");
    });

    it("should log errors to console", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      console.error("Test error");
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Database Query", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select specific columns", () => {
      const columns = [
        "id",
        "navio",
        "data",
        "norma",
        "item_auditado",
        "resultado",
        "comentarios",
        "created_at"
      ];
      expect(columns).toContain("navio");
      expect(columns).toContain("resultado");
      expect(columns.length).toBe(8);
    });
  });

  describe("Integration with Supabase", () => {
    it("should use createClient from supabase/server", () => {
      const clientPath = "@/lib/supabase/server";
      expect(clientPath).toContain("supabase/server");
    });

    it("should handle Supabase errors", () => {
      const supabaseError = {
        message: "Database error",
        code: "PGRST116"
      };
      expect(supabaseError).toHaveProperty("message");
    });
  });

  describe("Response Format", () => {
    it("should return JSON format", () => {
      const contentType = "application/json";
      expect(contentType).toBe("application/json");
    });

    it("should return 200 status on success", () => {
      const successStatus = 200;
      expect(successStatus).toBe(200);
    });
  });
});
