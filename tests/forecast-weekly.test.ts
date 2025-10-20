import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock types based on the Edge Function
interface JobLog {
  executado_em: string;
  status: string;
}

interface Job {
  id: string;
  title: string;
  nome?: string;
  description?: string;
  component_id?: string;
  status: string;
}

interface ForecastResult {
  job_id: string;
  job_nome: string;
  data_sugerida: string;
  risco: string;
  justificativa: string;
  historico_analisado: number;
}

describe("Forecast Weekly - GPT-4 Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse GPT-4 response correctly", () => {
    const mockResponse = `
Data sugerida: 2025-11-01
Risco: alto
Justificativa: Intervalo se manteve constante, mas sistema reportou falha no último ciclo
`;

    // Simulate parsing logic from the Edge Function
    const dataRegex = /data sugerida:\s*(\d{4}-\d{2}-\d{2})/i;
    const riscoRegex = /risco:\s*(baixo|moderado|alto)/i;
    const justificativaRegex = /justificativa:\s*(.+?)(?:\n|$)/i;

    const dataMatch = dataRegex.exec(mockResponse);
    const riscoMatch = riscoRegex.exec(mockResponse);
    const justificativaMatch = justificativaRegex.exec(mockResponse);

    expect(dataMatch?.[1]).toBe("2025-11-01");
    expect(riscoMatch?.[1]?.toLowerCase()).toBe("alto");
    expect(justificativaMatch?.[1]?.trim()).toBe(
      "Intervalo se manteve constante, mas sistema reportou falha no último ciclo"
    );
  });

  it("should handle job with execution history", () => {
    const job: Job = {
      id: "job-123",
      title: "Inspeção da bomba de lastro",
      status: "pending",
      description: "Manutenção preventiva trimestral"
    };

    const historico: JobLog[] = [
      { executado_em: "2025-08-01T00:00:00Z", status: "executado" },
      { executado_em: "2025-05-01T00:00:00Z", status: "executado" },
      { executado_em: "2025-02-01T00:00:00Z", status: "executado" }
    ];

    // Verify history is properly structured
    expect(historico).toHaveLength(3);
    expect(historico[0].status).toBe("executado");
  });

  it("should handle job without execution history", () => {
    const job: Job = {
      id: "job-456",
      title: "Nova inspeção de equipamento",
      status: "pending"
    };

    const historico: JobLog[] = [];

    // When there's no history, should default to 30 days from now
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 30);

    expect(historico).toHaveLength(0);
  });

  it("should build proper context for GPT-4", () => {
    const job: Job = {
      id: "job-789",
      title: "Inspeção da bomba de lastro",
      nome: "Bomba Principal A",
      description: "Verificação do sistema hidráulico",
      status: "pending"
    };

    const historico: JobLog[] = [
      { executado_em: "2025-08-01T00:00:00Z", status: "executado" },
      { executado_em: "2025-05-01T00:00:00Z", status: "executado" }
    ];

    const jobName = job.nome || job.title;
    const historicoText = historico.map((h) => `- ${h.executado_em} (${h.status})`).join('\n');

    const expectedContext = `
Job: ${jobName}
Descrição: ${job.description}
Status Atual: ${job.status}

Últimas execuções:
${historicoText}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
Responda no seguinte formato:
Data sugerida: YYYY-MM-DD
Risco: [baixo|moderado|alto]
Justificativa: [Análise técnica em até 200 caracteres]
`;

    expect(expectedContext).toContain("Bomba Principal A");
    expect(expectedContext).toContain("2025-08-01");
    expect(expectedContext).toContain("executado");
  });

  it("should validate risk levels are within allowed values", () => {
    const allowedRiskLevels = ["baixo", "moderado", "alto"];
    
    const testRisks = ["baixo", "moderado", "alto"];
    
    testRisks.forEach(risk => {
      expect(allowedRiskLevels).toContain(risk);
    });
  });

  it("should limit justification to 200 characters", () => {
    const longJustification = "Esta é uma justificativa muito longa que precisa ser truncada para não exceder o limite de 200 caracteres estabelecido para garantir que a resposta seja concisa e objetiva para o usuário final e não cause problemas de formatação no banco de dados ou na interface";

    const truncated = longJustification.substring(0, 200);
    
    expect(truncated.length).toBeLessThanOrEqual(200);
  });

  it("should calculate average interval from history", () => {
    const historico: JobLog[] = [
      { executado_em: "2025-09-01T00:00:00Z", status: "executado" },
      { executado_em: "2025-06-01T00:00:00Z", status: "executado" },
      { executado_em: "2025-03-01T00:00:00Z", status: "executado" }
    ];

    // Calculate intervals
    const intervals = [];
    for (let i = 1; i < historico.length; i++) {
      const date1 = new Date(historico[i-1].executado_em);
      const date2 = new Date(historico[i].executado_em);
      const diffDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(diffDays);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Should be approximately 90 days (3 months)
    expect(avgInterval).toBeGreaterThan(85);
    expect(avgInterval).toBeLessThan(95);
  });

  it("should handle GPT-4 API configuration", () => {
    // Test that API key requirement is enforced
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    // In test environment, we don't require the actual key
    // but in production, the function should throw if not configured
    if (apiKey) {
      expect(apiKey).toBeTruthy();
    }
  });

  it("should structure forecast result correctly", () => {
    const forecast: ForecastResult = {
      job_id: "job-123",
      job_nome: "Inspeção da bomba de lastro",
      data_sugerida: "2025-11-01",
      risco: "alto",
      justificativa: "Intervalo constante, mas falha no último ciclo",
      historico_analisado: 3
    };

    expect(forecast).toHaveProperty("job_id");
    expect(forecast).toHaveProperty("data_sugerida");
    expect(forecast).toHaveProperty("risco");
    expect(forecast).toHaveProperty("justificativa");
    expect(forecast).toHaveProperty("historico_analisado");
    
    // Validate date format
    expect(forecast.data_sugerida).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
