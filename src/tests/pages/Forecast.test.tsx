import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForecastPage from "@/pages/Forecast";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock chart components
vi.mock("@/components/bi/JobsForecastReport", () => ({
  default: ({ trend }: { trend: unknown[] }) => (
    <div data-testid="jobs-forecast-report">
      Forecast Report with {trend.length} data points
    </div>
  ),
}));

describe("ForecastPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title and description", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Previsões de Vagas")).toBeInTheDocument();
    expect(
      screen.getByText(/Análise preditiva e previsões baseadas em IA/i)
    ).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    vi.mocked(supabase.rpc).mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    );

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should load and display trend data", async () => {
    const mockData = [
      { month: "2025-01", total_jobs: 100 },
      { month: "2025-02", total_jobs: 120 },
    ];

    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockData, error: null });

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("jobs-forecast-report")).toBeInTheDocument();
      expect(
        screen.getByText(/Forecast Report with 2 data points/)
      ).toBeInTheDocument();
    });
  });

  it("should display error message when RPC fails", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: "RPC error" },
    });

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao carregar dados de tendência")
      ).toBeInTheDocument();
    });
  });

  it("should call jobs_trend_by_month RPC on mount", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("jobs_trend_by_month");
    });
  });

  it("should display empty state when no data is available", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });

    render(
      <MemoryRouter>
        <ForecastPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum dado de tendência disponível")
      ).toBeInTheDocument();
    });
  });
});
