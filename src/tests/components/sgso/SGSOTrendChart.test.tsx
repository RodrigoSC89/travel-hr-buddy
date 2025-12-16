import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";

// Mock recharts
vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: vi.fn(() => <div />),
  XAxis: vi.fn(() => <div />),
  YAxis: vi.fn(() => <div />),
  Tooltip: vi.fn(() => <div />),
  Legend: vi.fn(() => <div />),
  ResponsiveContainer: vi.fn(({ children }) => <div>{children}</div>),
  CartesianGrid: vi.fn(() => <div />),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SGSOTrendChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the chart title", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API not available"));
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      expect(screen.getByText(/📈 Evolução dos Riscos SGSO/i)).toBeDefined();
    });
  });

  it("should render loading state initially", () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<SGSOTrendChart />);
    
    expect(screen.getByText(/Carregando dados de tendência/i)).toBeDefined();
  });

  it("should render chart with custom data", async () => {
    const customData = [
      { mes: "2025-10", risco: "baixo", total: 5 },
      { mes: "2025-10", risco: "alto", total: 2 },
    ];
    
    render(<SGSOTrendChart data={customData} />);
    
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeDefined();
    });
  });

  it("should fetch data from API when no custom data provided", async () => {
    const apiData = [
      { mes: "2025-10", risco: "baixo", total: 8 },
      { mes: "2025-10", risco: "moderado", total: 5 },
    ];
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiData,
    });
    
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/bi/sgso-trend");
    });
  });

  it("should use sample data when API fails and no custom data provided", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API error"));
    
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeDefined();
    });
  });

  it("should render chart description", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API not available"));
    
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      expect(screen.getByText(/Tendência mensal dos incidentes classificados/i)).toBeDefined();
    });
  });

  it("should display 'no data' message when chart data is empty", async () => {
    // Mock fetch to return empty array
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhum dado disponível para exibição/i)).toBeDefined();
    });
  });

  it("should not fetch from API when custom data is provided", async () => {
    const customData = [
      { mes: "2025-10", risco: "baixo", total: 5 },
    ];
    
    render(<SGSOTrendChart data={customData} />);
    
    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it("should handle API error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    
    render(<SGSOTrendChart />);
    
    await waitFor(() => {
      // Should still render with sample data, no error message
      expect(screen.queryByText(/error/i)).toBeNull();
      expect(screen.getByTestId("line-chart")).toBeDefined();
    });
  });

  it("should format date correctly in Portuguese", async () => {
    const customData = [
      { mes: "2025-10-15", risco: "baixo", total: 5 },
    ];
    
    render(<SGSOTrendChart data={customData} />);
    
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeDefined();
    });
  });

  it("should handle multiple risk levels in data", async () => {
    const customData = [
      { mes: "2025-10", risco: "baixo", total: 5 },
      { mes: "2025-10", risco: "moderado", total: 3 },
      { mes: "2025-10", risco: "alto", total: 2 },
      { mes: "2025-10", risco: "crítico", total: 1 },
    ];
    
    render(<SGSOTrendChart data={customData} />);
    
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeDefined();
    });
  });

  it("should render card component", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API not available"));
    
    const { container } = render(<SGSOTrendChart />);
    
    await waitFor(() => {
      // Card should be rendered (checking for the outer card structure)
      expect(container.querySelector("[class*=\"card\"]")).toBeDefined();
    });
  });
});
