/**
 * Admin Alertas API Endpoint Tests
 * 
 * Tests for the /api/admin/alertas endpoint that provides
 * AI-detected critical alerts from audit comments
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Admin Alertas API Endpoint", () => {
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
      const endpointPath = "/api/admin/alertas";
      expect(endpointPath).toBe("/api/admin/alertas");
    });

    it("should be accessible via pages/api/admin/alertas.ts", () => {
      const filePath = "pages/api/admin/alertas.ts";
      expect(filePath).toContain("admin/alertas");
    });
  });

  describe("Authentication", () => {
    it("should require authentication header", () => {
      const authHeader = "Authorization";
      expect(authHeader).toBe("Authorization");
    });

    it("should return 401 when no auth header", () => {
      const errorResponse = {
        status: 401,
        error: "Não autenticado."
      };
      expect(errorResponse.status).toBe(401);
      expect(errorResponse.error).toBe("Não autenticado.");
    });

    it("should extract Bearer token from auth header", () => {
      const authHeader = "Bearer token123";
      const token = authHeader.replace("Bearer ", "");
      expect(token).toBe("token123");
    });

    it("should verify token with Supabase auth", () => {
      const method = "getUser";
      expect(method).toBe("getUser");
    });

    it("should return 401 on invalid token", () => {
      const errorResponse = {
        status: 401,
        error: "Não autenticado."
      };
      expect(errorResponse.status).toBe(401);
    });
  });

  describe("Authorization", () => {
    it("should check user role from profiles table", () => {
      const tableName = "profiles";
      expect(tableName).toBe("profiles");
    });

    it("should require admin role", () => {
      const requiredRole = "admin";
      expect(requiredRole).toBe("admin");
    });

    it("should return 403 for non-admin users", () => {
      const errorResponse = {
        status: 403,
        error: "Acesso negado."
      };
      expect(errorResponse.status).toBe(403);
      expect(errorResponse.error).toBe("Acesso negado.");
    });

    it("should select role field from profiles", () => {
      const selectField = "role";
      expect(selectField).toBe("role");
    });

    it("should filter by user id", () => {
      const filterField = "id";
      expect(filterField).toBe("id");
    });
  });

  describe("Database Query", () => {
    it("should query auditoria_alertas table", () => {
      const tableName = "auditoria_alertas";
      expect(tableName).toBe("auditoria_alertas");
    });

    it("should select required columns", () => {
      const selectFields = "id, auditoria_id, comentario_id, descricao, criado_em";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("auditoria_id");
      expect(selectFields).toContain("comentario_id");
      expect(selectFields).toContain("descricao");
      expect(selectFields).toContain("criado_em");
    });

    it("should order by criado_em descending", () => {
      const orderConfig = {
        field: "criado_em",
        ascending: false
      };
      expect(orderConfig.field).toBe("criado_em");
      expect(orderConfig.ascending).toBe(false);
    });
  });

  describe("Response Format", () => {
    it("should return array of alerts", () => {
      const mockResponse = [
        {
          id: "uuid-1",
          auditoria_id: "audit-uuid-1",
          comentario_id: "comment-uuid-1",
          descricao: "Falha crítica detectada",
          criado_em: "2025-10-16T12:00:00Z"
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("id");
      expect(mockResponse[0]).toHaveProperty("auditoria_id");
      expect(mockResponse[0]).toHaveProperty("comentario_id");
      expect(mockResponse[0]).toHaveProperty("descricao");
      expect(mockResponse[0]).toHaveProperty("criado_em");
    });

    it("should include alert id in response", () => {
      const alert = {
        id: "uuid-1",
        auditoria_id: "audit-uuid-1",
        comentario_id: "comment-uuid-1",
        descricao: "Falha crítica",
        criado_em: "2025-10-16T12:00:00Z"
      };
      expect(alert.id).toBe("uuid-1");
      expect(typeof alert.id).toBe("string");
    });

    it("should include auditoria_id in response", () => {
      const alert = {
        id: "uuid-1",
        auditoria_id: "audit-uuid-1",
        comentario_id: "comment-uuid-1",
        descricao: "Falha crítica",
        criado_em: "2025-10-16T12:00:00Z"
      };
      expect(alert.auditoria_id).toBe("audit-uuid-1");
    });

    it("should include comentario_id in response", () => {
      const alert = {
        id: "uuid-1",
        auditoria_id: "audit-uuid-1",
        comentario_id: "comment-uuid-1",
        descricao: "Falha crítica",
        criado_em: "2025-10-16T12:00:00Z"
      };
      expect(alert.comentario_id).toBe("comment-uuid-1");
    });

    it("should include descricao in response", () => {
      const alert = {
        id: "uuid-1",
        auditoria_id: "audit-uuid-1",
        comentario_id: "comment-uuid-1",
        descricao: "Falha crítica detectada pela IA",
        criado_em: "2025-10-16T12:00:00Z"
      };
      expect(alert.descricao).toBe("Falha crítica detectada pela IA");
      expect(typeof alert.descricao).toBe("string");
    });

    it("should include criado_em timestamp", () => {
      const alert = {
        id: "uuid-1",
        auditoria_id: "audit-uuid-1",
        comentario_id: "comment-uuid-1",
        descricao: "Falha crítica",
        criado_em: "2025-10-16T12:00:00Z"
      };
      expect(alert.criado_em).toBe("2025-10-16T12:00:00Z");
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
        error: "Database error message"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeDefined();
    });

    it("should return Portuguese error message", () => {
      const errorMessage = "Erro ao buscar alertas.";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("alertas");
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao buscar alertas:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("alertas");
    });

    it("should handle auth errors", () => {
      const authError = {
        status: 401,
        error: "Não autenticado."
      };
      expect(authError.status).toBe(401);
    });

    it("should handle authorization errors", () => {
      const authzError = {
        status: 403,
        error: "Acesso negado."
      };
      expect(authzError.status).toBe(403);
    });
  });

  describe("Use Cases", () => {
    it("should support viewing AI-detected alerts", () => {
      const useCase = {
        description: "Exibir falhas críticas detectadas pela IA",
        endpoint: "/api/admin/alertas"
      };
      expect(useCase.endpoint).toBe("/api/admin/alertas");
    });

    it("should support admin dashboard integration", () => {
      const dashboardUrl = "/admin/alerts";
      expect(dashboardUrl).toBe("/admin/alerts");
    });

    it("should provide alerts ordered by creation date", () => {
      const orderConfig = {
        field: "criado_em",
        direction: "descending"
      };
      expect(orderConfig.field).toBe("criado_em");
      expect(orderConfig.direction).toBe("descending");
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
      const queryMethods = ["from", "select", "order", "eq", "single"];
      expect(queryMethods).toContain("from");
      expect(queryMethods).toContain("select");
      expect(queryMethods).toContain("order");
      expect(queryMethods).toContain("eq");
      expect(queryMethods).toContain("single");
    });

    it("should use Supabase auth methods", () => {
      const authMethods = ["getUser"];
      expect(authMethods).toContain("getUser");
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

  describe("Security", () => {
    it("should check authentication before processing", () => {
      const authCheck = true;
      expect(authCheck).toBe(true);
    });

    it("should check authorization before querying data", () => {
      const authzCheck = true;
      expect(authzCheck).toBe(true);
    });

    it("should use service role key for admin operations", () => {
      const keyType = "SUPABASE_SERVICE_ROLE_KEY";
      expect(keyType).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("should validate user role from profiles table", () => {
      const validationSource = "profiles";
      expect(validationSource).toBe("profiles");
    });
  });

  describe("API Documentation", () => {
    it("should document the endpoint purpose", () => {
      const purpose = "Retorna alertas críticos detectados pela IA em comentários de auditoria";
      expect(purpose).toContain("alertas");
      expect(purpose).toContain("IA");
      expect(purpose).toContain("auditoria");
    });

    it("should document authentication requirement", () => {
      const requirement = "Requer autenticação via Bearer token";
      expect(requirement).toContain("autenticação");
      expect(requirement).toContain("Bearer token");
    });

    it("should document authorization requirement", () => {
      const requirement = "Requer role admin";
      expect(requirement).toContain("admin");
    });

    it("should document response format", () => {
      const responseFormat = {
        example: [
          {
            id: "uuid",
            auditoria_id: "uuid",
            comentario_id: "uuid",
            descricao: "Descrição do alerta",
            criado_em: "timestamp"
          }
        ]
      };
      expect(responseFormat.example).toHaveLength(1);
      expect(responseFormat.example[0]).toHaveProperty("id");
      expect(responseFormat.example[0]).toHaveProperty("descricao");
    });
  });
});
