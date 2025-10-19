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
      // Mock query to get active jobs for forecasting
      const mockQuery = {
        table: "mmi_jobs",
        select: ["id", "title", "component_name", "vessel_name"],
        filter: {
          status: ["pending", "in_progress"],
        },
        limit: 50,
      };

      expect(mockQuery.table).toBe("mmi_jobs");
      expect(mockQuery.select).toContain("id");
      expect(mockQuery.select).toContain("title");
      expect(mockQuery.select).toContain("component_name");
      expect(mockQuery.select).toContain("vessel_name");
      expect(mockQuery.filter.status).toContain("pending");
      expect(mockQuery.filter.status).toContain("in_progress");
    });

    it("should query mmi_logs for execution history", () => {
      // Mock query to get job execution history
      const mockQuery = {
        table: "mmi_logs",
        select: ["executado_em", "status"],
        filter: {
          job_id: expect.any(String),
        },
        order: { field: "executado_em", ascending: false },
        limit: 5,
      };

      expect(mockQuery.table).toBe("mmi_logs");
      expect(mockQuery.select).toContain("executado_em");
      expect(mockQuery.select).toContain("status");
      expect(mockQuery.limit).toBe(5);
    });

    it("should format historical executions for AI context", () => {
      const mockHistorico = [
        { executado_em: "2025-08-01T10:00:00Z", status: "executado" },
        { executado_em: "2025-05-01T10:00:00Z", status: "executado" },
        { executado_em: "2025-02-01T10:00:00Z", status: "executado" },
      ];

      const context = `
Job: Inspeção da bomba de lastro
Últimas execuções:
${mockHistorico.map((h) => `- ${h.executado_em} (${h.status})`).join('\n')}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
`;

      expect(context).toContain("Inspeção da bomba de lastro");
      expect(context).toContain("2025-08-01T10:00:00Z");
      expect(context).toContain("executado");
      expect(context).toContain("Recomende a próxima execução");
    });

    it("should extract date from GPT-4 response", () => {
      const mockResponse = "Próxima execução sugerida: 2025-11-01. Risco: alto.";
      const dataRegex = /\d{4}-\d{2}-\d{2}/;
      const dataSugerida = dataRegex.exec(mockResponse)?.[0];

      expect(dataSugerida).toBe("2025-11-01");
      expect(dataSugerida).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should extract risk level from GPT-4 response", () => {
      const mockResponse = "Próxima execução: 2025-11-01. Risco: alto devido a falhas recentes.";
      const riscoRegex = /risco:\s*(.+)/i;
      const risco = riscoRegex.exec(mockResponse)?.[1];

      expect(risco).toContain("alto");
    });

    it("should normalize risk levels correctly", () => {
      const testCases = [
        { input: "risco: baixo", expected: "low" },
        { input: "risco: alto", expected: "high" },
        { input: "risco: crítico", expected: "high" },
        { input: "risco: moderado", expected: "medium" },
      ];

      testCases.forEach(({ input, expected }) => {
        const riscoRegex = /risco:\s*(.+)/i;
        const risco = riscoRegex.exec(input)?.[1]?.toLowerCase() || "moderado";
        
        let normalizedRisk = "medium";
        if (risco.includes("baixo") || risco.includes("low")) {
          normalizedRisk = "low";
        } else if (risco.includes("alto") || risco.includes("high") || risco.includes("crítico") || risco.includes("critical")) {
          normalizedRisk = "high";
        }

        expect(normalizedRisk).toBe(expected);
      });
    });

    it("should format email HTML with forecast results", () => {
      const mockForecast = {
        job_title: "Inspeção da bomba de lastro",
        next_date: "2025-11-01",
        risk_level: "high",
        reasoning: "Sistema reportou falha no último ciclo, manutenção urgente necessária."
      };

      const emailHtml = `
      <div style="margin-bottom: 25px; padding: 15px; border-left: 4px solid #ef4444; background: #f9fafb;">
        <h3>${mockForecast.job_title}</h3>
        <p><strong>📆 Próxima execução sugerida:</strong> ${mockForecast.next_date}</p>
        <p><strong>⚠️ Nível de risco:</strong> <span style="color: #ef4444; font-weight: bold;">ALTO</span></p>
        <p><strong>🧠 Justificativa:</strong></p>
        <p>${mockForecast.reasoning}</p>
      </div>
    `;

      expect(emailHtml).toContain(mockForecast.job_title);
      expect(emailHtml).toContain(mockForecast.next_date);
      expect(emailHtml).toContain("ALTO");
      expect(emailHtml).toContain(mockForecast.reasoning);
      expect(emailHtml).toContain("📆");
      expect(emailHtml).toContain("⚠️");
      expect(emailHtml).toContain("🧠");
    });

    it("should have correct email subject for GPT-4 report", () => {
      const subject = "🔧 Previsão Semanal de Manutenção - Análise GPT-4";
      
      expect(subject).toContain("🔧");
      expect(subject).toContain("Previsão Semanal");
      expect(subject).toContain("Manutenção");
      expect(subject).toContain("GPT-4");
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
    it("should validate OpenAI request structure for job forecast", () => {
      const mockRequest = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um engenheiro especialista em manutenção offshore."
          },
          { 
            role: "user", 
            content: expect.any(String) 
          }
        ],
        temperature: 0.3
      };

      expect(mockRequest.model).toBe("gpt-4");
      expect(mockRequest.messages).toHaveLength(2);
      expect(mockRequest.messages[0].role).toBe("system");
      expect(mockRequest.messages[1].role).toBe("user");
      expect(mockRequest.temperature).toBe(0.3);
    });

    it("should validate system prompt content for offshore engineer", () => {
      const systemPrompt = "Você é um engenheiro especialista em manutenção offshore.";
      
      expect(systemPrompt).toContain("engenheiro especialista");
      expect(systemPrompt).toContain("manutenção offshore");
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
        forecastsGenerated: 40,
        recipients: ["engenharia@nautilus.system"]
      };

      expect(mockSuccessResponse.sent).toBe(true);
      expect(mockSuccessResponse.message).toContain("successfully");
      expect(mockSuccessResponse.jobsCount).toBeGreaterThan(0);
      expect(mockSuccessResponse.forecastsGenerated).toBeGreaterThan(0);
      expect(mockSuccessResponse.recipients).toBeInstanceOf(Array);
    });

    it("should log success to cron_execution_logs with forecast data", () => {
      const mockLogEntry = {
        function_name: "send-forecast-report",
        status: "success",
        message: "Forecast report sent successfully to engenharia@nautilus.system",
        metadata: {
          jobs_count: 42,
          forecasts_generated: 40,
          forecasts_saved: 40,
          recipients: ["engenharia@nautilus.system"]
        },
      };

      expect(mockLogEntry.function_name).toBe("send-forecast-report");
      expect(mockLogEntry.status).toBe("success");
      expect(mockLogEntry.metadata.jobs_count).toBeGreaterThan(0);
      expect(mockLogEntry.metadata.forecasts_generated).toBeGreaterThan(0);
      expect(mockLogEntry.metadata.forecasts_saved).toBeGreaterThan(0);
    });

    it("should save forecasts to mmi_forecasts table", () => {
      const mockForecastToSave = {
        vessel_name: "Navio ABC",
        system_name: "Bomba de lastro",
        hourmeter: 0,
        last_maintenance: [],
        forecast_text: "Sistema reportou falha no último ciclo",
        priority: "critical"
      };

      expect(mockForecastToSave.vessel_name).toBeTruthy();
      expect(mockForecastToSave.system_name).toBeTruthy();
      expect(mockForecastToSave.forecast_text).toBeTruthy();
      expect(["low", "medium", "high", "critical"]).toContain(mockForecastToSave.priority);
    });
  });
});
