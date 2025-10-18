import { describe, it, expect } from "vitest";
import type { EffectivenessData, EffectivenessDataByVessel } from "../../pages/api/sgso/effectiveness";

describe("SGSO Effectiveness API Types", () => {
  it("should have correct EffectivenessData structure", () => {
    const sampleData: EffectivenessData = {
      category: "Erro humano",
      incidents_total: 10,
      incidents_repeated: 2,
      effectiveness_percent: 80,
      avg_resolution_days: 5.5
    };

    expect(sampleData).toHaveProperty("category");
    expect(sampleData).toHaveProperty("incidents_total");
    expect(sampleData).toHaveProperty("incidents_repeated");
    expect(sampleData).toHaveProperty("effectiveness_percent");
    expect(sampleData).toHaveProperty("avg_resolution_days");
    expect(typeof sampleData.category).toBe("string");
    expect(typeof sampleData.incidents_total).toBe("number");
    expect(typeof sampleData.incidents_repeated).toBe("number");
    expect(typeof sampleData.effectiveness_percent).toBe("number");
    expect(typeof sampleData.avg_resolution_days).toBe("number");
  });

  it("should have correct EffectivenessDataByVessel structure", () => {
    const sampleData: EffectivenessDataByVessel = {
      vessel: "DP Shuttle Tanker X",
      category: "Falha técnica",
      incidents_total: 5,
      incidents_repeated: 1,
      effectiveness_percent: 80,
      avg_resolution_days: 3.2
    };

    expect(sampleData).toHaveProperty("vessel");
    expect(sampleData).toHaveProperty("category");
    expect(sampleData).toHaveProperty("incidents_total");
    expect(sampleData).toHaveProperty("incidents_repeated");
    expect(sampleData).toHaveProperty("effectiveness_percent");
    expect(sampleData).toHaveProperty("avg_resolution_days");
    expect(typeof sampleData.vessel).toBe("string");
  });

  it("should calculate effectiveness correctly", () => {
    const testData: EffectivenessData = {
      category: "Comunicação",
      incidents_total: 10,
      incidents_repeated: 1,
      effectiveness_percent: 90, // 100 - (1/10 * 100) = 90
      avg_resolution_days: 2.5
    };

    const expectedEffectiveness = 100 - (testData.incidents_repeated / testData.incidents_total * 100);
    expect(testData.effectiveness_percent).toBe(expectedEffectiveness);
  });

  it("should handle zero repeated incidents", () => {
    const perfectData: EffectivenessData = {
      category: "Comunicação",
      incidents_total: 10,
      incidents_repeated: 0,
      effectiveness_percent: 100,
      avg_resolution_days: 2.0
    };

    expect(perfectData.effectiveness_percent).toBe(100);
    expect(perfectData.incidents_repeated).toBe(0);
  });

  it("should handle multiple categories", () => {
    const categories: EffectivenessData[] = [
      {
        category: "Erro humano",
        incidents_total: 12,
        incidents_repeated: 3,
        effectiveness_percent: 75,
        avg_resolution_days: 4.2
      },
      {
        category: "Falha técnica",
        incidents_total: 9,
        incidents_repeated: 1,
        effectiveness_percent: 88.9,
        avg_resolution_days: 2.7
      },
      {
        category: "Comunicação",
        incidents_total: 6,
        incidents_repeated: 0,
        effectiveness_percent: 100,
        avg_resolution_days: 1.3
      },
      {
        category: "Falha organizacional",
        incidents_total: 8,
        incidents_repeated: 2,
        effectiveness_percent: 75,
        avg_resolution_days: 6.1
      }
    ];

    expect(categories).toHaveLength(4);
    expect(categories.every(c => c.effectiveness_percent >= 0 && c.effectiveness_percent <= 100)).toBe(true);
    expect(categories.every(c => c.incidents_repeated <= c.incidents_total)).toBe(true);
  });

  it("should validate vessel-specific data grouping", () => {
    const vesselData: EffectivenessDataByVessel[] = [
      {
        vessel: "DP Shuttle Tanker X",
        category: "Erro humano",
        incidents_total: 3,
        incidents_repeated: 1,
        effectiveness_percent: 66.7,
        avg_resolution_days: 5.0
      },
      {
        vessel: "DP Shuttle Tanker X",
        category: "Falha técnica",
        incidents_total: 2,
        incidents_repeated: 0,
        effectiveness_percent: 100,
        avg_resolution_days: 3.5
      },
      {
        vessel: "DP DSV Subsea Alpha",
        category: "Falha técnica",
        incidents_total: 4,
        incidents_repeated: 1,
        effectiveness_percent: 75,
        avg_resolution_days: 2.8
      }
    ];

    const vessels = [...new Set(vesselData.map(d => d.vessel))];
    expect(vessels).toHaveLength(2);
    expect(vessels).toContain("DP Shuttle Tanker X");
    expect(vessels).toContain("DP DSV Subsea Alpha");
  });

  it("should validate data ranges", () => {
    const data: EffectivenessData = {
      category: "Falha técnica",
      incidents_total: 5,
      incidents_repeated: 2,
      effectiveness_percent: 60,
      avg_resolution_days: 4.5
    };

    // Effectiveness should be between 0 and 100
    expect(data.effectiveness_percent).toBeGreaterThanOrEqual(0);
    expect(data.effectiveness_percent).toBeLessThanOrEqual(100);

    // Repeated incidents should not exceed total
    expect(data.incidents_repeated).toBeLessThanOrEqual(data.incidents_total);

    // All counts should be non-negative
    expect(data.incidents_total).toBeGreaterThanOrEqual(0);
    expect(data.incidents_repeated).toBeGreaterThanOrEqual(0);
    expect(data.avg_resolution_days).toBeGreaterThanOrEqual(0);
  });

  it("should handle edge case with all incidents repeated", () => {
    const worstCase: EffectivenessData = {
      category: "Critical Category",
      incidents_total: 10,
      incidents_repeated: 10,
      effectiveness_percent: 0,
      avg_resolution_days: 10.0
    };

    expect(worstCase.effectiveness_percent).toBe(0);
    expect(worstCase.incidents_repeated).toBe(worstCase.incidents_total);
  });

  it("should validate SGSO category names", () => {
    const validCategories = [
      "Erro humano",
      "Falha técnica",
      "Comunicação",
      "Falha organizacional"
    ];

    const data: EffectivenessData[] = validCategories.map(cat => ({
      category: cat,
      incidents_total: 5,
      incidents_repeated: 1,
      effectiveness_percent: 80,
      avg_resolution_days: 3.0
    }));

    expect(data).toHaveLength(4);
    data.forEach(item => {
      expect(validCategories).toContain(item.category);
    });
  });
});
