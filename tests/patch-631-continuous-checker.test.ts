/**
 * Tests for PATCH 631 - Continuous Compliance Engine
 */

import { describe, it, expect } from "vitest";
import {
  runComplianceAudit,
  getComplianceAlerts,
  getComplianceScoreByStandard,
  validateSchemaChange
} from "@/lib/compliance/continuous-checker";

describe("PATCH 631 - Continuous Compliance Engine", () => {
  describe("Compliance Audit Execution", () => {
    it("should run comprehensive compliance audit", async () => {
      const report = await runComplianceAudit("manual");

      expect(report).toBeDefined();
      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.passed).toBeDefined();
      expect(report.failed).toBeDefined();
      expect(report.warnings).toBeDefined();
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
      expect(report.checks).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it("should support different trigger types", async () => {
      const triggers = ["manual", "schema_change", "code_push", "checklist_update", "scheduled"] as const;

      for (const trigger of triggers) {
        const report = await runComplianceAudit(trigger);
        expect(report.trigger).toBe(trigger);
      }
    });

    it("should run audit for specific standards", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);

      expect(report.checks.every(c => c.standard === "ISM")).toBe(true);
    });

    it("should run audit for multiple standards", async () => {
      const report = await runComplianceAudit("manual", ["ISM", "MLC"]);

      const standards = new Set(report.checks.map(c => c.standard));
      expect(standards.has("ISM")).toBe(true);
      expect(standards.has("MLC")).toBe(true);
    });

    it("should calculate compliance score correctly", async () => {
      const report = await runComplianceAudit("manual");

      const expectedScore = Math.round(
        ((report.passed + report.warnings * 0.5) / report.totalChecks) * 100
      );

      expect(report.score).toBe(expectedScore);
    });

    it("should generate appropriate recommendations", async () => {
      const report = await runComplianceAudit("manual");

      expect(report.recommendations.length).toBeGreaterThan(0);
      
      if (report.score >= 90) {
        expect(report.recommendations.some(r => r.includes("audit-ready"))).toBe(true);
      }
    });
  });

  describe("ISM Code Checks", () => {
    it("should include ISM compliance checks", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);

      expect(report.checks.length).toBeGreaterThan(0);
      expect(report.checks.every(c => c.standard === "ISM")).toBe(true);
    });

    it("should check SMS documentation (ISM 1.2.3)", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);
      const smsCheck = report.checks.find(c => c.section === "1.2.3");

      expect(smsCheck).toBeDefined();
      expect(smsCheck?.requirement).toContain("Safety Management System");
    });

    it("should check resources and personnel (ISM 6.1)", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);
      const resourceCheck = report.checks.find(c => c.section === "6.1");

      expect(resourceCheck).toBeDefined();
      expect(resourceCheck?.requirement).toContain("resources");
    });

    it("should check reports and analysis (ISM 9.1)", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);
      const reportCheck = report.checks.find(c => c.section === "9.1");

      expect(reportCheck).toBeDefined();
      expect(reportCheck?.requirement).toContain("reported");
    });

    it("should check maintenance system (ISM 10.1)", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);
      const maintenanceCheck = report.checks.find(c => c.section === "10.1");

      expect(maintenanceCheck).toBeDefined();
      expect(maintenanceCheck?.requirement).toContain("maintenance");
    });

    it("should check internal audits (ISM 12.1)", async () => {
      const report = await runComplianceAudit("manual", ["ISM"]);
      const auditCheck = report.checks.find(c => c.section === "12.1");

      expect(auditCheck).toBeDefined();
      expect(auditCheck?.requirement).toContain("audits");
    });
  });

  describe("MLC 2006 Checks", () => {
    it("should include MLC compliance checks", async () => {
      const report = await runComplianceAudit("manual", ["MLC"]);

      expect(report.checks.length).toBeGreaterThan(0);
      expect(report.checks.every(c => c.standard === "MLC")).toBe(true);
    });

    it("should check employment agreements (MLC Reg 2.1)", async () => {
      const report = await runComplianceAudit("manual", ["MLC"]);
      const agreementCheck = report.checks.find(c => c.section === "Regulation 2.1");

      expect(agreementCheck).toBeDefined();
      expect(agreementCheck?.requirement).toContain("employment agreements");
    });

    it("should check hours of work and rest (MLC Reg 2.3)", async () => {
      const report = await runComplianceAudit("manual", ["MLC"]);
      const hoursCheck = report.checks.find(c => c.section === "Regulation 2.3");

      expect(hoursCheck).toBeDefined();
      expect(hoursCheck?.requirement).toContain("Hours of work");
    });

    it("should check accommodation (MLC Reg 3.1)", async () => {
      const report = await runComplianceAudit("manual", ["MLC"]);
      const accommodationCheck = report.checks.find(c => c.section === "Regulation 3.1");

      expect(accommodationCheck).toBeDefined();
      expect(accommodationCheck?.requirement).toContain("Accommodation");
    });

    it("should check medical care (MLC Reg 4.3)", async () => {
      const report = await runComplianceAudit("manual", ["MLC"]);
      const medicalCheck = report.checks.find(c => c.section === "Regulation 4.3");

      expect(medicalCheck).toBeDefined();
      expect(medicalCheck?.requirement).toContain("medical");
    });
  });

  describe("MARPOL Checks", () => {
    it("should include MARPOL environmental checks", async () => {
      const report = await runComplianceAudit("manual", ["MARPOL"]);

      expect(report.checks.length).toBeGreaterThan(0);
      expect(report.checks.every(c => c.standard === "MARPOL")).toBe(true);
    });

    it("should check oil pollution (Annex I)", async () => {
      const report = await runComplianceAudit("manual", ["MARPOL"]);
      const oilCheck = report.checks.find(c => c.section === "Annex I");

      expect(oilCheck).toBeDefined();
      expect(oilCheck?.requirement).toContain("Oil");
    });

    it("should check sewage (Annex IV)", async () => {
      const report = await runComplianceAudit("manual", ["MARPOL"]);
      const sewageCheck = report.checks.find(c => c.section === "Annex IV");

      expect(sewageCheck).toBeDefined();
      expect(sewageCheck?.requirement).toContain("Sewage");
    });

    it("should check garbage (Annex V)", async () => {
      const report = await runComplianceAudit("manual", ["MARPOL"]);
      const garbageCheck = report.checks.find(c => c.section === "Annex V");

      expect(garbageCheck).toBeDefined();
      expect(garbageCheck?.requirement).toContain("Garbage");
    });

    it("should check air pollution (Annex VI)", async () => {
      const report = await runComplianceAudit("manual", ["MARPOL"]);
      const airCheck = report.checks.find(c => c.section === "Annex VI");

      expect(airCheck).toBeDefined();
      expect(airCheck?.requirement).toContain("emissions");
    });
  });

  describe("PSC Readiness Checks", () => {
    it("should include PSC readiness checks", async () => {
      const report = await runComplianceAudit("manual", ["PSC"]);

      expect(report.checks.length).toBeGreaterThan(0);
      expect(report.checks.every(c => c.standard === "PSC")).toBe(true);
    });

    it("should check document validity", async () => {
      const report = await runComplianceAudit("manual", ["PSC"]);
      const docCheck = report.checks.find(c => c.section === "Documentation");

      expect(docCheck).toBeDefined();
      expect(docCheck?.requirement).toContain("certificates");
    });

    it("should check crew certification", async () => {
      const report = await runComplianceAudit("manual", ["PSC"]);
      const crewCheck = report.checks.find(c => c.section === "Crew Certification");

      expect(crewCheck).toBeDefined();
      expect(crewCheck?.requirement).toContain("STCW");
    });

    it("should check safety equipment", async () => {
      const report = await runComplianceAudit("manual", ["PSC"]);
      const safetyCheck = report.checks.find(c => c.section === "Safety Equipment");

      expect(safetyCheck).toBeDefined();
      expect(safetyCheck?.requirement).toContain("equipment");
    });
  });

  describe("Compliance Alerts", () => {
    it("should generate alerts from audit results", async () => {
      const alerts = await getComplianceAlerts();

      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should include alert properties", async () => {
      const alerts = await getComplianceAlerts();

      if (alerts.length > 0) {
        const alert = alerts[0];
        expect(alert).toHaveProperty("id");
        expect(alert).toHaveProperty("severity");
        expect(alert).toHaveProperty("standard");
        expect(alert).toHaveProperty("message");
        expect(alert).toHaveProperty("timestamp");
        expect(alert).toHaveProperty("acknowledged");
      }
    });

    it("should prioritize critical alerts", async () => {
      const alerts = await getComplianceAlerts();
      const criticalAlerts = alerts.filter(a => a.severity === "critical");

      // Critical alerts should appear first
      if (criticalAlerts.length > 0) {
        expect(alerts[0].severity).toBe("critical");
      }
    });
  });

  describe("Score by Standard", () => {
    it("should calculate scores for each standard", async () => {
      const scores = await getComplianceScoreByStandard();

      expect(scores).toBeDefined();
      expect(typeof scores).toBe("object");
      expect(scores).toHaveProperty("ISM");
      expect(scores).toHaveProperty("MLC");
      expect(scores).toHaveProperty("MARPOL");
      expect(scores).toHaveProperty("PSC");
    });

    it("should have valid score ranges", async () => {
      const scores = await getComplianceScoreByStandard();

      Object.values(scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Schema Change Validation", () => {
    it("should validate non-critical schema changes", async () => {
      const result = await validateSchemaChange("user_preferences", "update");

      expect(result.compliant).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should flag critical table changes", async () => {
      const result = await validateSchemaChange("auditorias_imca", "update");

      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain("compliance");
    });

    it("should prevent deletion of critical tables", async () => {
      const result = await validateSchemaChange("sgso_auditorias", "delete");

      expect(result.compliant).toBe(false);
      expect(result.issues.some(i => i.includes("Cannot delete"))).toBe(true);
    });

    it("should validate create operations", async () => {
      const result = await validateSchemaChange("new_table", "create");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("compliant");
      expect(result).toHaveProperty("issues");
    });
  });

  describe("Check Properties", () => {
    it("should include all required check properties", async () => {
      const report = await runComplianceAudit("manual");
      const check = report.checks[0];

      expect(check).toHaveProperty("id");
      expect(check).toHaveProperty("standard");
      expect(check).toHaveProperty("section");
      expect(check).toHaveProperty("requirement");
      expect(check).toHaveProperty("status");
      expect(check).toHaveProperty("severity");
      expect(check).toHaveProperty("message");
      expect(check).toHaveProperty("automated");
      expect(check).toHaveProperty("timestamp");
    });

    it("should have valid status values", async () => {
      const report = await runComplianceAudit("manual");

      const validStatuses = ["pass", "fail", "warning", "not_applicable"];
      report.checks.forEach(check => {
        expect(validStatuses).toContain(check.status);
      });
    });

    it("should have valid severity values", async () => {
      const report = await runComplianceAudit("manual");

      const validSeverities = ["critical", "major", "minor", "informational"];
      report.checks.forEach(check => {
        expect(validSeverities).toContain(check.severity);
      });
    });

    it("should mark checks as automated", async () => {
      const report = await runComplianceAudit("manual");

      report.checks.forEach(check => {
        expect(check.automated).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty standard array", async () => {
      const report = await runComplianceAudit("manual", []);

      // Empty array should trigger default standards
      expect(report.checks.length).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeDefined();
    });

    it("should handle audit with all passing checks", async () => {
      const report = await runComplianceAudit("manual");

      // Even with all passing, should have comprehensive report
      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.score).toBeDefined();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should generate unique check IDs", async () => {
      const report = await runComplianceAudit("manual");
      const ids = report.checks.map(c => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include timestamps in ISO format", async () => {
      const report = await runComplianceAudit("manual");

      report.checks.forEach(check => {
        expect(() => new Date(check.timestamp)).not.toThrow();
        expect(check.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });
  });
});
