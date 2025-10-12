import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RestoreChartEmbed from "@/pages/embed/RestoreChartEmbed";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      Chart Mock
    </div>
  ),
}));

describe("RestoreChartEmbed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).chartReady;
  });

  it("should render loading state initially", () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should fetch and display data", async () => {
    const mockData = [
      { executed_at: "2025-10-10T10:00:00Z", status: "success" },
      { executed_at: "2025-10-11T10:00:00Z", status: "success" },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("should set chartReady flag when data is loaded", async () => {
    const mockData = [
      { executed_at: "2025-10-10T10:00:00Z", status: "success" },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect((window as any).chartReady).toBe(true);
    });
  });

  it("should handle empty data gracefully", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("should handle null data", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Test error" },
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("should have correct styling", async () => {
    const mockData = [
      { executed_at: "2025-10-10T10:00:00Z", status: "success" },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    const { container } = render(<RestoreChartEmbed />);

    await waitFor(() => {
      const chartContainer = container.querySelector("div > div");
      expect(chartContainer).toHaveAttribute("style");
      const style = chartContainer?.getAttribute("style") || "";
      expect(style).toContain("background-color: white");
    });
  });

  it("should format dates correctly", async () => {
    const mockData = [
      { executed_at: "2025-10-10T10:00:00Z", status: "success" },
      { executed_at: "2025-10-11T10:00:00Z", status: "success" },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockImplementation(mockFrom);

    render(<RestoreChartEmbed />);

    await waitFor(() => {
      const chart = screen.getByTestId("bar-chart");
      const chartData = JSON.parse(chart.getAttribute("data-chart-data") || "{}");
      expect(chartData.labels).toBeDefined();
      expect(Array.isArray(chartData.labels)).toBe(true);
    });
  });
});
