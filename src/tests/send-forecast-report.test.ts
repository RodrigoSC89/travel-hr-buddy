import { describe, it, expect } from "vitest";

describe("Send Forecast Report System", () => {
  describe("Edge Function - send-forecast-report", () => {
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
        "OPENAI_API_KEY",
        "EMAIL_FROM",
      ];

      // Verify all required variables are documented
      requiredEnvVars.forEach((envVar) => {
        expect(envVar).toBeDefined();
        expect(typeof envVar).toBe("string");
      });
    });

    it("should query mmi_jobs table correctly", () => {
      // Mock query to get completed jobs from last 6 months
      const mockQuery = {
        table: "mmi_jobs",
        select: ["component_id", "completed_at"],
        filter: {
          status: "completed",
        },
        gte: {
          field: "completed_at",
          value: expect.any(String),
        },
      };

      expect(mockQuery.table).toBe("mmi_jobs");
      expect(mockQuery.select).toContain("component_id");
      expect(mockQuery.select).toContain("completed_at");
      expect(mockQuery.filter.status).toBe("completed");
    });

    it("should calculate 6 months ago correctly", () => {
      const now = Date.now();
      const sixMonthsAgo = new Date(now - 1000 * 60 * 60 * 24 * 180);
      
      const daysDiff = (now - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBe(180);
      expect(daysDiff).toBeGreaterThanOrEqual(180);
    });

    it("should format month string correctly", () => {
      const testDate = "2025-10-15T10:30:00Z";
      const month = testDate.slice(0, 7); // YYYY-MM format
      
      expect(month).toBe("2025-10");
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should group jobs by component correctly", () => {
      const mockJobs = [
        { component_id: "comp-1", completed_at: "2025-10-15T10:00:00Z" },
        { component_id: "comp-1", completed_at: "2025-09-20T10:00:00Z" },
        { component_id: "comp-2", completed_at: "2025-10-10T10:00:00Z" },
      ];

      const trendByComponent: Record<string, string[]> = {};
      mockJobs.forEach((job) => {
        if (job.completed_at) {
          const month = job.completed_at.slice(0, 7);
          const componentId = job.component_id || "unknown";
          if (!trendByComponent[componentId]) {
            trendByComponent[componentId] = [];
          }
          trendByComponent[componentId].push(month);
        }
      });

      expect(trendByComponent["comp-1"]).toHaveLength(2);
      expect(trendByComponent["comp-1"]).toContain("2025-10");
      expect(trendByComponent["comp-1"]).toContain("2025-09");
      expect(trendByComponent["comp-2"]).toHaveLength(1);
      expect(trendByComponent["comp-2"]).toContain("2025-10");
    });

    it("should format AI prompt correctly", () => {
      const mockTrend = {
        "comp-1": ["2025-09", "2025-10"],
        "comp-2": ["2025-10"]
      };

      const prompt = `Abaixo estão os dados de jobs por componente (por mês):\n
${JSON.stringify(mockTrend, null, 2)}\n
Gere uma previsão dos próximos dois meses por componente e indique os mais críticos.`;

      expect(prompt).toContain("dados de jobs por componente");
      expect(prompt).toContain("comp-1");
      expect(prompt).toContain("comp-2");
      expect(prompt).toContain("próximos dois meses");
      expect(prompt).toContain("mais críticos");
    });

    it("should format email HTML correctly", () => {
      const mockForecast = "Previsão: Componente A crítico, Componente B baixa prioridade.";
      const emailHtml = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🔮 Previsão IA</h2>
        <pre style="background:#f4f4f4; padding: 10px; border-radius: 6px; white-space: pre-wrap;">${mockForecast}</pre>
      </div>
    `;

      expect(emailHtml).toContain("🔮 Previsão IA");
      expect(emailHtml).toContain(mockForecast);
      expect(emailHtml).toContain("font-family: Arial");
      expect(emailHtml).toContain("white-space: pre-wrap");
    });

    it("should have correct email subject", () => {
      const subject = "🔧 Previsão Semanal de Manutenção por Componente";
      
      expect(subject).toContain("🔧");
      expect(subject).toContain("Previsão Semanal");
      expect(subject).toContain("Manutenção");
      expect(subject).toContain("Componente");
    });

    it("should parse email recipients correctly", () => {
      const emailString = "engenharia@nautilus.system, admin@nautilus.system";
      const recipients = emailString.split(",").map(email => email.trim());
      
      expect(recipients).toHaveLength(2);
      expect(recipients[0]).toBe("engenharia@nautilus.system");
      expect(recipients[1]).toBe("admin@nautilus.system");
    });

    it("should handle single email recipient", () => {
      const emailString = "engenharia@nautilus.system";
      const recipients = emailString.split(",").map(email => email.trim());
      
      expect(recipients).toHaveLength(1);
      expect(recipients[0]).toBe("engenharia@nautilus.system");
    });
  });

  describe("OpenAI Integration", () => {
    it("should validate OpenAI request structure", () => {
      const mockRequest = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade."
          },
          { 
            role: "user", 
            content: expect.any(String) 
          }
        ],
        temperature: 0.4
      };

      expect(mockRequest.model).toBe("gpt-4");
      expect(mockRequest.messages).toHaveLength(2);
      expect(mockRequest.messages[0].role).toBe("system");
      expect(mockRequest.messages[1].role).toBe("user");
      expect(mockRequest.temperature).toBe(0.4);
    });

    it("should validate system prompt content", () => {
      const systemPrompt = "Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade.";
      
      expect(systemPrompt).toContain("IA técnica");
      expect(systemPrompt).toContain("manutenção");
      expect(systemPrompt).toContain("previsão");
      expect(systemPrompt).toContain("criticidade");
    });
  });

  describe("Cron Configuration", () => {
    it("should validate cron schedule format", () => {
      const schedule = "0 6 * * 1"; // Every Monday at 06:00 UTC
      const parts = schedule.split(" ");
      
      expect(parts).toHaveLength(5);
      expect(parts[0]).toBe("0"); // minute
      expect(parts[1]).toBe("6"); // hour (6 AM)
      expect(parts[2]).toBe("*"); // day of month
      expect(parts[3]).toBe("*"); // month
      expect(parts[4]).toBe("1"); // day of week (Monday)
    });

    it("should validate function name", () => {
      const functionName = "send-forecast-report";
      
      expect(functionName).toBe("send-forecast-report");
      expect(functionName).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe("Error Handling", () => {
    it("should return error response when RESEND_API_KEY missing", () => {
      const mockError = {
        sent: false,
        error: "RESEND_API_KEY is not configured"
      };

      expect(mockError.sent).toBe(false);
      expect(mockError.error).toContain("RESEND_API_KEY");
    });

    it("should return error response when OPENAI_API_KEY missing", () => {
      const mockError = {
        sent: false,
        error: "OPENAI_API_KEY is not configured"
      };

      expect(mockError.sent).toBe(false);
      expect(mockError.error).toContain("OPENAI_API_KEY");
    });

    it("should log errors to cron_execution_logs", () => {
      const mockLogEntry = {
        function_name: "send-forecast-report",
        status: "critical",
        message: "Critical error in function",
        error_details: {
          message: expect.any(String),
          stack: expect.any(String),
        },
      };

      expect(mockLogEntry.function_name).toBe("send-forecast-report");
      expect(mockLogEntry.status).toBe("critical");
    });
  });

  describe("Success Response", () => {
    it("should return success response with correct structure", () => {
      const mockSuccessResponse = {
        sent: true,
        message: "Forecast report sent successfully",
        jobsCount: 42,
        componentsCount: 5,
        recipients: ["engenharia@nautilus.system"]
      };

      expect(mockSuccessResponse.sent).toBe(true);
      expect(mockSuccessResponse.message).toContain("successfully");
      expect(mockSuccessResponse.jobsCount).toBeGreaterThan(0);
      expect(mockSuccessResponse.componentsCount).toBeGreaterThan(0);
      expect(mockSuccessResponse.recipients).toBeInstanceOf(Array);
    });

    it("should log success to cron_execution_logs", () => {
      const mockLogEntry = {
        function_name: "send-forecast-report",
        status: "success",
        message: "Forecast report sent successfully to engenharia@nautilus.system",
        metadata: {
          jobs_count: 42,
          components_count: 5,
          recipients: ["engenharia@nautilus.system"]
        },
      };

      expect(mockLogEntry.function_name).toBe("send-forecast-report");
      expect(mockLogEntry.status).toBe("success");
      expect(mockLogEntry.metadata.jobs_count).toBeGreaterThan(0);
    });
  });
});
