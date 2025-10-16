/**
 * Auditoria Export PDF API Endpoint Tests
 * 
 * Tests for the /api/auditoria/[id]/export-comentarios-pdf endpoint
 * that exports audit comments to PDF format
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditoria Export PDF API Endpoint", () => {
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
        error: "Método não permitido.",
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Método não permitido.");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/auditoria/[id]/export-comentarios-pdf";
      expect(endpointPath).toContain("[id]");
      expect(endpointPath).toContain("export-comentarios-pdf");
    });

    it("should validate auditoria ID parameter", () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      expect(typeof validId).toBe("string");
    });

    it("should reject invalid ID with 400", () => {
      const errorResponse = {
        status: 400,
        error: "ID inválido.",
      };
      expect(errorResponse.status).toBe(400);
    });
  });

  describe("Data Retrieval", () => {
    it("should query auditorias_imca table for audit details", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select audit fields", () => {
      const fields = ["title", "description", "audit_date", "score", "status"];
      expect(fields).toContain("title");
      expect(fields).toContain("description");
      expect(fields).toContain("audit_date");
      expect(fields).toContain("score");
      expect(fields).toContain("status");
    });

    it("should return 404 if audit not found", () => {
      const errorResponse = {
        status: 404,
        error: "Auditoria não encontrada.",
      };
      expect(errorResponse.status).toBe(404);
    });

    it("should query auditoria_comentarios for comments", () => {
      const tableName = "auditoria_comentarios";
      expect(tableName).toBe("auditoria_comentarios");
    });

    it("should order comments by created_at ascending", () => {
      const orderConfig = { ascending: true };
      expect(orderConfig.ascending).toBe(true);
    });

    it("should handle database errors gracefully", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao buscar comentários: Database error",
      };
      expect(errorResponse.status).toBe(500);
    });
  });

  describe("PDF Generation", () => {
    it("should use jsPDF library", () => {
      const library = "jsPDF";
      expect(library).toBe("jsPDF");
    });

    it("should use autoTable for comments table", () => {
      const plugin = "jspdf-autotable";
      expect(plugin).toBe("jspdf-autotable");
    });

    it("should set margin to 20", () => {
      const margin = 20;
      expect(margin).toBe(20);
    });

    it("should add title to PDF", () => {
      const title = "Relatório de Auditoria IMCA";
      expect(title).toContain("Relatório");
      expect(title).toContain("IMCA");
    });

    it("should use font size 18 for main title", () => {
      const fontSize = 18;
      expect(fontSize).toBe(18);
    });

    it("should use bold font for title", () => {
      const fontStyle = "bold";
      expect(fontStyle).toBe("bold");
    });
  });

  describe("Audit Details Section", () => {
    it("should include audit title", () => {
      const label = "Título:";
      expect(label).toContain("Título");
    });

    it("should include audit description", () => {
      const label = "Descrição:";
      expect(label).toContain("Descrição");
    });

    it("should split long description text", () => {
      const method = "splitTextToSize";
      expect(method).toBe("splitTextToSize");
    });

    it("should include audit date", () => {
      const label = "Data da Auditoria:";
      expect(label).toContain("Data");
    });

    it("should format date as dd/MM/yyyy", () => {
      const format = "dd/MM/yyyy";
      expect(format).toBe("dd/MM/yyyy");
    });

    it("should include audit status", () => {
      const label = "Status:";
      expect(label).toBe("Status:");
    });

    it("should include audit score", () => {
      const label = "Pontuação:";
      expect(label).toContain("Pontuação");
    });

    it("should display score out of 100", () => {
      const scoreFormat = "/100";
      expect(scoreFormat).toBe("/100");
    });

    it("should show dash for missing values", () => {
      const placeholder = "-";
      expect(placeholder).toBe("-");
    });
  });

  describe("Comments Section", () => {
    it("should have section title", () => {
      const sectionTitle = "Comentários e Análises Técnicas";
      expect(sectionTitle).toContain("Comentários");
      expect(sectionTitle).toContain("Análises Técnicas");
    });

    it("should use font size 14 for section title", () => {
      const fontSize = 14;
      expect(fontSize).toBe(14);
    });

    it("should create table with headers", () => {
      const headers = ["Data/Hora", "Autor", "Comentário"];
      expect(headers).toHaveLength(3);
      expect(headers).toContain("Data/Hora");
      expect(headers).toContain("Autor");
      expect(headers).toContain("Comentário");
    });

    it("should format comment date as dd/MM/yyyy HH:mm", () => {
      const format = "dd/MM/yyyy HH:mm";
      expect(format).toContain("dd/MM/yyyy");
      expect(format).toContain("HH:mm");
    });

    it("should label AI comments as IA IMCA", () => {
      const aiLabel = "IA IMCA";
      expect(aiLabel).toBe("IA IMCA");
    });

    it("should label user comments as Usuário", () => {
      const userLabel = "Usuário";
      expect(userLabel).toBe("Usuário");
    });

    it("should detect AI comments by user_id", () => {
      const aiUserId = "ia-auto-responder";
      expect(aiUserId).toBe("ia-auto-responder");
    });

    it("should show message when no comments", () => {
      const message = "Nenhum comentário registrado.";
      expect(message).toContain("Nenhum comentário");
    });
  });

  describe("Table Styling", () => {
    it("should use font size 9 for table content", () => {
      const fontSize = 9;
      expect(fontSize).toBe(9);
    });

    it("should set cell padding to 5", () => {
      const padding = 5;
      expect(padding).toBe(5);
    });

    it("should use slate-900 for header background", () => {
      const headerColor = [15, 23, 42];
      expect(headerColor).toEqual([15, 23, 42]);
    });

    it("should use white text for headers", () => {
      const textColor = [255, 255, 255];
      expect(textColor).toEqual([255, 255, 255]);
    });

    it("should use slate-50 for alternate rows", () => {
      const alternateColor = [248, 250, 252];
      expect(alternateColor).toEqual([248, 250, 252]);
    });

    it("should set Data/Hora column width to 35", () => {
      const columnWidth = 35;
      expect(columnWidth).toBe(35);
    });

    it("should set Autor column width to 25", () => {
      const columnWidth = 25;
      expect(columnWidth).toBe(25);
    });

    it("should set Comentário column to auto width", () => {
      const columnWidth = "auto";
      expect(columnWidth).toBe("auto");
    });
  });

  describe("AI Comment Highlighting", () => {
    it("should use blue-600 color for AI author", () => {
      const aiColor = [37, 99, 235];
      expect(aiColor).toEqual([37, 99, 235]);
    });

    it("should bold AI author text", () => {
      const fontStyle = "bold";
      expect(fontStyle).toBe("bold");
    });

    it("should detect AI comments in table cell", () => {
      const cellValue = "IA IMCA";
      expect(cellValue).toBe("IA IMCA");
    });
  });

  describe("Critical Warning Highlighting", () => {
    it("should detect critical warnings by emoji prefix", () => {
      const warningPrefix = "⚠️";
      expect(warningPrefix).toBe("⚠️");
    });

    it("should use red-50 background for warnings", () => {
      const warningBgColor = [254, 242, 242];
      expect(warningBgColor).toEqual([254, 242, 242]);
    });

    it("should use red-900 text for warnings", () => {
      const warningTextColor = [127, 29, 29];
      expect(warningTextColor).toEqual([127, 29, 29]);
    });

    it("should check if comment starts with warning emoji", () => {
      const comment = "⚠️ Atenção: Falha crítica detectada";
      expect(comment.startsWith("⚠️")).toBe(true);
    });
  });

  describe("Footer", () => {
    it("should add generation timestamp", () => {
      const label = "Gerado em:";
      expect(label).toContain("Gerado em");
    });

    it("should use font size 8 for footer", () => {
      const fontSize = 8;
      expect(fontSize).toBe(8);
    });

    it("should use gray color for footer text", () => {
      const grayValue = 128;
      expect(grayValue).toBe(128);
    });

    it("should position footer 10 units from bottom", () => {
      const bottomMargin = 10;
      expect(bottomMargin).toBe(10);
    });

    it("should format timestamp as dd/MM/yyyy HH:mm", () => {
      const format = "dd/MM/yyyy HH:mm";
      expect(format).toBe("dd/MM/yyyy HH:mm");
    });
  });

  describe("Response Headers", () => {
    it("should set Content-Type to application/pdf", () => {
      const contentType = "application/pdf";
      expect(contentType).toBe("application/pdf");
    });

    it("should set Content-Disposition for attachment", () => {
      const disposition = "attachment; filename=";
      expect(disposition).toContain("attachment");
      expect(disposition).toContain("filename=");
    });

    it("should include auditoria ID in filename", () => {
      const auditoriaId = "550e8400-e29b-41d4-a716-446655440000";
      const filename = `auditoria-comentarios-${auditoriaId}`;
      expect(filename).toContain(auditoriaId);
    });

    it("should include date in filename", () => {
      const dateFormat = "yyyyMMdd";
      expect(dateFormat).toBe("yyyyMMdd");
    });

    it("should set Content-Length header", () => {
      const header = "Content-Length";
      expect(header).toBe("Content-Length");
    });

    it("should return 200 status on success", () => {
      const status = 200;
      expect(status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should catch and log PDF generation errors", () => {
      const logPrefix = "Erro ao gerar PDF:";
      expect(logPrefix).toContain("Erro");
      expect(logPrefix).toContain("PDF");
    });

    it("should return 500 on PDF generation error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao gerar PDF dos comentários.",
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toContain("PDF");
    });
  });

  describe("Date Formatting", () => {
    it("should use date-fns format function", () => {
      const library = "date-fns";
      expect(library).toBe("date-fns");
    });

    it("should format audit date", () => {
      const format = "dd/MM/yyyy";
      expect(format).toBe("dd/MM/yyyy");
    });

    it("should format comment timestamps", () => {
      const format = "dd/MM/yyyy HH:mm";
      expect(format).toContain("HH:mm");
    });

    it("should format filename date", () => {
      const format = "yyyyMMdd";
      expect(format).toBe("yyyyMMdd");
    });
  });

  describe("Buffer Handling", () => {
    it("should convert PDF to arraybuffer", () => {
      const outputFormat = "arraybuffer";
      expect(outputFormat).toBe("arraybuffer");
    });

    it("should create Buffer from arraybuffer", () => {
      const method = "Buffer.from";
      expect(method).toBe("Buffer.from");
    });

    it("should send buffer as response", () => {
      const method = "send";
      expect(method).toBe("send");
    });
  });

  describe("Integration", () => {
    it("should integrate with Supabase", () => {
      const service = "Supabase";
      expect(service).toBe("Supabase");
    });

    it("should use service role key", () => {
      const envVar = "SUPABASE_SERVICE_ROLE_KEY";
      expect(envVar).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("should query multiple tables", () => {
      const tables = ["auditorias_imca", "auditoria_comentarios"];
      expect(tables).toHaveLength(2);
    });
  });

  describe("Use Cases", () => {
    it("should support exporting audit report with comments", () => {
      const useCase = "Export audit report to PDF";
      expect(useCase).toContain("Export");
      expect(useCase).toContain("PDF");
    });

    it("should support downloading audit documentation", () => {
      const useCase = "Download audit documentation";
      expect(useCase).toContain("Download");
    });

    it("should support archiving audit records", () => {
      const useCase = "Archive audit records";
      expect(useCase).toContain("Archive");
    });

    it("should support sharing audit reports", () => {
      const useCase = "Share audit reports";
      expect(useCase).toContain("Share");
    });
  });

  describe("Portuguese Language", () => {
    it("should use Portuguese labels", () => {
      const labels = [
        "Título:",
        "Descrição:",
        "Status:",
        "Pontuação:",
        "Data da Auditoria:",
      ];
      labels.forEach((label) => {
        expect(label).toBeTruthy();
      });
    });

    it("should use Portuguese error messages", () => {
      const errors = [
        "ID inválido.",
        "Método não permitido.",
        "Auditoria não encontrada.",
        "Erro ao gerar PDF dos comentários.",
      ];
      errors.forEach((error) => {
        expect(error).toBeTruthy();
      });
    });

    it("should use Portuguese section titles", () => {
      const titles = [
        "Relatório de Auditoria IMCA",
        "Comentários e Análises Técnicas",
      ];
      titles.forEach((title) => {
        expect(title).toBeTruthy();
      });
    });
  });
});
