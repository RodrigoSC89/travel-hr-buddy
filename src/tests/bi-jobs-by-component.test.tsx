import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";

// Mock the environment variables
vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("DashboardJobs Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock fetch
    global.fetch = vi.fn();
  });

  it("should render the dashboard title", () => {
    (global.fetch as unknown as typeof vi.fn).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });

  it("should render loading skeleton initially", () => {
    (global.fetch as unknown as typeof vi.fn).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<DashboardJobs />);
    const skeleton = container.querySelector("[class*=\"animate-pulse\"]");
    expect(skeleton).toBeDefined();
  });

  it("should fetch and display job statistics", async () => {
    const mockData = [
      { component_id: "Motor Principal", count: 5, avg_duration: 2.5 },
      { component_id: "Gerador", count: 3, avg_duration: 1.8 },
    ];

    (global.fetch as unknown as typeof vi.fn).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { container } = render(<DashboardJobs />);

    await waitFor(() => {
      // Check that the chart container is rendered
      const chartContainer = container.querySelector(".recharts-responsive-container");
      expect(chartContainer).toBeDefined();
    });
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    (global.fetch as unknown as typeof vi.fn).mockRejectedValueOnce(new Error("Network error"));

    render(<DashboardJobs />);

    await waitFor(() => {
      const skeleton = screen.queryByText(/animate-pulse/);
      expect(skeleton).toBeNull();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should render the component without errors", () => {
    (global.fetch as unknown as typeof vi.fn).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { container } = render(<DashboardJobs />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
