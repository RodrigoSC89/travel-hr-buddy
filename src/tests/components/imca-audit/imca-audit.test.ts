/**
 * IMCA Audit System Tests
 * Comprehensive test suite for IMCA DP Technical Audit System
 */

import { describe, it, expect } from "vitest";
import {
  DPClass,
  RiskLevel,
  PriorityLevel,
  isValidDPClass,
  getRiskLevelColor,
  getPriorityLevelColor,
  getDeadlineByPriority,
  DP_MODULES,
  INTERNATIONAL_STANDARDS,
  formatAuditForExport,
  IMCAAuditReport
} from "@/types/imca-audit";

describe("IMCA Audit Type System", () => {
  describe("DP Class Validation", () => {
    it("should validate correct DP classes", () => {
      expect(isValidDPClass("DP1")).toBe(true);
      expect(isValidDPClass("DP2")).toBe(true);
      expect(isValidDPClass("DP3")).toBe(true);
    });

    it("should reject invalid DP classes", () => {
      expect(isValidDPClass("DP4")).toBe(false);
      expect(isValidDPClass("dp1")).toBe(false);
      expect(isValidDPClass("")).toBe(false);
    });
  });

  describe("Risk Level Colors", () => {
    it("should return correct color for Alto risk", () => {
      expect(getRiskLevelColor("Alto")).toBe("bg-red-500");
    });

    it("should return correct color for Médio risk", () => {
      expect(getRiskLevelColor("Médio")).toBe("bg-yellow-500");
    });

    it("should return correct color for Baixo risk", () => {
      expect(getRiskLevelColor("Baixo")).toBe("bg-green-500");
    });
  });

  describe("Priority Level Colors", () => {
    it("should return correct color for Crítico priority", () => {
      expect(getPriorityLevelColor("Crítico")).toBe("bg-red-600");
    });

    it("should return correct color for Alto priority", () => {
      expect(getPriorityLevelColor("Alto")).toBe("bg-orange-500");
    });

    it("should return correct color for Médio priority", () => {
      expect(getPriorityLevelColor("Médio")).toBe("bg-blue-500");
    });

    it("should return correct color for Baixo priority", () => {
      expect(getPriorityLevelColor("Baixo")).toBe("bg-green-500");
    });
  });

  describe("Deadline Calculation", () => {
    it("should calculate deadline for Crítico priority (7 days)", () => {
      const deadline = getDeadlineByPriority("Crítico");
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 7);
      expect(deadline).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it("should calculate deadline for Alto priority (30 days)", () => {
      const deadline = getDeadlineByPriority("Alto");
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 30);
      expect(deadline).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it("should calculate deadline for Médio priority (90 days)", () => {
      const deadline = getDeadlineByPriority("Médio");
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 90);
      expect(deadline).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it("should calculate deadline for Baixo priority (180 days)", () => {
      const deadline = getDeadlineByPriority("Baixo");
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 180);
      expect(deadline).toBe(expectedDate.toISOString().split('T')[0]);
    });
  });

  describe("DP Modules", () => {
    it("should have exactly 12 modules", () => {
      expect(DP_MODULES.length).toBe(12);
    });

    it("should include all required modules", () => {
      const requiredModules = [
        "Sistema de Controle DP",
        "Sistema de Propulsão",
        "Sensores de Posicionamento",
        "Rede e Comunicações",
        "Pessoal DP",
        "Logs e Históricos",
        "FMEA",
        "Testes Anuais",
        "Documentação",
        "Power Management System",
        "Capability Plots",
        "Planejamento Operacional"
      ];
      requiredModules.forEach(module => {
        expect(DP_MODULES).toContain(module);
      });
    });
  });

  describe("International Standards", () => {
    it("should have exactly 10 standards", () => {
      expect(INTERNATIONAL_STANDARDS.length).toBe(10);
    });

    it("should include all IMCA standards", () => {
      const imcaStandards = INTERNATIONAL_STANDARDS.filter(std => 
        std.startsWith("IMCA")
      );
      expect(imcaStandards.length).toBeGreaterThanOrEqual(7);
    });

    it("should include IMO standard", () => {
      const hasIMO = INTERNATIONAL_STANDARDS.some(std => 
        std.includes("IMO")
      );
      expect(hasIMO).toBe(true);
    });

    it("should include MTS standard", () => {
      const hasMTS = INTERNATIONAL_STANDARDS.some(std => 
        std.includes("MTS")
      );
      expect(hasMTS).toBe(true);
    });
  });

  describe("Audit Export Format", () => {
    const mockAudit: IMCAAuditReport = {
      vesselName: "Test Vessel",
      dpClass: "DP2",
      location: "Test Location",
      auditDate: "2025-01-01",
      auditObjective: "Test Objective",
      overallScore: 85,
      maxScore: 100,
      summary: "Test summary",
      moduleEvaluations: [
        {
          module: "Sistema de Controle DP",
          score: 9,
          maxScore: 10,
          status: "compliant",
          observations: "Test observations",
          nonConformities: []
        }
      ],
      nonConformities: [
        {
          id: "nc-1",
          module: "Sistema de Controle DP",
          description: "Test non-conformity",
          standard: "IMCA M103",
          riskLevel: "Médio",
          recommendation: "Test recommendation"
        }
      ],
      actionPlan: [
        {
          id: "action-1",
          description: "Test action",
          priority: "Alto",
          deadline: "2025-02-01",
          module: "Sistema de Controle DP"
        }
      ],
      standardsCompliance: [
        {
          standard: "IMCA M103",
          description: "Test standard",
          compliant: true,
          observations: "Test observations"
        }
      ],
      recommendations: ["Test recommendation"],
      generatedAt: "2025-01-01T00:00:00Z",
      status: "completed"
    };

    it("should format audit with all sections", () => {
      const markdown = formatAuditForExport(mockAudit);
      
      expect(markdown).toContain("# IMCA DP Technical Audit Report");
      expect(markdown).toContain("**Vessel:** Test Vessel");
      expect(markdown).toContain("**DP Class:** DP2");
      expect(markdown).toContain("**Overall Score:** 85/100");
      expect(markdown).toContain("## Executive Summary");
      expect(markdown).toContain("## Module Evaluations");
      expect(markdown).toContain("## Non-Conformities");
      expect(markdown).toContain("## Action Plan");
      expect(markdown).toContain("## Standards Compliance");
    });

    it("should include risk level icons in non-conformities", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("🟡"); // Médio risk icon
    });

    it("should include compliance icons in standards", () => {
      const markdown = formatAuditForExport(mockAudit);
      expect(markdown).toContain("✅"); // Compliant icon
    });
  });
});
