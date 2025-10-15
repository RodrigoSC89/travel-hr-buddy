import { describe, it, expect } from "vitest";
import {
  workflowSuggestionTemplates,
  getTemplatesByCriticality,
  getTemplatesBySuggestionType,
  getTemplatesByResponsible,
  type WorkflowSuggestionTemplate,
} from "@/lib/workflows/suggestionTemplates";

describe("Workflow Suggestion Templates", () => {
  describe("Template Structure", () => {
    it("should have exactly 3 template entries", () => {
      expect(workflowSuggestionTemplates).toHaveLength(3);
    });

    it("should have valid structure for all templates", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template).toHaveProperty("etapa");
        expect(template).toHaveProperty("tipo_sugestao");
        expect(template).toHaveProperty("conteudo");
        expect(template).toHaveProperty("criticidade");
        expect(template).toHaveProperty("responsavel_sugerido");
        expect(template).toHaveProperty("origem");
      });
    });

    it("should have valid criticality levels", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(["Alta", "Média", "Baixa"]).toContain(template.criticidade);
      });
    });

    it("should have all templates marked as Template Histórico", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.origem).toBe("Template Histórico");
      });
    });

    it("should have non-empty string values", () => {
      workflowSuggestionTemplates.forEach((template) => {
        expect(template.etapa).toBeTruthy();
        expect(template.tipo_sugestao).toBeTruthy();
        expect(template.conteudo).toBeTruthy();
        expect(template.responsavel_sugerido).toBeTruthy();
      });
    });
  });

  describe("Template Content Validation", () => {
    it("should include sensor verification template", () => {
      const sensorTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Verificar status de sensores redundantes"
      );
      expect(sensorTemplate).toBeDefined();
      expect(sensorTemplate?.tipo_sugestao).toBe("Criar tarefa");
      expect(sensorTemplate?.criticidade).toBe("Alta");
      expect(sensorTemplate?.responsavel_sugerido).toBe("Oficial de Náutica");
    });

    it("should include FMEA document update template", () => {
      const fmeaTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Atualizar documento de FMEA embarcado"
      );
      expect(fmeaTemplate).toBeDefined();
      expect(fmeaTemplate?.tipo_sugestao).toBe("Criar tarefa");
      expect(fmeaTemplate?.criticidade).toBe("Média");
      expect(fmeaTemplate?.responsavel_sugerido).toBe("Engenharia Onshore");
    });

    it("should include checklist review template", () => {
      const checklistTemplate = workflowSuggestionTemplates.find(
        (t) => t.etapa === "Revisar checklists incompletos no último mês"
      );
      expect(checklistTemplate).toBeDefined();
      expect(checklistTemplate?.tipo_sugestao).toBe("Ajustar prazo");
      expect(checklistTemplate?.criticidade).toBe("Alta");
      expect(checklistTemplate?.responsavel_sugerido).toBe("Supervisor de DP");
    });
  });

  describe("Filter Functions", () => {
    describe("getTemplatesByCriticality", () => {
      it("should filter templates by Alta criticality", () => {
        const highPriority = getTemplatesByCriticality("Alta");
        expect(highPriority).toHaveLength(2);
        highPriority.forEach((template) => {
          expect(template.criticidade).toBe("Alta");
        });
      });

      it("should filter templates by Média criticality", () => {
        const mediumPriority = getTemplatesByCriticality("Média");
        expect(mediumPriority).toHaveLength(1);
        expect(mediumPriority[0].criticidade).toBe("Média");
      });

      it("should return empty array for Baixa criticality", () => {
        const lowPriority = getTemplatesByCriticality("Baixa");
        expect(lowPriority).toHaveLength(0);
      });
    });

    describe("getTemplatesBySuggestionType", () => {
      it("should filter templates by Criar tarefa type", () => {
        const createTaskTemplates = getTemplatesBySuggestionType("Criar tarefa");
        expect(createTaskTemplates).toHaveLength(2);
        createTaskTemplates.forEach((template) => {
          expect(template.tipo_sugestao).toBe("Criar tarefa");
        });
      });

      it("should filter templates by Ajustar prazo type", () => {
        const adjustDeadlineTemplates = getTemplatesBySuggestionType("Ajustar prazo");
        expect(adjustDeadlineTemplates).toHaveLength(1);
        expect(adjustDeadlineTemplates[0].tipo_sugestao).toBe("Ajustar prazo");
      });

      it("should return empty array for non-existent type", () => {
        const nonExistent = getTemplatesBySuggestionType("Non-existent type");
        expect(nonExistent).toHaveLength(0);
      });
    });

    describe("getTemplatesByResponsible", () => {
      it("should filter templates by Oficial de Náutica", () => {
        const nauticaTemplates = getTemplatesByResponsible("Oficial de Náutica");
        expect(nauticaTemplates).toHaveLength(1);
        expect(nauticaTemplates[0].responsavel_sugerido).toBe("Oficial de Náutica");
      });

      it("should filter templates by Engenharia Onshore", () => {
        const engineeringTemplates = getTemplatesByResponsible("Engenharia Onshore");
        expect(engineeringTemplates).toHaveLength(1);
        expect(engineeringTemplates[0].responsavel_sugerido).toBe("Engenharia Onshore");
      });

      it("should filter templates by Supervisor de DP", () => {
        const supervisorTemplates = getTemplatesByResponsible("Supervisor de DP");
        expect(supervisorTemplates).toHaveLength(1);
        expect(supervisorTemplates[0].responsavel_sugerido).toBe("Supervisor de DP");
      });

      it("should return empty array for non-existent responsible", () => {
        const nonExistent = getTemplatesByResponsible("Non-existent role");
        expect(nonExistent).toHaveLength(0);
      });
    });
  });

  describe("TypeScript Type Validation", () => {
    it("should comply with WorkflowSuggestionTemplate interface", () => {
      const template: WorkflowSuggestionTemplate = {
        etapa: "Test Stage",
        tipo_sugestao: "Test Type",
        conteudo: "Test Content",
        criticidade: "Alta",
        responsavel_sugerido: "Test Responsible",
        origem: "Test Origin",
      };

      expect(template).toHaveProperty("etapa");
      expect(template).toHaveProperty("tipo_sugestao");
      expect(template).toHaveProperty("conteudo");
      expect(template).toHaveProperty("criticidade");
      expect(template).toHaveProperty("responsavel_sugerido");
      expect(template).toHaveProperty("origem");
    });

    it("should enforce criticidade type constraints", () => {
      const validCriticalities: Array<"Alta" | "Média" | "Baixa"> = ["Alta", "Média", "Baixa"];
      
      validCriticalities.forEach((criticidade) => {
        const template: WorkflowSuggestionTemplate = {
          etapa: "Test",
          tipo_sugestao: "Test",
          conteudo: "Test",
          criticidade,
          responsavel_sugerido: "Test",
          origem: "Test",
        };
        expect(template.criticidade).toBe(criticidade);
      });
    });
  });

  describe("Integration Scenarios", () => {
    it("should support workflow initialization with templates", () => {
      // Simulate loading templates for a new workflow
      const templates = workflowSuggestionTemplates;
      expect(templates.length).toBeGreaterThan(0);
      
      // Templates should be ready for AI copilot suggestions
      const highPriorityTemplates = getTemplatesByCriticality("Alta");
      expect(highPriorityTemplates.length).toBeGreaterThan(0);
    });

    it("should support audit best practices lookup", () => {
      // Simulate finding templates for an audit scenario
      const allTemplates = workflowSuggestionTemplates;
      const historicalTemplates = allTemplates.filter(
        (t) => t.origem === "Template Histórico"
      );
      
      expect(historicalTemplates.length).toBe(allTemplates.length);
    });

    it("should support contextual suggestions by role", () => {
      // Simulate showing relevant templates based on user role
      const roles = ["Oficial de Náutica", "Engenharia Onshore", "Supervisor de DP"];
      
      roles.forEach((role) => {
        const roleTemplates = getTemplatesByResponsible(role);
        expect(roleTemplates.length).toBeGreaterThan(0);
        roleTemplates.forEach((template) => {
          expect(template.responsavel_sugerido).toBe(role);
        });
      });
    });
  });
});
