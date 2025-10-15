import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("JobsForecastReport Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component title", () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: null,
    });
    render(<JobsForecastReport />);
    expect(screen.getByText(/🔮 Previsão IA de Manutenção/i)).toBeDefined();
  });

  it("should show loading skeleton when fetching forecast", async () => {
    const mockInvoke = vi.fn(() => 
      new Promise((resolve) => setTimeout(() => resolve({ 
        data: {
          forecasts: [],
          summary: { totalPredictions: 0, criticalActions: 0, accuracy: 0 }
        }, 
        error: null 
      }), 100))
    );
    (supabase.functions.invoke as any).mockImplementation(mockInvoke);

    render(<JobsForecastReport />);
    
    // The component should show loading state initially
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display forecast data when loaded", async () => {
    const mockData = {
      forecasts: [
        {
          component: "Gerador Principal",
          priority: "critical",
          prediction: "Provável falha nas próximas 48h",
          action: "Agendar inspeção preventiva imediata"
        }
      ],
      summary: {
        totalPredictions: 4,
        criticalActions: 1,
        accuracy: 87
      }
    };

    (supabase.functions.invoke as any).mockResolvedValue({
      data: mockData,
      error: null,
    });

    render(<JobsForecastReport />);

    await waitFor(() => {
      expect(screen.getByText("Gerador Principal")).toBeDefined();
      expect(screen.getByText(/Provável falha nas próximas 48h/i)).toBeDefined();
    });
  });

  it("should display summary statistics", async () => {
    const mockData = {
      forecasts: [],
      summary: {
        totalPredictions: 4,
        criticalActions: 1,
        accuracy: 87
      }
    };

    (supabase.functions.invoke as any).mockResolvedValue({
      data: mockData,
      error: null,
    });

    render(<JobsForecastReport />);

    await waitFor(() => {
      expect(screen.getByText("4")).toBeDefined();
      expect(screen.getByText("1")).toBeDefined();
      expect(screen.getByText("87%")).toBeDefined();
    });
  });

  it("should handle error with fallback to mock data", async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: new Error("API Error"),
    });

    render(<JobsForecastReport />);

    await waitFor(() => {
      // Should display mock data when API fails
      expect(screen.getByText("Gerador Principal")).toBeDefined();
    });
  });

  it("should automatically fetch forecast on mount", async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: {
        forecasts: [],
        summary: { totalPredictions: 0, criticalActions: 0, accuracy: 0 }
      },
      error: null,
    });
    (supabase.functions.invoke as any).mockImplementation(mockInvoke);

    render(<JobsForecastReport />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("bi-jobs-forecast");
    });
  });

  it("should display priority indicators correctly", async () => {
    const mockData = {
      forecasts: [
        {
          component: "Critical Component",
          priority: "critical",
          prediction: "Test prediction",
          action: "Test action"
        },
        {
          component: "High Priority Component",
          priority: "high",
          prediction: "Test prediction",
          action: "Test action"
        }
      ],
      summary: {
        totalPredictions: 2,
        criticalActions: 1,
        accuracy: 90
      }
    };

    (supabase.functions.invoke as any).mockResolvedValue({
      data: mockData,
      error: null,
    });

    render(<JobsForecastReport />);

    await waitFor(() => {
      expect(screen.getByText("🔴")).toBeDefined();
      expect(screen.getByText("🟠")).toBeDefined();
    });
  });

  it("should render the component without errors", () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: null,
    });
    const { container } = render(<JobsForecastReport />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
