import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RestoreChartEmbed from "@/pages/embed/RestoreChartEmbed";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock Chart.js to avoid canvas rendering issues in tests
vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-labels">{JSON.stringify(data.labels)}</div>
      <div data-testid="chart-data">{JSON.stringify(data.datasets[0].data)}</div>
    </div>
  ),
}));

// Import supabase after mocking
import { supabase } from "@/integrations/supabase/client";

describe("RestoreChartEmbed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).chartReady;
  });

  it("should render loading state initially", () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<RestoreChartEmbed />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should fetch and display chart data", async () => {
    const mockData = [
      { day: "2024-01-15", count: 5 },
      { day: "2024-01-16", count: 8 },
      { day: "2024-01-17", count: 3 },
    ];

    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockData, error: null });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    // Verify RPC was called correctly
    expect(supabase.rpc).toHaveBeenCalledWith("get_restore_count_by_day_with_email", {
      email_input: "",
    });
  });

  it("should format dates correctly in chart labels", async () => {
    const mockData = [
      { day: "2024-01-15", count: 5 },
      { day: "2024-02-20", count: 8 },
    ];

    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockData, error: null });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      const labels = screen.getByTestId("chart-labels");
      expect(labels.textContent).toContain("15/01");
      expect(labels.textContent).toContain("20/02");
    });
  });

  it("should set chartReady flag when data is loaded", async () => {
    const mockData = [{ day: "2024-01-15", count: 5 }];

    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockData, error: null });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect((window as any).chartReady).toBe(true);
    });
  });

  it("should handle empty data gracefully", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    const chartData = screen.getByTestId("chart-data");
    expect(chartData.textContent).toBe("[]");
  });

  it("should handle null data gracefully", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    const chartData = screen.getByTestId("chart-data");
    expect(chartData.textContent).toBe("[]");
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading chart data:",
        expect.objectContaining({ message: "Database error" })
      );
    });

    consoleSpy.mockRestore();
  });

  it("should render with correct styling", async () => {
    const mockData = [{ day: "2024-01-15", count: 5 }];

    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockData, error: null });

    const { container } = render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    const chartContainer = container.querySelector("div");
    expect(chartContainer).toHaveStyle({
      width: "600px",
      height: "300px",
    });
  });
});
