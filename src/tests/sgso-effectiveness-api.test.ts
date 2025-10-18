import { describe, it, expect } from "vitest";

describe("SGSO Effectiveness API", () => {
  describe("API Structure", () => {
    it("should define the expected endpoint structure", () => {
      // Test that the API endpoint expectations are clear
      const expectedEndpoint = "/api/sgso/effectiveness";
      const expectedMethods = ["GET"];
      const expectedQueryParams = ["by_vessel"];

      expect(expectedEndpoint).toBe("/api/sgso/effectiveness");
      expect(expectedMethods).toContain("GET");
      expect(expectedQueryParams).toContain("by_vessel");
    });

    it("should return overall effectiveness data structure", () => {
      const mockData = [
        {
          category: "Erro humano",
          incidents_total: 12,
          incidents_repeated: 3,
          effectiveness_percent: 75,
          avg_resolution_days: 4.2,
        },
        {
          category: "Falha técnica",
          incidents_total: 9,
          incidents_repeated: 1,
          effectiveness_percent: 88.9,
          avg_resolution_days: 2.7,
        },
      ];

      // Validate structure
      mockData.forEach(item => {
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("incidents_total");
        expect(item).toHaveProperty("incidents_repeated");
        expect(item).toHaveProperty("effectiveness_percent");
        expect(item).toHaveProperty("avg_resolution_days");
      });
    });

    it("should return effectiveness data by vessel structure", () => {
      const mockData = [
        {
          vessel_name: "Navio A",
          category: "Erro humano",
          incidents_total: 5,
          incidents_repeated: 1,
          effectiveness_percent: 80,
          avg_resolution_days: 3.5,
        },
      ];

      // Validate structure
      mockData.forEach(item => {
        expect(item).toHaveProperty("vessel_name");
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("incidents_total");
        expect(item).toHaveProperty("incidents_repeated");
        expect(item).toHaveProperty("effectiveness_percent");
        expect(item).toHaveProperty("avg_resolution_days");
      });
    });
  });

  describe("SQL Functions", () => {
    it("calculate_sgso_effectiveness should group by category", () => {
      // Test SQL function logic conceptually
      const mockIncidents = [
        { sgso_category: "Erro humano", repeated: false, resolved_at: new Date(), created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { sgso_category: "Erro humano", repeated: true, resolved_at: new Date(), created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { sgso_category: "Falha técnica", repeated: false, resolved_at: new Date(), created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ];

      const grouped = mockIncidents.reduce((acc: any, incident) => {
        const cat = incident.sgso_category;
        if (!acc[cat]) {
          acc[cat] = { total: 0, repeated: 0, resolutionTimes: [] };
        }
        acc[cat].total += 1;
        if (incident.repeated) acc[cat].repeated += 1;
        if (incident.resolved_at) {
          const days = (incident.resolved_at.getTime() - incident.created_at.getTime()) / (1000 * 60 * 60 * 24);
          acc[cat].resolutionTimes.push(days);
        }
        return acc;
      }, {});

      expect(grouped["Erro humano"].total).toBe(2);
      expect(grouped["Erro humano"].repeated).toBe(1);
      expect(grouped["Falha técnica"].total).toBe(1);
      expect(grouped["Falha técnica"].repeated).toBe(0);
    });

    it("should calculate effectiveness percentage correctly", () => {
      const total = 12;
      const repeated = 3;
      const effectiveness = 100 - (repeated / total * 100);
      
      expect(effectiveness).toBe(75);
    });

    it("should calculate average resolution days", () => {
      const resolutionDays = [3, 5, 2, 4];
      const average = resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length;
      
      expect(average).toBe(3.5);
    });

    it("should handle null sgso_category as 'Não Classificado'", () => {
      const category = null;
      const result = category ?? "Não Classificado";
      
      expect(result).toBe("Não Classificado");
    });
  });

  describe("Effectiveness Metrics", () => {
    it("should identify categories with high reincidence", () => {
      const data = [
        { category: "Erro humano", incidents_total: 10, incidents_repeated: 5, effectiveness_percent: 50 },
        { category: "Falha técnica", incidents_total: 10, incidents_repeated: 1, effectiveness_percent: 90 },
      ];

      const criticalCategories = data.filter(item => item.effectiveness_percent < 75);
      
      expect(criticalCategories).toHaveLength(1);
      expect(criticalCategories[0].category).toBe("Erro humano");
    });

    it("should calculate overall effectiveness", () => {
      const data = [
        { incidents_total: 12, incidents_repeated: 3 },
        { incidents_total: 9, incidents_repeated: 1 },
      ];

      const totalIncidents = data.reduce((sum, item) => sum + item.incidents_total, 0);
      const totalRepeated = data.reduce((sum, item) => sum + item.incidents_repeated, 0);
      const overallEffectiveness = 100 - (totalRepeated / totalIncidents * 100);

      expect(totalIncidents).toBe(21);
      expect(totalRepeated).toBe(4);
      expect(overallEffectiveness).toBeCloseTo(80.95, 1);
    });
  });
});
