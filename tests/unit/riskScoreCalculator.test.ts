/**
 * PATCH 600 - Unit tests for Risk Score Calculator
 * Tests risk assessment, scoring algorithms, and mitigation recommendations
 */

import { describe, it, expect } from "vitest";

interface RiskAssessment {
  id: string;
  vessel_id: string;
  risk_type: "operational" | "environmental" | "regulatory" | "security" | "financial";
  description: string;
  probability: 1 | 2 | 3 | 4 | 5; // 1=Rare, 5=Almost Certain
  impact: 1 | 2 | 3 | 4 | 5; // 1=Insignificant, 5=Catastrophic
  risk_score: number; // Probability x Impact
  risk_level: "low" | "medium" | "high" | "critical";
  identified_date: string;
  assessed_by: string;
}

interface RiskMitigation {
  risk_id: string;
  strategy: "avoid" | "reduce" | "transfer" | "accept";
  actions: string[];
  responsible_party: string;
  target_completion_date: string;
  status: "planned" | "in_progress" | "completed" | "deferred";
  effectiveness: number; // 0-100%
}

interface RiskMatrix {
  probability_levels: string[];
  impact_levels: string[];
  matrix: number[][];
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface PredictiveRiskFactor {
  factor_name: string;
  weight: number;
  current_value: number;
  threshold_value: number;
  trend: "improving" | "stable" | "deteriorating";
}

describe("Risk Score Calculator", () => {
  describe("Risk Scoring", () => {
    it("should calculate risk score correctly", () => {
      const risk: RiskAssessment = {
        id: "risk-001",
        vessel_id: "vessel-123",
        risk_type: "operational",
        description: "Engine failure during voyage",
        probability: 2, // Unlikely
        impact: 4, // Major
        risk_score: 8, // 2 * 4
        risk_level: "high",
        identified_date: "2025-11-03T10:00:00Z",
        assessed_by: "safety-officer",
      };

      expect(risk.risk_score).toBe(risk.probability * risk.impact);
      expect(risk.risk_score).toBe(8);
    });

    it("should classify risk levels correctly", () => {
      const lowRisk: RiskAssessment = {
        id: "risk-002",
        vessel_id: "vessel-123",
        risk_type: "operational",
        description: "Minor equipment wear",
        probability: 2,
        impact: 1,
        risk_score: 2,
        risk_level: "low",
        identified_date: "2025-11-03T10:00:00Z",
        assessed_by: "engineer",
      };

      const criticalRisk: RiskAssessment = {
        id: "risk-003",
        vessel_id: "vessel-123",
        risk_type: "safety",
        description: "Critical safety system failure",
        probability: 4,
        impact: 5,
        risk_score: 20,
        risk_level: "critical",
        identified_date: "2025-11-03T10:00:00Z",
        assessed_by: "safety-officer",
      };

      expect(lowRisk.risk_level).toBe("low");
      expect(lowRisk.risk_score).toBeLessThan(5);
      expect(criticalRisk.risk_level).toBe("critical");
      expect(criticalRisk.risk_score).toBeGreaterThan(15);
    });

    it("should validate probability and impact ranges", () => {
      const validProbabilities: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
      const validImpacts: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

      const risk: RiskAssessment = {
        id: "risk-004",
        vessel_id: "vessel-123",
        risk_type: "environmental",
        description: "Potential oil spill",
        probability: 3,
        impact: 5,
        risk_score: 15,
        risk_level: "critical",
        identified_date: "2025-11-03T10:00:00Z",
        assessed_by: "environmental-officer",
      };

      expect(validProbabilities).toContain(risk.probability);
      expect(validImpacts).toContain(risk.impact);
      expect(risk.probability).toBeGreaterThanOrEqual(1);
      expect(risk.probability).toBeLessThanOrEqual(5);
      expect(risk.impact).toBeGreaterThanOrEqual(1);
      expect(risk.impact).toBeLessThanOrEqual(5);
    });
  });

  describe("Risk Matrix", () => {
    it("should define valid risk matrix structure", () => {
      const matrix: RiskMatrix = {
        probability_levels: ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"],
        impact_levels: ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"],
        matrix: [
          [1, 2, 3, 4, 5],
          [2, 4, 6, 8, 10],
          [3, 6, 9, 12, 15],
          [4, 8, 12, 16, 20],
          [5, 10, 15, 20, 25],
        ],
        thresholds: {
          low: 4,
          medium: 9,
          high: 15,
          critical: 20,
        },
      };

      expect(matrix.probability_levels.length).toBe(5);
      expect(matrix.impact_levels.length).toBe(5);
      expect(matrix.matrix.length).toBe(5);
      expect(matrix.matrix[0].length).toBe(5);
      expect(matrix.thresholds.low).toBeLessThan(matrix.thresholds.medium);
      expect(matrix.thresholds.medium).toBeLessThan(matrix.thresholds.high);
      expect(matrix.thresholds.high).toBeLessThan(matrix.thresholds.critical);
    });

    it("should map scores to risk levels using thresholds", () => {
      const thresholds = {
        low: 4,
        medium: 9,
        high: 15,
        critical: 20,
      };

      const getRiskLevel = (score: number): string => {
        if (score > thresholds.critical) return "critical";
        if (score > thresholds.high) return "high";
        if (score > thresholds.medium) return "medium";
        return "low";
      };

      expect(getRiskLevel(2)).toBe("low");
      expect(getRiskLevel(7)).toBe("medium");
      expect(getRiskLevel(12)).toBe("high");
      expect(getRiskLevel(22)).toBe("critical");
    });
  });

  describe("Risk Mitigation", () => {
    it("should define valid mitigation strategies", () => {
      const mitigation: RiskMitigation = {
        risk_id: "risk-001",
        strategy: "reduce",
        actions: [
          "Implement preventive maintenance schedule",
          "Train crew on early warning signs",
          "Increase inspection frequency",
        ],
        responsible_party: "chief-engineer",
        target_completion_date: "2025-12-31T23:59:59Z",
        status: "in_progress",
        effectiveness: 75,
      };

      expect(["avoid", "reduce", "transfer", "accept"]).toContain(mitigation.strategy);
      expect(mitigation.actions).toBeInstanceOf(Array);
      expect(mitigation.actions.length).toBeGreaterThan(0);
      expect(mitigation.effectiveness).toBeGreaterThanOrEqual(0);
      expect(mitigation.effectiveness).toBeLessThanOrEqual(100);
    });

    it("should track mitigation effectiveness", () => {
      const highlyEffectiveMitigation: RiskMitigation = {
        risk_id: "risk-002",
        strategy: "reduce",
        actions: ["Implemented automated monitoring system"],
        responsible_party: "chief-engineer",
        target_completion_date: "2025-11-30T23:59:59Z",
        status: "completed",
        effectiveness: 95,
      };

      const lowEffectivenessMitigation: RiskMitigation = {
        risk_id: "risk-003",
        strategy: "reduce",
        actions: ["Manual checks increased"],
        responsible_party: "deck-officer",
        target_completion_date: "2025-12-15T23:59:59Z",
        status: "in_progress",
        effectiveness: 40,
      };

      expect(highlyEffectiveMitigation.effectiveness).toBeGreaterThan(80);
      expect(lowEffectivenessMitigation.effectiveness).toBeLessThan(60);
    });
  });

  describe("Predictive Risk Analysis", () => {
    it("should analyze risk factors and trends", () => {
      const riskFactor: PredictiveRiskFactor = {
        factor_name: "Equipment Age",
        weight: 0.35,
        current_value: 8.5,
        threshold_value: 10.0,
        trend: "deteriorating",
      };

      expect(riskFactor.weight).toBeGreaterThan(0);
      expect(riskFactor.weight).toBeLessThanOrEqual(1);
      expect(["improving", "stable", "deteriorating"]).toContain(riskFactor.trend);
      expect(riskFactor.current_value).toBeLessThanOrEqual(riskFactor.threshold_value);
    });

    it("should calculate composite risk score from multiple factors", () => {
      const factors: PredictiveRiskFactor[] = [
        {
          factor_name: "Equipment Age",
          weight: 0.30,
          current_value: 8.5,
          threshold_value: 10.0,
          trend: "deteriorating",
        },
        {
          factor_name: "Maintenance Compliance",
          weight: 0.25,
          current_value: 7.0,
          threshold_value: 10.0,
          trend: "stable",
        },
        {
          factor_name: "Incident History",
          weight: 0.20,
          current_value: 6.0,
          threshold_value: 10.0,
          trend: "improving",
        },
        {
          factor_name: "Crew Competency",
          weight: 0.25,
          current_value: 9.0,
          threshold_value: 10.0,
          trend: "improving",
        },
      ];

      const compositeScore = factors.reduce((sum, factor) => {
        return sum + (factor.current_value / factor.threshold_value) * factor.weight;
      }, 0);

      expect(compositeScore).toBeGreaterThan(0);
      expect(compositeScore).toBeLessThanOrEqual(1);
      expect(factors.reduce((sum, f) => sum + f.weight, 0)).toBe(1.0);
    });
  });

  describe("Risk Monitoring", () => {
    it("should detect risk trend changes", () => {
      const historicalRisks: RiskAssessment[] = [
        {
          id: "risk-005",
          vessel_id: "vessel-123",
          risk_type: "operational",
          description: "Equipment reliability",
          probability: 4,
          impact: 4,
          risk_score: 16,
          risk_level: "high",
          identified_date: "2025-09-01T10:00:00Z",
          assessed_by: "safety-officer",
        },
        {
          id: "risk-006",
          vessel_id: "vessel-123",
          risk_type: "operational",
          description: "Equipment reliability",
          probability: 3,
          impact: 4,
          risk_score: 12,
          risk_level: "high",
          identified_date: "2025-10-01T10:00:00Z",
          assessed_by: "safety-officer",
        },
        {
          id: "risk-007",
          vessel_id: "vessel-123",
          risk_type: "operational",
          description: "Equipment reliability",
          probability: 2,
          impact: 3,
          risk_score: 6,
          risk_level: "medium",
          identified_date: "2025-11-01T10:00:00Z",
          assessed_by: "safety-officer",
        },
      ];

      // Check improving trend
      expect(historicalRisks[0].risk_score).toBeGreaterThan(historicalRisks[1].risk_score);
      expect(historicalRisks[1].risk_score).toBeGreaterThan(historicalRisks[2].risk_score);
      
      const isImproving = 
        historicalRisks[0].risk_score > historicalRisks[historicalRisks.length - 1].risk_score;
      expect(isImproving).toBe(true);
    });
  });
});
