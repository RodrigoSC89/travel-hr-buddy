import { describe, it, expect } from "vitest";
import { 
  workflowSuggestionTemplates, 
  WorkflowSuggestionTemplate 
} from "@/lib/workflows/suggestionTemplates";

describe("Workflow Suggestion Templates", () => {
  describe("Template Structure", () => {
    it("should have exactly 3 templates", () => {
      expect(workflowSuggestionTemplates).toHaveLength(3);
    });

    it("should have all required fields in each template", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template).toHaveProperty("etapa");
        expect(template).toHaveProperty("tipo_sugestao");
        expect(template).toHaveProperty("conteudo");
        expect(template).toHaveProperty("criticidade");
        expect(template).toHaveProperty("responsavel_sugerido");
        expect(template).toHaveProperty("origem");
      });
    });

    it("should have valid criticidade values", () => {
      const validCriticidades: Array<"Alta" | "Média" | "Baixa"> = ["Alta", "Média", "Baixa"];
      workflowSuggestionTemplates.forEach((template) => {
        expect(validCriticidades).toContain(template.criticidade);
      });
    });

    it("should have non-empty string values", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.etapa).toBeTruthy();
        expect(template.tipo_sugestao).toBeTruthy();
        expect(template.conteudo).toBeTruthy();
        expect(template.criticidade).toBeTruthy();
        expect(template.responsavel_sugerido).toBeTruthy();
        expect(template.origem).toBeTruthy();
      });
    });

    it("should all have \"Template Histórico\" as origem", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.origem).toBe("Template Histórico");
      });
    });
  });

  describe("Template Content Verification", () => {
    it("should have template for sensor status verification", () => {
      const template = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Verificar status de sensores redundantes"
      );
      expect(template).toBeDefined();
      expect(template?.criticidade).toBe("Alta");
      expect(template?.responsavel_sugerido).toBe("Oficial de Náutica");
      expect(template?.tipo_sugestao).toBe("Criar tarefa");
    });

    it("should have template for FMEA document update", () => {
      const template = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Atualizar documento de FMEA embarcado"
      );
      expect(template).toBeDefined();
      expect(template?.criticidade).toBe("Média");
      expect(template?.responsavel_sugerido).toBe("Engenharia Onshore");
      expect(template?.tipo_sugestao).toBe("Criar tarefa");
    });

    it("should have template for checklist review", () => {
      const template = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Revisar checklists incompletos no último mês"
      );
      expect(template).toBeDefined();
      expect(template?.criticidade).toBe("Alta");
      expect(template?.responsavel_sugerido).toBe("Supervisor de DP");
      expect(template?.tipo_sugestao).toBe("Ajustar prazo");
    });

    it("should have templates with \"Criar tarefa\" type", () => {
      const taskTemplates = workflowSuggestionTemplates.filter(
        (t) => t.tipo_sugestao === "Criar tarefa"
      );
      expect(taskTemplates).toHaveLength(2);
    });

    it("should have template with \"Ajustar prazo\" type", () => {
      const deadlineTemplates = workflowSuggestionTemplates.filter(
        (t) => t.tipo_sugestao === "Ajustar prazo"
      );
      expect(deadlineTemplates).toHaveLength(1);
    });
  });

  describe("Template Statistics", () => {
    it("should have 2 templates with Alta criticidade", () => {
      const altaTemplates = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Alta"
      );
      expect(altaTemplates).toHaveLength(2);
    });

    it("should have 1 template with Média criticidade", () => {
      const mediaTemplates = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Média"
      );
      expect(mediaTemplates).toHaveLength(1);
    });

    it("should have 0 templates with Baixa criticidade", () => {
      const baixaTemplates = workflowSuggestionTemplates.filter(
        (t) => t.criticidade === "Baixa"
      );
      expect(baixaTemplates).toHaveLength(0);
    });
  });

  describe("Type Safety", () => {
    it("should match WorkflowSuggestionTemplate interface", () => {
      const template: WorkflowSuggestionTemplate = workflowSuggestionTemplates[0];
      expect(typeof template.etapa).toBe("string");
      expect(typeof template.tipo_sugestao).toBe("string");
      expect(typeof template.conteudo).toBe("string");
      expect(["Alta", "Média", "Baixa"]).toContain(template.criticidade);
      expect(typeof template.responsavel_sugerido).toBe("string");
      expect(typeof template.origem).toBe("string");
    });

    it("should be exportable as array", () => {
      expect(Array.isArray(workflowSuggestionTemplates)).toBe(true);
    });

    it("should be iterable", () => {
      let count = 0;
      for (const template of workflowSuggestionTemplates) {
        expect(template).toBeDefined();
        count++;
      }
      expect(count).toBe(3);
    });

    it("should support array methods", () => {
      const etapas = workflowSuggestionTemplates.map((t) => t.etapa);
      expect(etapas).toHaveLength(3);
      expect(etapas.every((e) => typeof e === "string")).toBe(true);
    });
  });
});
