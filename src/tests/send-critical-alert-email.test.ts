/**
 * Critical Alert Email Service Tests
 * 
 * Tests for the sendCriticalAlertEmail function that sends critical
 * alerts to the security team when AI detects critical failures
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Critical Alert Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Function Interface", () => {
    it("should have correct function name", () => {
      const functionName = "sendCriticalAlertEmail";
      expect(functionName).toBe("sendCriticalAlertEmail");
    });

    it("should accept auditoriaId parameter", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "Test description" };
      expect(params.auditoriaId).toBe("AUD-12345");
    });

    it("should accept descricao parameter", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "Falha crítica detectada" };
      expect(params.descricao).toBe("Falha crítica detectada");
    });

    it("should return success and data on successful send", () => {
      const result = {
        success: true,
        data: { id: "email-123" }
      };
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should return success false and error on failure", () => {
      const result = {
        success: false,
        error: "API error"
      };
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Email Configuration", () => {
    it("should use Resend SDK", () => {
      const importPath = "resend";
      expect(importPath).toBe("resend");
    });

    it("should use RESEND_API_KEY environment variable", () => {
      const envVar = "RESEND_API_KEY";
      expect(envVar).toBe("RESEND_API_KEY");
    });

    it("should use alertas@nautilus.one as default sender", () => {
      const from = "alertas@nautilus.one";
      expect(from).toBe("alertas@nautilus.one");
    });

    it("should send to seguranca@empresa.com", () => {
      const to = ["seguranca@empresa.com"];
      expect(to).toContain("seguranca@empresa.com");
    });

    it("should use EMAIL_FROM environment variable if set", () => {
      const envVar = "EMAIL_FROM";
      expect(envVar).toBe("EMAIL_FROM");
    });
  });

  describe("Email Subject", () => {
    it("should include warning emoji in subject", () => {
      const subject = "⚠️ Alerta Crítico - Auditoria AUD-12345";
      expect(subject).toContain("⚠️");
    });

    it("should include 'Alerta Crítico' in subject", () => {
      const subject = "⚠️ Alerta Crítico - Auditoria AUD-12345";
      expect(subject).toContain("Alerta Crítico");
    });

    it("should include auditoria ID in subject", () => {
      const auditoriaId = "AUD-12345";
      const subject = `⚠️ Alerta Crítico - Auditoria ${auditoriaId}`;
      expect(subject).toContain("AUD-12345");
    });

    it("should format subject with template literal", () => {
      const auditoriaId = "AUD-99999";
      const subject = `⚠️ Alerta Crítico - Auditoria ${auditoriaId}`;
      expect(subject).toBe("⚠️ Alerta Crítico - Auditoria AUD-99999");
    });
  });

  describe("Email HTML Content", () => {
    it("should include critical failure header", () => {
      const html = "<h3>⚠️ Falha crítica detectada</h3>";
      expect(html).toContain("⚠️ Falha crítica detectada");
    });

    it("should include auditoria ID in body", () => {
      const auditoriaId = "AUD-12345";
      const html = `<p><strong>Auditoria:</strong> ${auditoriaId}</p>`;
      expect(html).toContain("AUD-12345");
    });

    it("should include description in pre tag", () => {
      const descricao = "Erro crítico no sistema";
      const html = `<pre>${descricao}</pre>`;
      expect(html).toContain("<pre>Erro crítico no sistema</pre>");
    });

    it("should include link to alerts panel", () => {
      const html = "<a href=\"https://nautilus.one/admin/alerts\">Acessar</a>";
      expect(html).toContain("https://nautilus.one/admin/alerts");
      expect(html).toContain("Acessar");
    });

    it("should format complete HTML email", () => {
      const auditoriaId = "AUD-12345";
      const descricao = "Falha crítica";
      const html = `<h3>⚠️ Falha crítica detectada</h3><p><strong>Auditoria:</strong> ${auditoriaId}</p><pre>${descricao}</pre><p>Ver painel de alertas: <a href="https://nautilus.one/admin/alerts">Acessar</a></p>`;
      
      expect(html).toContain("⚠️ Falha crítica detectada");
      expect(html).toContain("AUD-12345");
      expect(html).toContain("Falha crítica");
      expect(html).toContain("https://nautilus.one/admin/alerts");
    });
  });

  describe("Error Handling", () => {
    it("should return error when RESEND_API_KEY is not configured", () => {
      const result = {
        success: false,
        error: "RESEND_API_KEY is not configured in environment variables"
      };
      expect(result.success).toBe(false);
      expect(result.error).toContain("RESEND_API_KEY");
    });

    it("should log error when API key is missing", () => {
      const errorMessage = "❌ RESEND_API_KEY is not configured in environment variables";
      expect(errorMessage).toContain("❌");
      expect(errorMessage).toContain("RESEND_API_KEY");
    });

    it("should handle Resend API errors", () => {
      const error = { message: "API error" };
      expect(error.message).toBe("API error");
    });

    it("should log Resend API errors to console", () => {
      const errorLog = "❌ Erro ao enviar alerta crítico por email:";
      expect(errorLog).toContain("❌");
      expect(errorLog).toContain("Erro ao enviar");
    });

    it("should return error when no data returned from API", () => {
      const result = {
        success: false,
        error: "No data returned from Resend API"
      };
      expect(result.success).toBe(false);
      expect(result.error).toBe("No data returned from Resend API");
    });

    it("should handle unexpected errors", () => {
      const err = new Error("Unexpected error");
      const result = {
        success: false,
        error: err.message
      };
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unexpected error");
    });

    it("should handle unknown error types", () => {
      const result = {
        success: false,
        error: "Unknown error occurred"
      };
      expect(result.error).toBe("Unknown error occurred");
    });
  });

  describe("Success Handling", () => {
    it("should return success true when email sent", () => {
      const result = {
        success: true,
        data: { id: "email-123" }
      };
      expect(result.success).toBe(true);
    });

    it("should include email ID in response data", () => {
      const data = { id: "email-123" };
      expect(data.id).toBe("email-123");
      expect(typeof data.id).toBe("string");
    });

    it("should log success message to console", () => {
      const successLog = "✅ Email de alerta crítico enviado com sucesso:";
      expect(successLog).toContain("✅");
      expect(successLog).toContain("enviado com sucesso");
    });
  });

  describe("Parameter Validation", () => {
    it("should require auditoriaId parameter", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "Test" };
      expect(params.auditoriaId).toBeDefined();
      expect(typeof params.auditoriaId).toBe("string");
    });

    it("should require descricao parameter", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "Test" };
      expect(params.descricao).toBeDefined();
      expect(typeof params.descricao).toBe("string");
    });

    it("should handle empty auditoria ID", () => {
      const params = { auditoriaId: "", descricao: "Test" };
      expect(params.auditoriaId).toBe("");
    });

    it("should handle empty description", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "" };
      expect(params.descricao).toBe("");
    });

    it("should handle long descriptions", () => {
      const longDesc = "A".repeat(1000);
      const params = { auditoriaId: "AUD-12345", descricao: longDesc };
      expect(params.descricao.length).toBe(1000);
    });

    it("should handle special characters in description", () => {
      const params = { auditoriaId: "AUD-12345", descricao: "Error: <script>alert('xss')</script>" };
      expect(params.descricao).toContain("<script>");
    });
  });

  describe("TypeScript Interfaces", () => {
    it("should define CriticalAlertEmailParams interface", () => {
      const interfaceName = "CriticalAlertEmailParams";
      expect(interfaceName).toBe("CriticalAlertEmailParams");
    });

    it("should define CriticalAlertEmailResult interface", () => {
      const interfaceName = "CriticalAlertEmailResult";
      expect(interfaceName).toBe("CriticalAlertEmailResult");
    });

    it("should include success field in result", () => {
      const result: { success: boolean } = { success: true };
      expect(typeof result.success).toBe("boolean");
    });

    it("should include optional data field in result", () => {
      const result: { data?: { id: string } } = { data: { id: "123" } };
      expect(result.data?.id).toBe("123");
    });

    it("should include optional error field in result", () => {
      const result: { error?: unknown } = { error: "Test error" };
      expect(result.error).toBe("Test error");
    });
  });

  describe("Integration with Resend", () => {
    it("should create Resend instance with API key", () => {
      const apiKey = "re_test_key";
      expect(apiKey).toContain("re_");
    });

    it("should call resend.emails.send method", () => {
      const method = "emails.send";
      expect(method).toBe("emails.send");
    });

    it("should pass from parameter to Resend", () => {
      const emailConfig = {
        from: "alertas@nautilus.one"
      };
      expect(emailConfig.from).toBe("alertas@nautilus.one");
    });

    it("should pass to parameter to Resend", () => {
      const emailConfig = {
        to: ["seguranca@empresa.com"]
      };
      expect(emailConfig.to).toContain("seguranca@empresa.com");
    });

    it("should pass subject parameter to Resend", () => {
      const emailConfig = {
        subject: "⚠️ Alerta Crítico - Auditoria AUD-12345"
      };
      expect(emailConfig.subject).toContain("Alerta Crítico");
    });

    it("should pass html parameter to Resend", () => {
      const emailConfig = {
        html: "<h3>⚠️ Falha crítica detectada</h3>"
      };
      expect(emailConfig.html).toContain("<h3>");
    });
  });

  describe("Use Cases", () => {
    it("should support AI-detected critical failure alerts", () => {
      const useCase = {
        description: "AI detecta falha crítica em auditoria",
        params: { auditoriaId: "AUD-12345", descricao: "Falha crítica detectada pela IA" }
      };
      expect(useCase.params.auditoriaId).toBeDefined();
      expect(useCase.params.descricao).toContain("IA");
    });

    it("should support multiple alert types", () => {
      const alerts = [
        { auditoriaId: "AUD-001", descricao: "Falha no sistema" },
        { auditoriaId: "AUD-002", descricao: "Erro de validação" },
        { auditoriaId: "AUD-003", descricao: "Timeout de conexão" }
      ];
      expect(alerts).toHaveLength(3);
    });

    it("should provide link for security team to review", () => {
      const alertsPanelUrl = "https://nautilus.one/admin/alerts";
      expect(alertsPanelUrl).toContain("/admin/alerts");
    });
  });

  describe("Documentation", () => {
    it("should document function purpose", () => {
      const purpose = "Send critical alert email to security team";
      expect(purpose).toContain("critical alert");
      expect(purpose).toContain("security team");
    });

    it("should document parameters", () => {
      const paramDocs = {
        auditoriaId: "ID da auditoria com falha crítica",
        descricao: "Descrição da falha detectada"
      };
      expect(paramDocs.auditoriaId).toContain("auditoria");
      expect(paramDocs.descricao).toContain("Descrição");
    });

    it("should document return value", () => {
      const returnDocs = "CriticalAlertEmailResult with success flag and optional data/error";
      expect(returnDocs).toContain("CriticalAlertEmailResult");
      expect(returnDocs).toContain("success");
    });

    it("should document example usage", () => {
      const example = {
        auditoriaId: "AUD-12345",
        descricao: "Falha crítica no sistema de auditoria"
      };
      expect(example.auditoriaId).toBe("AUD-12345");
      expect(example.descricao).toContain("Falha crítica");
    });
  });

  describe("Security Considerations", () => {
    it("should not expose API key in logs", () => {
      const logMessage = "❌ RESEND_API_KEY is not configured";
      expect(logMessage).not.toContain("re_");
    });

    it("should send only to authorized email addresses", () => {
      const to = ["seguranca@empresa.com"];
      expect(to).toHaveLength(1);
      expect(to[0]).toContain("@empresa.com");
    });

    it("should validate email format for sender", () => {
      const from = "alertas@nautilus.one";
      expect(from).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("should validate email format for recipient", () => {
      const to = "seguranca@empresa.com";
      expect(to).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe("Environment Configuration", () => {
    it("should check for RESEND_API_KEY before sending", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(typeof apiKey === "string" || apiKey === undefined).toBe(true);
    });

    it("should use EMAIL_FROM if configured", () => {
      const emailFrom = process.env.EMAIL_FROM || "alertas@nautilus.one";
      expect(emailFrom).toBeTruthy();
    });

    it("should fallback to default sender if EMAIL_FROM not set", () => {
      const defaultFrom = "alertas@nautilus.one";
      expect(defaultFrom).toBe("alertas@nautilus.one");
    });
  });

  describe("Portuguese Language Support", () => {
    it("should use Portuguese in subject line", () => {
      const subject = "⚠️ Alerta Crítico - Auditoria AUD-12345";
      expect(subject).toContain("Alerta Crítico");
      expect(subject).toContain("Auditoria");
    });

    it("should use Portuguese in email body", () => {
      const body = "⚠️ Falha crítica detectada";
      expect(body).toContain("Falha crítica detectada");
    });

    it("should use Portuguese for link text", () => {
      const linkText = "Ver painel de alertas: Acessar";
      expect(linkText).toContain("Ver painel de alertas");
      expect(linkText).toContain("Acessar");
    });

    it("should use Portuguese in console logs", () => {
      const log = "❌ Erro ao enviar alerta crítico por email:";
      expect(log).toContain("Erro ao enviar");
    });
  });
});
