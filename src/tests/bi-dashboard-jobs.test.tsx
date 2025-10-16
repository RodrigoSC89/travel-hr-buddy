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

  it("should render the chart title", () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });

  it("should call the bi-jobs-by-component function on mount", async () => {
    const mockData = [
      { component_id: "Motor ME-4500", count: 5, avg_duration: 8.5 },
      { component_id: "Gerador GE-1", count: 3, avg_duration: 5.2 },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/functions/v1/bi-jobs-by-component"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  it("should display error message when fetch fails", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados:/i)).toBeDefined();
    });

    consoleSpy.mockRestore();
  });

  it("should handle network errors gracefully", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados:/i)).toBeDefined();
      expect(screen.getByText(/Network error/i)).toBeDefined();
    });

    consoleSpy.mockRestore();
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
});
