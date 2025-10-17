import { describe, it, expect } from "vitest";
import {
  getTemplatesByCriticidade,
  getHighPriorityTemplates,
  getTemplatesByResponsavel,
  getTemplatesBySuggestionType,
  searchTemplates,
  convertTemplateToWorkflowFormat,
  createWorkflowFromTemplate,
  getAllTemplatesFormatted,
  getTemplateSummary,
} from "../../lib/workflows/exampleIntegration";
import { workflowSuggestionTemplates } from "../../lib/workflows/suggestionTemplates";

describe("Example Integration Functions", () => {
  describe("convertTemplateToWorkflowFormat", () => {
    it("should convert template to SmartWorkflow format", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow.name).toBe(template.etapa);
      expect(workflow.description).toBe(template.conteudo);
      expect(workflow.status).toBe("draft");
      expect(workflow.trigger).toBe(template.tipo_sugestao);
      expect(workflow.category).toBe("safety"); // Alta criticidade -> safety
      expect(workflow.tags).toContain(template.responsavel_sugerido);
      expect(workflow.tags).toContain(template.criticidade);
      expect(workflow.tags).toContain(template.origem);
      expect(workflow.steps).toEqual([]);
      expect(workflow.executions).toBe(0);
      expect(workflow.successRate).toBe(0);
      expect(workflow.createdAt).toBeInstanceOf(Date);
    });

    it("should apply overrides to workflow", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template, {
        status: "active",
        category: "custom",
        executions: 10,
        successRate: 95.5,
      });

      expect(workflow.status).toBe("active");
      expect(workflow.category).toBe("custom");
      expect(workflow.executions).toBe(10);
      expect(workflow.successRate).toBe(95.5);
    });

    it("should set category to maintenance for Média criticidade", () => {
      const template = workflowSuggestionTemplates.find((t) => t.criticidade === "Média");
      expect(template).toBeDefined();
      const workflow = convertTemplateToWorkflowFormat(template!);
      expect(workflow.category).toBe("maintenance");
    });

    it("should preserve all template information in tags", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);
      
      expect(workflow.tags).toHaveLength(3);
      expect(workflow.tags).toEqual([
        template.responsavel_sugerido,
        template.criticidade,
        template.origem,
      ]);
    });

    it("should create new Date instance for each conversion", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow1 = convertTemplateToWorkflowFormat(template);
      const workflow2 = convertTemplateToWorkflowFormat(template);
      
      expect(workflow1.createdAt).not.toBe(workflow2.createdAt);
    });

    it("should handle partial overrides correctly", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template, {
        status: "active",
      });

      expect(workflow.status).toBe("active");
      expect(workflow.category).toBe("safety");
      expect(workflow.executions).toBe(0);
    });
  });

  describe("getTemplatesByCriticidade", () => {
    it("should return all templates when no criticidade is provided", () => {
      const templates = getTemplatesByCriticidade();
      expect(templates).toHaveLength(3);
    });

    it("should filter by Alta criticidade", () => {
      const templates = getTemplatesByCriticidade("Alta");
      expect(templates).toHaveLength(2);
      templates.forEach((t) => {
        expect(t.criticidade).toBe("Alta");
      });
    });

    it("should filter by Média criticidade", () => {
      const templates = getTemplatesByCriticidade("Média");
      expect(templates).toHaveLength(1);
      expect(templates[0].criticidade).toBe("Média");
    });

    it("should return empty array for Baixa criticidade", () => {
      const templates = getTemplatesByCriticidade("Baixa");
      expect(templates).toHaveLength(0);
    });
  });

  describe("getHighPriorityTemplates", () => {
    it("should return only Alta criticidade templates", () => {
      const templates = getHighPriorityTemplates();
      expect(templates).toHaveLength(2);
      templates.forEach((t) => {
        expect(t.criticidade).toBe("Alta");
      });
    });

    it("should be equivalent to getTemplatesByCriticidade(\"Alta\")", () => {
      const highPriority = getHighPriorityTemplates();
      const altaCriticidade = getTemplatesByCriticidade("Alta");
      expect(highPriority).toEqual(altaCriticidade);
    });
  });

  describe("getTemplatesByResponsavel", () => {
    it("should filter by exact responsavel name", () => {
      const templates = getTemplatesByResponsavel("Oficial de Náutica");
      expect(templates).toHaveLength(1);
      expect(templates[0].responsavel_sugerido).toBe("Oficial de Náutica");
    });

    it("should filter by partial responsavel name (case insensitive)", () => {
      const templates = getTemplatesByResponsavel("náutica");
      expect(templates).toHaveLength(1);
      expect(templates[0].responsavel_sugerido).toContain("Náutica");
    });

    it("should filter by \"Engenharia\"", () => {
      const templates = getTemplatesByResponsavel("Engenharia");
      expect(templates).toHaveLength(1);
      expect(templates[0].responsavel_sugerido).toContain("Engenharia");
    });

    it("should return empty array for non-existent responsavel", () => {
      const templates = getTemplatesByResponsavel("Non-existent");
      expect(templates).toHaveLength(0);
    });
  });

  describe("getTemplatesBySuggestionType", () => {
    it("should filter by \"Criar tarefa\" type", () => {
      const templates = getTemplatesBySuggestionType("Criar tarefa");
      expect(templates).toHaveLength(2);
      templates.forEach((t) => {
        expect(t.tipo_sugestao).toBe("Criar tarefa");
      });
    });

    it("should filter by \"Ajustar prazo\" type", () => {
      const templates = getTemplatesBySuggestionType("Ajustar prazo");
      expect(templates).toHaveLength(1);
      expect(templates[0].tipo_sugestao).toBe("Ajustar prazo");
    });

    it("should filter by partial type (case insensitive)", () => {
      const templates = getTemplatesBySuggestionType("criar");
      expect(templates).toHaveLength(2);
    });

    it("should return empty array for non-existent type", () => {
      const templates = getTemplatesBySuggestionType("Non-existent");
      expect(templates).toHaveLength(0);
    });
  });

  describe("createWorkflowFromTemplate", () => {
    it("should create workflow from valid template index", () => {
      const workflow = createWorkflowFromTemplate(0);
      expect(workflow).not.toBeNull();
      expect(workflow?.name).toBe(workflowSuggestionTemplates[0].etapa);
    });

    it("should return null for invalid template index", () => {
      const workflow = createWorkflowFromTemplate(999);
      expect(workflow).toBeNull();
    });

    it("should apply custom properties", () => {
      const workflow = createWorkflowFromTemplate(0, {
        status: "active",
        executions: 5,
      });
      expect(workflow).not.toBeNull();
      expect(workflow?.status).toBe("active");
      expect(workflow?.executions).toBe(5);
    });

    it("should return null for negative index", () => {
      const workflow = createWorkflowFromTemplate(-1);
      expect(workflow).toBeNull();
    });
  });

  describe("getAllTemplatesFormatted", () => {
    it("should return formatted array with correct length", () => {
      const formatted = getAllTemplatesFormatted();
      expect(formatted).toHaveLength(3);
    });

    it("should have correct format structure", () => {
      const formatted = getAllTemplatesFormatted();
      formatted.forEach((item, index) => {
        expect(item.id).toBe(index);
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("description");
        expect(item).toHaveProperty("priority");
        expect(item).toHaveProperty("responsible");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("source");
      });
    });

    it("should map etapa to title", () => {
      const formatted = getAllTemplatesFormatted();
      expect(formatted[0].title).toBe(workflowSuggestionTemplates[0].etapa);
    });

    it("should map conteudo to description", () => {
      const formatted = getAllTemplatesFormatted();
      expect(formatted[0].description).toBe(workflowSuggestionTemplates[0].conteudo);
    });
  });

  describe("getTemplateSummary", () => {
    it("should return correct total count", () => {
      const summary = getTemplateSummary();
      expect(summary.total).toBe(3);
    });

    it("should return correct alta count", () => {
      const summary = getTemplateSummary();
      expect(summary.alta).toBe(2);
    });

    it("should return correct media count", () => {
      const summary = getTemplateSummary();
      expect(summary.media).toBe(1);
    });

    it("should return correct baixa count", () => {
      const summary = getTemplateSummary();
      expect(summary.baixa).toBe(0);
    });

    it("should have sum of criticidade counts equal to total", () => {
      const summary = getTemplateSummary();
      expect(summary.alta + summary.media + summary.baixa).toBe(summary.total);
    });
  });

  describe("searchTemplates", () => {
    it("should find templates by keyword in etapa", () => {
      const templates = searchTemplates("sensor");
      expect(templates).toHaveLength(1);
      expect(templates[0].etapa).toContain("sensor");
    });

    it("should find templates by keyword in conteudo", () => {
      const templates = searchTemplates("FMEA");
      expect(templates).toHaveLength(1);
      expect(templates[0].conteudo).toContain("FMEA");
    });

    it("should be case insensitive", () => {
      const templates1 = searchTemplates("SENSOR");
      const templates2 = searchTemplates("sensor");
      expect(templates1).toEqual(templates2);
    });

    it("should return empty array for non-matching keyword", () => {
      const templates = searchTemplates("xyz123notfound");
      expect(templates).toHaveLength(0);
    });

    it("should find multiple templates with common keyword", () => {
      const templates = searchTemplates("Revisar");
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should handle partial matches", () => {
      const templates = searchTemplates("checklist");
      expect(templates).toHaveLength(1);
    });
  });
});
