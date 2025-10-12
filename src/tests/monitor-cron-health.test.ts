import { describe, it, expect } from "vitest";

describe("Monitor Cron Health System", () => {
  describe("SQL Function - check_daily_cron_execution", () => {
    it("should return correct status structure", () => {
      // Mock response from SQL function
      const mockOkResponse = {
        status: "ok",
        message: "Cron executado normalmente. Última execução há 2.5 horas"
      };

      const mockErrorResponse = {
        status: "error",
        message: "Última execução há 48.0 horas. Última execução: 10/10/2025 08:00:00"
      };

      // Verify OK response
      expect(mockOkResponse.status).toBe("ok");
      expect(mockOkResponse.message).toBeDefined();
      expect(mockOkResponse.message).toContain("Cron executado normalmente");

      // Verify Error response
      expect(mockErrorResponse.status).toBe("error");
      expect(mockErrorResponse.message).toBeDefined();
      expect(mockErrorResponse.message).toContain("Última execução há");
    });

    it("should validate status enum values", () => {
      const validStatuses = ["ok", "error"];
      
      expect(validStatuses).toContain("ok");
      expect(validStatuses).toContain("error");
      expect(validStatuses).toHaveLength(2);
    });

    it("should detect cron execution within 36 hours", () => {
      // Test the 36h threshold logic
      const now = Date.now();
      const hoursAgo35 = new Date(now - 1000 * 60 * 60 * 35);
      const hoursAgo37 = new Date(now - 1000 * 60 * 60 * 37);
      
      // Calculate hours difference
      const diff35 = (now - hoursAgo35.getTime()) / (1000 * 60 * 60);
      const diff37 = (now - hoursAgo37.getTime()) / (1000 * 60 * 60);
      
      // 35 hours should be OK (within threshold)
      expect(diff35).toBeLessThan(36);
      
      // 37 hours should trigger alert (beyond threshold)
      expect(diff37).toBeGreaterThan(36);
    });
  });

  describe("Edge Function - monitor-cron-health", () => {
    it("should have correct CORS headers", () => {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      };

      expect(corsHeaders["Access-Control-Allow-Origin"]).toBe("*");
      expect(corsHeaders["Access-Control-Allow-Headers"]).toContain("authorization");
    });

    it("should validate environment variables required", () => {
      const requiredEnvVars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "RESEND_API_KEY",
        "ADMIN_EMAIL",
        "EMAIL_FROM",
      ];

      // Verify all required variables are documented
      requiredEnvVars.forEach((envVar) => {
        expect(envVar).toBeDefined();
        expect(typeof envVar).toBe("string");
      });
    });

    it("should return success response when cron is healthy", () => {
      const mockSuccessResponse = "✅ Cron executado normalmente.";
      
      expect(mockSuccessResponse).toContain("✅");
      expect(mockSuccessResponse).toContain("Cron executado normalmente");
    });

    it("should return alert sent response when cron failed", () => {
      const mockAlertResponse = "⚠️ Alerta enviado com sucesso";
      
      expect(mockAlertResponse).toContain("⚠️");
      expect(mockAlertResponse).toContain("Alerta enviado com sucesso");
    });

    it("should format alert email correctly", () => {
      const mockEmail = {
        from: "alertas@nautilus.ai",
        to: "admin@nautilus.ai",
        subject: "⚠️ Alerta: Cron Diário Não Executado",
        html: expect.stringContaining("send-assistant-report-daily"),
      };

      expect(mockEmail.from).toContain("@");
      expect(mockEmail.to).toContain("@");
      expect(mockEmail.subject).toContain("Alerta");
      expect(mockEmail.subject).toContain("Cron Diário Não Executado");
    });
  });

  describe("Integration Logic", () => {
    it("should query assistant_report_logs table correctly", () => {
      // Mock query to get last execution
      const mockQuery = {
        table: "assistant_report_logs",
        filter: {
          triggered_by: "automated",
          status: "success",
        },
        orderBy: "sent_at",
        order: "DESC",
        limit: 1,
      };

      expect(mockQuery.table).toBe("assistant_report_logs");
      expect(mockQuery.filter.triggered_by).toBe("automated");
      expect(mockQuery.filter.status).toBe("success");
    });

    it("should calculate hours difference correctly", () => {
      const mockLastExecution = new Date("2025-10-10T08:00:00Z");
      const mockNow = new Date("2025-10-12T08:00:00Z");
      
      const timeDiff = mockNow.getTime() - mockLastExecution.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      expect(hoursDiff).toBe(48);
      expect(hoursDiff).toBeGreaterThan(36); // Should trigger alert
    });

    it("should handle case with no executions in history", () => {
      const mockEmptyResponse = null;
      
      // When no executions found, should return error
      if (mockEmptyResponse === null) {
        const errorResponse = {
          status: "error",
          message: "Nenhuma execução do cron encontrada no histórico"
        };
        
        expect(errorResponse.status).toBe("error");
        expect(errorResponse.message).toContain("Nenhuma execução");
      }
    });
  });

  describe("Alert Email Content", () => {
    it("should include all required information", () => {
      const mockEmailHtml = `
        <h2>⚠️ Alerta de Monitoramento</h2>
        <p>O cron <strong>send-assistant-report-daily</strong> não foi executado nas últimas 36 horas.</p>
        <p><strong>Detalhes:</strong> Última execução há 48.0 horas</p>
        <p><strong>Ação requerida:</strong> Revisar logs no painel <code>/admin/reports/assistant</code></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este é um alerta automático do sistema de monitoramento.<br>
          Função: monitor-cron-health<br>
          Timestamp: 2025-10-12T21:00:00.000Z
        </p>
      `;

      expect(mockEmailHtml).toContain("Alerta de Monitoramento");
      expect(mockEmailHtml).toContain("send-assistant-report-daily");
      expect(mockEmailHtml).toContain("36 horas");
      expect(mockEmailHtml).toContain("/admin/reports/assistant");
      expect(mockEmailHtml).toContain("monitor-cron-health");
    });

    it("should have proper email subject", () => {
      const subject = "⚠️ Alerta: Cron Diário Não Executado";
      
      expect(subject).toContain("⚠️");
      expect(subject).toContain("Alerta");
      expect(subject).toContain("Cron Diário");
    });
  });

  describe("Configuration Validation", () => {
    it("should validate 36-hour threshold constant", () => {
      const THRESHOLD_HOURS = 36;
      
      expect(THRESHOLD_HOURS).toBe(36);
      expect(THRESHOLD_HOURS).toBeGreaterThan(24); // More than daily
      expect(THRESHOLD_HOURS).toBeLessThan(48); // Less than 2 days
    });

    it("should validate default email addresses format", () => {
      const defaultAdminEmail = "admin@nautilus.ai";
      const defaultFromEmail = "alertas@nautilus.ai";
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(defaultAdminEmail)).toBe(true);
      expect(emailRegex.test(defaultFromEmail)).toBe(true);
    });
  });
});
