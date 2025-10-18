import { describe, it, expect } from "vitest";
import type {
  SGSOEffectiveness,
  SGSOEffectivenessByVessel,
  SGSOEffectivenessResponse,
  SGSOEffectivenessSummary,
} from "@/types/sgso-effectiveness";

describe("SGSO Effectiveness API Types", () => {
  it("should have correct SGSOEffectiveness structure", () => {
    const mockData: SGSOEffectiveness = {
      category: "Erro humano",
      total_incidents: 12,
      repeated_incidents: 3,
      effectiveness_percentage: 75.0,
      avg_resolution_days: 4.2,
    };

    expect(mockData.category).toBe("Erro humano");
    expect(mockData.total_incidents).toBe(12);
    expect(mockData.repeated_incidents).toBe(3);
    expect(mockData.effectiveness_percentage).toBe(75.0);
    expect(mockData.avg_resolution_days).toBe(4.2);
  });

  it("should have correct SGSOEffectivenessByVessel structure", () => {
    const mockData: SGSOEffectivenessByVessel = {
      vessel_name: "Vessel 1",
      category: "Falha técnica",
      total_incidents: 9,
      repeated_incidents: 1,
      effectiveness_percentage: 88.9,
      avg_resolution_days: 2.7,
    };

    expect(mockData.vessel_name).toBe("Vessel 1");
    expect(mockData.category).toBe("Falha técnica");
    expect(mockData.total_incidents).toBe(9);
    expect(mockData.repeated_incidents).toBe(1);
    expect(mockData.effectiveness_percentage).toBe(88.9);
    expect(mockData.avg_resolution_days).toBe(2.7);
  });

  it("should have correct SGSOEffectivenessSummary structure", () => {
    const mockSummary: SGSOEffectivenessSummary = {
      total_incidents: 35,
      total_repeated: 6,
      overall_effectiveness: 82.86,
      avg_resolution_time: 3.8,
    };

    expect(mockSummary.total_incidents).toBe(35);
    expect(mockSummary.total_repeated).toBe(6);
    expect(mockSummary.overall_effectiveness).toBe(82.86);
    expect(mockSummary.avg_resolution_time).toBe(3.8);
  });

  it("should have correct SGSOEffectivenessResponse structure", () => {
    const mockResponse: SGSOEffectivenessResponse = {
      data: [
        {
          category: "Erro humano",
          total_incidents: 12,
          repeated_incidents: 3,
          effectiveness_percentage: 75.0,
          avg_resolution_days: 4.2,
        },
      ],
      summary: {
        total_incidents: 35,
        total_repeated: 6,
        overall_effectiveness: 82.86,
        avg_resolution_time: 3.8,
      },
      by_vessel: false,
    };

    expect(mockResponse.data).toHaveLength(1);
    expect(mockResponse.summary.total_incidents).toBe(35);
    expect(mockResponse.by_vessel).toBe(false);
  });

  it("should support all SGSO categories", () => {
    const categories = [
      "Erro humano",
      "Falha técnica",
      "Comunicação",
      "Falha organizacional",
    ];

    categories.forEach((category) => {
      const mockData: SGSOEffectiveness = {
        category: category as any,
        total_incidents: 10,
        repeated_incidents: 2,
        effectiveness_percentage: 80.0,
        avg_resolution_days: 3.0,
      };
      expect(mockData.category).toBe(category);
    });
  });

  it("should calculate effectiveness correctly", () => {
    const totalIncidents = 12;
    const repeatedIncidents = 3;
    const effectiveness = 100 - (repeatedIncidents / totalIncidents * 100);
    
    expect(effectiveness).toBe(75);
  });

  it("should handle zero incidents", () => {
    const mockData: SGSOEffectiveness = {
      category: "Comunicação",
      total_incidents: 0,
      repeated_incidents: 0,
      effectiveness_percentage: 0,
      avg_resolution_days: 0,
    };

    expect(mockData.total_incidents).toBe(0);
    expect(mockData.effectiveness_percentage).toBe(0);
  });

  it("should handle 100% effectiveness", () => {
    const mockData: SGSOEffectiveness = {
      category: "Comunicação",
      total_incidents: 6,
      repeated_incidents: 0,
      effectiveness_percentage: 100.0,
      avg_resolution_days: 1.3,
    };

    expect(mockData.repeated_incidents).toBe(0);
    expect(mockData.effectiveness_percentage).toBe(100.0);
  });
});
