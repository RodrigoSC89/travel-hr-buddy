import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminBI from "@/pages/admin/bi";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock the BI components
vi.mock("@/components/bi", () => ({
  PainelBI: () => <div data-testid="painel-bi">PainelBI Component</div>,
  DashboardJobs: () => <div data-testid="dashboard-jobs">DashboardJobs Component</div>,
  JobsTrendChart: () => <div data-testid="jobs-trend-chart">JobsTrendChart Component</div>,
  JobsForecastReport: () => <div data-testid="jobs-forecast-report">JobsForecastReport Component</div>,
  ComplianceByVesselChart: () => <div data-testid="compliance-by-vessel-chart">ComplianceByVesselChart Component</div>,
  ComplianceByVesselTable: () => <div data-testid="compliance-by-vessel-table">ComplianceByVesselTable Component</div>,
}));

describe("AdminBI Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <BrowserRouter>
        <AdminBI />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Business Intelligence Dashboard/i)).toBeDefined();
  });

  it("should render the page description", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <BrowserRouter>
        <AdminBI />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Análise de dados de manutenção com visualizações e previsões de IA/i)).toBeDefined();
  });

  it("should render all BI components including compliance by vessel", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <BrowserRouter>
        <AdminBI />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId("painel-bi")).toBeDefined();
    expect(screen.getByTestId("compliance-by-vessel-chart")).toBeDefined();
    expect(screen.getByTestId("compliance-by-vessel-table")).toBeDefined();
    expect(screen.getByTestId("dashboard-jobs")).toBeDefined();
    expect(screen.getByTestId("jobs-trend-chart")).toBeDefined();
    expect(screen.getByTestId("jobs-forecast-report")).toBeDefined();
  });

  it("should call jobs_trend_by_month RPC on mount", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <BrowserRouter>
        <AdminBI />
      </BrowserRouter>
    );
    
    expect(supabase.rpc).toHaveBeenCalledWith("jobs_trend_by_month");
  });

  it("should handle errors gracefully when fetching trend data", () => {
    const mockError = new Error("RPC Error");
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <AdminBI />
      </BrowserRouter>
    );
    
    // Component should still render even with errors
    expect(screen.getByText(/Business Intelligence Dashboard/i)).toBeDefined();

    consoleSpy.mockRestore();
  });
});
