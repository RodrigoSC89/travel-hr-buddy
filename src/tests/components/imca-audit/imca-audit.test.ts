import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DPClass,
  Priority,
  RiskLevel,
  IMCAAuditInput,
  IMCAAuditReport,
  DP_MODULES,
  IMCA_STANDARDS,
  getDeadlineFromPriority,
  getRiskLevelColor,
  getPriorityColor,
  validateAuditInput,
  formatAuditAsMarkdown,
  getDaysUntilDeadline,
} from "@/types/imca-audit";

describe("IMCA Audit System", () => {
  describe("DP Class Validation", () => {
    it("should accept valid DP classes", () => {
      const validClasses: DPClass[] = ["DP1", "DP2", "DP3"];
      validClasses.forEach((dpClass) => {
        const input: IMCAAuditInput = {
          vesselName: "Test Vessel",
          dpClass,
          location: "Test Location",
          auditObjective: "Test Objective",
        };
        const validation = validateAuditInput(input);
        expect(validation.valid).toBe(true);
      });
    });
  });

  describe("Standards Completeness", () => {
    it("should have exactly 10 IMCA standards", () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it("should include key IMCA standards", () => {
      const codes = IMCA_STANDARDS.map((s) => s.code);
      expect(codes).toContain("IMCA M103");
      expect(codes).toContain("IMCA M117");
      expect(codes).toContain("IMCA M190");
      expect(codes).toContain("IMO MSC.1/Circ.1580");
    });

    it("should have all standard fields", () => {
      IMCA_STANDARDS.forEach((std) => {
        expect(std).toHaveProperty("code");
        expect(std).toHaveProperty("name");
        expect(std).toHaveProperty("description");
        expect(std.code).toBeTruthy();
        expect(std.name).toBeTruthy();
        expect(std.description).toBeTruthy();
      });
    });
  });

  describe("Modules Completeness", () => {
    it("should have exactly 13 DP modules", () => {
      expect(DP_MODULES).toHaveLength(13);
    });

    it("should include critical DP modules", () => {
      expect(DP_MODULES).toContain("DP Control System");
      expect(DP_MODULES).toContain("Propulsion System");
      expect(DP_MODULES).toContain("Power Generation System");
      expect(DP_MODULES).toContain("Position Reference Sensors");
      expect(DP_MODULES).toContain("FMEA & Trials");
    });
  });

  describe("Risk Level Color Mapping", () => {
    it("should map Alto to red", () => {
      expect(getRiskLevelColor("Alto")).toBe("text-red-600");
    });

    it("should map Médio to yellow", () => {
      expect(getRiskLevelColor("Médio")).toBe("text-yellow-600");
    });

    it("should map Baixo to gray", () => {
      expect(getRiskLevelColor("Baixo")).toBe("text-gray-600");
    });
  });

  describe("Priority Color Mapping", () => {
    it("should map Crítico to red background", () => {
      expect(getPriorityColor("Crítico")).toBe("bg-red-600");
    });

    it("should map Alto to orange background", () => {
      expect(getPriorityColor("Alto")).toBe("bg-orange-600");
    });

    it("should map Médio to yellow background", () => {
      expect(getPriorityColor("Médio")).toBe("bg-yellow-600");
    });

    it("should map Baixo to blue background", () => {
      expect(getPriorityColor("Baixo")).toBe("bg-blue-600");
    });
  });

  describe("Deadline Calculation with UTC Midnight Normalization", () => {
    beforeEach(() => {
      // Use fake timers to control the current time
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate Crítico deadline as exactly 7 days", () => {
      // Set a specific date and time
      vi.setSystemTime(new Date("2024-01-15T14:30:00Z"));
      
      const deadline = getDeadlineFromPriority("Crítico");
      const today = new Date("2024-01-15T00:00:00Z");
      const expected = new Date("2024-01-22T00:00:00Z");
      
      const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
      expect(deadline.toISOString()).toBe(expected.toISOString());
    });

    it("should calculate Alto deadline as exactly 30 days", () => {
      vi.setSystemTime(new Date("2024-01-15T14:30:00Z"));
      
      const deadline = getDeadlineFromPriority("Alto");
      const today = new Date("2024-01-15T00:00:00Z");
      
      const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });

    it("should calculate Médio deadline as exactly 90 days", () => {
      vi.setSystemTime(new Date("2024-01-15T14:30:00Z"));
      
      const deadline = getDeadlineFromPriority("Médio");
      const today = new Date("2024-01-15T00:00:00Z");
      
      const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90);
    });

    it("should calculate Baixo deadline as exactly 180 days", () => {
      vi.setSystemTime(new Date("2024-01-15T14:30:00Z"));
      
      const deadline = getDeadlineFromPriority("Baixo");
      const today = new Date("2024-01-15T00:00:00Z");
      
      const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(180);
    });

    it("should be consistent regardless of time of day", () => {
      // Test at different times of day
      const times = [
        "2024-01-15T00:00:00Z",
        "2024-01-15T06:30:00Z",
        "2024-01-15T12:00:00Z",
        "2024-01-15T18:45:00Z",
        "2024-01-15T23:59:59Z",
      ];

      times.forEach((time) => {
        vi.setSystemTime(new Date(time));
        const deadline = getDeadlineFromPriority("Crítico");
        const today = new Date("2024-01-15T00:00:00Z");
        const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(7);
      });
    });

    it("should use UTC midnight, not local midnight", () => {
      vi.setSystemTime(new Date("2024-01-15T14:30:00Z"));
      
      const deadline = getDeadlineFromPriority("Crítico");
      
      // Deadline should be at UTC midnight
      expect(deadline.getUTCHours()).toBe(0);
      expect(deadline.getUTCMinutes()).toBe(0);
      expect(deadline.getUTCSeconds()).toBe(0);
      expect(deadline.getUTCMilliseconds()).toBe(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty vessel name", () => {
      const input: IMCAAuditInput = {
        vesselName: "",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
      };
      const validation = validateAuditInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Vessel name is required");
    });

    it("should reject missing location", () => {
      const input: IMCAAuditInput = {
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "",
        auditObjective: "Test Objective",
      };
      const validation = validateAuditInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Location is required");
    });

    it("should reject missing audit objective", () => {
      const input: IMCAAuditInput = {
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "",
      };
      const validation = validateAuditInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Audit objective is required");
    });

    it("should accept valid input", () => {
      const input: IMCAAuditInput = {
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
      };
      const validation = validateAuditInput(input);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Markdown Export", () => {
    it("should generate markdown with correct structure", () => {
      const report: IMCAAuditReport = {
        id: "test-id",
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
        auditDate: new Date("2024-01-15"),
        overallScore: 85,
        standards: IMCA_STANDARDS.slice(0, 3),
        moduleEvaluations: [
          {
            moduleName: "DP Control System",
            score: 90,
            complianceStatus: "Compliant",
            findings: ["Test finding"],
            recommendations: ["Test recommendation"],
          },
        ],
        nonConformities: [],
        actionPlan: [],
        summary: "Test summary",
        conclusion: "Test conclusion",
      };

      const markdown = formatAuditAsMarkdown(report);
      expect(markdown).toContain("# IMCA DP Technical Audit Report");
      expect(markdown).toContain("Test Vessel");
      expect(markdown).toContain("DP2");
      expect(markdown).toContain("85/100");
      expect(markdown).toContain("## Standards Applied");
      expect(markdown).toContain("## Module Evaluations");
      expect(markdown).toContain("## Summary");
      expect(markdown).toContain("## Conclusion");
    });

    it("should include non-conformities in markdown", () => {
      const report: IMCAAuditReport = {
        id: "test-id",
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
        auditDate: new Date("2024-01-15"),
        overallScore: 85,
        standards: [],
        moduleEvaluations: [],
        nonConformities: [
          {
            id: "nc-1",
            module: "DP Control System",
            description: "Test NC",
            riskLevel: "Alto",
            standard: "IMCA M103",
            finding: "Test finding",
            recommendation: "Test recommendation",
          },
        ],
        actionPlan: [],
        summary: "Test summary",
        conclusion: "Test conclusion",
      };

      const markdown = formatAuditAsMarkdown(report);
      expect(markdown).toContain("## Non-Conformities");
      expect(markdown).toContain("🔴");
      expect(markdown).toContain("Alto");
      expect(markdown).toContain("IMCA M103");
    });

    it("should include action plan in markdown", () => {
      const report: IMCAAuditReport = {
        id: "test-id",
        vesselName: "Test Vessel",
        dpClass: "DP2",
        location: "Test Location",
        auditObjective: "Test Objective",
        auditDate: new Date("2024-01-15"),
        overallScore: 85,
        standards: [],
        moduleEvaluations: [],
        nonConformities: [],
        actionPlan: [
          {
            id: "action-1",
            priority: "Alto",
            description: "Test action",
            responsibleParty: "DPO",
            deadline: new Date("2024-02-15"),
            relatedNonConformity: "nc-1",
          },
        ],
        summary: "Test summary",
        conclusion: "Test conclusion",
      };

      const markdown = formatAuditAsMarkdown(report);
      expect(markdown).toContain("## Action Plan");
      expect(markdown).toContain("Test action");
      expect(markdown).toContain("Alto");
      expect(markdown).toContain("DPO");
    });
  });

  describe("Days Until Deadline", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate days until future deadline", () => {
      const deadline = new Date("2024-01-22T12:00:00Z");
      const days = getDaysUntilDeadline(deadline);
      expect(days).toBe(7);
    });

    it("should return negative days for past deadline", () => {
      const deadline = new Date("2024-01-08T12:00:00Z");
      const days = getDaysUntilDeadline(deadline);
      expect(days).toBeLessThan(0);
    });
  });

  describe("Data Structure Validation", () => {
    it("should have correct Priority type values", () => {
      const priorities: Priority[] = ["Crítico", "Alto", "Médio", "Baixo"];
      priorities.forEach((priority) => {
        const deadline = getDeadlineFromPriority(priority);
        expect(deadline).toBeInstanceOf(Date);
      });
    });

    it("should have correct RiskLevel type values", () => {
      const riskLevels: RiskLevel[] = ["Alto", "Médio", "Baixo"];
      riskLevels.forEach((level) => {
        const color = getRiskLevelColor(level);
        expect(color).toContain("text-");
      });
    });
  });
});
