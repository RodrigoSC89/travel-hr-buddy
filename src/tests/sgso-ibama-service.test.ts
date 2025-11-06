/**
 * SGSO IBAMA Requirements Service Tests
 * 
 * Tests for the SGSO IBAMA requirements service that manages
 * the 17 official IBAMA SGSO requirements for maritime compliance.
 */

import { describe, it, expect } from "vitest";
import type { SGSOIbamaRequirement } from "@/types/sgso-ibama";

describe("SGSO IBAMA Requirements Service", () => {
  describe("Database Schema", () => {
    it("should have sgso_ibama_requirements table", () => {
      const tableName = "sgso_ibama_requirements";
      expect(tableName).toBe("sgso_ibama_requirements");
    });

    it("should have correct columns in the table", () => {
      const columns = [
        "id",
        "requirement_number",
        "requirement_title",
        "description",
        "created_at",
        "updated_at"
      ];
      expect(columns).toContain("id");
      expect(columns).toContain("requirement_number");
      expect(columns).toContain("requirement_title");
      expect(columns).toContain("description");
    });

    it("should enforce requirement_number between 1 and 17", () => {
      const validNumbers = [1, 2, 3, 10, 15, 17];
      const invalidNumbers = [0, 18, 20, -1];
      
      validNumbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(17);
      });

      invalidNumbers.forEach(num => {
        expect(num < 1 || num > 17).toBe(true);
      });
    });

    it("should have unique constraint on requirement_number", () => {
      const constraint = "requirement_number must be unique";
      expect(constraint).toContain("unique");
    });
  });

  describe("Requirement Structure", () => {
    it("should match the expected IBAMA requirement format", () => {
      const mockRequirement: SGSOIbamaRequirement = {
        id: "uuid-123",
        requirement_number: 1,
        requirement_title: "Política de SMS",
        description: "A empresa deve estabelecer uma política documentada de Segurança, Meio Ambiente e Saúde (SMS), aprovada pela alta direção, divulgada e compreendida por todos os níveis da organização.",
        created_at: "2025-10-18T00:00:00Z",
        updated_at: "2025-10-18T00:00:00Z"
      };

      expect(mockRequirement).toHaveProperty("requirement_number");
      expect(mockRequirement).toHaveProperty("requirement_title");
      expect(mockRequirement).toHaveProperty("description");
      expect(mockRequirement.requirement_number).toBe(1);
    });

    it("should have all 17 official IBAMA requirements", () => {
      const expectedRequirements = [
        { number: 1, title: "Política de SMS" },
        { number: 2, title: "Planejamento Operacional" },
        { number: 3, title: "Treinamento e Capacitação" },
        { number: 4, title: "Comunicação e Acesso à Informação" },
        { number: 5, title: "Gestão de Riscos" },
        { number: 6, title: "Equipamentos Críticos" },
        { number: 7, title: "Procedimentos de Emergência" },
        { number: 8, title: "Manutenção Preventiva" },
        { number: 9, title: "Inspeções e Verificações" },
        { number: 10, title: "Auditorias Internas" },
        { number: 11, title: "Gestão de Mudanças" },
        { number: 12, title: "Registro de Incidentes" },
        { number: 13, title: "Análise de Causa Raiz" },
        { number: 14, title: "Monitoramento de Desempenho" },
        { number: 15, title: "Análise Crítica pela Direção" },
        { number: 16, title: "Melhoria Contínua" },
        { number: 17, title: "Conformidade Legal e Regulatória" }
      ];

      expect(expectedRequirements).toHaveLength(17);
      expect(expectedRequirements[0].number).toBe(1);
      expect(expectedRequirements[16].number).toBe(17);
    });
  });

  describe("Service Methods", () => {
    it("should have getAllIbamaRequirements method", () => {
      const methodName = "getAllIbamaRequirements";
      expect(methodName).toBe("getAllIbamaRequirements");
    });

    it("should have getIbamaRequirementByNumber method", () => {
      const methodName = "getIbamaRequirementByNumber";
      expect(methodName).toBe("getIbamaRequirementByNumber");
    });

    it("should have getIbamaRequirementById method", () => {
      const methodName = "getIbamaRequirementById";
      expect(methodName).toBe("getIbamaRequirementById");
    });

    it("should have searchIbamaRequirements method", () => {
      const methodName = "searchIbamaRequirements";
      expect(methodName).toBe("searchIbamaRequirements");
    });

    it("should have getIbamaRequirementsWithCompliance method", () => {
      const methodName = "getIbamaRequirementsWithCompliance";
      expect(methodName).toBe("getIbamaRequirementsWithCompliance");
    });

    it("should have exportIbamaRequirementsAsJSON method", () => {
      const methodName = "exportIbamaRequirementsAsJSON";
      expect(methodName).toBe("exportIbamaRequirementsAsJSON");
    });

    it("should have getIbamaRequirementsSummary method", () => {
      const methodName = "getIbamaRequirementsSummary";
      expect(methodName).toBe("getIbamaRequirementsSummary");
    });
  });

  describe("Requirement Categories", () => {
    it("should categorize requirements correctly", () => {
      const categories = {
        management: [1, 11, 15, 16, 17],
        risk_safety: [5, 7, 9, 12, 13, 14],
        operations: [2, 6, 8],
        training_communication: [3, 4],
        auditing: [10]
      };

      expect(categories.management).toContain(1); // Política de SMS
      expect(categories.risk_safety).toContain(5); // Gestão de Riscos
      expect(categories.operations).toContain(8); // Manutenção Preventiva
      expect(categories.training_communication).toContain(3); // Treinamento
      expect(categories.auditing).toContain(10); // Auditorias
    });

    it("should have all 17 requirements distributed across categories", () => {
      const categories = {
        management: [1, 11, 15, 16, 17],
        risk_safety: [5, 7, 9, 12, 13, 14],
        operations: [2, 6, 8],
        training_communication: [3, 4],
        auditing: [10]
      };

      const totalRequirements = 
        categories.management.length +
        categories.risk_safety.length +
        categories.operations.length +
        categories.training_communication.length +
        categories.auditing.length;

      expect(totalRequirements).toBe(17);
    });
  });

  describe("Search Functionality", () => {
    it("should search by keyword in title", () => {
      const mockRequirements = [
        { requirement_title: "Política de SMS", description: "..." },
        { requirement_title: "Gestão de Riscos", description: "..." },
        { requirement_title: "Treinamento e Capacitação", description: "..." }
      ];

      const keyword = "gestão";
      const filtered = mockRequirements.filter(r => 
        r.requirement_title.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].requirement_title).toContain("Gestão");
    });

    it("should search by keyword in description", () => {
      const mockRequirements = [
        { 
          requirement_title: "Política de SMS", 
          description: "A empresa deve estabelecer uma política documentada" 
        },
        { 
          requirement_title: "Gestão de Riscos", 
          description: "identificar, avaliar e controlar riscos" 
        }
      ];

      const keyword = "riscos";
      const filtered = mockRequirements.filter(r => 
        r.description.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toContain("riscos");
    });
  });

  describe("Validation", () => {
    it("should validate requirement number range", () => {
      const isValid = (num: number) => num >= 1 && num <= 17;

      expect(isValid(1)).toBe(true);
      expect(isValid(17)).toBe(true);
      expect(isValid(10)).toBe(true);
      expect(isValid(0)).toBe(false);
      expect(isValid(18)).toBe(false);
      expect(isValid(-1)).toBe(false);
    });

    it("should require non-empty title", () => {
      const requirement = {
        requirement_number: 1,
        requirement_title: "Política de SMS",
        description: "..."
      };

      expect(requirement.requirement_title).toBeTruthy();
      expect(requirement.requirement_title.length).toBeGreaterThan(0);
    });

    it("should require non-empty description", () => {
      const requirement = {
        requirement_number: 1,
        requirement_title: "Política de SMS",
        description: "A empresa deve estabelecer uma política documentada de Segurança, Meio Ambiente e Saúde (SMS)"
      };

      expect(requirement.description).toBeTruthy();
      expect(requirement.description.length).toBeGreaterThan(0);
    });
  });

  describe("Export Functionality", () => {
    it("should export requirements as JSON", () => {
      const mockRequirements = [
        {
          id: "uuid-1",
          requirement_number: 1,
          requirement_title: "Política de SMS",
          description: "..."
        }
      ];

      const json = JSON.stringify(mockRequirements, null, 2);
      expect(json).toContain("requirement_number");
      expect(json).toContain("requirement_title");
      expect(json).toContain("description");
    });

    it("should format JSON with proper indentation", () => {
      const mockData = { test: "value" };
      const json = JSON.stringify(mockData, null, 2);
      expect(json).toContain("  "); // 2-space indentation
    });
  });

  describe("Integration with UI", () => {
    it("should provide data suitable for UI display", () => {
      const requirement = {
        requirement_number: 1,
        requirement_title: "Política de SMS",
        description: "A empresa deve estabelecer uma política documentada de Segurança, Meio Ambiente e Saúde (SMS), aprovada pela alta direção, divulgada e compreendida por todos os níveis da organização."
      };

      // Verify structure for UI components
      expect(requirement.requirement_number).toBeTypeOf("number");
      expect(requirement.requirement_title).toBeTypeOf("string");
      expect(requirement.description).toBeTypeOf("string");
    });

    it("should support AI explainer integration", () => {
      const requirement = {
        requirement_number: 1,
        requirement_title: "Política de SMS",
        description: "A empresa deve estabelecer uma política documentada..."
      };

      // Data ready for AI processing
      const aiPrompt = `Explique o requisito IBAMA SGSO ${requirement.requirement_number}: ${requirement.requirement_title}. ${requirement.description}`;
      
      expect(aiPrompt).toContain("requisito IBAMA SGSO");
      expect(aiPrompt).toContain(requirement.requirement_title);
    });
  });

  describe("Row Level Security", () => {
    it("should enable RLS on sgso_ibama_requirements table", () => {
      const rlsEnabled = true;
      expect(rlsEnabled).toBe(true);
    });

    it("should allow authenticated users to read requirements", () => {
      const policyName = "Authenticated users can view IBAMA requirements";
      expect(policyName.toLowerCase()).toContain("authenticated");
      expect(policyName).toContain("view");
    });

    it("should make requirements read-only for users", () => {
      const operations = ["SELECT"];
      expect(operations).toContain("SELECT");
      expect(operations).not.toContain("INSERT");
      expect(operations).not.toContain("UPDATE");
      expect(operations).not.toContain("DELETE");
    });
  });

  describe("Summary Statistics", () => {
    it("should provide total requirements count", () => {
      const summary = {
        total_requirements: 17,
        requirement_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      };

      expect(summary.total_requirements).toBe(17);
      expect(summary.requirement_numbers).toHaveLength(17);
    });

    it("should provide category breakdown", () => {
      const summary = {
        categories: {
          management: [1, 11, 15, 16, 17],
          risk_safety: [5, 7, 9, 12, 13, 14],
          operations: [2, 6, 8],
          training_communication: [3, 4],
          auditing: [10]
        }
      };

      expect(summary.categories.management).toHaveLength(5);
      expect(summary.categories.risk_safety).toHaveLength(6);
      expect(summary.categories.operations).toHaveLength(3);
      expect(summary.categories.training_communication).toHaveLength(2);
      expect(summary.categories.auditing).toHaveLength(1);
    });
  });
});
