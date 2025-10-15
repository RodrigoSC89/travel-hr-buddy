import { describe, it, expect } from "vitest";
import { 
  workflowSuggestionTemplates, 
  WorkflowSuggestionTemplate 
} from "../../../lib/workflows/suggestionTemplates";

describe("Workflow Suggestion Templates", () => {
  it("should export an array of workflow suggestion templates", () => {
    expect(Array.isArray(workflowSuggestionTemplates)).toBe(true);
    expect(workflowSuggestionTemplates.length).toBeGreaterThan(0);
  });

  it("should have exactly 3 historical templates", () => {
    expect(workflowSuggestionTemplates.length).toBe(3);
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
    const validCriticidades = ["Alta", "Média", "Baixa"];
    
    workflowSuggestionTemplates.forEach((template) => {
      expect(validCriticidades).toContain(template.criticidade);
    });
  });

  it("should have 'Template Histórico' as origem for all templates", () => {
    workflowSuggestionTemplates.forEach((template) => {
      expect(template.origem).toBe("Template Histórico");
    });
  });

  it("should have non-empty strings for all fields", () => {
    workflowSuggestionTemplates.forEach((template) => {
      expect(template.etapa.length).toBeGreaterThan(0);
      expect(template.tipo_sugestao.length).toBeGreaterThan(0);
      expect(template.conteudo.length).toBeGreaterThan(0);
      expect(template.criticidade.length).toBeGreaterThan(0);
      expect(template.responsavel_sugerido.length).toBeGreaterThan(0);
      expect(template.origem.length).toBeGreaterThan(0);
    });
  });

  describe("Template 1: Verificar status de sensores redundantes", () => {
    it("should have correct properties", () => {
      const template = workflowSuggestionTemplates[0];
      
      expect(template.etapa).toBe("Verificar status de sensores redundantes");
      expect(template.tipo_sugestao).toBe("Criar tarefa");
      expect(template.conteudo).toContain("sensores de backup");
      expect(template.criticidade).toBe("Alta");
      expect(template.responsavel_sugerido).toBe("Oficial de Náutica");
    });
  });

  describe("Template 2: Atualizar documento de FMEA embarcado", () => {
    it("should have correct properties", () => {
      const template = workflowSuggestionTemplates[1];
      
      expect(template.etapa).toBe("Atualizar documento de FMEA embarcado");
      expect(template.tipo_sugestao).toBe("Criar tarefa");
      expect(template.conteudo).toContain("FMEA");
      expect(template.criticidade).toBe("Média");
      expect(template.responsavel_sugerido).toBe("Engenharia Onshore");
    });
  });

  describe("Template 3: Revisar checklists incompletos no último mês", () => {
    it("should have correct properties", () => {
      const template = workflowSuggestionTemplates[2];
      
      expect(template.etapa).toBe("Revisar checklists incompletos no último mês");
      expect(template.tipo_sugestao).toBe("Ajustar prazo");
      expect(template.conteudo).toContain("checklists");
      expect(template.criticidade).toBe("Alta");
      expect(template.responsavel_sugerido).toBe("Supervisor de DP");
    });
  });

  describe("WorkflowSuggestionTemplate interface", () => {
    it("should be properly typed", () => {
      const mockTemplate: WorkflowSuggestionTemplate = {
        etapa: "Test step",
        tipo_sugestao: "Test type",
        conteudo: "Test content",
        criticidade: "Baixa",
        responsavel_sugerido: "Test responsible",
        origem: "Test origin",
      };

      expect(mockTemplate.etapa).toBe("Test step");
      expect(mockTemplate.criticidade).toBe("Baixa");
    });
  });
});
