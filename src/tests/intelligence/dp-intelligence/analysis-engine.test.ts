/**
 * Tests for DP Intelligence Analysis Engine
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock analysis engine
const analyzeIncident = async (incidentData: any) => {
  const { severity, type, location, timestamp } = incidentData;

  // Simple severity calculation
  let riskScore = 0;
  if (severity === "critical") riskScore += 50;
  else if (severity === "high") riskScore += 30;
  else if (severity === "medium") riskScore += 15;
  else riskScore += 5;

  // Add type-specific risk
  const typeRisk: Record<string, number> = {
    collision: 40,
    grounding: 35,
    fire: 45,
    flooding: 40,
    equipment_failure: 20,
  };
  riskScore += typeRisk[type] || 10;

  return {
    incidentId: `incident-${Date.now()}`,
    riskScore,
    severity,
    type,
    location,
    timestamp,
    recommendations: generateRecommendations(type, riskScore),
    predictedImpact: riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low",
  };
};

const generateRecommendations = (type: string, riskScore: number) => {
  const recommendations: string[] = [];

  if (riskScore > 60) {
    recommendations.push("Immediate response required");
    recommendations.push("Notify emergency services");
  }

  switch (type) {
    case "collision":
      recommendations.push("Assess structural damage");
      recommendations.push("Check for injuries");
      break;
    case "fire":
      recommendations.push("Activate fire suppression system");
      recommendations.push("Evacuate affected areas");
      break;
    case "equipment_failure":
      recommendations.push("Switch to backup systems");
      recommendations.push("Schedule maintenance inspection");
      break;
  }

  return recommendations;
};

const analyzeTrends = (incidents: any[]) => {
  const typeCount: Record<string, number> = {};
  const severityCount: Record<string, number> = {};

  incidents.forEach((incident) => {
    typeCount[incident.type] = (typeCount[incident.type] || 0) + 1;
    severityCount[incident.severity] = (severityCount[incident.severity] || 0) + 1;
  });

  const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
  const mostCommonSeverity = Object.entries(severityCount).sort((a, b) => b[1] - a[1])[0];

  return {
    totalIncidents: incidents.length,
    typeDistribution: typeCount,
    severityDistribution: severityCount,
    mostCommonType: mostCommonType ? mostCommonType[0] : null,
    mostCommonSeverity: mostCommonSeverity ? mostCommonSeverity[0] : null,
    trend: incidents.length > 5 ? "increasing" : "stable",
  };
};

describe("DP Intelligence Analysis Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Incident Analysis", () => {
    it("should analyze critical incident correctly", async () => {
      const incident = {
        severity: "critical",
        type: "fire",
        location: "Engine Room",
        timestamp: new Date(),
      };

      const analysis = await analyzeIncident(incident);

      expect(analysis.riskScore).toBeGreaterThan(60);
      expect(analysis.predictedImpact).toBe("high");
      expect(analysis.recommendations).toContain("Immediate response required");
    });

    it("should analyze medium severity incident", async () => {
      const incident = {
        severity: "medium",
        type: "equipment_failure",
        location: "Deck",
        timestamp: new Date(),
      };

      const analysis = await analyzeIncident(incident);

      expect(analysis.riskScore).toBeLessThan(60);
      expect(analysis.predictedImpact).not.toBe("high");
    });

    it("should generate type-specific recommendations", async () => {
      const collisionIncident = {
        severity: "high",
        type: "collision",
        location: "Bow",
        timestamp: new Date(),
      };

      const analysis = await analyzeIncident(collisionIncident);

      expect(analysis.recommendations).toContain("Assess structural damage");
      expect(analysis.recommendations).toContain("Check for injuries");
    });

    it("should calculate risk score correctly", async () => {
      const highRiskIncident = {
        severity: "critical",
        type: "collision",
        location: "Hull",
        timestamp: new Date(),
      };

      const lowRiskIncident = {
        severity: "low",
        type: "equipment_failure",
        location: "Storage",
        timestamp: new Date(),
      };

      const highAnalysis = await analyzeIncident(highRiskIncident);
      const lowAnalysis = await analyzeIncident(lowRiskIncident);

      expect(highAnalysis.riskScore).toBeGreaterThan(lowAnalysis.riskScore);
    });
  });

  describe("Trend Analysis", () => {
    it("should analyze incident trends", () => {
      const incidents = [
        { type: "fire", severity: "high" },
        { type: "fire", severity: "medium" },
        { type: "collision", severity: "high" },
        { type: "equipment_failure", severity: "low" },
        { type: "fire", severity: "high" },
      ];

      const trends = analyzeTrends(incidents);

      expect(trends.totalIncidents).toBe(5);
      expect(trends.mostCommonType).toBe("fire");
      expect(trends.typeDistribution.fire).toBe(3);
    });

    it("should identify severity distribution", () => {
      const incidents = [
        { type: "fire", severity: "critical" },
        { type: "fire", severity: "critical" },
        { type: "collision", severity: "high" },
        { type: "equipment_failure", severity: "low" },
      ];

      const trends = analyzeTrends(incidents);

      expect(trends.mostCommonSeverity).toBe("critical");
      expect(trends.severityDistribution.critical).toBe(2);
    });

    it("should detect increasing trend", () => {
      const manyIncidents = Array(10).fill(null).map((_, i) => ({
        type: "equipment_failure",
        severity: "medium",
        id: i,
      }));

      const trends = analyzeTrends(manyIncidents);

      expect(trends.trend).toBe("increasing");
    });

    it("should handle empty incident list", () => {
      const trends = analyzeTrends([]);

      expect(trends.totalIncidents).toBe(0);
      expect(trends.mostCommonType).toBeNull();
      expect(trends.trend).toBe("stable");
    });
  });

  describe("Recommendations Generation", () => {
    it("should prioritize critical incidents", async () => {
      const incident = {
        severity: "critical",
        type: "flooding",
        location: "Lower Deck",
        timestamp: new Date(),
      };

      const analysis = await analyzeIncident(incident);

      expect(analysis.recommendations[0]).toBe("Immediate response required");
    });

    it("should provide equipment-specific guidance", async () => {
      const incident = {
        severity: "medium",
        type: "equipment_failure",
        location: "Bridge",
        timestamp: new Date(),
      };

      const analysis = await analyzeIncident(incident);

      expect(analysis.recommendations).toContain("Switch to backup systems");
    });
  });
});
