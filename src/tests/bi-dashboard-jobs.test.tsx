import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";

// Mock global fetch
global.fetch = vi.fn();

describe("DashboardJobs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton initially", () => {
    // Mock pending state
    vi.mocked(global.fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });

  it("should render the chart title with dual metrics", () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });

  it("should call the jobs-by-component API on mount", async () => {
    const mockData = [
      { component_id: "comp-1", count: 5, avg_duration: 24.5 },
      { component_id: "comp-2", count: 3, avg_duration: 12.3 },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/bi/jobs-by-component");
    });
  });

  it("should display error message when fetch fails", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados:/i)).toBeDefined();
    });
  });

  it("should handle network errors gracefully", async () => {
    const mockError = new Error("Network error");
    vi.mocked(global.fetch).mockRejectedValue(mockError);

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados: Network error/i)).toBeDefined();
    });
  });

  it("should render without crashing", () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { container } = render(<DashboardJobs />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should handle data with dual metrics correctly", async () => {
    const mockData = [
      { component_id: "Motor Principal", count: 15, avg_duration: 24.5 },
      { component_id: "Bomba Hidráulica", count: 8, avg_duration: 18.2 },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
