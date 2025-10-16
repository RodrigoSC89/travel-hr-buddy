// IMCA Audit System Tests
// Comprehensive test suite for IMCA DP Technical Audit functionality

import { describe, it, expect } from "vitest";
import {
  isValidDPClass,
  getRiskLevelColor,
  getPriorityLevelColor,
  formatAuditForExport,
  IMCA_STANDARDS,
  DP_MODULES,
  RISK_COLORS,
  PRIORITY_COLORS,
} from "@/types/imca-audit";
import type {
  DPClass,
  RiskLevel,
  PriorityLevel,
  AuditResult,
  IMCAStandard,
} from "@/types/imca-audit";

describe("IMCA Audit System", () => {
  describe("Type Validation", () => {
    it("should validate DP classes correctly", () => {
      expect(isValidDPClass("DP1")).toBe(true);
      expect(isValidDPClass("DP2")).toBe(true);
      expect(isValidDPClass("DP3")).toBe(true);
      expect(isValidDPClass("DP4")).toBe(false);
      expect(isValidDPClass("")).toBe(false);
      expect(isValidDPClass("invalid")).toBe(false);
    });

    it("should have all 3 DP classes", () => {
      const validClasses: DPClass[] = ["DP1", "DP2", "DP3"];
      expect(validClasses.length).toBe(3);
      validClasses.forEach(dpClass => {
        expect(isValidDPClass(dpClass)).toBe(true);
      });
    });
  });

  describe("Standards Coverage", () => {
    it("should include all 10 international standards", () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it("should have complete standard information", () => {
      IMCA_STANDARDS.forEach((standard: IMCAStandard) => {
        expect(standard.code).toBeTruthy();
        expect(standard.title).toBeTruthy();
        expect(standard.description).toBeTruthy();
      });
    });

    it("should include key IMCA standards", () => {
      const codes = IMCA_STANDARDS.map(s => s.code);
      expect(codes).toContain("IMCA M103");
      expect(codes).toContain("IMCA M117");
      expect(codes).toContain("IMCA M190");
      expect(codes).toContain("IMCA M166");
      expect(codes).toContain("IMO MSC.1/Circ.1580");
    });
  });

  describe("Module Coverage", () => {
    it("should include all 12 critical DP system modules", () => {
      expect(DP_MODULES).toHaveLength(12);
    });

    it("should include key DP modules", () => {
      expect(DP_MODULES).toContain("Sistema de Controle DP");
      expect(DP_MODULES).toContain("Sistema de Propulsão");
      expect(DP_MODULES).toContain("Sensores de Posicionamento");
      expect(DP_MODULES).toContain("FMEA");
      expect(DP_MODULES).toContain("Testes Anuais");
      expect(DP_MODULES).toContain("Power Management System");
    });
  });

  describe("Risk Level Colors", () => {
    it("should have colors for all risk levels", () => {
      expect(RISK_COLORS).toHaveProperty("Alto");
      expect(RISK_COLORS).toHaveProperty("Médio");
      expect(RISK_COLORS).toHaveProperty("Baixo");
    });

    it("should return correct colors for risk levels", () => {
      expect(getRiskLevelColor("Alto")).toBe("text-red-500");
      expect(getRiskLevelColor("Médio")).toBe("text-yellow-500");
      expect(getRiskLevelColor("Baixo")).toBe("text-gray-500");
    });

    it("should have distinct colors for each risk level", () => {
      const colors = Object.values(RISK_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe("Priority Level Colors", () => {
    it("should have colors for all priority levels", () => {
      expect(PRIORITY_COLORS).toHaveProperty("Crítico");
      expect(PRIORITY_COLORS).toHaveProperty("Alto");
      expect(PRIORITY_COLORS).toHaveProperty("Médio");
      expect(PRIORITY_COLORS).toHaveProperty("Baixo");
    });

    it("should return correct colors for priority levels", () => {
      expect(getPriorityLevelColor("Crítico")).toBe("text-red-500");
      expect(getPriorityLevelColor("Alto")).toBe("text-orange-500");
      expect(getPriorityLevelColor("Médio")).toBe("text-yellow-500");
      expect(getPriorityLevelColor("Baixo")).toBe("text-blue-500");
    });

    it("should have distinct colors for each priority level", () => {
      const colors = Object.values(PRIORITY_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe("Markdown Export", () => {
    const mockAudit: AuditResult = {
      vesselName: "Test Vessel",
      dpClass: "DP2",
      location: "Test Location",
      auditDate: "2025-10-16",
      auditObjective: "Test audit objective",
      overallScore: 75,
      standards: [
        {
          code: "IMCA M103",
          title: "Guidelines for Design and Operation of DP Vessels",
          description: "Core guidelines",
        },
      ],
      modules: [
        {
          name: "Sistema de Controle DP",
          description: "DP Control System",
          score: 80,
          conformities: ["Conformity 1"],
          nonConformities: ["Non-conformity 1"],
        },
      ],
      nonConformities: [
        {
          id: "nc-1",
          module: "Sistema de Controle DP",
          description: "Test non-conformity",
          standard: "IMCA M103",
          riskLevel: "Alto",
          recommendation: "Fix immediately",
        },
      ],
      actionPlan: [
        {
          id: "action-1",
          description: "Test action",
          priority: "Crítico",
          deadline: "< 7 days",
        },
      ],
      summary: "Test summary",
      recommendations: ["Recommendation 1", "Recommendation 2"],
      generatedAt: "2025-10-16T10:00:00Z",
    };

    it("should format audit for markdown export", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("# Auditoria IMCA - Test Vessel");
      expect(markdown).toContain("Test Vessel");
      expect(markdown).toContain("DP2");
      expect(markdown).toContain("Test Location");
    });

    it("should include all sections in markdown", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("## Dados Gerais");
      expect(markdown).toContain("## Normas Avaliadas");
      expect(markdown).toContain("## Módulos Avaliados");
      expect(markdown).toContain("## Não Conformidades");
      expect(markdown).toContain("## Plano de Ação");
      expect(markdown).toContain("## Resumo");
      expect(markdown).toContain("## Recomendações");
    });

    it("should include overall score in markdown", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("75/100");
    });

    it("should include non-conformities with risk levels", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("Test non-conformity");
      expect(markdown).toContain("Alto");
    });

    it("should include action plan with priorities", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("Test action");
      expect(markdown).toContain("Crítico");
    });
  });

  describe("Audit Data Structure", () => {
    it("should have required fields for basic data", () => {
      const basicData = {
        vesselName: "Test Vessel",
        dpClass: "DP2" as DPClass,
        location: "Test Location",
        auditObjective: "Test objective",
      };

      expect(basicData.vesselName).toBeDefined();
      expect(basicData.dpClass).toBeDefined();
      expect(basicData.location).toBeDefined();
      expect(basicData.auditObjective).toBeDefined();
    });

    it("should allow optional operational data", () => {
      const operationalData = {
        incidentDetails: "Test incident",
        environmentalConditions: "Test conditions",
        systemStatus: "Test status",
        operationalNotes: "Test notes",
      };

      expect(operationalData.incidentDetails).toBeDefined();
      expect(operationalData.environmentalConditions).toBeDefined();
      expect(operationalData.systemStatus).toBeDefined();
      expect(operationalData.operationalNotes).toBeDefined();
    });
  });
});
