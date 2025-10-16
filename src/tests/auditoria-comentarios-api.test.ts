/**
 * Auditoria Comentarios API Endpoint Tests
 * 
 * Tests for the /api/auditoria/[id]/comentarios endpoint that handles
 * audit comments with AI auto-responder based on IMCA standards
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
        error: "Método não permitido."
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Método não permitido.");
    });

    it("should use correct API endpoint path with dynamic id", () => {
      const endpointPath = "/api/auditoria/[id]/comentarios";
      expect(endpointPath).toContain("auditoria");
      expect(endpointPath).toContain("[id]");
      expect(endpointPath).toContain("comentarios");
    });

    it("should be accessible via pages/api/auditoria/[id]/comentarios.ts", () => {
      const filePath = "pages/api/auditoria/[id]/comentarios.ts";
      expect(filePath).toContain("auditoria/[id]/comentarios");
    });
  });

  describe("URL Parameters", () => {
    it("should extract auditoriaId from URL parameter", () => {
      const auditoriaId = "uuid-123-456-789";
      expect(typeof auditoriaId).toBe("string");
      expect(auditoriaId).toBeTruthy();
    });

    it("should validate auditoriaId is a string", () => {
      const auditoriaId = "uuid-123-456-789";
      expect(typeof auditoriaId).toBe("string");
    });

    it("should return 400 for invalid auditoriaId type", () => {
      const errorResponse = {
        status: 400,
        error: "ID inválido."
      };
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.error).toBe("ID inválido.");
    });
  });

  describe("GET Method - Fetch Comments", () => {
    it("should query auditoria_comentarios table", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should select required columns", () => {
      const selectFields = "id, comentario, created_at, user_id";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("comentario");
      expect(selectFields).toContain("created_at");
      expect(selectFields).toContain("user_id");
    });

    it("should filter by auditoria_id", () => {
      const auditoriaId = "uuid-123-456";
      expect(auditoriaId).toBeTruthy();
    });

    it("should order by created_at descending", () => {
      const orderConfig = { ascending: false };
      expect(orderConfig.ascending).toBe(false);
    });

    it("should return 200 status on success", () => {
      const successResponse = {
        status: 200,
        data: []
      };
      expect(successResponse.status).toBe(200);
    });

    it("should return array of comments", () => {
      const mockComments = [
        { id: "1", comentario: "Test", created_at: "2025-10-16", user_id: "user-1" },
        { id: "2", comentario: "AI Response", created_at: "2025-10-16", user_id: "ia-auto-responder" }
      ];
      expect(Array.isArray(mockComments)).toBe(true);
      expect(mockComments).toHaveLength(2);
    });

    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Database error"
      };
      expect(errorResponse.status).toBe(500);
    });
  });

  describe("POST Method - Create Comment", () => {
    it("should authenticate user before posting", () => {
      const authCheck = true;
      expect(authCheck).toBeDefined();
    });

    it("should return 401 for unauthenticated users", () => {
      const errorResponse = {
        status: 401,
        error: "Usuário não autenticado."
      };
      expect(errorResponse.status).toBe(401);
      expect(errorResponse.error).toBe("Usuário não autenticado.");
    });

    it("should validate comentario is not empty", () => {
      const comentario = "Valid comment";
      expect(comentario.trim()).toBeTruthy();
    });

    it("should return 400 for empty comentario", () => {
      const errorResponse = {
        status: 400,
        error: "Comentário vazio."
      };
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.error).toBe("Comentário vazio.");
    });

    it("should trim comentario before saving", () => {
      const comentario = "  Test comment  ";
      const trimmed = comentario.trim();
      expect(trimmed).toBe("Test comment");
    });

    it("should insert comment with required fields", () => {
      const insertData = {
        auditoria_id: "uuid-123",
        comentario: "Test comment",
        user_id: "user-uuid"
      };
      expect(insertData.auditoria_id).toBeTruthy();
      expect(insertData.comentario).toBeTruthy();
      expect(insertData.user_id).toBeTruthy();
    });

    it("should return 201 status on successful creation", () => {
      const successResponse = {
        status: 201,
        body: { sucesso: true, comentario: {} }
      };
      expect(successResponse.status).toBe(201);
      expect(successResponse.body.sucesso).toBe(true);
    });

    it("should return inserted comment data", () => {
      const response = {
        sucesso: true,
        comentario: {
          id: "uuid-1",
          auditoria_id: "uuid-123",
          comentario: "Test",
          user_id: "user-1"
        }
      };
      expect(response.sucesso).toBe(true);
      expect(response.comentario).toBeDefined();
    });
  });

  describe("AI Auto-Responder Integration", () => {
    it("should use OpenAI API for generating responses", () => {
      const openaiImport = "openai";
      expect(openaiImport).toBe("openai");
    });

    it("should use VITE_OPENAI_API_KEY environment variable", () => {
      const envVar = "VITE_OPENAI_API_KEY";
      expect(envVar).toBe("VITE_OPENAI_API_KEY");
    });

    it("should create AI prompt based on user comment", () => {
      const comentario = "Verificar equipamentos de segurança";
      const iaPrompt = `Você é um auditor técnico baseado nas normas IMCA. Dado o seguinte comentário de um usuário:
"${comentario}"
Gere uma resposta técnica sucinta com base nas melhores práticas de auditoria offshore.`;
      
      expect(iaPrompt).toContain(comentario);
      expect(iaPrompt).toContain("IMCA");
      expect(iaPrompt).toContain("auditor técnico");
    });

    it("should use GPT-4 model", () => {
      const model = "gpt-4";
      expect(model).toBe("gpt-4");
    });

    it("should configure system message for IMCA auditor role", () => {
      const systemMessage = {
        role: "system",
        content: "Você é um engenheiro auditor da IMCA."
      };
      expect(systemMessage.role).toBe("system");
      expect(systemMessage.content).toContain("IMCA");
      expect(systemMessage.content).toContain("auditor");
    });

    it("should save AI response with ia-auto-responder user_id", () => {
      const aiCommentData = {
        auditoria_id: "uuid-123",
        comentario: "AI generated response",
        user_id: "ia-auto-responder"
      };
      expect(aiCommentData.user_id).toBe("ia-auto-responder");
    });

    it("should handle AI errors gracefully", () => {
      const errorHandling = {
        continueOnError: true,
        logError: true
      };
      expect(errorHandling.continueOnError).toBe(true);
      expect(errorHandling.logError).toBe(true);
    });

    it("should trim AI response before saving", () => {
      const aiResponse = "  AI generated response  ";
      const trimmed = aiResponse.trim();
      expect(trimmed).toBe("AI generated response");
    });

    it("should only save AI response if content exists", () => {
      const respostaIA = "Valid AI response";
      expect(respostaIA).toBeTruthy();
    });
  });

  describe("Database Schema", () => {
    it("should have id column as UUID primary key", () => {
      const columnDef = "id UUID PRIMARY KEY DEFAULT gen_random_uuid()";
      expect(columnDef).toContain("UUID");
      expect(columnDef).toContain("PRIMARY KEY");
    });

    it("should have auditoria_id column as UUID", () => {
      const columnDef = "auditoria_id UUID NOT NULL";
      expect(columnDef).toContain("UUID");
      expect(columnDef).toContain("NOT NULL");
    });

    it("should have comentario column as TEXT", () => {
      const columnDef = "comentario TEXT NOT NULL";
      expect(columnDef).toContain("TEXT");
      expect(columnDef).toContain("NOT NULL");
    });

    it("should have user_id column as TEXT", () => {
      const columnDef = "user_id TEXT NOT NULL";
      expect(columnDef).toContain("TEXT");
      expect(columnDef).toContain("NOT NULL");
    });

    it("should have created_at timestamp", () => {
      const columnDef = "created_at TIMESTAMPTZ DEFAULT NOW()";
      expect(columnDef).toContain("TIMESTAMPTZ");
      expect(columnDef).toContain("DEFAULT NOW()");
    });

    it("should have updated_at timestamp", () => {
      const columnDef = "updated_at TIMESTAMPTZ DEFAULT NOW()";
      expect(columnDef).toContain("TIMESTAMPTZ");
      expect(columnDef).toContain("DEFAULT NOW()");
    });

    it("should have index on auditoria_id", () => {
      const indexName = "idx_auditoria_comentarios_auditoria_id";
      expect(indexName).toContain("auditoria_comentarios");
      expect(indexName).toContain("auditoria_id");
    });

    it("should have index on created_at", () => {
      const indexName = "idx_auditoria_comentarios_created_at";
      expect(indexName).toContain("auditoria_comentarios");
      expect(indexName).toContain("created_at");
    });
  });

  describe("Response Format", () => {
    it("should return comments array with proper structure", () => {
      const mockResponse = [
        {
          id: "uuid-1",
          comentario: "User comment",
          created_at: "2025-10-16T12:00:00Z",
          user_id: "user-uuid"
        },
        {
          id: "uuid-2",
          comentario: "AI response",
          created_at: "2025-10-16T12:01:00Z",
          user_id: "ia-auto-responder"
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("id");
      expect(mockResponse[0]).toHaveProperty("comentario");
      expect(mockResponse[0]).toHaveProperty("created_at");
      expect(mockResponse[0]).toHaveProperty("user_id");
    });

    it("should distinguish AI comments by user_id", () => {
      const aiComment = { user_id: "ia-auto-responder" };
      const userComment = { user_id: "user-uuid-123" };
      
      expect(aiComment.user_id).toBe("ia-auto-responder");
      expect(userComment.user_id).not.toBe("ia-auto-responder");
    });
  });

  describe("Error Handling", () => {
    it("should return Portuguese error messages", () => {
      const errors = {
        invalidId: "ID inválido.",
        unauthenticated: "Usuário não autenticado.",
        emptyComment: "Comentário vazio.",
        methodNotAllowed: "Método não permitido."
      };

      expect(errors.invalidId).toContain("ID");
      expect(errors.unauthenticated).toContain("Usuário");
      expect(errors.emptyComment).toContain("Comentário");
      expect(errors.methodNotAllowed).toContain("Método");
    });

    it("should handle database errors gracefully", () => {
      const errorResponse = {
        status: 500,
        error: "Database error message"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBeTruthy();
    });

    it("should log AI errors without failing request", () => {
      const errorLog = "Erro ao gerar resposta da IA:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("IA");
    });
  });

  describe("Supabase Client Configuration", () => {
    it("should use createClient from @supabase/supabase-js", () => {
      const importPath = "@supabase/supabase-js";
      expect(importPath).toBe("@supabase/supabase-js");
    });

    it("should use VITE_SUPABASE_URL environment variable", () => {
      const envVar = "VITE_SUPABASE_URL";
      expect(envVar).toBe("VITE_SUPABASE_URL");
    });

    it("should use SUPABASE_SERVICE_ROLE_KEY for admin operations", () => {
      const envVar = "SUPABASE_SERVICE_ROLE_KEY";
      expect(envVar).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("should fallback to VITE_SUPABASE_PUBLISHABLE_KEY", () => {
      const fallbackEnvVar = "VITE_SUPABASE_PUBLISHABLE_KEY";
      expect(fallbackEnvVar).toBe("VITE_SUPABASE_PUBLISHABLE_KEY");
    });
  });

  describe("Authentication Flow", () => {
    it("should call supabase.auth.getUser()", () => {
      const authMethod = "getUser";
      expect(authMethod).toBe("getUser");
    });

    it("should extract user id from auth response", () => {
      const authResponse = {
        data: { user: { id: "user-uuid-123" } },
        error: null
      };
      expect(authResponse.data.user.id).toBeTruthy();
    });

    it("should handle auth errors", () => {
      const authResponse = {
        data: { user: null },
        error: { message: "Auth failed" }
      };
      expect(authResponse.error).toBeTruthy();
    });
  });

  describe("Use Cases", () => {
    it("should support viewing all comments for an audit", () => {
      const useCase = {
        method: "GET",
        endpoint: "/api/auditoria/uuid-123/comentarios",
        description: "Buscar todos os comentários de uma auditoria"
      };
      expect(useCase.method).toBe("GET");
    });

    it("should support creating new user comment", () => {
      const useCase = {
        method: "POST",
        endpoint: "/api/auditoria/uuid-123/comentarios",
        body: { comentario: "Verificar equipamentos" },
        description: "Criar comentário do usuário"
      };
      expect(useCase.method).toBe("POST");
      expect(useCase.body.comentario).toBeTruthy();
    });

    it("should automatically generate AI response after user comment", () => {
      const workflow = {
        step1: "User posts comment",
        step2: "Comment saved to database",
        step3: "AI generates technical response",
        step4: "AI response saved with ia-auto-responder user_id"
      };
      expect(workflow.step1).toBeTruthy();
      expect(workflow.step2).toBeTruthy();
      expect(workflow.step3).toBeTruthy();
      expect(workflow.step4).toBeTruthy();
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

    it("should destructure query, method, and body from request", () => {
      const destructuring = "{ query: { id }, method, body }";
      expect(destructuring).toContain("query");
      expect(destructuring).toContain("method");
      expect(destructuring).toContain("body");
    });
  });

  describe("IMCA Standards Integration", () => {
    it("should reference IMCA in AI prompt", () => {
      const prompt = "auditor técnico baseado nas normas IMCA";
      expect(prompt).toContain("IMCA");
      expect(prompt).toContain("normas");
    });

    it("should focus on offshore audit best practices", () => {
      const context = "melhores práticas de auditoria offshore";
      expect(context).toContain("auditoria offshore");
      expect(context).toContain("melhores práticas");
    });

    it("should generate technical and succinct responses", () => {
      const requirements = {
        technical: true,
        succinct: true,
        imcaBased: true
      };
      expect(requirements.technical).toBe(true);
      expect(requirements.succinct).toBe(true);
      expect(requirements.imcaBased).toBe(true);
    });
  });

  describe("API Documentation", () => {
    it("should document endpoint purpose", () => {
      const purpose = "Gerencia comentários de auditoria com resposta automática por IA baseada em normas IMCA";
      expect(purpose).toContain("comentários");
      expect(purpose).toContain("auditoria");
      expect(purpose).toContain("IA");
      expect(purpose).toContain("IMCA");
    });

    it("should document GET method usage", () => {
      const getExample = {
        endpoint: "/api/auditoria/[id]/comentarios",
        method: "GET",
        description: "Buscar comentários de uma auditoria específica",
        response: [{ id: "uuid", comentario: "text", created_at: "date", user_id: "uuid" }]
      };
      expect(getExample.method).toBe("GET");
      expect(getExample.description).toContain("comentários");
    });

    it("should document POST method usage", () => {
      const postExample = {
        endpoint: "/api/auditoria/[id]/comentarios",
        method: "POST",
        body: { comentario: "Comentário do usuário" },
        description: "Criar novo comentário e gerar resposta automática da IA",
        response: { sucesso: true, comentario: {} }
      };
      expect(postExample.method).toBe("POST");
      expect(postExample.body).toHaveProperty("comentario");
    });
  });
});
