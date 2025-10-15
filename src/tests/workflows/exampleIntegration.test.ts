import { describe, it, expect } from "vitest";
import {
  convertTemplateToWorkflowFormat,
  getTemplatesByCriticidade,
  getHighPriorityTemplates,
  getTemplatesByResponsavel,
  getTemplatesBySuggestionType,
  createWorkflowFromTemplate,
  getAllTemplatesFormatted,
  getTemplateSummary,
  searchTemplates,
} from "../../../lib/workflows/exampleIntegration";
import { workflowSuggestionTemplates } from "../../../lib/workflows/suggestionTemplates";

describe("Workflow Integration Helpers", () => {
  describe("convertTemplateToWorkflowFormat", () => {
    it("should convert template to SmartWorkflow format", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow).toHaveProperty("id");
      expect(workflow).toHaveProperty("name");
      expect(workflow).toHaveProperty("description");
      expect(workflow).toHaveProperty("status");
      expect(workflow).toHaveProperty("trigger");
      expect(workflow).toHaveProperty("steps");
      expect(workflow).toHaveProperty("executions");
      expect(workflow).toHaveProperty("successRate");
      expect(workflow).toHaveProperty("createdAt");
      expect(workflow).toHaveProperty("category");
      expect(workflow).toHaveProperty("tags");
    });

    it("should set correct workflow properties from template", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow.name).toBe(template.etapa);
      expect(workflow.description).toBe(template.conteudo);
      expect(workflow.status).toBe("draft");
      expect(workflow.trigger).toContain(template.tipo_sugestao);
    });

    it("should set category based on criticidade", () => {
      const highPriorityTemplate = workflowSuggestionTemplates.find(
        (t) => t.criticidade === "Alta"
      )!;
      const mediumPriorityTemplate = workflowSuggestionTemplates.find(
        (t) => t.criticidade === "Média"
      )!;

      const highWorkflow = convertTemplateToWorkflowFormat(highPriorityTemplate);
      const mediumWorkflow = convertTemplateToWorkflowFormat(mediumPriorityTemplate);

      expect(highWorkflow.category).toBe("urgent");
      expect(mediumWorkflow.category).toBe("standard");
    });

    it("should include proper tags", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow.tags).toContain(template.tipo_sugestao);
      expect(workflow.tags).toContain(template.criticidade);
      expect(workflow.tags).toContain(template.responsavel_sugerido);
      expect(workflow.tags).toContain("Template");
    });

    it("should allow overrides", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template, {
        status: "active",
        category: "custom",
      });

      expect(workflow.status).toBe("active");
      expect(workflow.category).toBe("custom");
    });

    it("should initialize with zero executions and success rate", () => {
      const template = workflowSuggestionTemplates[0];
      const workflow = convertTemplateToWorkflowFormat(template);

      expect(workflow.executions).toBe(0);
      expect(workflow.successRate).toBe(0);
    });
  });

  describe("getTemplatesByCriticidade", () => {
    it("should return all templates when no filter provided", () => {
      const templates = getTemplatesByCriticidade();
      expect(templates).toHaveLength(workflowSuggestionTemplates.length);
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
      templates.forEach((t) => {
        expect(t.criticidade).toBe("Média");
      });
    });

    it("should filter by Baixa criticidade", () => {
      const templates = getTemplatesByCriticidade("Baixa");
      expect(templates).toHaveLength(0);
    });
  });

  describe("getHighPriorityTemplates", () => {
    it("should return only high priority templates", () => {
      const templates = getHighPriorityTemplates();
      expect(templates).toHaveLength(2);
      templates.forEach((t) => {
        expect(t.criticidade).toBe("Alta");
      });
    });

    it("should return templates with correct content", () => {
      const templates = getHighPriorityTemplates();
      const etapas = templates.map((t) => t.etapa);
      
      expect(etapas).toContain("Verificar status de sensores redundantes");
      expect(etapas).toContain("Revisar checklists incompletos no último mês");
    });
  });

  describe("getTemplatesByResponsavel", () => {
    it("should filter by exact responsavel name", () => {
      const templates = getTemplatesByResponsavel("Oficial de Náutica");
      expect(templates).toHaveLength(1);
      expect(templates[0].responsavel_sugerido).toBe("Oficial de Náutica");
    });

    it("should filter with case insensitive search", () => {
      const templates = getTemplatesByResponsavel("náutica");
      expect(templates).toHaveLength(1);
    });

    it("should filter by partial match", () => {
      const templates = getTemplatesByResponsavel("Supervisor");
      expect(templates).toHaveLength(1);
      expect(templates[0].responsavel_sugerido).toBe("Supervisor de DP");
    });

    it("should return empty array for non-matching responsavel", () => {
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

    it("should filter with case insensitive search", () => {
      const templates = getTemplatesBySuggestionType("criar");
      expect(templates).toHaveLength(2);
    });

    it("should return empty array for non-matching type", () => {
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
        category: "test",
      });
      expect(workflow?.status).toBe("active");
      expect(workflow?.category).toBe("test");
    });

    it("should create workflow for each template index", () => {
      for (let i = 0; i < workflowSuggestionTemplates.length; i++) {
        const workflow = createWorkflowFromTemplate(i);
        expect(workflow).not.toBeNull();
      }
    });
  });

  describe("getAllTemplatesFormatted", () => {
    it("should return formatted array with correct length", () => {
      const formatted = getAllTemplatesFormatted();
      expect(formatted).toHaveLength(workflowSuggestionTemplates.length);
    });

    it("should have correct structure for each formatted template", () => {
      const formatted = getAllTemplatesFormatted();
      formatted.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("description");
        expect(item).toHaveProperty("priority");
        expect(item).toHaveProperty("responsible");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("origin");
      });
    });

    it("should map properties correctly", () => {
      const formatted = getAllTemplatesFormatted();
      const first = formatted[0];
      const original = workflowSuggestionTemplates[0];

      expect(first.id).toBe(0);
      expect(first.title).toBe(original.etapa);
      expect(first.description).toBe(original.conteudo);
      expect(first.priority).toBe(original.criticidade);
      expect(first.responsible).toBe(original.responsavel_sugerido);
      expect(first.type).toBe(original.tipo_sugestao);
      expect(first.origin).toBe(original.origem);
    });

    it("should have sequential IDs", () => {
      const formatted = getAllTemplatesFormatted();
      formatted.forEach((item, index) => {
        expect(item.id).toBe(index);
      });
    });
  });

  describe("getTemplateSummary", () => {
    it("should return correct total count", () => {
      const summary = getTemplateSummary();
      expect(summary.total).toBe(3);
    });

    it("should count criticidade levels correctly", () => {
      const summary = getTemplateSummary();
      expect(summary.alta).toBe(2);
      expect(summary.media).toBe(1);
      expect(summary.baixa).toBe(0);
    });

    it("should count by responsavel correctly", () => {
      const summary = getTemplateSummary();
      expect(summary.byResponsavel["Oficial de Náutica"]).toBe(1);
      expect(summary.byResponsavel["Engenharia Onshore"]).toBe(1);
      expect(summary.byResponsavel["Supervisor de DP"]).toBe(1);
    });

    it("should count by tipo correctly", () => {
      const summary = getTemplateSummary();
      expect(summary.byTipo["Criar tarefa"]).toBe(2);
      expect(summary.byTipo["Ajustar prazo"]).toBe(1);
    });

    it("should have all required properties", () => {
      const summary = getTemplateSummary();
      expect(summary).toHaveProperty("total");
      expect(summary).toHaveProperty("alta");
      expect(summary).toHaveProperty("media");
      expect(summary).toHaveProperty("baixa");
      expect(summary).toHaveProperty("byResponsavel");
      expect(summary).toHaveProperty("byTipo");
    });
  });

  describe("searchTemplates", () => {
    it("should find templates by etapa keyword", () => {
      const results = searchTemplates("sensor");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].etapa).toContain("sensores");
    });

    it("should find templates by conteudo keyword", () => {
      const results = searchTemplates("FMEA");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].conteudo).toContain("FMEA");
    });

    it("should be case insensitive", () => {
      const lowerResults = searchTemplates("fmea");
      const upperResults = searchTemplates("FMEA");
      expect(lowerResults).toEqual(upperResults);
    });

    it("should find templates by checklist keyword", () => {
      const results = searchTemplates("checklist");
      expect(results).toHaveLength(1);
      expect(results[0].etapa).toContain("checklists");
    });

    it("should return empty array for non-matching keyword", () => {
      const results = searchTemplates("xyz123nonexistent");
      expect(results).toHaveLength(0);
    });

    it("should find multiple templates with common keyword", () => {
      const results = searchTemplates("a"); // Common letter
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
