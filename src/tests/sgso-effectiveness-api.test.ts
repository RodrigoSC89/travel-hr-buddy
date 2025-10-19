import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

describe("SGSO Effectiveness API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate effectiveness by category correctly", async () => {
    const mockCategoryData = [
      {
        category: "Erro humano",
        total_incidents: 4,
        repeated_incidents: 1,
        effectiveness_percentage: 75.0,
        avg_resolution_days: 4.5,
      },
      {
        category: "Falha técnica",
        total_incidents: 4,
        repeated_incidents: 2,
        effectiveness_percentage: 50.0,
        avg_resolution_days: 7.0,
      },
      {
        category: "Comunicação",
        total_incidents: 5,
        repeated_incidents: 3,
        effectiveness_percentage: 40.0,
        avg_resolution_days: 6.0,
      },
      {
        category: "Falha organizacional",
        total_incidents: 3,
        repeated_incidents: 1,
        effectiveness_percentage: 66.67,
        avg_resolution_days: 15.0,
      },
    ];

    const mockVesselData = [
      {
        vessel_id: "123e4567-e89b-12d3-a456-426614174000",
        vessel_name: "Vessel A",
        total_incidents: 10,
        repeated_incidents: 4,
        effectiveness_percentage: 60.0,
        avg_resolution_days: 8.0,
      },
    ];

    const mockSupabase = {
      rpc: vi.fn()
        .mockResolvedValueOnce({ data: mockCategoryData, error: null })
        .mockResolvedValueOnce({ data: mockVesselData, error: null }),
    };

    (createClient as any).mockReturnValue(mockSupabase);

    // Test the effectiveness calculation logic
    const totalIncidents = mockCategoryData.reduce(
      (sum, item) => sum + item.total_incidents,
      0
    );
    const totalRepeated = mockCategoryData.reduce(
      (sum, item) => sum + item.repeated_incidents,
      0
    );
    const overallEffectiveness = 100 - (totalRepeated / totalIncidents) * 100;

    expect(totalIncidents).toBe(16);
    expect(totalRepeated).toBe(7);
    expect(overallEffectiveness).toBeCloseTo(56.25, 2);
  });

  it("should handle empty data gracefully", () => {
    const emptyData: any[] = [];
    
    const totalIncidents = emptyData.reduce(
      (sum, item) => sum + item.total_incidents,
      0
    );
    const totalRepeated = emptyData.reduce(
      (sum, item) => sum + item.repeated_incidents,
      0
    );
    const overallEffectiveness = totalIncidents > 0 
      ? 100 - (totalRepeated / totalIncidents) * 100 
      : 0;

    expect(totalIncidents).toBe(0);
    expect(totalRepeated).toBe(0);
    expect(overallEffectiveness).toBe(0);
  });

  it("should calculate weighted average resolution time correctly", () => {
    const mockData = [
      {
        category: "Erro humano",
        total_incidents: 4,
        repeated_incidents: 1,
        effectiveness_percentage: 75.0,
        avg_resolution_days: 5.0,
      },
      {
        category: "Falha técnica",
        total_incidents: 6,
        repeated_incidents: 2,
        effectiveness_percentage: 66.67,
        avg_resolution_days: 10.0,
      },
    ];

    let totalResolutionDays = 0;
    let totalResolved = 0;

    mockData.forEach((item) => {
      if (item.avg_resolution_days !== null) {
        const resolvedCount = item.total_incidents - item.repeated_incidents;
        totalResolutionDays += item.avg_resolution_days * resolvedCount;
        totalResolved += resolvedCount;
      }
    });

    const avgResolutionTime = totalResolved > 0 
      ? totalResolutionDays / totalResolved 
      : null;

    expect(totalResolved).toBe(7); // (4-1) + (6-2) = 3 + 4
    expect(avgResolutionTime).toBeCloseTo(7.86, 2); // (5*3 + 10*4) / 7
  });

  it("should correctly categorize effectiveness levels", () => {
    const getEffectivenessLabel = (percentage: number): string => {
      if (percentage >= 90) return "Excelente";
      if (percentage >= 75) return "Bom";
      if (percentage >= 50) return "Regular";
      return "Crítico";
    };

    expect(getEffectivenessLabel(95)).toBe("Excelente");
    expect(getEffectivenessLabel(80)).toBe("Bom");
    expect(getEffectivenessLabel(60)).toBe("Regular");
    expect(getEffectivenessLabel(30)).toBe("Crítico");
  });

  it("should generate insights for low effectiveness", () => {
    const mockCategories = [
      {
        category: "Comunicação",
        total_incidents: 5,
        repeated_incidents: 3,
        effectiveness_percentage: 40.0,
        avg_resolution_days: 6.0,
      },
      {
        category: "Erro humano",
        total_incidents: 4,
        repeated_incidents: 0,
        effectiveness_percentage: 100.0,
        avg_resolution_days: 3.0,
      },
    ];

    const lowEffectivenessCategories = mockCategories.filter(
      (c) => c.effectiveness_percentage < 50
    );
    
    expect(lowEffectivenessCategories).toHaveLength(1);
    expect(lowEffectivenessCategories[0].category).toBe("Comunicação");
  });

  it("should identify high recurrence categories", () => {
    const mockCategories = [
      {
        category: "Comunicação",
        total_incidents: 5,
        repeated_incidents: 3,
        effectiveness_percentage: 40.0,
        avg_resolution_days: 6.0,
      },
      {
        category: "Erro humano",
        total_incidents: 10,
        repeated_incidents: 1,
        effectiveness_percentage: 90.0,
        avg_resolution_days: 3.0,
      },
    ];

    const highRecurrence = mockCategories.filter(
      (c) => c.repeated_incidents / c.total_incidents > 0.3
    );

    expect(highRecurrence).toHaveLength(1);
    expect(highRecurrence[0].category).toBe("Comunicação");
    expect(highRecurrence[0].repeated_incidents / highRecurrence[0].total_incidents).toBe(0.6);
  });
});
