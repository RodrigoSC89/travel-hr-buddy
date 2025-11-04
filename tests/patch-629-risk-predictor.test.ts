/**
 * Tests for PATCH 629 - Predictive Risk Engine
 */

import { describe, it, expect } from "vitest";
import {
  calculateRiskScore,
  predictComplianceRisks,
  getModuleRisk,
  getRiskSummary
} from "@/lib/ai/risk-predictor";

describe("PATCH 629 - Predictive Risk Engine", () => {
  describe("Risk Score Calculation", () => {
    it("should calculate high risk for module with long time since inspection", () => {
      const module = {
        id: "test-module",
        name: "Test Module",
        type: "ISM" as const,
        lastInspection: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 4,
        changeFrequency: 5
      };

      const history = [
        { module: "test-module", date: "2025-04-01", nonConformances: 4, severity: "high" },
        { module: "test-module", date: "2025-01-15", nonConformances: 3, severity: "medium" }
      ];

      const risk = calculateRiskScore(module, history);

      expect(risk.score).toBeGreaterThan(60);
      expect(risk.riskLevel).toBe("high");
      expect(risk.daysWithoutInspection).toBeGreaterThan(180);
    });

    it("should calculate low risk for recently inspected module with no issues", () => {
      const module = {
        id: "test-module-2",
        name: "Test Module 2",
        type: "MLC" as const,
        lastInspection: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 0,
        changeFrequency: 1
      };

      const history = [
        { module: "test-module-2", date: "2025-10-05", nonConformances: 0, severity: "low" },
        { module: "test-module-2", date: "2025-07-01", nonConformances: 0, severity: "low" }
      ];

      const risk = calculateRiskScore(module, history);

      expect(risk.score).toBeLessThan(40);
      expect(risk.riskLevel).toBe("low");
    });

    it("should identify critical risk with high non-conformances and time factors", () => {
      const module = {
        id: "critical-module",
        name: "Critical Module",
        type: "PSC" as const,
        lastInspection: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 5,
        changeFrequency: 8
      };

      const history = [
        { module: "critical-module", date: "2025-05-01", nonConformances: 5, severity: "critical" },
        { module: "critical-module", date: "2025-02-15", nonConformances: 4, severity: "high" },
        { module: "critical-module", date: "2024-11-10", nonConformances: 6, severity: "critical" }
      ];

      const risk = calculateRiskScore(module, history);

      expect(risk.score).toBeGreaterThan(70);
      expect(risk.riskLevel).toMatch(/critical|high/);
    });

    it("should include all risk factors in calculation", () => {
      const module = {
        id: "factor-test",
        name: "Factor Test Module",
        type: "IMCA" as const,
        lastInspection: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 2,
        changeFrequency: 4
      };

      const history = [
        { module: "factor-test", date: "2025-07-01", nonConformances: 2, severity: "medium" }
      ];

      const risk = calculateRiskScore(module, history);

      expect(risk.factors).toHaveLength(4);
      expect(risk.factors.map(f => f.factor)).toContain("Time Since Inspection");
      expect(risk.factors.map(f => f.factor)).toContain("Historical Non-Conformances");
      expect(risk.factors.map(f => f.factor)).toContain("Module Change Frequency");
      expect(risk.factors.map(f => f.factor)).toContain("Severity Trend");
    });

    it("should provide appropriate recommended actions for high risk", () => {
      const module = {
        id: "action-test",
        name: "Action Test",
        type: "SGSO" as const,
        lastInspection: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 3,
        changeFrequency: 6
      };

      const history = [
        { module: "action-test", date: "2025-06-01", nonConformances: 3, severity: "high" }
      ];

      const risk = calculateRiskScore(module, history);

      expect(risk.recommendedActions.length).toBeGreaterThan(0);
      expect(risk.recommendedActions.some(a => 
        a.includes("audit") || a.includes("inspection")
      )).toBe(true);
    });
  });

  describe("Predictive Analysis", () => {
    it("should predict risks for all compliance modules", async () => {
      const risks = await predictComplianceRisks();

      expect(risks).toBeDefined();
      expect(Array.isArray(risks)).toBe(true);
      expect(risks.length).toBeGreaterThan(0);
    });

    it("should return risks sorted by score (highest first)", async () => {
      const risks = await predictComplianceRisks();

      for (let i = 1; i < risks.length; i++) {
        expect(risks[i - 1].score).toBeGreaterThanOrEqual(risks[i].score);
      }
    });

    it("should include all required fields in risk objects", async () => {
      const risks = await predictComplianceRisks();
      const risk = risks[0];

      expect(risk).toHaveProperty("moduleId");
      expect(risk).toHaveProperty("moduleName");
      expect(risk).toHaveProperty("score");
      expect(risk).toHaveProperty("riskLevel");
      expect(risk).toHaveProperty("factors");
      expect(risk).toHaveProperty("prediction");
      expect(risk).toHaveProperty("recommendedActions");
      expect(risk).toHaveProperty("daysWithoutInspection");
    });

    it("should get risk for specific module", async () => {
      const moduleRisk = await getModuleRisk("ism-code");

      expect(moduleRisk).toBeDefined();
      expect(moduleRisk?.moduleId).toBe("ism-code");
    });

    it("should return null for non-existent module", async () => {
      const moduleRisk = await getModuleRisk("non-existent-module");

      expect(moduleRisk).toBeNull();
    });
  });

  describe("Risk Summary", () => {
    it("should generate comprehensive risk summary", async () => {
      const summary = await getRiskSummary();

      expect(summary).toHaveProperty("totalModules");
      expect(summary).toHaveProperty("averageScore");
      expect(summary).toHaveProperty("criticalCount");
      expect(summary).toHaveProperty("highCount");
      expect(summary).toHaveProperty("mediumCount");
      expect(summary).toHaveProperty("lowCount");
      expect(summary).toHaveProperty("topRisks");
      expect(summary).toHaveProperty("timestamp");
    });

    it("should count risk levels correctly", async () => {
      const summary = await getRiskSummary();

      const total = summary.criticalCount + summary.highCount + summary.mediumCount + summary.lowCount;
      expect(total).toBe(summary.totalModules);
    });

    it("should include top 5 risks", async () => {
      const summary = await getRiskSummary();

      expect(summary.topRisks).toBeDefined();
      expect(Array.isArray(summary.topRisks)).toBe(true);
      expect(summary.topRisks.length).toBeLessThanOrEqual(5);
    });

    it("should have valid average score", async () => {
      const summary = await getRiskSummary();

      expect(summary.averageScore).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Risk Prediction Accuracy", () => {
    it("should correctly identify modules overdue for inspection", async () => {
      const risks = await predictComplianceRisks();
      const overdueRisks = risks.filter(r => r.daysWithoutInspection > 180);

      // All overdue modules should have elevated risk scores and inspection recommendations
      const allHaveHighScore = overdueRisks.every(risk => risk.score > 50);
      const allHaveInspectionAction = overdueRisks.every(risk =>
        risk.recommendedActions.some(a =>
          a.toLowerCase().includes("inspection") || a.toLowerCase().includes("audit")
        )
      );

      expect(allHaveHighScore).toBe(true);
      expect(allHaveInspectionAction).toBe(true);
    });

    it("should assign appropriate predictions based on risk level", async () => {
      const risks = await predictComplianceRisks();

      risks.forEach(risk => {
        if (risk.riskLevel === "critical") {
          expect(risk.prediction).toContain("CRITICAL");
        } else if (risk.riskLevel === "high") {
          expect(risk.prediction).toContain("HIGH RISK");
        } else if (risk.riskLevel === "medium") {
          expect(risk.prediction).toContain("MEDIUM RISK");
        } else {
          expect(risk.prediction).toContain("LOW RISK");
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle module with no inspection history", () => {
      const module = {
        id: "new-module",
        name: "New Module",
        type: "MLC" as const,
        nonConformanceCount: 0,
        changeFrequency: 0
      };

      const risk = calculateRiskScore(module, []);

      expect(risk.score).toBeDefined();
      expect(risk.daysWithoutInspection).toBeGreaterThan(0);
    });

    it("should handle module with very old last inspection", () => {
      const module = {
        id: "old-module",
        name: "Old Module",
        type: "PSC" as const,
        lastInspection: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 0,
        changeFrequency: 0
      };

      const risk = calculateRiskScore(module, []);

      expect(risk.daysWithoutInspection).toBeGreaterThan(400);
      expect(risk.score).toBeGreaterThan(0);
    });

    it("should cap individual factor contributions appropriately", () => {
      const module = {
        id: "extreme-module",
        name: "Extreme Module",
        type: "ISM" as const,
        lastInspection: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 20,
        changeFrequency: 50
      };

      const history = Array(10).fill(null).map((_, i) => ({
        module: "extreme-module",
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformances: 10,
        severity: "critical"
      }));

      const risk = calculateRiskScore(module, history);

      // Score should not exceed 100
      expect(risk.score).toBeLessThanOrEqual(100);
      
      // Individual factors should be capped
      risk.factors.forEach(factor => {
        if (factor.factor === "Time Since Inspection") {
          expect(factor.value).toBeLessThanOrEqual(30);
        } else if (factor.factor === "Historical Non-Conformances") {
          expect(factor.value).toBeLessThanOrEqual(35);
        } else if (factor.factor === "Module Change Frequency") {
          expect(factor.value).toBeLessThanOrEqual(20);
        } else if (factor.factor === "Severity Trend") {
          expect(factor.value).toBeLessThanOrEqual(15);
        }
      });
    });
  });
});
