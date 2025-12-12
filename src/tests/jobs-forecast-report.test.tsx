import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

type TrendPoint = {
  date: string;
  jobs: number;
};

type ForecastResponse = {
  data: { forecast: string } | null;
  error: Error | null;
};

type ForecastInvokeFn = (
  functionName: string,
  options: { body: { trend: TrendPoint[] } }
) => Promise<ForecastResponse>;

const invokeMock = vi.fn<ForecastInvokeFn>();

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));
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
    invokeMock.mockImplementation(mockInvoke);

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} />);
    
    // The component should show loading state
    await waitFor(() => {
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it("should display forecast when data is loaded", async () => {
    const mockForecast = "Previsão: Esperamos um aumento de 15% nos próximos 2 meses";
    invokeMock.mockResolvedValue({
      data: { forecast: mockForecast },
      error: null,
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} />);

    await waitFor(() => {
      expect(screen.getByText(mockForecast)).toBeDefined();
    });
  });

  it("should handle error when forecast fetch fails", async () => {
    invokeMock.mockResolvedValue({
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
    invokeMock.mockResolvedValue({
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
    invokeMock.mockImplementation(mockInvoke);

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
    invokeMock.mockImplementation(mockInvoke);

    render(<JobsForecastReport trend={[]} />);

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsForecastReport trend={[]} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should call onForecastUpdate callback when forecast is loaded", async () => {
    const mockForecast = "Previsão de teste";
    const mockCallback = vi.fn();
    invokeMock.mockResolvedValue({
      data: { forecast: mockForecast },
      error: null,
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} onForecastUpdate={mockCallback} />);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(mockForecast);
    });
  });

  it("should call onForecastUpdate callback with error message on error", async () => {
    const mockCallback = vi.fn();
    invokeMock.mockResolvedValue({
      data: null,
      error: new Error("API Error"),
    });

    render(<JobsForecastReport trend={[{ date: "2025-01", jobs: 10 }]} onForecastUpdate={mockCallback} />);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith("Erro ao buscar previsão. Tente novamente.");
    });
  });
};
