import { describe, it, expect, vi } from "vitest";
import {
  getDeadlineFromPriority,
  getRiskLevelColor,
  getPriorityColor,
  isValidDPClass,
  exportAuditToMarkdown,
  IMCA_STANDARDS,
  DP_MODULES,
  type DPClass,
  type Priority,
  type RiskLevel,
  type IMCAAuditResult,
} from "@/types/imca-audit";

describe("IMCA Audit Helper Functions", () => {
  describe("getDeadlineFromPriority", () => {
    it("should return correct deadline for Crítico priority (7 days)", () => {
      // Use fake timers for deterministic testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-17T00:00:00.000Z"));

      const deadline = getDeadlineFromPriority("Crítico");
      const now = new Date("2025-10-17T00:00:00.000Z");
      
      // Calculate days difference
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);

      vi.useRealTimers();
    });

    it("should return correct deadline for Alto priority (30 days)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-17T00:00:00.000Z"));

      const deadline = getDeadlineFromPriority("Alto");
      const now = new Date("2025-10-17T00:00:00.000Z");
      
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(30);

      vi.useRealTimers();
    });

    it("should return correct deadline for Médio priority (90 days)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-17T00:00:00.000Z"));

      const deadline = getDeadlineFromPriority("Médio");
      const now = new Date("2025-10-17T00:00:00.000Z");
      
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(90);

      vi.useRealTimers();
    });

    it("should return correct deadline for Baixo priority (180 days)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-17T00:00:00.000Z"));

      const deadline = getDeadlineFromPriority("Baixo");
      const now = new Date("2025-10-17T00:00:00.000Z");
      
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(180);

      vi.useRealTimers();
    });

    it("should handle different time of day without off-by-one errors", () => {
      // Test at noon UTC to ensure no time-of-day issues
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-17T12:30:45.000Z"));

      const deadline = getDeadlineFromPriority("Crítico");
      const now = new Date("2025-10-17T12:30:45.000Z");
      
      // Normalize both to start of day for comparison
      const startOfDayNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diffTime = deadline.getTime() - startOfDayNow.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);

      vi.useRealTimers();
    });
  });

  describe("getRiskLevelColor", () => {
    it("should return destructive for Alto risk", () => {
      expect(getRiskLevelColor("Alto")).toBe("destructive");
    });

    it("should return warning for Médio risk", () => {
      expect(getRiskLevelColor("Médio")).toBe("warning");
    });

    it("should return secondary for Baixo risk", () => {
      expect(getRiskLevelColor("Baixo")).toBe("secondary");
    });
  });

  describe("getPriorityColor", () => {
    it("should return destructive for Crítico priority", () => {
      expect(getPriorityColor("Crítico")).toBe("destructive");
    });

    it("should return destructive for Alto priority", () => {
      expect(getPriorityColor("Alto")).toBe("destructive");
    });

    it("should return warning for Médio priority", () => {
      expect(getPriorityColor("Médio")).toBe("warning");
    });

    it("should return secondary for Baixo priority", () => {
      expect(getPriorityColor("Baixo")).toBe("secondary");
    });
  });

  describe("isValidDPClass", () => {
    it("should return true for valid DP classes", () => {
      expect(isValidDPClass("DP1")).toBe(true);
      expect(isValidDPClass("DP2")).toBe(true);
      expect(isValidDPClass("DP3")).toBe(true);
    });

    it("should return false for invalid DP classes", () => {
      expect(isValidDPClass("DP4")).toBe(false);
      expect(isValidDPClass("dp1")).toBe(false);
      expect(isValidDPClass("")).toBe(false);
      expect(isValidDPClass("invalid")).toBe(false);
    });
  });

  describe("IMCA_STANDARDS", () => {
    it("should have exactly 10 standards", () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it("should include key IMCA standards", () => {
      expect(IMCA_STANDARDS.some((s) => s.includes("M103"))).toBe(true);
      expect(IMCA_STANDARDS.some((s) => s.includes("M117"))).toBe(true);
      expect(IMCA_STANDARDS.some((s) => s.includes("M190"))).toBe(true);
    });

    it("should include IMO standard", () => {
      expect(IMCA_STANDARDS.some((s) => s.includes("IMO"))).toBe(true);
    });

    it("should include MTS standard", () => {
      expect(IMCA_STANDARDS.some((s) => s.includes("MTS"))).toBe(true);
    });
  });

  describe("DP_MODULES", () => {
    it("should have exactly 12 modules", () => {
      expect(DP_MODULES).toHaveLength(12);
    });

    it("should include critical DP modules", () => {
      expect(DP_MODULES).toContain("Sistema de Controle DP");
      expect(DP_MODULES).toContain("Sistema de Propulsão");
      expect(DP_MODULES).toContain("Geração de Energia");
      expect(DP_MODULES).toContain("FMEA Atualizado");
    });

    it("should include personnel and documentation modules", () => {
      expect(DP_MODULES).toContain("Capacitação de Pessoal");
      expect(DP_MODULES).toContain("Documentação Técnica");
    });
  });

  describe("exportAuditToMarkdown", () => {
    const mockAudit: IMCAAuditResult = {
      vesselName: "Test Vessel",
      dpClass: "DP2",
      location: "Test Location",
      auditObjective: "Test Objective",
      auditDate: new Date("2025-10-17"),
      overallScore: 85,
      standards: [
        {
          standard: "IMCA M103",
          description: "Test standard",
          compliant: true,
          observations: "Test observation",
        },
      ],
      modules: [
        {
          name: "Test Module",
          score: 8,
          observations: "Test module observation",
          nonConformities: [],
        },
      ],
      nonConformities: [
        {
          module: "Test Module",
          description: "Test NC",
          standard: "IMCA M103",
          riskLevel: "Alto",
          recommendation: "Test recommendation",
        },
      ],
      actionPlan: [
        {
          priority: "Crítico",
          description: "Test action",
          responsible: "Test person",
          deadline: new Date("2025-10-24"),
          status: "pending",
        },
      ],
      summary: "Test summary",
    };

    it("should generate markdown with vessel information", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain("Test Vessel");
      expect(markdown).toContain("DP2");
      expect(markdown).toContain("Test Location");
    });

    it("should include standards compliance section", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain("Conformidade com Normas");
      expect(markdown).toContain("IMCA M103");
    });

    it("should include modules evaluation", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain("Avaliação dos Módulos");
      expect(markdown).toContain("Test Module");
    });

    it("should include non-conformities with risk indicators", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain("Não Conformidades");
      expect(markdown).toContain("🔴"); // Alto risk emoji
    });

    it("should include action plan with priorities", () => {
      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain("Plano de Ação");
      expect(markdown).toContain("Crítico");
      expect(markdown).toContain("Test action");
    });
  });

  describe("Data structure validation", () => {
    it("should support all priority types", () => {
      const priorities: Priority[] = ["Crítico", "Alto", "Médio", "Baixo"];
      priorities.forEach((p) => {
        expect(() => getDeadlineFromPriority(p)).not.toThrow();
      });
    });

    it("should support all risk levels", () => {
      const risks: RiskLevel[] = ["Alto", "Médio", "Baixo"];
      risks.forEach((r) => {
        expect(() => getRiskLevelColor(r)).not.toThrow();
      });
    });

    it("should support all DP classes", () => {
      const dpClasses: DPClass[] = ["DP1", "DP2", "DP3"];
      dpClasses.forEach((dp) => {
        expect(isValidDPClass(dp)).toBe(true);
      });
    });
  });
});
