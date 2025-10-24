import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DPIntelligenceDashboard from "@/components/dp-intelligence/DPIntelligenceDashboard";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe("DPIntelligenceDashboard Component", () => {
  const mockStatsData = {
    byVessel: {
      "DP Shuttle Tanker X": 2,
      "DP DSV Subsea Alpha": 1,
      "DP Drillship Beta": 1,
      "DP Construction Vessel Gamma": 1,
      "DP Platform Supply Delta": 1,
    },
    bySeverity: {
      Alta: 3,
      Média: 2,
      Baixa: 1,
    },
    byMonth: {
      "2024-12": 1,
      "2025-06": 1,
      "2025-07": 1,
      "2025-08": 1,
      "2025-09": 1,
      "2025-10": 1,
    },
  };

  beforeEach(() => {
    // Mock successful fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStatsData),
      })
    ) as unknown;
  });

  describe("Component Rendering", () => {
    it("should render dashboard title", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/📊 Resumo de Incidentes DP/i)).toBeInTheDocument();
      });
    });

    it("should display loading state initially", () => {
      render(<DPIntelligenceDashboard />);

      expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });

    it("should render three chart cards", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("🚢 Por Navio")).toBeInTheDocument();
        expect(screen.getByText("🎯 Por Severidade")).toBeInTheDocument();
        expect(screen.getByText("📅 Por Mês")).toBeInTheDocument();
      });
    });

    it("should render insights section", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("📈 Insights Acionáveis")).toBeInTheDocument();
      });
    });
  });

  describe("Data Loading", () => {
    it("should fetch data from API on mount", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/dp-intelligence/stats");
      });
    });

    it("should display data after loading", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/📊 Resumo de Incidentes DP/i)).toBeInTheDocument();
        expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
      });
    });

    it("should display error message when fetch fails", async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      ) as unknown;

      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar dados/i)).toBeInTheDocument();
      });
    });

    it("should display error message when API returns error", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      ) as unknown;

      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar dados/i)).toBeInTheDocument();
      });
    });
  });

  describe("Charts Rendering", () => {
    it("should render bar charts for vessels and months", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        const barCharts = screen.getAllByTestId("bar-chart");
        expect(barCharts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should render pie chart for severity", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
      });
    });

    it("should use ResponsiveContainer for all charts", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        const responsiveContainers = screen.getAllByTestId("responsive-container");
        expect(responsiveContainers.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe("Insights Section", () => {
    it("should display total incidents count", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Total de incidentes registrados/i)).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument(); // Sum of all vessels
      });
    });

    it("should display vessel with most incidents", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Navio com mais incidentes/i)).toBeInTheDocument();
        expect(screen.getByText("DP Shuttle Tanker X")).toBeInTheDocument();
      });
    });

    it("should display most common severity", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Severidade mais comum/i)).toBeInTheDocument();
        expect(screen.getByText("Alta")).toBeInTheDocument();
      });
    });

    it("should display recommendations section", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("⚠️ Recomendações")).toBeInTheDocument();
        expect(screen.getByText(/protocolos de manutenção preventiva/i)).toBeInTheDocument();
      });
    });

    it("should display next steps section", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("✅ Próximos Passos")).toBeInTheDocument();
        expect(screen.getByText(/reuniões com equipes/i)).toBeInTheDocument();
      });
    });

    it("should display analysis section", async () => {
      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("🔍 Análise de Tendências")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty data gracefully", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            byVessel: {},
            bySeverity: { Alta: 0, Média: 0, Baixa: 0 },
            byMonth: {},
          }),
        })
      ) as unknown;

      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/📊 Resumo de Incidentes DP/i)).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("should handle null data", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null),
        })
      ) as unknown;

      render(<DPIntelligenceDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Nenhum dado disponível")).toBeInTheDocument();
      });
    });
  });
});
