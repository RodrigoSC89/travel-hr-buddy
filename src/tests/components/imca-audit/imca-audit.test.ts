/**
 * IMCA Audit System Tests
 * Comprehensive test suite for IMCA DP Technical Audit functionality
 */

import { describe, it, expect } from "vitest";
import {
  DPClass,
  RiskLevel,
  PriorityLevel,
  IMCAAuditInput,
  IMCAAuditReport,
  IMCA_STANDARDS,
  DP_MODULES,
  getRiskLevelColor,
  getPriorityLevelColor,
  getDeadlineFromPriority,
  isValidDPClass,
  validateAuditInput,
  formatAuditToMarkdown,
} from "@/types/imca-audit";

describe("IMCA Audit Type Definitions", () => {
  describe("Constants", () => {
    it("should have exactly 10 IMCA/IMO/MTS standards", () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it("should include all required standards", () => {
      const standardCodes = IMCA_STANDARDS.map(s => s.code);
      expect(standardCodes).toContain("IMCA M 103");
      expect(standardCodes).toContain("IMCA M 117");
      expect(standardCodes).toContain("IMCA M 190");
      expect(standardCodes).toContain("IMCA M 166");
      expect(standardCodes).toContain("IMCA M 109");
      expect(standardCodes).toContain("IMCA M 220");
      expect(standardCodes).toContain("IMCA M 140");
      expect(standardCodes).toContain("MSF 182");
      expect(standardCodes).toContain("MTS DP Operations");
      expect(standardCodes).toContain("IMO MSC.1/Circ.1580");
    });

    it("should have exactly 12 DP modules", () => {
      expect(DP_MODULES).toHaveLength(12);
    });

    it("should include all critical DP modules", () => {
      const moduleIds = DP_MODULES.map(m => m.id);
      expect(moduleIds).toContain("control");
      expect(moduleIds).toContain("propulsion");
      expect(moduleIds).toContain("power");
      expect(moduleIds).toContain("sensors");
      expect(moduleIds).toContain("communications");
      expect(moduleIds).toContain("personnel");
      expect(moduleIds).toContain("fmea");
      expect(moduleIds).toContain("trials");
      expect(moduleIds).toContain("documentation");
      expect(moduleIds).toContain("pms");
      expect(moduleIds).toContain("capability");
      expect(moduleIds).toContain("planning");
    });
  });

  describe("Helper Functions", () => {
    describe("getRiskLevelColor", () => {
      it("should return red for Alto risk", () => {
        expect(getRiskLevelColor("Alto")).toContain("red");
      });

      it("should return yellow for Médio risk", () => {
        expect(getRiskLevelColor("Médio")).toContain("yellow");
      });

      it("should return green for Baixo risk", () => {
        expect(getRiskLevelColor("Baixo")).toContain("green");
      });
    });

    describe("getPriorityLevelColor", () => {
      it("should return red for Crítico priority", () => {
        expect(getPriorityLevelColor("Crítico")).toContain("red");
      });

      it("should return orange for Alto priority", () => {
        expect(getPriorityLevelColor("Alto")).toContain("orange");
      });

      it("should return blue for Médio priority", () => {
        expect(getPriorityLevelColor("Médio")).toContain("blue");
      });

      it("should return gray for Baixo priority", () => {
        expect(getPriorityLevelColor("Baixo")).toContain("gray");
      });
    });

    describe("getDeadlineFromPriority", () => {
      it("should return deadline 7 days from today for Crítico", () => {
        const deadline = getDeadlineFromPriority("Crítico");
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(7);
      });

      it("should return deadline 30 days from today for Alto", () => {
        const deadline = getDeadlineFromPriority("Alto");
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(30);
      });

      it("should return deadline 90 days from today for Médio", () => {
        const deadline = getDeadlineFromPriority("Médio");
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(90);
      });

      it("should return deadline 180 days from today for Baixo", () => {
        const deadline = getDeadlineFromPriority("Baixo");
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(180);
      });
    });

    describe("isValidDPClass", () => {
      it("should validate DP1 as valid", () => {
        expect(isValidDPClass("DP1")).toBe(true);
      });

      it("should validate DP2 as valid", () => {
        expect(isValidDPClass("DP2")).toBe(true);
      });

      it("should validate DP3 as valid", () => {
        expect(isValidDPClass("DP3")).toBe(true);
      });

      it("should reject invalid DP classes", () => {
        expect(isValidDPClass("DP4")).toBe(false);
        expect(isValidDPClass("DP0")).toBe(false);
        expect(isValidDPClass("")).toBe(false);
      });
    });

    describe("validateAuditInput", () => {
      const validInput: IMCAAuditInput = {
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Santos Basin",
        auditObjective: "Routine audit",
      };

      it("should validate correct input with no errors", () => {
        const errors = validateAuditInput(validInput);
        expect(errors).toHaveLength(0);
      });

      it("should require vessel name", () => {
        const input = { ...validInput, vesselName: "" };
        const errors = validateAuditInput(input);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.includes("embarcação"))).toBe(true);
      });

      it("should require valid DP class", () => {
        const input = { ...validInput, dpClass: "DP4" as DPClass };
        const errors = validateAuditInput(input);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.includes("Classe DP"))).toBe(true);
      });

      it("should require location", () => {
        const input = { ...validInput, location: "" };
        const errors = validateAuditInput(input);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.includes("Localização"))).toBe(true);
      });

      it("should require audit objective", () => {
        const input = { ...validInput, auditObjective: "" };
        const errors = validateAuditInput(input);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.includes("Objetivo"))).toBe(true);
      });
    });
  });

  describe("formatAuditToMarkdown", () => {
    const mockReport: IMCAAuditReport = {
      id: "test-id",
      userId: "user-id",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      vesselName: "Test Vessel",
      dpClass: "DP2",
      location: "Santos Basin",
      auditDate: "2024-01-01",
      auditObjective: "Test audit",
      overallScore: 85,
      executiveSummary: "Test summary",
      standardsEvaluated: ["IMCA M 103", "IMCA M 117"],
      moduleEvaluations: [
        {
          moduleId: "control",
          moduleName: "Control Systems",
          score: 90,
          findings: "Good condition",
          recommendations: ["Maintain current standards"],
        },
      ],
      nonConformities: [
        {
          id: "nc-1",
          standard: "IMCA M 103",
          module: "Control Systems",
          description: "Minor issue",
          riskLevel: "Baixo",
          evidence: "Test evidence",
        },
      ],
      actionPlan: [
        {
          id: "action-1",
          description: "Fix minor issue",
          priority: "Baixo",
          deadline: "2024-07-01",
          responsible: "Test Person",
        },
      ],
      observations: "Test observations",
      strengths: ["Good team"],
      weaknesses: ["Needs improvement"],
    };

    it("should include vessel name in markdown", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Test Vessel");
    });

    it("should include DP class in markdown", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("DP2");
    });

    it("should include overall score in markdown", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("85/100");
    });

    it("should include executive summary in markdown", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Test summary");
    });

    it("should include all evaluated standards", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("IMCA M 103");
      expect(markdown).toContain("IMCA M 117");
    });

    it("should include module evaluations", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Control Systems");
      expect(markdown).toContain("90/100");
      expect(markdown).toContain("Good condition");
    });

    it("should include non-conformities with risk emojis", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Minor issue");
      expect(markdown).toContain("⚪"); // Baixo risk emoji
    });

    it("should include action plan with priorities", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Fix minor issue");
      expect(markdown).toContain("Baixo");
      expect(markdown).toContain("2024-07-01");
    });

    it("should include observations if present", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("Test observations");
    });

    it("should have proper markdown structure", () => {
      const markdown = formatAuditToMarkdown(mockReport);
      expect(markdown).toContain("# Auditoria Técnica IMCA DP");
      expect(markdown).toContain("## Informações Básicas");
      expect(markdown).toContain("## Resumo Executivo");
      expect(markdown).toContain("## Normas Avaliadas");
      expect(markdown).toContain("## Avaliação por Módulo");
      expect(markdown).toContain("## Não Conformidades");
      expect(markdown).toContain("## Plano de Ação");
    });
  });

  describe("Data Structure Validation", () => {
    it("should have correct structure for IMCAAuditInput", () => {
      const input: IMCAAuditInput = {
        vesselName: "Test",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
        operationalData: {
          incidentDetails: "Test incident",
          environmentalConditions: "Test conditions",
          systemStatus: "Test status",
          recentChanges: "Test changes",
        },
      };
      expect(input.vesselName).toBe("Test");
      expect(input.dpClass).toBe("DP2");
      expect(input.operationalData?.incidentDetails).toBe("Test incident");
    });

    it("should allow optional operational data", () => {
      const input: IMCAAuditInput = {
        vesselName: "Test",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
      };
      expect(input.operationalData).toBeUndefined();
    });
  });
});
