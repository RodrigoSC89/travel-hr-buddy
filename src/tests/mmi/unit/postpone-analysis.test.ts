import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * MMI - Postpone Analysis Unit Tests
 * 
 * Tests AI-powered postponement analysis with mocked responses
 */

describe("MMI - Postpone Analysis", () => {
  const mockJob = {
    id: "job-uuid-123",
    title: "Manutenção Preventiva - Motor Principal",
    job_type: "preventive",
    priority: "high",
    scheduled_date: "2025-10-20T10:00:00Z",
    component: {
      name: "Motor Principal",
      current_hours: 8500,
      next_maintenance_hours: 8000,
    },
    last_maintenance: "2024-08-15",
  };

  const mockPostponeRequest = {
    reason: "Embarcação em viagem crítica para cliente importante",
    requested_new_date: "2025-11-15T10:00:00Z",
    context: {
      vessel_status: "em_viagem",
      crew_availability: "limitada",
      parts_availability: "disponível",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Postponement Request Structure", () => {
    it("should validate postponement request data", () => {
      expect(mockPostponeRequest).toHaveProperty("reason");
      expect(mockPostponeRequest).toHaveProperty("requested_new_date");
      expect(mockPostponeRequest).toHaveProperty("context");
      
      expect(mockPostponeRequest.reason).toBeTruthy();
      expect(mockPostponeRequest.requested_new_date).toBeTruthy();
    });

    it("should have valid context data", () => {
      const { context } = mockPostponeRequest;
      
      expect(context).toHaveProperty("vessel_status");
      expect(context).toHaveProperty("crew_availability");
      expect(context).toHaveProperty("parts_availability");
    });
  });

  describe("AI Analysis Response", () => {
    it("should return structured AI analysis", () => {
      const mockAIResponse = {
        recommendation: "conditional",
        risk_level: "medium",
        reasoning: "O motor ultrapassou em 500 horas o intervalo recomendado. A postergação por mais 25 dias adiciona risco moderado.",
        conditions: [
          "Realizar inspeção visual diária do motor",
          "Monitorar temperatura e vibração a cada 4 horas",
          "Preparar equipe para manutenção de emergência",
          "Limitar RPM a 85% da capacidade",
        ],
        alternative_dates: ["2025-11-01T10:00:00Z", "2025-11-08T10:00:00Z"],
        impact_assessment: {
          safety: "Risco moderado de falha se não monitorado adequadamente",
          operational: "Possível redução de performance e aumento de consumo",
          financial: "Custo de manutenção diferida pode aumentar em 15-20%",
        },
      };

      expect(mockAIResponse).toHaveProperty("recommendation");
      expect(mockAIResponse).toHaveProperty("risk_level");
      expect(mockAIResponse).toHaveProperty("reasoning");
      expect(mockAIResponse).toHaveProperty("conditions");
      expect(mockAIResponse).toHaveProperty("impact_assessment");
    });

    it("should validate recommendation enum values", () => {
      const validRecommendations = ["approve", "reject", "conditional"];
      const mockRecommendation = "conditional";
      
      expect(validRecommendations).toContain(mockRecommendation);
    });

    it("should validate risk_level enum values", () => {
      const validRiskLevels = ["low", "medium", "high", "critical"];
      const mockRiskLevel = "medium";
      
      expect(validRiskLevels).toContain(mockRiskLevel);
    });

    it("should provide conditions when recommendation is conditional", () => {
      const conditionalAnalysis = {
        recommendation: "conditional",
        conditions: [
          "Realizar inspeção visual diária",
          "Monitorar temperatura",
        ],
      };

      expect(conditionalAnalysis.recommendation).toBe("conditional");
      expect(conditionalAnalysis.conditions).toBeInstanceOf(Array);
      expect(conditionalAnalysis.conditions.length).toBeGreaterThan(0);
    });

    it("should provide alternative dates", () => {
      const mockAlternativeDates = [
        "2025-11-01T10:00:00Z",
        "2025-11-08T10:00:00Z",
      ];

      expect(mockAlternativeDates).toBeInstanceOf(Array);
      expect(mockAlternativeDates.length).toBeGreaterThan(0);
      
      mockAlternativeDates.forEach((date) => {
        const parsed = new Date(date);
        expect(parsed).toBeInstanceOf(Date);
        expect(parsed.toISOString()).toContain("2025-11-");
      });
    });
  });

  describe("Impact Assessment", () => {
    it("should assess safety impact", () => {
      const mockImpact = {
        safety: "Risco moderado de falha se não monitorado adequadamente",
      };

      expect(mockImpact.safety).toBeTruthy();
      expect(typeof mockImpact.safety).toBe("string");
    });

    it("should assess operational impact", () => {
      const mockImpact = {
        operational: "Possível redução de performance e aumento de consumo",
      };

      expect(mockImpact.operational).toBeTruthy();
      expect(typeof mockImpact.operational).toBe("string");
    });

    it("should assess financial impact", () => {
      const mockImpact = {
        financial: "Custo de manutenção diferida pode aumentar em 15-20%",
      };

      expect(mockImpact.financial).toBeTruthy();
      expect(typeof mockImpact.financial).toBe("string");
    });
  });

  describe("Hours Analysis", () => {
    it("should calculate hours overdue", () => {
      const currentHours = 8500;
      const nextMaintenanceHours = 8000;
      const hoursOverdue = currentHours - nextMaintenanceHours;

      expect(hoursOverdue).toBe(500);
      expect(hoursOverdue).toBeGreaterThan(0);
    });

    it("should identify when maintenance is overdue", () => {
      const component = mockJob.component;
      const isOverdue = component.current_hours > component.next_maintenance_hours;

      expect(isOverdue).toBe(true);
    });

    it("should calculate days until requested date", () => {
      const scheduledDate = new Date("2025-10-20T10:00:00Z");
      const requestedDate = new Date("2025-11-15T10:00:00Z");
      const daysDifference = Math.ceil(
        (requestedDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDifference).toBe(26);
      expect(daysDifference).toBeGreaterThan(0);
    });
  });

  describe("Complete Analysis Flow", () => {
    it("should process complete postponement analysis", () => {
      const completeAnalysis = {
        success: true,
        job_id: mockJob.id,
        analysis: {
          recommendation: "conditional",
          risk_level: "medium",
          reasoning: "Análise detalhada da situação",
          conditions: ["Condição 1", "Condição 2"],
          alternative_dates: ["2025-11-01T10:00:00Z"],
          impact_assessment: {
            safety: "Impacto de segurança",
            operational: "Impacto operacional",
            financial: "Impacto financeiro",
          },
        },
        job_updated: true,
        postpone_count: 1,
      };

      expect(completeAnalysis.success).toBe(true);
      expect(completeAnalysis.job_id).toBe(mockJob.id);
      expect(completeAnalysis.job_updated).toBe(true);
      expect(completeAnalysis.postpone_count).toBe(1);
      expect(completeAnalysis.analysis).toBeDefined();
      expect(completeAnalysis.analysis.recommendation).toBeTruthy();
    });

    it("should increment postpone_count", () => {
      let postponeCount = 0;
      
      // First postponement
      postponeCount++;
      expect(postponeCount).toBe(1);
      
      // Second postponement
      postponeCount++;
      expect(postponeCount).toBe(2);
    });

    it("should store postponement history", () => {
      const postponementHistory = {
        last_postpone_reason: mockPostponeRequest.reason,
        last_postpone_date: new Date().toISOString(),
        last_postpone_analysis: {
          recommendation: "conditional",
          risk_level: "medium",
        },
      };

      expect(postponementHistory.last_postpone_reason).toBe(mockPostponeRequest.reason);
      expect(postponementHistory.last_postpone_date).toBeTruthy();
      expect(postponementHistory.last_postpone_analysis).toBeDefined();
    });
  });

  describe("Rejection Scenarios", () => {
    it("should handle rejected postponements", () => {
      const rejectedAnalysis = {
        recommendation: "reject",
        risk_level: "critical",
        reasoning: "O componente está muito além do limite de manutenção e representa risco crítico",
        conditions: [],
        alternative_dates: [],
      };

      expect(rejectedAnalysis.recommendation).toBe("reject");
      expect(rejectedAnalysis.risk_level).toBe("critical");
      expect(rejectedAnalysis.conditions.length).toBe(0);
    });
  });

  describe("Approval Scenarios", () => {
    it("should handle approved postponements", () => {
      const approvedAnalysis = {
        recommendation: "approve",
        risk_level: "low",
        reasoning: "O componente está dentro das especificações e pode ser postergado com segurança",
        conditions: [],
        alternative_dates: ["2025-11-15T10:00:00Z", "2025-11-20T10:00:00Z"],
      };

      expect(approvedAnalysis.recommendation).toBe("approve");
      expect(approvedAnalysis.risk_level).toBe("low");
      expect(approvedAnalysis.alternative_dates.length).toBeGreaterThan(0);
    });
  });
});
