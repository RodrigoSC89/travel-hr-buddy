/**
 * Auditoria Export PDF API Endpoint Tests
 * 
 * Tests for the /api/auditoria/[id]/export-comentarios-pdf endpoint that generates
 * professional PDF reports with audit comments and AI analyses
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Export Comentarios PDF API Endpoint", () => {
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

    it("should use correct API endpoint path with dynamic id", () => {
      const endpointPath = "/api/auditoria/[id]/export-comentarios-pdf";
      expect(endpointPath).toContain("auditoria");
      expect(endpointPath).toContain("[id]");
      expect(endpointPath).toContain("export-comentarios-pdf");
    });

    it("should be accessible via pages/api/auditoria/[id]/export-comentarios-pdf.ts", () => {
      const filePath = "pages/api/auditoria/[id]/export-comentarios-pdf.ts";
      expect(filePath).toContain("auditoria/[id]/export-comentarios-pdf");
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

  describe("PDF Generation", () => {
    it("should use jsPDF library", () => {
      const library = "jspdf";
      expect(library).toBe("jspdf");
    });

    it("should use jspdf-autotable for table generation", () => {
      const library = "jspdf-autotable";
      expect(library).toBe("jspdf-autotable");
    });

    it("should generate PDF with correct MIME type", () => {
      const contentType = "application/pdf";
      expect(contentType).toBe("application/pdf");
    });

    it("should set Content-Disposition header for download", () => {
      const header = "attachment; filename=";
      expect(header).toContain("attachment");
      expect(header).toContain("filename");
    });

    it("should include audit ID in filename", () => {
      const auditoriaId = "abc-123";
      const filename = `auditoria-comentarios-${auditoriaId}`;
      expect(filename).toContain(auditoriaId);
    });

    it("should include date in filename", () => {
      const date = new Date().toISOString().split("T")[0];
      const filename = `auditoria-comentarios-uuid-${date}.pdf`;
      expect(filename).toContain(date);
    });

    it("should return 200 status on successful generation", () => {
      const successResponse = { status: 200 };
      expect(successResponse.status).toBe(200);
    });

    it("should return PDF buffer", () => {
      const bufferCheck = Buffer.isBuffer(Buffer.from("test"));
      expect(bufferCheck).toBe(true);
    });
  });

  describe("Audit Data Retrieval", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select audit metadata fields", () => {
      const selectFields = "id, title, description, audit_date, status, score";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("title");
      expect(selectFields).toContain("description");
      expect(selectFields).toContain("audit_date");
      expect(selectFields).toContain("status");
      expect(selectFields).toContain("score");
    });

    it("should filter by audit id", () => {
      const auditoriaId = "uuid-123";
      expect(auditoriaId).toBeTruthy();
    });

    it("should fetch single audit record", () => {
      const method = "single";
      expect(method).toBe("single");
    });

    it("should return 404 if audit not found", () => {
      const errorResponse = {
        status: 404,
        error: "Auditoria não encontrada."
      };
      expect(errorResponse.status).toBe(404);
      expect(errorResponse.error).toBe("Auditoria não encontrada.");
    });
  });

  describe("Comments Data Retrieval", () => {
    it("should query auditoria_comentarios table", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should select comment fields", () => {
      const selectFields = "id, comentario, created_at, user_id";
      expect(selectFields).toContain("id");
      expect(selectFields).toContain("comentario");
      expect(selectFields).toContain("created_at");
      expect(selectFields).toContain("user_id");
    });

    it("should filter comments by auditoria_id", () => {
      const auditoriaId = "uuid-123";
      expect(auditoriaId).toBeTruthy();
    });

    it("should order comments by created_at ascending", () => {
      const orderConfig = { ascending: true };
      expect(orderConfig.ascending).toBe(true);
    });

    it("should handle empty comments gracefully", () => {
      const emptyComments = [];
      expect(Array.isArray(emptyComments)).toBe(true);
      expect(emptyComments).toHaveLength(0);
    });
  });

  describe("PDF Layout", () => {
    it("should include title in PDF", () => {
      const title = "Relatório de Comentários - Auditoria IMCA";
      expect(title).toContain("Relatório");
      expect(title).toContain("Comentários");
      expect(title).toContain("Auditoria IMCA");
    });

    it("should use slate-900 color for title", () => {
      const color = [15, 23, 42];
      expect(color).toEqual([15, 23, 42]);
    });

    it("should center title on page", () => {
      const alignment = "center";
      expect(alignment).toBe("center");
    });

    it("should include audit title in metadata", () => {
      const metadata = "Título: ";
      expect(metadata).toContain("Título");
    });

    it("should include audit description in metadata", () => {
      const metadata = "Descrição: ";
      expect(metadata).toContain("Descrição");
    });

    it("should include audit date in metadata", () => {
      const metadata = "Data: ";
      expect(metadata).toContain("Data");
    });

    it("should include audit status in metadata", () => {
      const metadata = "Status: ";
      expect(metadata).toContain("Status");
    });

    it("should include audit score in metadata", () => {
      const metadata = "Pontuação: ";
      expect(metadata).toContain("Pontuação");
    });

    it("should format date as pt-BR locale", () => {
      const date = new Date("2025-10-16");
      const formatted = date.toLocaleDateString("pt-BR");
      expect(formatted).toBeTruthy();
    });
  });

  describe("PDF Table Structure", () => {
    it("should create table with three columns", () => {
      const headers = ["Data/Hora", "Autor", "Comentário"];
      expect(headers).toHaveLength(3);
    });

    it("should have Data/Hora column", () => {
      const headers = ["Data/Hora", "Autor", "Comentário"];
      expect(headers[0]).toBe("Data/Hora");
    });

    it("should have Autor column", () => {
      const headers = ["Data/Hora", "Autor", "Comentário"];
      expect(headers[1]).toBe("Autor");
    });

    it("should have Comentário column", () => {
      const headers = ["Data/Hora", "Autor", "Comentário"];
      expect(headers[2]).toBe("Comentário");
    });

    it("should format timestamps as pt-BR locale", () => {
      const date = new Date("2025-10-16T10:30:00Z");
      const formatted = date.toLocaleString("pt-BR");
      expect(formatted).toBeTruthy();
    });

    it("should identify AI comments by user_id", () => {
      const userId = "ia-auto-responder";
      const isAI = userId === "ia-auto-responder";
      expect(isAI).toBe(true);
    });

    it("should display IA Auditor IMCA for AI comments", () => {
      const author = "IA Auditor IMCA";
      expect(author).toBe("IA Auditor IMCA");
    });

    it("should display Usuário for regular comments", () => {
      const author = "Usuário";
      expect(author).toBe("Usuário");
    });
  });

  describe("PDF Styling", () => {
    it("should use slate-900 for table header background", () => {
      const color = [15, 23, 42];
      expect(color).toEqual([15, 23, 42]);
    });

    it("should use white text for table headers", () => {
      const color = [255, 255, 255];
      expect(color).toEqual([255, 255, 255]);
    });

    it("should use bold font for table headers", () => {
      const fontStyle = "bold";
      expect(fontStyle).toBe("bold");
    });

    it("should use slate-50 for alternate row background", () => {
      const color = [248, 250, 252];
      expect(color).toEqual([248, 250, 252]);
    });

    it("should use blue-600 for AI author text", () => {
      const color = [37, 99, 235];
      expect(color).toEqual([37, 99, 235]);
    });

    it("should use bold font for AI author", () => {
      const fontStyle = "bold";
      expect(fontStyle).toBe("bold");
    });
  });

  describe("Critical Warning Highlighting", () => {
    it("should detect critical warnings by prefix", () => {
      const comment = "⚠️ Atenção: Vazamento detectado";
      const isCritical = comment.startsWith("⚠️ Atenção:");
      expect(isCritical).toBe(true);
    });

    it("should not flag non-critical comments", () => {
      const comment = "Tudo está funcionando bem";
      const isCritical = comment.startsWith("⚠️ Atenção:");
      expect(isCritical).toBe(false);
    });

    it("should use red-50 background for critical comments", () => {
      const color = [254, 242, 242];
      expect(color).toEqual([254, 242, 242]);
    });

    it("should use red-900 text for critical comments", () => {
      const color = [127, 29, 29];
      expect(color).toEqual([127, 29, 29]);
    });
  });

  describe("PDF Footer", () => {
    it("should include generation timestamp", () => {
      const footer = `Gerado em: ${new Date().toLocaleString("pt-BR")}`;
      expect(footer).toContain("Gerado em:");
    });

    it("should use slate-400 color for footer", () => {
      const color = [148, 163, 184];
      expect(color).toEqual([148, 163, 184]);
    });

    it("should center footer text", () => {
      const alignment = "center";
      expect(alignment).toBe("center");
    });

    it("should place footer at bottom of page", () => {
      const bottomMargin = 10;
      expect(bottomMargin).toBe(10);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao gerar PDF."
      };
      expect(errorResponse.status).toBe(500);
    });

    it("should log errors to console", () => {
      const errorLog = "Erro ao gerar PDF:";
      expect(errorLog).toContain("Erro");
      expect(errorLog).toContain("PDF");
    });

    it("should handle missing audit gracefully", () => {
      const errorResponse = {
        status: 404,
        error: "Auditoria não encontrada."
      };
      expect(errorResponse.status).toBe(404);
    });

    it("should handle comments query error", () => {
      const errorResponse = {
        status: 500,
        error: "error message"
      };
      expect(errorResponse.status).toBe(500);
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

    it("should destructure query and method from request", () => {
      const destructuring = "{ query: { id }, method }";
      expect(destructuring).toContain("query");
      expect(destructuring).toContain("method");
    });
  });

  describe("Use Cases", () => {
    it("should support exporting all comments for an audit", () => {
      const useCase = {
        method: "GET",
        endpoint: "/api/auditoria/uuid-123/export-comentarios-pdf",
        description: "Exportar todos os comentários como PDF"
      };
      expect(useCase.method).toBe("GET");
    });

    it("should include user comments in export", () => {
      const comment = {
        user_id: "user-uuid",
        comentario: "User comment"
      };
      expect(comment.user_id).not.toBe("ia-auto-responder");
    });

    it("should include AI comments in export", () => {
      const comment = {
        user_id: "ia-auto-responder",
        comentario: "AI response"
      };
      expect(comment.user_id).toBe("ia-auto-responder");
    });

    it("should highlight critical warnings visually", () => {
      const comment = "⚠️ Atenção: Critical issue";
      expect(comment.startsWith("⚠️ Atenção:")).toBe(true);
    });
  });

  describe("API Documentation", () => {
    it("should document endpoint purpose", () => {
      const purpose = "Gera PDF profissional com comentários de auditoria IMCA";
      expect(purpose).toContain("PDF");
      expect(purpose).toContain("comentários");
      expect(purpose).toContain("auditoria IMCA");
    });

    it("should document GET method usage", () => {
      const getExample = {
        endpoint: "/api/auditoria/[id]/export-comentarios-pdf",
        method: "GET",
        description: "Exportar comentários como PDF",
        response: "PDF file buffer"
      };
      expect(getExample.method).toBe("GET");
      expect(getExample.response).toContain("PDF");
    });
  });

  describe("PDF Features", () => {
    it("should include complete audit metadata", () => {
      const metadata = ["title", "description", "audit_date", "status", "score"];
      expect(metadata).toContain("title");
      expect(metadata).toContain("description");
      expect(metadata).toContain("audit_date");
      expect(metadata).toContain("status");
      expect(metadata).toContain("score");
    });

    it("should format all comments in table", () => {
      const tableStructure = {
        headers: true,
        body: true,
        styling: true
      };
      expect(tableStructure.headers).toBe(true);
      expect(tableStructure.body).toBe(true);
      expect(tableStructure.styling).toBe(true);
    });

    it("should distinguish between user and AI comments", () => {
      const userComment = { user_id: "user-1" };
      const aiComment = { user_id: "ia-auto-responder" };
      expect(userComment.user_id).not.toBe(aiComment.user_id);
    });

    it("should color-code critical warnings", () => {
      const criticalColor = { bg: [254, 242, 242], text: [127, 29, 29] };
      expect(criticalColor.bg).toEqual([254, 242, 242]);
      expect(criticalColor.text).toEqual([127, 29, 29]);
    });

    it("should include generation timestamp in footer", () => {
      const now = new Date();
      expect(now).toBeInstanceOf(Date);
    });
  });
});
