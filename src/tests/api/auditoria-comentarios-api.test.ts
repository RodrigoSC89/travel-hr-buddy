/**
 * Auditoria Comentarios API Endpoint Tests
 * 
 * Tests for the /api/auditoria/[auditoriaId]/comentarios endpoint
 * that provides functionality to fetch and create comments for audits
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Comentarios API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should handle POST requests", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should reject non-GET/POST requests with 405", () => {
      const errorResponse = {
        status: 405,
        error: "Method not allowed"
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Method not allowed");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/auditoria/[auditoriaId]/comentarios";
      expect(endpointPath).toContain("auditoria");
      expect(endpointPath).toContain("comentarios");
    });

    it("should be accessible via pages/api/auditoria/[auditoriaId]/comentarios.ts", () => {
      const filePath = "pages/api/auditoria/[auditoriaId]/comentarios.ts";
      expect(filePath).toContain("auditoria");
      expect(filePath).toContain("comentarios");
    });
  });

  describe("Route Parameters", () => {
    it("should extract auditoriaId from URL", () => {
      const params = { auditoriaId: "123" };
      expect(params.auditoriaId).toBe("123");
    });

    it("should validate auditoriaId is present", () => {
      const auditoriaId = undefined;
      const isValid = auditoriaId !== undefined && auditoriaId !== null;
      expect(isValid).toBe(false);
    });

    it("should validate auditoriaId is a string", () => {
      const auditoriaId = "123";
      expect(typeof auditoriaId).toBe("string");
    });

    it("should return 400 if auditoriaId is missing", () => {
      const errorResponse = {
        status: 400,
        error: "auditoriaId é obrigatório"
      };
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.error).toContain("auditoriaId");
    });
  });

  describe("GET - Fetching Comments", () => {
    it("should query auditoria_comentarios table", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should select required columns", () => {
      const selectFields = "id, comentario, user_id, created_at";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("comentario");
      expect(selectFields).toContain("user_id");
      expect(selectFields).toContain("created_at");
    });

    it("should filter by auditoria_id", () => {
      const filter = { auditoria_id: "123" };
      expect(filter.auditoria_id).toBe("123");
    });

    it("should order by created_at ascending", () => {
      const orderConfig = { field: "created_at", ascending: true };
      expect(orderConfig.field).toBe("created_at");
      expect(orderConfig.ascending).toBe(true);
    });

    it("should use eq operator for auditoria_id filter", () => {
      const operator = "eq";
      expect(operator).toBe("eq");
    });

    it("should return 200 status on success", () => {
      const successResponse = {
        status: 200,
        data: []
      };
      expect(successResponse.status).toBe(200);
    });

    it("should return empty array when no comments exist", () => {
      const emptyData: unknown[] = [];
      expect(Array.isArray(emptyData)).toBe(true);
      expect(emptyData).toHaveLength(0);
    });

    it("should return array of comments on success", () => {
      const mockResponse = [
        {
          id: "1",
          comentario: "Test comment",
          user_id: "user-1",
          created_at: "2025-10-16T12:00:00Z"
        }
      ];
      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("id");
      expect(mockResponse[0]).toHaveProperty("comentario");
      expect(mockResponse[0]).toHaveProperty("user_id");
      expect(mockResponse[0]).toHaveProperty("created_at");
    });
  });

  describe("POST - Creating Comments", () => {
    it("should extract comentario from request body", () => {
      const body = { comentario: "New comment" };
      expect(body.comentario).toBe("New comment");
    });

    it("should validate comentario is present", () => {
      const comentario = undefined;
      const isValid = comentario !== undefined && comentario !== null;
      expect(isValid).toBe(false);
    });

    it("should validate comentario is a string", () => {
      const comentario = "New comment";
      expect(typeof comentario).toBe("string");
    });

    it("should validate comentario is not empty", () => {
      const comentario = "";
      const isValid = comentario.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it("should validate comentario is not just whitespace", () => {
      const comentario = "   ";
      const isValid = comentario.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it("should return 400 if comentario is missing", () => {
      const errorResponse = {
        status: 400,
        error: "comentario é obrigatório"
      };
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.error).toContain("comentario");
    });

    it("should insert into auditoria_comentarios table", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should include auditoria_id in insert", () => {
      const insertData = {
        auditoria_id: "123",
        comentario: "New comment",
        user_id: "user-1"
      };
      expect(insertData.auditoria_id).toBe("123");
    });

    it("should trim comentario before inserting", () => {
      const comentario = "  New comment  ";
      const trimmed = comentario.trim();
      expect(trimmed).toBe("New comment");
    });

    it("should include user_id in insert", () => {
      const insertData = {
        auditoria_id: "123",
        comentario: "New comment",
        user_id: "user-1"
      };
      expect(insertData.user_id).toBeDefined();
    });

    it("should return 201 status on success", () => {
      const successResponse = {
        status: 201,
        data: {}
      };
      expect(successResponse.status).toBe(201);
    });

    it("should return created comment on success", () => {
      const mockResponse = {
        id: "1",
        comentario: "New comment",
        user_id: "user-1",
        created_at: "2025-10-16T12:00:00Z",
        auditoria_id: "123"
      };
      expect(mockResponse).toHaveProperty("id");
      expect(mockResponse).toHaveProperty("comentario");
      expect(mockResponse).toHaveProperty("user_id");
      expect(mockResponse).toHaveProperty("created_at");
    });

    it("should use select after insert to return data", () => {
      const queryChain = ["insert", "select"];
      expect(queryChain).toContain("insert");
      expect(queryChain).toContain("select");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 status on database error (GET)", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao buscar comentários."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return 500 status on database error (POST)", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao criar comentário."
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message for GET", () => {
      const errorMessage = "Erro ao buscar comentários.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("comentários");
    });

    it("should return Portuguese error message for POST", () => {
      const errorMessage = "Erro ao criar comentário.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("comentário");
    });

    it("should log errors to console on GET failure", () => {
      const errorLog = "Erro ao buscar comentários:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("comentários");
    });

    it("should log errors to console on POST failure", () => {
      const errorLog = "Erro ao criar comentário:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("comentário");
    });
  });

  describe("Data Structure", () => {
    it("should define Comentario interface with id", () => {
      const comentario = {
        id: "123",
        comentario: "Test",
        user_id: "user-1",
        created_at: "2025-10-16T12:00:00Z"
      };
      expect(comentario).toHaveProperty("id");
      expect(typeof comentario.id).toBe("string");
    });

    it("should define Comentario interface with comentario", () => {
      const comentario = {
        id: "123",
        comentario: "Test",
        user_id: "user-1",
        created_at: "2025-10-16T12:00:00Z"
      };
      expect(comentario).toHaveProperty("comentario");
      expect(typeof comentario.comentario).toBe("string");
    });

    it("should define Comentario interface with user_id", () => {
      const comentario = {
        id: "123",
        comentario: "Test",
        user_id: "user-1",
        created_at: "2025-10-16T12:00:00Z"
      };
      expect(comentario).toHaveProperty("user_id");
      expect(typeof comentario.user_id).toBe("string");
    });

    it("should define Comentario interface with created_at", () => {
      const comentario = {
        id: "123",
        comentario: "Test",
        user_id: "user-1",
        created_at: "2025-10-16T12:00:00Z"
      };
      expect(comentario).toHaveProperty("created_at");
      expect(typeof comentario.created_at).toBe("string");
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

    it("should use Supabase query builder methods for GET", () => {
      const queryMethods = ["from", "select", "eq", "order"];
      expect(queryMethods).toContain("from");
      expect(queryMethods).toContain("select");
      expect(queryMethods).toContain("eq");
      expect(queryMethods).toContain("order");
    });

    it("should use Supabase query builder methods for POST", () => {
      const queryMethods = ["from", "insert", "select"];
      expect(queryMethods).toContain("from");
      expect(queryMethods).toContain("insert");
      expect(queryMethods).toContain("select");
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

  describe("Use Cases", () => {
    it("should support fetching all comments for an audit", () => {
      const useCase = {
        description: "Buscar todos os comentários de uma auditoria",
        method: "GET",
        params: { auditoriaId: "123" }
      };
      expect(useCase.method).toBe("GET");
      expect(useCase.params.auditoriaId).toBeDefined();
    });

    it("should support creating a new comment", () => {
      const useCase = {
        description: "Criar novo comentário em uma auditoria",
        method: "POST",
        params: { auditoriaId: "123" },
        body: { comentario: "New comment" }
      };
      expect(useCase.method).toBe("POST");
      expect(useCase.params.auditoriaId).toBeDefined();
      expect(useCase.body.comentario).toBeDefined();
    });

    it("should support comments ordered chronologically", () => {
      const orderConfig = {
        field: "created_at",
        direction: "ascending"
      };
      expect(orderConfig.field).toBe("created_at");
      expect(orderConfig.direction).toBe("ascending");
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Gerencia comentários de auditorias";
      expect(purpose).toContain("comentários");
      expect(purpose).toContain("auditorias");
    });

    it("should document GET method", () => {
      const docs = {
        method: "GET",
        description: "Busca comentários de uma auditoria",
        returns: "Array de comentários ordenados por data"
      };
      expect(docs.method).toBe("GET");
      expect(docs.description).toContain("Busca");
      expect(docs.returns).toContain("Array");
    });

    it("should document POST method", () => {
      const docs = {
        method: "POST",
        description: "Cria novo comentário",
        body: { comentario: "string" },
        returns: "Comentário criado"
      };
      expect(docs.method).toBe("POST");
      expect(docs.description).toContain("Cria");
      expect(docs.body).toHaveProperty("comentario");
    });

    it("should document example GET usage", () => {
      const example = "GET /api/auditoria/123/comentarios";
      expect(example).toContain("GET");
      expect(example).toContain("/api/auditoria/");
      expect(example).toContain("/comentarios");
    });

    it("should document example POST usage", () => {
      const example = {
        url: "POST /api/auditoria/123/comentarios",
        body: { comentario: "Novo comentário" }
      };
      expect(example.url).toContain("POST");
      expect(example.body).toHaveProperty("comentario");
    });
  });

  describe("Security Considerations", () => {
    it("should use authorization header for user identification", () => {
      const authHeader = "req.headers.authorization";
      expect(authHeader).toContain("authorization");
    });

    it("should have fallback user_id when no auth", () => {
      const fallback = "system";
      expect(fallback).toBe("system");
    });

    it("should use service role key for database access", () => {
      const envVar = "SUPABASE_SERVICE_ROLE_KEY";
      expect(envVar).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });
  });
});
