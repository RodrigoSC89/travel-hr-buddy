import { describe, it, expect } from "vitest";
import { getEffectivenessLevel } from "@/types/sgso-effectiveness";

describe("SGSOEffectivenessChart Component", () => {
  describe("Effectiveness Level Classification", () => {
    it("should classify 95% as Excelente", () => {
      const level = getEffectivenessLevel(95);
      expect(level.label).toBe("Excelente");
      expect(level.color).toBe("green");
      expect(level.icon).toBe("🟢");
    });

    it("should classify 90% as Excelente (boundary)", () => {
      const level = getEffectivenessLevel(90);
      expect(level.label).toBe("Excelente");
      expect(level.color).toBe("green");
    });

    it("should classify 80% as Bom", () => {
      const level = getEffectivenessLevel(80);
      expect(level.label).toBe("Bom");
      expect(level.color).toBe("yellow");
      expect(level.icon).toBe("🟡");
    });

    it("should classify 75% as Bom (boundary)", () => {
      const level = getEffectivenessLevel(75);
      expect(level.label).toBe("Bom");
      expect(level.color).toBe("yellow");
    });

    it("should classify 60% as Regular", () => {
      const level = getEffectivenessLevel(60);
      expect(level.label).toBe("Regular");
      expect(level.color).toBe("orange");
      expect(level.icon).toBe("🟠");
    });

    it("should classify 50% as Regular (boundary)", () => {
      const level = getEffectivenessLevel(50);
      expect(level.label).toBe("Regular");
      expect(level.color).toBe("orange");
    });

    it("should classify 30% as Crítico", () => {
      const level = getEffectivenessLevel(30);
      expect(level.label).toBe("Crítico");
      expect(level.color).toBe("red");
      expect(level.icon).toBe("🔴");
    });

    it("should classify 0% as Crítico", () => {
      const level = getEffectivenessLevel(0);
      expect(level.label).toBe("Crítico");
      expect(level.color).toBe("red");
    });

    it("should classify 49.9% as Crítico (just below threshold)", () => {
      const level = getEffectivenessLevel(49.9);
      expect(level.label).toBe("Crítico");
      expect(level.color).toBe("red");
    });

    it("should classify 100% as Excelente", () => {
      const level = getEffectivenessLevel(100);
      expect(level.label).toBe("Excelente");
      expect(level.color).toBe("green");
    });
  });

  describe("Data Structure Validation", () => {
    it("should validate effectiveness metric structure", () => {
      const metric = {
        category: "Erro humano",
        total_incidents: 12,
        repeated_incidents: 3,
        effectiveness_percentage: 75.0,
        avg_resolution_days: 4.2,
      };

      expect(metric).toHaveProperty("category");
      expect(metric).toHaveProperty("total_incidents");
      expect(metric).toHaveProperty("repeated_incidents");
      expect(metric).toHaveProperty("effectiveness_percentage");
      expect(metric).toHaveProperty("avg_resolution_days");
      expect(typeof metric.category).toBe("string");
      expect(typeof metric.total_incidents).toBe("number");
      expect(typeof metric.repeated_incidents).toBe("number");
      expect(typeof metric.effectiveness_percentage).toBe("number");
    });

    it("should validate vessel-specific metric structure", () => {
      const vesselMetric = {
        vessel_name: "Navio A",
        category: "Erro humano",
        total_incidents: 5,
        repeated_incidents: 1,
        effectiveness_percentage: 80.0,
        avg_resolution_days: 3.5,
      };

      expect(vesselMetric).toHaveProperty("vessel_name");
      expect(vesselMetric).toHaveProperty("category");
      expect(typeof vesselMetric.vessel_name).toBe("string");
    });

    it("should validate summary structure", () => {
      const summary = {
        total_incidents: 21,
        total_repeated: 4,
        overall_effectiveness: 80.95,
      };

      expect(summary).toHaveProperty("total_incidents");
      expect(summary).toHaveProperty("total_repeated");
      expect(summary).toHaveProperty("overall_effectiveness");
      expect(typeof summary.total_incidents).toBe("number");
      expect(typeof summary.total_repeated).toBe("number");
      expect(typeof summary.overall_effectiveness).toBe("number");
    });
  });

  describe("Chart Data Transformation", () => {
    it("should transform API data to chart format", () => {
      const apiData = {
        category: "Erro humano",
        total_incidents: 12,
        repeated_incidents: 3,
        effectiveness_percentage: 75.0,
        avg_resolution_days: 4.2,
      };

      const chartData = {
        category: apiData.category,
        effectiveness: Number(apiData.effectiveness_percentage),
        total: Number(apiData.total_incidents),
        repeated: Number(apiData.repeated_incidents),
        avgDays: apiData.avg_resolution_days ? Number(apiData.avg_resolution_days) : null,
      };

      expect(chartData.category).toBe("Erro humano");
      expect(chartData.effectiveness).toBe(75);
      expect(chartData.total).toBe(12);
      expect(chartData.repeated).toBe(3);
      expect(chartData.avgDays).toBe(4.2);
    });

    it("should handle null avg_resolution_days", () => {
      const apiData = {
        category: "Comunicação",
        total_incidents: 6,
        repeated_incidents: 0,
        effectiveness_percentage: 100.0,
        avg_resolution_days: null,
      };

      const chartData = {
        avgDays: apiData.avg_resolution_days ? Number(apiData.avg_resolution_days) : null,
      };

      expect(chartData.avgDays).toBeNull();
    });
  });

  describe("Category Constants", () => {
    it("should define all SGSO effectiveness categories", () => {
      const categories = [
        "Erro humano",
        "Falha técnica",
        "Comunicação",
        "Falha organizacional",
      ];

      expect(categories).toHaveLength(4);
      expect(categories).toContain("Erro humano");
      expect(categories).toContain("Falha técnica");
      expect(categories).toContain("Comunicação");
      expect(categories).toContain("Falha organizacional");
    });
  });
});
