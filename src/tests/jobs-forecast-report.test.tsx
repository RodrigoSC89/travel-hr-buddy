import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
    render(<JobsForecastReport trend={[]} />);
    expect(screen.getByText(/🔮 Previsão IA de Jobs/i)).toBeDefined();
  });

  it("should show generate button when no trend data is provided", () => {
    render(<JobsForecastReport trend={[]} />);
    expect(screen.getByText(/Gerar Previsão/i)).toBeDefined();
  });

  it("should show loading skeleton when fetching forecast", async () => {
    const mockInvoke = vi.fn(() => 
      new Promise((resolve) => setTimeout(() => resolve({ data: { forecast: "Test forecast" }, error: null }), 100))
    );
    (supabase.functions.invoke as any).mockImplementation(mockInvoke);

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} />);
    
    // The component should show loading state
    await waitFor(() => {
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it("should display forecast when data is loaded", async () => {
    const mockForecast = "Previsão: Esperamos um aumento de 15% nos próximos 2 meses";
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { forecast: mockForecast },
      error: null,
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} />);

    await waitFor(() => {
      expect(screen.getByText(mockForecast)).toBeDefined();
    });
  });

  it("should handle error when forecast fetch fails", async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: new Error("API Error"),
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao buscar previsão/i)).toBeDefined();
    });
  });

  it("should call generate forecast when button is clicked", async () => {
    const mockForecast = "Previsão gerada manualmente";
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { forecast: mockForecast },
      error: null,
    });

    render(<JobsForecastReport trend={[]} />);
    
    const button = screen.getByText(/Gerar Previsão/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(mockForecast)).toBeDefined();
    });
  });

  it("should automatically fetch forecast when trend data is provided", async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: { forecast: "Auto-generated forecast" },
      error: null,
    });
    (supabase.functions.invoke as any).mockImplementation(mockInvoke);

    const trendData = [
      { date: "2025-01", jobs: 10 },
      { date: "2025-02", jobs: 15 },
    ];

    render(<JobsForecastReport trend={trendData} />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("bi-jobs-forecast", {
        body: { trend: trendData }
      });
    });
  });

  it("should not fetch when trend array is empty", () => {
    const mockInvoke = vi.fn();
    (supabase.functions.invoke as any).mockImplementation(mockInvoke);

    render(<JobsForecastReport trend={[]} />);

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsForecastReport trend={[]} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should call onForecastUpdate callback when forecast is fetched", async () => {
    const mockForecast = "Test forecast with callback";
    const onForecastUpdate = vi.fn();
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { forecast: mockForecast },
      error: null,
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} onForecastUpdate={onForecastUpdate} />);

    await waitFor(() => {
      expect(onForecastUpdate).toHaveBeenCalledWith(mockForecast);
    });
  });

  it("should call onForecastUpdate with error message when fetch fails", async () => {
    const onForecastUpdate = vi.fn();
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: new Error("API Error"),
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} onForecastUpdate={onForecastUpdate} />);

    await waitFor(() => {
      expect(onForecastUpdate).toHaveBeenCalledWith("Erro ao buscar previsão. Tente novamente.");
    });
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
