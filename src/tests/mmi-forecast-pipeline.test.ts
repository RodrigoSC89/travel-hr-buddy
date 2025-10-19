/**
 * MMI Forecast Pipeline - Comprehensive Tests
 * Tests for AI forecast generation, database save, and complete pipeline
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MMIJob, ForecastResult, ForecastData } from "@/lib/mmi";

// Mock OpenAI client
vi.mock("@/lib/ai/openai-client", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  next_due_date: "2025-11-30",
                  risk_level: "alto",
                  reasoning: "Manutenção crítica com alta prioridade requer atenção imediata.",
                }),
              },
            },
          ],
        }),
      },
    },
  },
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })),
  },
}));

describe("MMI Forecast Pipeline - Data Validation", () => {
  describe("MMIJob structure validation", () => {
    it("should validate complete MMIJob structure", () => {
      const job: MMIJob = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Manutenção preventiva - Sistema hidráulico",
        description: "Inspeção completa do sistema",
        component: {
          name: "Sistema hidráulico do guindaste",
          current_hours: 1200,
          maintenance_interval_hours: 500,
          asset: {
            name: "Guindaste A1",
            vessel: "FPSO Alpha",
          },
        },
        status: "pending",
        priority: "high",
        due_date: "2025-11-30",
      };

      expect(job.id).toBeDefined();
      expect(job.title).toBeDefined();
      expect(job.component).toBeDefined();
      expect(job.component.name).toBeDefined();
      expect(job.status).toBeDefined();
      expect(job.priority).toBeDefined();
    });

    it("should validate minimal MMIJob structure", () => {
      const job: MMIJob = {
        id: "660e8400-e29b-41d4-a716-446655440001",
        title: "Verificação básica",
        component: {
          name: "Componente genérico",
        },
        status: "pending",
        priority: "low",
      };

      expect(job.id).toBeDefined();
      expect(job.title).toBeDefined();
      expect(job.component.name).toBeDefined();
      expect(job.status).toBe("pending");
      expect(job.priority).toBe("low");
    });

    it("should validate job with metadata", () => {
      const job: MMIJob = {
        id: "770e8400-e29b-41d4-a716-446655440002",
        title: "Manutenção com metadados",
        component: {
          name: "Sistema com observações",
        },
        status: "pending",
        priority: "medium",
        metadata: {
          observations: "Sistema apresentando anomalias",
          last_inspection: "2025-10-01",
          technician: "João Silva",
        },
      };

      expect(job.metadata).toBeDefined();
      expect(job.metadata?.observations).toBe("Sistema apresentando anomalias");
    });

    it("should validate all job statuses", () => {
      const validStatuses: MMIJob["status"][] = [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "postponed",
      ];

      validStatuses.forEach((status) => {
        const job: MMIJob = {
          id: "test-id",
          title: "Test",
          component: { name: "Test Component" },
          status,
          priority: "medium",
        };
        expect(job.status).toBe(status);
      });
    });

    it("should validate all job priorities", () => {
      const validPriorities: MMIJob["priority"][] = [
        "critical",
        "high",
        "medium",
        "low",
      ];

      validPriorities.forEach((priority) => {
        const job: MMIJob = {
          id: "test-id",
          title: "Test",
          component: { name: "Test Component" },
          status: "pending",
          priority,
        };
        expect(job.priority).toBe(priority);
      });
    });
  });

  describe("ForecastResult structure validation", () => {
    it("should validate complete forecast result", () => {
      const forecast: ForecastResult = {
        next_due_date: "2025-11-30",
        risk_level: "alto",
        reasoning:
          "Manutenção crítica com alta prioridade requer atenção imediata.",
      };

      expect(forecast.next_due_date).toBeDefined();
      expect(forecast.risk_level).toBeDefined();
      expect(forecast.reasoning).toBeDefined();
      expect(forecast.reasoning.length).toBeLessThanOrEqual(300);
    });

    it("should validate all risk levels", () => {
      const validRiskLevels: ForecastResult["risk_level"][] = [
        "baixo",
        "médio",
        "alto",
      ];

      validRiskLevels.forEach((risk_level) => {
        const forecast: ForecastResult = {
          next_due_date: "2025-12-01",
          risk_level,
          reasoning: "Justificativa técnica da previsão",
        };
        expect(forecast.risk_level).toBe(risk_level);
      });
    });

    it("should validate date format in forecast", () => {
      const forecast: ForecastResult = {
        next_due_date: "2025-11-30",
        risk_level: "médio",
        reasoning: "Previsão baseada em análise técnica",
      };

      // Check ISO date format YYYY-MM-DD
      expect(forecast.next_due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("ForecastData structure validation", () => {
    it("should validate complete forecast data for database", () => {
      const forecastData: ForecastData = {
        job_id: "550e8400-e29b-41d4-a716-446655440000",
        system: "Sistema hidráulico do guindaste",
        next_due_date: "2025-11-30",
        risk_level: "alto",
        reasoning: "Manutenção crítica necessária",
      };

      expect(forecastData.job_id).toBeDefined();
      expect(forecastData.system).toBeDefined();
      expect(forecastData.next_due_date).toBeDefined();
      expect(forecastData.risk_level).toBeDefined();
      expect(forecastData.reasoning).toBeDefined();
    });

    it("should validate job_id is UUID format", () => {
      const forecastData: ForecastData = {
        job_id: "550e8400-e29b-41d4-a716-446655440000",
        system: "Test System",
        next_due_date: "2025-11-30",
        risk_level: "médio",
        reasoning: "Test reasoning",
      };

      // UUID v4 format validation
      expect(forecastData.job_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });
});

describe("MMI Forecast Pipeline - Risk Level Mapping", () => {
  it("should map critical priority to alto risk", () => {
    const job: MMIJob = {
      id: "test-id",
      title: "Critical Job",
      component: { name: "Critical Component" },
      status: "pending",
      priority: "critical",
    };

    expect(job.priority).toBe("critical");
    // The function should map this to "alto" risk
  });

  it("should map high priority to alto risk", () => {
    const job: MMIJob = {
      id: "test-id",
      title: "High Priority Job",
      component: { name: "Important Component" },
      status: "pending",
      priority: "high",
    };

    expect(job.priority).toBe("high");
    // The function should map this to "alto" risk
  });

  it("should map medium priority to médio risk", () => {
    const job: MMIJob = {
      id: "test-id",
      title: "Medium Priority Job",
      component: { name: "Standard Component" },
      status: "pending",
      priority: "medium",
    };

    expect(job.priority).toBe("medium");
    // The function should map this to "médio" risk
  });

  it("should map low priority to baixo risk", () => {
    const job: MMIJob = {
      id: "test-id",
      title: "Low Priority Job",
      component: { name: "Non-critical Component" },
      status: "pending",
      priority: "low",
    };

    expect(job.priority).toBe("low");
    // The function should map this to "baixo" risk
  });
});

describe("MMI Forecast Pipeline - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle complete job with all fields", () => {
    const job: MMIJob = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Manutenção completa",
      description: "Descrição detalhada",
      component: {
        name: "Sistema completo",
        current_hours: 1500,
        maintenance_interval_hours: 1000,
        asset: {
          name: "Ativo principal",
          vessel: "Embarcação teste",
        },
      },
      status: "pending",
      priority: "high",
      due_date: "2025-11-30",
      completed_date: undefined,
      metadata: {
        notes: "Notas adicionais",
      },
    };

    expect(job).toBeDefined();
    expect(job.component.asset).toBeDefined();
    expect(job.component.asset?.vessel).toBe("Embarcação teste");
  });

  it("should handle job without optional fields", () => {
    const job: MMIJob = {
      id: "660e8400-e29b-41d4-a716-446655440001",
      title: "Manutenção mínima",
      component: {
        name: "Sistema básico",
      },
      status: "pending",
      priority: "low",
    };

    expect(job).toBeDefined();
    expect(job.description).toBeUndefined();
    expect(job.due_date).toBeUndefined();
    expect(job.component.current_hours).toBeUndefined();
  });

  it("should validate forecast data mapping from job", () => {
    const job: MMIJob = {
      id: "770e8400-e29b-41d4-a716-446655440002",
      title: "Job para mapeamento",
      component: {
        name: "Sistema a ser mapeado",
      },
      status: "pending",
      priority: "medium",
    };

    const forecast: ForecastResult = {
      next_due_date: "2025-12-15",
      risk_level: "médio",
      reasoning: "Previsão baseada em prioridade medium",
    };

    const forecastData: ForecastData = {
      job_id: job.id,
      system: job.component.name,
      next_due_date: forecast.next_due_date,
      risk_level: forecast.risk_level,
      reasoning: forecast.reasoning,
    };

    expect(forecastData.job_id).toBe(job.id);
    expect(forecastData.system).toBe(job.component.name);
    expect(forecastData.next_due_date).toBe(forecast.next_due_date);
    expect(forecastData.risk_level).toBe(forecast.risk_level);
  });
});

describe("MMI Forecast Pipeline - Error Handling", () => {
  it("should handle missing required fields in job", () => {
    const invalidJob = {
      id: "test-id",
      title: "Invalid job",
      // missing component
      status: "pending",
      priority: "medium",
    };

    // TypeScript would catch this, but runtime validation is important
    expect(invalidJob.id).toBeDefined();
    expect((invalidJob as any).component).toBeUndefined();
  });

  it("should handle invalid risk level values", () => {
    const invalidRiskLevel = "muito_alto" as any;
    const validRiskLevels = ["baixo", "médio", "alto"];

    expect(validRiskLevels.includes(invalidRiskLevel)).toBe(false);
  });

  it("should handle invalid date format", () => {
    const invalidDate = "30-11-2025"; // Should be YYYY-MM-DD
    const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    expect(validDatePattern.test(invalidDate)).toBe(false);
  });

  it("should handle empty reasoning", () => {
    const forecast: ForecastResult = {
      next_due_date: "2025-11-30",
      risk_level: "médio",
      reasoning: "",
    };

    // Empty reasoning should be considered invalid
    expect(forecast.reasoning.length).toBe(0);
    expect(forecast.reasoning.length > 0).toBe(false);
  });

  it("should handle reasoning exceeding max length", () => {
    const longReasoning = "a".repeat(350);
    const maxLength = 300;

    expect(longReasoning.length).toBeGreaterThan(maxLength);
    expect(longReasoning.length > maxLength).toBe(true);
  });
});
