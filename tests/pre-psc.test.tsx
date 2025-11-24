/**
 * Pre-PSC Module Tests
 * E2E tests for Pre-Port State Control inspection system
 */

import { describe, it, expect } from "vitest";
import { calculatePSCScore, PSCFinding } from "@/modules/pre-psc/PSCScoreCalculator";
import {
  shouldTriggerAlert,
  generateAlertSummary,
  getRecommendedActions
} from "@/modules/pre-psc/PSCAlertTrigger";

describe("Pre-PSC Module", () => {
  describe("Score Calculator Integration", () => {
    it("should calculate scores correctly", () => {
      const findings: PSCFinding[] = [
        { category: "Fire Safety", item: "Fire extinguishers", status: "compliant", severity: "medium" },
        { category: "Life Safety", item: "Lifeboats", status: "non-compliant", severity: "high" },
      ];

      const result = calculatePSCScore(findings);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(100);
    });
  });

  describe("Alert Trigger Integration", () => {
    it("should trigger alerts for critical findings", () => {
      const findings: PSCFinding[] = [
        { category: "Fire Safety", item: "Fire extinguishers", status: "non-compliant", severity: "critical" },
      ];

      const scoreResult = calculatePSCScore(findings);
      expect(shouldTriggerAlert(scoreResult)).toBe(true);
    });

    it("should generate alert summaries", () => {
      const findings: PSCFinding[] = [
        { category: "Fire Safety", item: "Fire extinguishers", status: "non-compliant", severity: "high" },
      ];

      const scoreResult = calculatePSCScore(findings);
      const inspection = {
        inspectionId: "test-123",
        vesselId: "vessel-123",
        vesselName: "Test Vessel",
        score: scoreResult.overallScore,
        riskLevel: scoreResult.riskLevel,
        criticalFindings: scoreResult.criticalFindings,
        timestamp: new Date(),
      };

      const summary = generateAlertSummary(inspection, scoreResult);
      expect(summary).toContain("non-compliant");
    });

    it("should provide recommended actions for high risk", () => {
      const findings: PSCFinding[] = [
        { category: "Fire Safety", item: "Fire extinguishers", status: "non-compliant", severity: "critical" },
      ];

      const scoreResult = calculatePSCScore(findings);
      const actions = getRecommendedActions(scoreResult);
      
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe("Module Exports", () => {
    it("should export main dashboard component", async () => {
      const PrePSCDashboard = await import("@/modules/pre-psc");
      expect(PrePSCDashboard.default).toBeDefined();
    });

    it("should export form component", async () => {
      const { PrePSCForm } = await import("@/modules/pre-psc/PrePSCForm");
      expect(PrePSCForm).toBeDefined();
    });

    it("should export AI assistant component", async () => {
      const { PSCAIAssistant } = await import("@/modules/pre-psc/PSCAIAssistant");
      expect(PSCAIAssistant).toBeDefined();
    });
  });

  describe("PDF Generator", () => {
    it("should have PDF generation functions", async () => {
      const { generatePSCReport, exportPSCReport } = await import("@/lib/psc/PSCReportGenerator");
      expect(generatePSCReport).toBeDefined();
      expect(exportPSCReport).toBeDefined();
    });
  });

  describe("Signature Validator", () => {
    it("should have signature validation functions", async () => {
      const {
        generateSignatureHash,
        validatePSCSignature,
        verifyInspectionIntegrity
      } = await import("@/lib/psc/PSCSignatureValidator");
      
      expect(generateSignatureHash).toBeDefined();
      expect(validatePSCSignature).toBeDefined();
      expect(verifyInspectionIntegrity).toBeDefined();
    });

    it("should generate consistent hashes", async () => {
      const { generateSignatureHash } = await import("@/lib/psc/PSCSignatureValidator");
      
      const data = "test data";
      const hash1 = await generateSignatureHash(data);
      const hash2 = await generateSignatureHash(data);
      
      expect(hash1).toBe(hash2);
    });
  });
});
