import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client");

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-count={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("DashboardJobs", () => {
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock implementation
    (supabase.functions.invoke as unknown) = mockInvoke;
  });

  it("renders loading skeleton initially", () => {
    mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DashboardJobs />);
    
    // Check for skeleton loader
    const skeleton = document.querySelector(".h-64.w-full");
    expect(skeleton).toBeTruthy();
  });

  it("renders chart with data after successful fetch", async () => {
    const mockData = [
      { component_id: "Motor Principal", count: 15, avg_duration: 8.5 },
      { component_id: "Gerador", count: 10, avg_duration: 5.2 },
      { component_id: "Sistema Elétrico", count: 8, avg_duration: 3.8 },
    ];

    mockInvoke.mockResolvedValue({ data: mockData, error: null });

    render(<DashboardJobs />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    // Check that the chart is rendered with correct data
    const barChart = screen.getByTestId("bar-chart");
    expect(barChart).toHaveAttribute("data-count", "3");

    // Check that both bars are rendered
    expect(screen.getByTestId("bar-count")).toBeInTheDocument();
    expect(screen.getByTestId("bar-avg_duration")).toBeInTheDocument();

    // Check bar names
    expect(screen.getByTestId("bar-count")).toHaveAttribute("data-name", "Jobs Finalizados");
    expect(screen.getByTestId("bar-avg_duration")).toHaveAttribute("data-name", "Tempo Médio (h)");
  });

  it("handles API errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    mockInvoke.mockResolvedValue({ data: null, error: { message: "API Error" } });

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching jobs by component:",
        { message: "API Error" }
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles network errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    mockInvoke.mockRejectedValue(new Error("Network error"));

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch jobs by component:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("renders title correctly", () => {
    mockInvoke.mockResolvedValue({ data: [], error: null });

    render(<DashboardJobs />);

    expect(screen.getByText("📊 Falhas por Componente + Tempo Médio")).toBeInTheDocument();
  });

  it("renders empty chart when no data is available", async () => {
    mockInvoke.mockResolvedValue({ data: [], error: null });

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    const barChart = screen.getByTestId("bar-chart");
    expect(barChart).toHaveAttribute("data-count", "0");
  });
});
