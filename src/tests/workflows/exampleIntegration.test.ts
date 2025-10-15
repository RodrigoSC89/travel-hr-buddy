import { describe, it, expect } from "vitest";
import {
  convertTemplateToWorkflowFormat,
  getHighPriorityTemplates,
  getTemplatesByResponsavel,
  getTemplatesBySuggestionType,
  createWorkflowFromTemplate,
  getAllTemplatesFormatted,
  getTemplateSummary,
} from "../../../lib/workflows/exampleIntegration";
import { workflowSuggestionTemplates } from "../../../lib/workflows/suggestionTemplates";

describe("Example Integration Functions", () => {
  describe("convertTemplateToWorkflowFormat", () => {
    it("should convert template to workflow format", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow).toHaveProperty("id");
      expect(workflow).toHaveProperty("name");
      expect(workflow).toHaveProperty("description");
      expect(workflow).toHaveProperty("category");
      expect(workflow).toHaveProperty("triggers");
      expect(workflow).toHaveProperty("actions");
      expect(workflow).toHaveProperty("estimatedTimeSaved");
      expect(workflow).toHaveProperty("complexity");
      expect(workflow).toHaveProperty("popularity");
    });

    it("should map criticidade to complexity correctly", () => {
      const highPriorityTemplate = workflowSuggestionTemplates[0]; // Alta
      const mediumPriorityTemplate = workflowSuggestionTemplates[1]; // Média

      const highWorkflow = convertTemplateToWorkflowFormat(highPriorityTemplate);
      const mediumWorkflow = convertTemplateToWorkflowFormat(mediumPriorityTemplate);

      expect(highWorkflow.complexity).toBe("complex");
      expect(mediumWorkflow.complexity).toBe("medium");
    });
  });

  describe("getHighPriorityTemplates", () => {
    it("should return only high priority templates", () => {
      const highPriorityTemplates = getHighPriorityTemplates();

      expect(highPriorityTemplates.length).toBeGreaterThan(0);
      highPriorityTemplates.forEach(template => {
        expect(template.criticidade).toBe("Alta");
      });
    });

    it("should return exactly 2 high priority templates from the current set", () => {
      const highPriorityTemplates = getHighPriorityTemplates();
      expect(highPriorityTemplates.length).toBe(2);
    });
  });

  describe("getTemplatesByResponsavel", () => {
    it("should filter templates by responsible party", () => {
      const templates = getTemplatesByResponsavel("Oficial de Náutica");

      templates.forEach(template => {
        expect(template.responsavel_sugerido).toBe("Oficial de Náutica");
      });
    });

    it("should return empty array for non-existent responsible party", () => {
      const templates = getTemplatesByResponsavel("Non-existent Role");
      expect(templates.length).toBe(0);
    });
  });

  describe("getTemplatesBySuggestionType", () => {
    it("should filter templates by suggestion type", () => {
      const templates = getTemplatesBySuggestionType("Criar tarefa");

      templates.forEach(template => {
        expect(template.tipo_sugestao).toBe("Criar tarefa");
      });
    });

    it("should return correct number of 'Criar tarefa' templates", () => {
      const templates = getTemplatesBySuggestionType("Criar tarefa");
      expect(templates.length).toBe(2);
    });
  });

  describe("createWorkflowFromTemplate", () => {
    it("should create a new workflow from template", () => {
      const template = workflowSuggestionTemplates[0];
      const newWorkflow = createWorkflowFromTemplate(template);

      expect(newWorkflow.etapa).toBe(template.etapa);
      expect(newWorkflow.origem).toBe("Template Derivado");
    });

    it("should allow overriding template properties", () => {
      const template = workflowSuggestionTemplates[0];
      const newWorkflow = createWorkflowFromTemplate(template, {
        criticidade: "Baixa",
        responsavel_sugerido: "New Responsible",
      });

      expect(newWorkflow.criticidade).toBe("Baixa");
      expect(newWorkflow.responsavel_sugerido).toBe("New Responsible");
      expect(newWorkflow.origem).toBe("Template Derivado");
    });
  });

  describe("getAllTemplatesFormatted", () => {
    it("should return formatted template list", () => {
      const formatted = getAllTemplatesFormatted();

      expect(Array.isArray(formatted)).toBe(true);
      expect(formatted.length).toBe(workflowSuggestionTemplates.length);
    });

    it("should include criticidade and responsible in formatted strings", () => {
      const formatted = getAllTemplatesFormatted();

      formatted.forEach(str => {
        expect(str).toMatch(/\[Alta\]|\[Média\]|\[Baixa\]/);
        expect(str).toContain(" - ");
      });
    });
  });

  describe("getTemplateSummary", () => {
    it("should return correct template summary", () => {
      const summary = getTemplateSummary();

      expect(summary).toHaveProperty("total");
      expect(summary).toHaveProperty("alta");
      expect(summary).toHaveProperty("media");
      expect(summary).toHaveProperty("baixa");
    });

    it("should have correct total count", () => {
      const summary = getTemplateSummary();
      expect(summary.total).toBe(3);
    });

    it("should have correct counts by criticidade", () => {
      const summary = getTemplateSummary();
      expect(summary.alta).toBe(2);
      expect(summary.media).toBe(1);
      expect(summary.baixa).toBe(0);
    });

    it("should have sum of criticidade counts equal to total", () => {
      const summary = getTemplateSummary();
      expect(summary.alta + summary.media + summary.baixa).toBe(summary.total);
    });
  });
});
