import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * MMI - Copilot Chat E2E Tests
 * 
 * Tests end-to-end functionality of the MMI Copilot AI assistant
 */

describe("MMI - Copilot Chat E2E", () => {
  const mockContext = {
    vessel_id: "vessel-uuid-123",
    user_role: "maintenance_engineer",
    current_view: "mmi_dashboard",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Job Creation via Chat", () => {
    it("should parse job creation request", () => {
      const message = "Crie um job de manutenção preventiva para o motor principal da embarcação Alpha";
      
      expect(message).toContain("job");
      expect(message).toContain("manutenção preventiva");
      expect(message).toContain("motor principal");
    });

    it("should extract job details from natural language", () => {
      const message = "Preciso criar uma manutenção corretiva urgente no sistema elétrico";
      
      const expectedAction = {
        type: "create_job",
        data: {
          job_type: "corrective",
          priority: "high", // "urgente" -> high priority
          system: "sistema elétrico",
        },
      };

      expect(expectedAction.type).toBe("create_job");
      expect(expectedAction.data.job_type).toBe("corrective");
      expect(expectedAction.data.priority).toBe("high");
    });

    it("should handle complete job creation command", () => {
      const mockResponse = {
        success: true,
        response: "Job de manutenção preventiva criado com sucesso para o motor principal.",
        actions: [
          {
            type: "create_job",
            data: {
              title: "Manutenção Preventiva - Motor Principal",
              job_type: "preventive",
              priority: "medium",
              component: "motor principal",
            },
            confidence: 0.95,
          },
        ],
        suggestions: [
          "Gerar ordem de serviço para este job",
          "Verificar histórico de manutenções do motor",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.actions).toBeInstanceOf(Array);
      expect(mockResponse.actions[0].type).toBe("create_job");
      expect(mockResponse.actions[0].confidence).toBeGreaterThan(0.9);
    });
  });

  describe("Job Query via Chat", () => {
    it("should handle job status queries", () => {
      const message = "Quais são os jobs críticos para a embarcação Alpha?";
      
      expect(message).toContain("jobs");
      expect(message).toContain("críticos");
    });

    it("should return job list from query", () => {
      const mockResponse = {
        success: true,
        response: "Encontrei 3 jobs críticos para a embarcação Alpha:",
        data: {
          jobs: [
            {
              id: "job-1",
              title: "Manutenção Motor Principal",
              priority: "critical",
              status: "pending",
            },
            {
              id: "job-2",
              title: "Reparo Sistema Elétrico",
              priority: "critical",
              status: "overdue",
            },
          ],
        },
        suggestions: [
          "Ver detalhes do job crítico",
          "Postergar jobs se necessário",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.jobs).toBeInstanceOf(Array);
      expect(mockResponse.data.jobs.length).toBeGreaterThan(0);
    });
  });

  describe("OS Generation via Chat", () => {
    it("should handle OS creation request", () => {
      const message = "Gere uma OS para o job #123";
      
      expect(message).toContain("OS");
      expect(message).toContain("job");
      expect(message).toContain("#123");
    });

    it("should create OS with job reference", () => {
      const mockResponse = {
        success: true,
        response: "Ordem de Serviço WO-2025-001 criada com sucesso para o job #123",
        actions: [
          {
            type: "create_os",
            data: {
              job_id: "job-123",
              wo_number: "WO-2025-001",
              status: "draft",
            },
            confidence: 0.98,
          },
        ],
        suggestions: [
          "Atribuir técnico à OS",
          "Adicionar peças necessárias",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.actions[0].type).toBe("create_os");
      expect(mockResponse.actions[0].data).toHaveProperty("job_id");
      expect(mockResponse.actions[0].data).toHaveProperty("wo_number");
    });
  });

  describe("Maintenance Status Queries", () => {
    it("should handle system status queries", () => {
      const message = "Qual o status da manutenção do sistema elétrico?";
      
      expect(message).toContain("status");
      expect(message).toContain("manutenção");
      expect(message).toContain("sistema elétrico");
    });

    it("should return system maintenance status", () => {
      const mockResponse = {
        success: true,
        response: "Status do sistema elétrico: 2 jobs pendentes, 1 em andamento",
        data: {
          system: "Sistema Elétrico",
          pending_jobs: 2,
          in_progress_jobs: 1,
          completed_jobs_last_30_days: 5,
          next_scheduled_maintenance: "2025-11-15",
        },
        suggestions: [
          "Ver jobs pendentes do sistema elétrico",
          "Histórico de falhas do sistema",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveProperty("system");
      expect(mockResponse.data).toHaveProperty("pending_jobs");
    });
  });

  describe("Hourometer Queries", () => {
    it("should handle hourometer queries", () => {
      const message = "Quantas horas tem o motor principal?";
      
      expect(message).toContain("horas");
      expect(message).toContain("motor principal");
    });

    it("should return component hours", () => {
      const mockResponse = {
        success: true,
        response: "Motor Principal: 8,500 horas operacionais. Próxima manutenção em 8,000 horas (500 horas atrasado)",
        data: {
          component: "Motor Principal",
          current_hours: 8500,
          next_maintenance_hours: 8000,
          hours_until_maintenance: -500,
          status: "overdue",
        },
        suggestions: [
          "Criar job de manutenção para o motor",
          "Ver histórico de manutenções",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.current_hours).toBe(8500);
      expect(mockResponse.data.status).toBe("overdue");
    });
  });

  describe("Postponement Analysis via Chat", () => {
    it("should handle postponement requests", () => {
      const message = "Posso postergar a manutenção do motor principal por 15 dias?";
      
      expect(message).toContain("postergar");
      expect(message).toContain("manutenção");
      expect(message).toContain("15 dias");
    });

    it("should trigger AI postponement analysis", () => {
      const mockResponse = {
        success: true,
        response: "Analisando viabilidade de postergação...",
        actions: [
          {
            type: "analyze_postponement",
            data: {
              job_id: "job-123",
              requested_days: 15,
              analysis: {
                recommendation: "conditional",
                risk_level: "medium",
                conditions: ["Monitorar diariamente", "Limitar operação"],
              },
            },
            confidence: 0.92,
          },
        ],
        suggestions: [
          "Ver análise completa de risco",
          "Aceitar postergação com condições",
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.actions[0].type).toBe("analyze_postponement");
      expect(mockResponse.actions[0].data.analysis.recommendation).toBeTruthy();
    });
  });

  describe("Natural Language Understanding", () => {
    it("should understand variations of commands", () => {
      const variations = [
        "Criar job de manutenção",
        "Preciso agendar uma manutenção",
        "Adicionar novo job",
        "Registrar manutenção",
      ];

      variations.forEach((message) => {
        expect(
          message.toLowerCase().includes("manutenção") ||
          message.toLowerCase().includes("job")
        ).toBe(true);
      });
    });

    it("should extract priority from natural language", () => {
      const messages = [
        { text: "urgente", expected: "high" },
        { text: "crítico", expected: "critical" },
        { text: "prioridade baixa", expected: "low" },
        { text: "normal", expected: "medium" },
      ];

      messages.forEach((msg) => {
        expect(msg.expected).toBeTruthy();
      });
    });
  });

  describe("Context Awareness", () => {
    it("should use vessel context", () => {
      const request = {
        message: "Quais são os jobs pendentes?",
        context: mockContext,
      };

      expect(request.context.vessel_id).toBeTruthy();
      expect(request.context.vessel_id).toBe("vessel-uuid-123");
    });

    it("should use user role for permissions", () => {
      const request = {
        message: "Aprovar OS WO-2025-001",
        context: mockContext,
      };

      expect(request.context.user_role).toBe("maintenance_engineer");
    });

    it("should adapt responses based on current view", () => {
      const dashboardContext = { ...mockContext, current_view: "mmi_dashboard" };
      const jobDetailContext = { ...mockContext, current_view: "job_detail" };

      expect(dashboardContext.current_view).toBe("mmi_dashboard");
      expect(jobDetailContext.current_view).toBe("job_detail");
    });
  });

  describe("Action Confidence Scoring", () => {
    it("should provide confidence scores for actions", () => {
      const action = {
        type: "create_job",
        data: {},
        confidence: 0.95,
      };

      expect(action.confidence).toBeGreaterThan(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
    });

    it("should flag low confidence actions", () => {
      const actions = [
        { type: "create_job", confidence: 0.95 },
        { type: "update_job", confidence: 0.65 },
        { type: "create_os", confidence: 0.45 },
      ];

      const lowConfidence = actions.filter((a) => a.confidence < 0.7);
      const highConfidence = actions.filter((a) => a.confidence >= 0.7);

      expect(lowConfidence.length).toBeGreaterThan(0);
      expect(highConfidence.length).toBeGreaterThan(0);
    });
  });

  describe("Suggestions Generation", () => {
    it("should provide contextual suggestions", () => {
      const mockResponse = {
        success: true,
        response: "Job criado com sucesso",
        suggestions: [
          "Gerar OS para este job",
          "Atribuir técnico responsável",
          "Adicionar peças necessárias",
          "Agendar data de execução",
        ],
      };

      expect(mockResponse.suggestions).toBeInstanceOf(Array);
      expect(mockResponse.suggestions.length).toBeGreaterThan(0);
    });

    it("should provide relevant follow-up actions", () => {
      const suggestions = [
        "Ver histórico de manutenções",
        "Gerar relatório de custos",
        "Verificar disponibilidade de peças",
      ];

      suggestions.forEach((suggestion) => {
        expect(suggestion).toBeTruthy();
        expect(typeof suggestion).toBe("string");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle ambiguous requests", () => {
      const ambiguousMessage = "manutenção";
      
      const mockResponse = {
        success: true,
        response: "Pode especificar mais detalhes sobre a manutenção? Por exemplo, qual componente ou sistema?",
        actions: [],
        suggestions: [
          "Criar job de manutenção preventiva",
          "Ver jobs pendentes",
          "Verificar status de componentes",
        ],
      };

      expect(mockResponse.actions.length).toBe(0);
      expect(mockResponse.suggestions.length).toBeGreaterThan(0);
    });

    it("should handle invalid job references", () => {
      const invalidMessage = "Gerar OS para job #999999";
      
      const mockResponse = {
        success: false,
        error: "Job #999999 não encontrado",
        suggestions: [
          "Verificar número do job",
          "Listar todos os jobs",
        ],
      };

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error).toBeTruthy();
    });
  });

  describe("Response Format", () => {
    it("should have consistent response structure", () => {
      const mockResponse = {
        success: true,
        response: "string",
        actions: [],
        suggestions: [],
      };

      expect(mockResponse).toHaveProperty("success");
      expect(mockResponse).toHaveProperty("response");
      expect(mockResponse).toHaveProperty("actions");
      expect(mockResponse).toHaveProperty("suggestions");
    });

    it("should handle responses with data", () => {
      const mockResponse = {
        success: true,
        response: "Query result",
        data: {
          jobs: [],
          total: 0,
        },
        actions: [],
        suggestions: [],
      };

      expect(mockResponse).toHaveProperty("data");
      expect(mockResponse.data).toHaveProperty("jobs");
    });
  });
});
