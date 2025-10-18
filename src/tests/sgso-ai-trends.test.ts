import { describe, it, expect } from "vitest";
import type { SGSOTrendsAnalysis } from "@/lib/sgso/ai-trends";

describe("SGSO AI Trends Analysis", () => {
  describe("SGSOTrendsAnalysis type structure", () => {
    const mockAnalysis: SGSOTrendsAnalysis = {
      topCategories: [
        { category: "Falha de Equipamento", count: 15, percentage: 45 },
        { category: "Erro Operacional", count: 10, percentage: 30 },
        { category: "Falha de Software", count: 8, percentage: 24 },
      ],
      mainRootCauses: [
        { cause: "Falta de manutenção preventiva", occurrences: 12 },
        { cause: "Erro humano", occurrences: 8 },
        { cause: "Falha de calibração", occurrences: 5 },
        { cause: "Desgaste natural", occurrences: 4 },
        { cause: "Documentação inadequada", occurrences: 3 },
      ],
      systemicMeasures: [
        "Implementar programa de manutenção preventiva mais rigoroso",
        "Aumentar frequência de treinamentos operacionais",
        "Estabelecer processo de calibração semestral",
        "Melhorar documentação de procedimentos",
        "Criar sistema de alertas preventivos",
      ],
      emergingRisks: [
        "Fadiga operacional em períodos de alta demanda",
        "Obsolescência de equipamentos críticos",
        "Lacunas de comunicação entre turmas",
      ],
      summary:
        "Análise de 33 planos de ação SGSO identificou que falhas de equipamento representam 45% dos incidentes. A falta de manutenção preventiva é a principal causa raiz. Recomenda-se implementação urgente de medidas sistêmicas para redução de riscos.",
      generatedAt: "2025-01-18T10:00:00Z",
    };

    it("should have topCategories array with proper structure", () => {
      expect(mockAnalysis.topCategories).toBeDefined();
      expect(Array.isArray(mockAnalysis.topCategories)).toBe(true);
      expect(mockAnalysis.topCategories.length).toBeGreaterThan(0);

      mockAnalysis.topCategories.forEach((category) => {
        expect(category.category).toBeDefined();
        expect(category.count).toBeDefined();
        expect(category.percentage).toBeDefined();
        expect(typeof category.category).toBe("string");
        expect(typeof category.count).toBe("number");
        expect(typeof category.percentage).toBe("number");
      });
    });

    it("should have mainRootCauses array with proper structure", () => {
      expect(mockAnalysis.mainRootCauses).toBeDefined();
      expect(Array.isArray(mockAnalysis.mainRootCauses)).toBe(true);
      expect(mockAnalysis.mainRootCauses.length).toBeGreaterThan(0);

      mockAnalysis.mainRootCauses.forEach((cause) => {
        expect(cause.cause).toBeDefined();
        expect(cause.occurrences).toBeDefined();
        expect(typeof cause.cause).toBe("string");
        expect(typeof cause.occurrences).toBe("number");
        expect(cause.occurrences).toBeGreaterThan(0);
      });
    });

    it("should have systemicMeasures array with strings", () => {
      expect(mockAnalysis.systemicMeasures).toBeDefined();
      expect(Array.isArray(mockAnalysis.systemicMeasures)).toBe(true);
      expect(mockAnalysis.systemicMeasures.length).toBeGreaterThan(0);

      mockAnalysis.systemicMeasures.forEach((measure) => {
        expect(typeof measure).toBe("string");
        expect(measure.length).toBeGreaterThan(0);
      });
    });

    it("should have emergingRisks array with strings", () => {
      expect(mockAnalysis.emergingRisks).toBeDefined();
      expect(Array.isArray(mockAnalysis.emergingRisks)).toBe(true);
      expect(mockAnalysis.emergingRisks.length).toBeGreaterThan(0);

      mockAnalysis.emergingRisks.forEach((risk) => {
        expect(typeof risk).toBe("string");
        expect(risk.length).toBeGreaterThan(0);
      });
    });

    it("should have summary as a non-empty string", () => {
      expect(mockAnalysis.summary).toBeDefined();
      expect(typeof mockAnalysis.summary).toBe("string");
      expect(mockAnalysis.summary.length).toBeGreaterThan(0);
    });

    it("should have generatedAt timestamp", () => {
      expect(mockAnalysis.generatedAt).toBeDefined();
      expect(typeof mockAnalysis.generatedAt).toBe("string");
      
      // Should be a valid ISO date string
      const date = new Date(mockAnalysis.generatedAt);
      expect(date.toISOString()).toContain("2025-01-18");
      expect(isNaN(date.getTime())).toBe(false);
    });

    it("should have percentages that sum close to 100", () => {
      const totalPercentage = mockAnalysis.topCategories.reduce(
        (sum, cat) => sum + cat.percentage,
        0
      );

      // Allow for rounding differences
      expect(totalPercentage).toBeGreaterThanOrEqual(95);
      expect(totalPercentage).toBeLessThanOrEqual(101);
    });

    it("should have categories sorted by count (descending)", () => {
      for (let i = 0; i < mockAnalysis.topCategories.length - 1; i++) {
        expect(mockAnalysis.topCategories[i].count).toBeGreaterThanOrEqual(
          mockAnalysis.topCategories[i + 1].count
        );
      }
    });

    it("should have root causes sorted by occurrences (descending)", () => {
      for (let i = 0; i < mockAnalysis.mainRootCauses.length - 1; i++) {
        expect(mockAnalysis.mainRootCauses[i].occurrences).toBeGreaterThanOrEqual(
          mockAnalysis.mainRootCauses[i + 1].occurrences
        );
      }
    });

    it("should have at least 3 top categories", () => {
      expect(mockAnalysis.topCategories.length).toBeGreaterThanOrEqual(3);
    });

    it("should have at least 3 systemic measures", () => {
      expect(mockAnalysis.systemicMeasures.length).toBeGreaterThanOrEqual(3);
    });

    it("should have at least 3 emerging risks", () => {
      expect(mockAnalysis.emergingRisks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Trends Analysis Validation", () => {
    it("should validate category structure", () => {
      const category = {
        category: "Test Category",
        count: 10,
        percentage: 50,
      };

      expect(category.count).toBeGreaterThan(0);
      expect(category.percentage).toBeGreaterThan(0);
      expect(category.percentage).toBeLessThanOrEqual(100);
    });

    it("should validate root cause structure", () => {
      const rootCause = {
        cause: "Test Cause",
        occurrences: 5,
      };

      expect(rootCause.occurrences).toBeGreaterThan(0);
      expect(rootCause.cause.length).toBeGreaterThan(0);
    });

    it("should handle edge case with single category", () => {
      const singleCategoryAnalysis: SGSOTrendsAnalysis = {
        topCategories: [{ category: "Only Category", count: 100, percentage: 100 }],
        mainRootCauses: [{ cause: "Main cause", occurrences: 100 }],
        systemicMeasures: ["Measure 1", "Measure 2", "Measure 3"],
        emergingRisks: ["Risk 1", "Risk 2", "Risk 3"],
        summary: "Single category analysis",
        generatedAt: new Date().toISOString(),
      };

      expect(singleCategoryAnalysis.topCategories.length).toBe(1);
      expect(singleCategoryAnalysis.topCategories[0].percentage).toBe(100);
    });

    it("should handle analysis with many categories", () => {
      const categories = Array.from({ length: 10 }, (_, i) => ({
        category: `Category ${i + 1}`,
        count: 10 - i,
        percentage: Math.floor(100 / 10),
      }));

      expect(categories.length).toBe(10);
      expect(categories[0].count).toBeGreaterThan(categories[9].count);
    });
  });
});
