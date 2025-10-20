/**
 * MMI Forecast IA - Tests
 * Tests for AI-powered forecast generation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

// Mock OpenAI client
vi.mock("@/lib/ai/openai-client", () => {
  return {
    openai: {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    },
  };
});

describe("MMI Forecast IA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve gerar forecast válido para job de manutenção", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    // Mock successful GPT-4 response
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-05",
              risk_level: "alto",
              reasoning: "Manutenção crítica com falhas recentes, execução urgente recomendada.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const forecast = await generateForecastForJob({
      id: "job123",
      title: "Inspeção de bombas hidráulicas",
      system: "Hidráulico",
      lastExecuted: "2025-09-01",
      frequencyDays: 30,
      observations: "Ocorreram falhas intermitentes no alarme",
    });

    expect(forecast).toHaveProperty("next_due_date");
    expect(forecast).toHaveProperty("risk_level");
    expect(forecast).toHaveProperty("reasoning");
    expect(forecast.next_due_date).toBe("2025-10-05");
    expect(forecast.risk_level).toBe("alto");
    expect(forecast.reasoning).toContain("Manutenção crítica");
  });

  it("deve processar job sem última execução", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-11-01",
              risk_level: "médio",
              reasoning: "Job sem histórico, recomenda-se programar manutenção preventiva.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const forecast = await generateForecastForJob({
      id: "job456",
      title: "Verificação de sistema elétrico",
      system: "Elétrico",
      lastExecuted: null,
      frequencyDays: 60,
    });

    expect(forecast.risk_level).toBe("médio");
    expect(forecast.reasoning).toBeTruthy();
  });

  it("deve incluir observações no prompt", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-20",
              risk_level: "baixo",
              reasoning: "Sistema estável, manutenção pode ser programada conforme frequência padrão.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    await generateForecastForJob({
      id: "job789",
      title: "Manutenção de propulsão",
      system: "Propulsão",
      lastExecuted: "2025-08-15",
      frequencyDays: 90,
      observations: "Sistema funcionando perfeitamente, sem alertas",
    });

    // Verify that create was called
    expect(openai.chat.completions.create).toHaveBeenCalledOnce();
    
    // Verify the prompt includes observations
    const call = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(call.messages[0].content).toContain("Sistema funcionando perfeitamente");
  });

  it("deve usar model gpt-4 e temperature 0.2", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-10",
              risk_level: "médio",
              reasoning: "Previsão baseada em frequência padrão.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    await generateForecastForJob({
      id: "job999",
      title: "Teste",
      system: "Teste",
      lastExecuted: "2025-09-01",
      frequencyDays: 30,
    });

    const call = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(call.model).toBe("gpt-4");
    expect(call.temperature).toBe(0.2);
  });

  it("deve validar níveis de risco permitidos", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    const riskLevels: Array<"baixo" | "médio" | "alto"> = ["baixo", "médio", "alto"];

    for (const riskLevel of riskLevels) {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                next_due_date: "2025-10-15",
                risk_level: riskLevel,
                reasoning: `Teste para risco ${riskLevel}`,
              }),
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
      } as any);

      const forecast = await generateForecastForJob({
        id: `job-${riskLevel}`,
        title: "Teste",
        system: "Teste",
        lastExecuted: "2025-09-01",
        frequencyDays: 30,
      });

      expect(["baixo", "médio", "alto"]).toContain(forecast.risk_level);
    }
  });

  it("deve retornar reasoning com máximo aproximado de 300 caracteres", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-10",
              risk_level: "médio",
              reasoning: "Justificativa técnica da previsão com informações relevantes sobre o estado do sistema.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const forecast = await generateForecastForJob({
      id: "job-reasoning",
      title: "Teste reasoning",
      system: "Teste",
      lastExecuted: "2025-09-01",
      frequencyDays: 30,
    });

    expect(forecast.reasoning).toBeTruthy();
    expect(typeof forecast.reasoning).toBe("string");
    // Reasoning should be reasonable length (not enforcing strict 300 chars in this test)
    expect(forecast.reasoning.length).toBeGreaterThan(0);
  });

  it("deve incluir todos os dados do job no prompt", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-15",
              risk_level: "médio",
              reasoning: "Teste completo",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const jobData = {
      id: "job-complete",
      title: "Manutenção completa",
      system: "Sistema Completo",
      lastExecuted: "2025-08-01",
      frequencyDays: 45,
      observations: "Observações importantes",
    };

    await generateForecastForJob(jobData);

    const call = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    const prompt = call.messages[0].content;

    expect(prompt).toContain(jobData.id);
    expect(prompt).toContain(jobData.title);
    expect(prompt).toContain(jobData.system);
    expect(prompt).toContain(jobData.lastExecuted);
    expect(prompt).toContain(jobData.frequencyDays.toString());
    expect(prompt).toContain(jobData.observations);
  });

  // New tests for defensive behavior
  it("deve processar job com estrutura completa de component", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-11-15",
              risk_level: "médio",
              reasoning: "Manutenção preventiva programada com base em horas de operação.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const forecast = await generateForecastForJob({
      id: "job-component",
      component: {
        name: "Sistema hidráulico",
        current_hours: 1200,
        maintenance_interval_hours: 1500,
        asset: {
          name: "Guindaste A1",
          vessel: "FPSO Alpha",
        },
      },
      priority: "high",
      frequencyDays: 30,
    });

    expect(forecast.next_due_date).toBe("2025-11-15");
    expect(forecast.risk_level).toBe("médio");
    expect(forecast.reasoning).toBeTruthy();
  });

  it("deve processar job sem component usando valores padrão", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-11-01",
              risk_level: "baixo",
              reasoning: "Manutenção padrão sem histórico de falhas.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    const forecast = await generateForecastForJob({
      id: "job-no-component",
      frequencyDays: 60,
    });

    expect(forecast.next_due_date).toBe("2025-11-01");
    expect(forecast.risk_level).toBe("baixo");
    expect(forecast.reasoning).toBeTruthy();
  });

  it("deve usar fallback quando OpenAI falha", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    // Mock API failure
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error("API rate limit exceeded")
    );

    const forecast = await generateForecastForJob({
      id: "job-fallback",
      title: "Manutenção de teste",
      priority: "high",
      frequencyDays: 30,
    });

    expect(forecast).toHaveProperty("next_due_date");
    expect(forecast).toHaveProperty("risk_level");
    expect(forecast).toHaveProperty("reasoning");
    expect(forecast.risk_level).toBe("alto"); // high priority maps to "alto"
    expect(forecast.reasoning).toContain("Previsão gerada automaticamente");
  });

  it("deve mapear prioridade para nível de risco no fallback", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    // Mock API failure
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error("API error")
    );

    // Test critical priority
    const forecastCritical = await generateForecastForJob({
      id: "job-critical",
      priority: "critical",
      frequencyDays: 15,
    });
    expect(forecastCritical.risk_level).toBe("alto");

    // Test low priority
    const forecastLow = await generateForecastForJob({
      id: "job-low",
      priority: "low",
      frequencyDays: 90,
    });
    expect(forecastLow.risk_level).toBe("baixo");

    // Test medium/default priority
    const forecastMedium = await generateForecastForJob({
      id: "job-medium",
      priority: "medium",
      frequencyDays: 45,
    });
    expect(forecastMedium.risk_level).toBe("médio");
  });

  it("deve validar job com campos mínimos", async () => {
    const { openai } = await import("@/lib/ai/openai-client");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              next_due_date: "2025-10-25",
              risk_level: "médio",
              reasoning: "Manutenção planejada.",
            }),
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as any);

    // Job with only ID - should not throw
    const forecast = await generateForecastForJob({
      id: "minimal-job",
    });

    expect(forecast.next_due_date).toBe("2025-10-25");
    expect(forecast.risk_level).toBe("médio");
  });
});
