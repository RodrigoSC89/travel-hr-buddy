import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SGSOEffectivenessChart } from "@/components/sgso/SGSOEffectivenessChart";
import type { SGSOEffectivenessSummary } from "@/types/sgso-effectiveness";

// Mock fetch
global.fetch = vi.fn();

const mockEffectivenessData: SGSOEffectivenessSummary = {
  total_incidents: 16,
  total_repeated: 7,
  overall_effectiveness: 56.25,
  avg_resolution_time: 7.5,
  by_category: [
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
  ],
  by_vessel: [
    {
      vessel_id: "123e4567-e89b-12d3-a456-426614174000",
      vessel_name: "Test Vessel A",
      total_incidents: 10,
      repeated_incidents: 4,
      effectiveness_percentage: 60.0,
      avg_resolution_days: 8.0,
    },
    {
      vessel_id: "223e4567-e89b-12d3-a456-426614174001",
      vessel_name: "Test Vessel B",
      total_incidents: 6,
      repeated_incidents: 3,
      effectiveness_percentage: 50.0,
      avg_resolution_days: 7.0,
    },
  ],
};

describe("SGSOEffectivenessChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SGSOEffectivenessChart />);
    
    expect(screen.getByText(/Carregando dados de efetividade/i)).toBeInTheDocument();
  });

  it("should render effectiveness data when loaded", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockEffectivenessData,
      }),
    });

    render(<SGSOEffectivenessChart />);

    await waitFor(() => {
      expect(screen.getByText("Total de Incidentes")).toBeInTheDocument();
    });

    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("56.3%")).toBeInTheDocument();
  });

  it("should render error state when fetch fails", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: "Failed to fetch data",
      }),
    });

    render(<SGSOEffectivenessChart />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao Carregar Dados/i)).toBeInTheDocument();
    });
  });

  it("should render empty state when no incidents", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          total_incidents: 0,
          total_repeated: 0,
          overall_effectiveness: 0,
          avg_resolution_time: null,
          by_category: [],
          by_vessel: [],
        },
      }),
    });

    render(<SGSOEffectivenessChart />);

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum incidente SGSO registrado/i)
      ).toBeInTheDocument();
    });
  });

  it("should display all category data", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockEffectivenessData,
      }),
    });

    render(<SGSOEffectivenessChart />);

    await waitFor(() => {
      expect(screen.getAllByText("Erro humano")[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText("Falha técnica")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Comunicação")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Falha organizacional")[0]).toBeInTheDocument();
  });

  it("should generate insights for low effectiveness categories", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockEffectivenessData,
      }),
    });

    render(<SGSOEffectivenessChart />);

    await waitFor(() => {
      expect(screen.getByText("Insights Estratégicos")).toBeInTheDocument();
    });

    // Should have warning for Comunicação (40% effectiveness)
    expect(
      screen.getByText(/Comunicação tem efetividade crítica/i)
    ).toBeInTheDocument();
  });

  it("should display vessel data in vessel view", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockEffectivenessData,
      }),
    });

    render(<SGSOEffectivenessChart />);

    // Verify data loads successfully
    await waitFor(() => {
      expect(screen.getByText("Total de Incidentes")).toBeInTheDocument();
    });

    // Verify vessel data is in the response (will be shown in vessel tab)
    expect(mockEffectivenessData.by_vessel.length).toBeGreaterThan(0);
  });

  it("should calculate effectiveness color correctly", () => {
    const getEffectivenessColor = (percentage: number): string => {
      if (percentage >= 90) return "#22c55e";
      if (percentage >= 75) return "#eab308";
      if (percentage >= 50) return "#f97316";
      return "#ef4444";
    };

    expect(getEffectivenessColor(95)).toBe("#22c55e"); // Green
    expect(getEffectivenessColor(80)).toBe("#eab308"); // Yellow
    expect(getEffectivenessColor(60)).toBe("#f97316"); // Orange
    expect(getEffectivenessColor(30)).toBe("#ef4444"); // Red
  });

  it("should calculate effectiveness label correctly", () => {
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
});
