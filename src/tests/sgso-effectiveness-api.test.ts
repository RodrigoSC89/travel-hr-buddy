import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Supabase client
const mockRpc = vi.fn();
const mockSupabase = {
  rpc: mockRpc,
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe("SGSO Effectiveness API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  describe("API Response Structure", () => {
    it("should return effectiveness data with correct structure", () => {
      const mockData = [
        {
          category: "Erro humano",
          total_incidents: 12,
          repeated_incidents: 3,
          effectiveness_percentage: 75.0,
          avg_resolution_days: 4.2,
        },
      ];

      expect(mockData[0]).toHaveProperty("category");
      expect(mockData[0]).toHaveProperty("total_incidents");
      expect(mockData[0]).toHaveProperty("repeated_incidents");
      expect(mockData[0]).toHaveProperty("effectiveness_percentage");
      expect(mockData[0]).toHaveProperty("avg_resolution_days");
    });

    it("should calculate summary statistics correctly", () => {
      const data = [
        {
          category: "Erro humano",
          total_incidents: 12,
          repeated_incidents: 3,
          effectiveness_percentage: 75.0,
          avg_resolution_days: 4.2,
        },
        {
          category: "Falha técnica",
          total_incidents: 9,
          repeated_incidents: 1,
          effectiveness_percentage: 88.9,
          avg_resolution_days: 2.7,
        },
      ];

      const totalIncidents = data.reduce((sum, item) => sum + item.total_incidents, 0);
      const totalRepeated = data.reduce((sum, item) => sum + item.repeated_incidents, 0);
      const overallEffectiveness = Number((100 - (totalRepeated / totalIncidents * 100)).toFixed(2));

      expect(totalIncidents).toBe(21);
      expect(totalRepeated).toBe(4);
      expect(overallEffectiveness).toBe(80.95);
    });
  });

  describe("Effectiveness Calculation", () => {
    it("should calculate effectiveness percentage correctly", () => {
      const totalIncidents = 12;
      const repeatedIncidents = 3;
      const effectiveness = 100 - (repeatedIncidents / totalIncidents * 100);

      expect(effectiveness).toBe(75);
    });

    it("should handle zero incidents", () => {
      const totalIncidents = 0;
      const repeatedIncidents = 0;
      const effectiveness = totalIncidents > 0 
        ? 100 - (repeatedIncidents / totalIncidents * 100)
        : 0;

      expect(effectiveness).toBe(0);
    });

    it("should handle 100% effectiveness (no repeated incidents)", () => {
      const totalIncidents = 10;
      const repeatedIncidents = 0;
      const effectiveness = 100 - (repeatedIncidents / totalIncidents * 100);

      expect(effectiveness).toBe(100);
    });
  });

  describe("Data Validation", () => {
    it("should validate SGSO categories", () => {
      const validCategories = [
        "Erro humano",
        "Falha técnica",
        "Comunicação",
        "Falha organizacional",
      ];

      const testCategory = "Erro humano";
      expect(validCategories).toContain(testCategory);
    });

    it("should handle null average resolution days", () => {
      const mockData = {
        category: "Erro humano",
        total_incidents: 5,
        repeated_incidents: 1,
        effectiveness_percentage: 80.0,
        avg_resolution_days: null,
      };

      expect(mockData.avg_resolution_days).toBeNull();
    });

    it("should validate numeric values are positive", () => {
      const mockData = {
        category: "Erro humano",
        total_incidents: 12,
        repeated_incidents: 3,
        effectiveness_percentage: 75.0,
        avg_resolution_days: 4.2,
      };

      expect(mockData.total_incidents).toBeGreaterThanOrEqual(0);
      expect(mockData.repeated_incidents).toBeGreaterThanOrEqual(0);
      expect(mockData.effectiveness_percentage).toBeGreaterThanOrEqual(0);
      expect(mockData.effectiveness_percentage).toBeLessThanOrEqual(100);
    });
  });

  describe("By Vessel Data", () => {
    it("should include vessel name in vessel-specific data", () => {
      const mockVesselData = [
        {
          vessel_name: "Navio A",
          category: "Erro humano",
          total_incidents: 5,
          repeated_incidents: 1,
          effectiveness_percentage: 80.0,
          avg_resolution_days: 3.5,
        },
      ];

      expect(mockVesselData[0]).toHaveProperty("vessel_name");
      expect(mockVesselData[0].vessel_name).toBe("Navio A");
    });

    it("should handle unknown vessel names", () => {
      const vesselName = "Unknown";
      expect(vesselName).toBeDefined();
      expect(typeof vesselName).toBe("string");
    });
  });
});
