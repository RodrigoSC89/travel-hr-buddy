import { describe, it, expect } from "vitest";
import { workflowSuggestionTemplates, WorkflowSuggestionTemplate } from "../../../lib/workflows/suggestionTemplates";

describe("Workflow Suggestion Templates", () => {
  describe("Template Structure", () => {
    it("should export an array of templates", () => {
      expect(Array.isArray(workflowSuggestionTemplates)).toBe(true);
      expect(workflowSuggestionTemplates.length).toBeGreaterThan(0);
    });

    it("should have exactly 3 templates", () => {
      expect(workflowSuggestionTemplates).toHaveLength(3);
    });

    it("should have all required properties in each template", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template).toHaveProperty("etapa");
        expect(template).toHaveProperty("tipo_sugestao");
        expect(template).toHaveProperty("conteudo");
        expect(template).toHaveProperty("criticidade");
        expect(template).toHaveProperty("responsavel_sugerido");
        expect(template).toHaveProperty("origem");
      });
    });

    it("should have string values for all properties", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(typeof template.etapa).toBe("string");
        expect(typeof template.tipo_sugestao).toBe("string");
        expect(typeof template.conteudo).toBe("string");
        expect(typeof template.criticidade).toBe("string");
        expect(typeof template.responsavel_sugerido).toBe("string");
        expect(typeof template.origem).toBe("string");
      });
    });

    it("should have valid criticidade values", () => {
      const validCriticidade = ["Alta", "Média", "Baixa"];
      workflowSuggestionTemplates.forEach((template) => {
        expect(validCriticidade).toContain(template.criticidade);
      });
    });
  });

  describe("Template Content", () => {
    it("should have sensor verification template", () => {
      const sensorTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa.includes("sensores redundantes")
      );
      expect(sensorTemplate).toBeDefined();
      expect(sensorTemplate?.criticidade).toBe("Alta");
      expect(sensorTemplate?.responsavel_sugerido).toBe("Oficial de Náutica");
      expect(sensorTemplate?.tipo_sugestao).toBe("Criar tarefa");
    });

    it("should have FMEA update template", () => {
      const fmeaTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa.includes("FMEA")
      );
      expect(fmeaTemplate).toBeDefined();
      expect(fmeaTemplate?.criticidade).toBe("Média");
      expect(fmeaTemplate?.responsavel_sugerido).toBe("Engenharia Onshore");
      expect(fmeaTemplate?.tipo_sugestao).toBe("Criar tarefa");
    });

    it("should have incomplete checklists review template", () => {
      const checklistTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa.includes("checklists")
      );
      expect(checklistTemplate).toBeDefined();
      expect(checklistTemplate?.criticidade).toBe("Alta");
      expect(checklistTemplate?.responsavel_sugerido).toBe("Supervisor de DP");
      expect(checklistTemplate?.tipo_sugestao).toBe("Ajustar prazo");
    });

    it("should have all templates with origem as \"Template Histórico\"", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.origem).toBe("Template Histórico");
      });
    });

    it("should have non-empty content in all templates", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.etapa.length).toBeGreaterThan(0);
        expect(template.conteudo.length).toBeGreaterThan(0);
        expect(template.tipo_sugestao.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Template Statistics", () => {
    it("should have 2 high priority templates", () => {
      const highPriority = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Alta"
      );
      expect(highPriority).toHaveLength(2);
    });

    it("should have 1 medium priority template", () => {
      const mediumPriority = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Média"
      );
      expect(mediumPriority).toHaveLength(1);
    });

    it("should have 0 low priority templates", () => {
      const lowPriority = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Baixa"
      );
      expect(lowPriority).toHaveLength(0);
    });

    it("should have 2 \"Criar tarefa\" suggestions", () => {
      const createTaskSuggestions = workflowSuggestionTemplates.filter(
        (t) => t.tipo_sugestao === "Criar tarefa"
      );
      expect(createTaskSuggestions).toHaveLength(2);
    });

    it("should have 1 \"Ajustar prazo\" suggestion", () => {
      const adjustDeadlineSuggestions = workflowSuggestionTemplates.filter(
        (t) => t.tipo_sugestao === "Ajustar prazo"
      );
      expect(adjustDeadlineSuggestions).toHaveLength(1);
    });
  });

  describe("Type Safety", () => {
    it("should match WorkflowSuggestionTemplate interface", () => {
      const template: WorkflowSuggestionTemplate = {
        etapa: "Test Stage",
        tipo_sugestao: "Test Type",
        conteudo: "Test Content",
        criticidade: "Alta",
        responsavel_sugerido: "Test Responsible",
        origem: "Test Origin",
      };

      expect(template).toBeDefined();
      expect(template.criticidade).toBe("Alta");
    });

    it("should validate criticidade type", () => {
      // This test ensures TypeScript type checking works
      const validCriticidade: WorkflowSuggestionTemplate["criticidade"][] = [
        "Alta",
        "Média",
        "Baixa",
      ];
      
      validCriticidade.forEach(criticidade => {
        expect(["Alta", "Média", "Baixa"]).toContain(criticidade);
      });
    });
  });
});
