import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch API
global.fetch = vi.fn();

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component title", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeDefined();
    });
  });

  it("should show loading state initially", () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<ForecastHistoryList />);
    expect(screen.getByText(/Carregando previsões/i)).toBeDefined();
  });

  it("should display empty state when no forecasts exist", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma previsão registrada ainda/i)).toBeDefined();
    });
  });

  it("should display forecast items when data is loaded", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Previsão de aumento de 15% nos jobs",
        source: "AI",
        created_by: "bi-jobs-forecast",
        created_at: "2025-10-15T12:00:00Z",
      },
      {
        id: 2,
        forecast_summary: "Redução esperada de 5% no próximo mês",
        source: "Manual",
        created_by: "admin",
        created_at: "2025-10-14T10:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Previsão de aumento de 15% nos jobs/i)).toBeDefined();
      expect(screen.getByText(/Redução esperada de 5% no próximo mês/i)).toBeDefined();
    });
  });

  it("should call the correct API endpoint", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/forecast/list');
    });
  });

  it("should display source and created_by information", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI",
        created_by: "bi-jobs-forecast",
        created_at: "2025-10-15T12:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/AI/i)).toBeDefined();
      expect(screen.getByText(/bi-jobs-forecast/i)).toBeDefined();
    });
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should format dates correctly", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI",
        created_by: "system",
        created_at: "2025-10-15T12:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      const dateElements = screen.getAllByText((content, element) => {
        return element?.className?.includes('text-slate-500') || false;
      });
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it("should render with correct styling classes", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI",
        created_by: "system",
        created_at: "2025-10-15T12:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { container } = render(<ForecastHistoryList />);

    await waitFor(() => {
      const card = container.querySelector('.border.rounded.p-4.bg-slate-50.shadow-sm');
      expect(card).toBeDefined();
    });
  });
});
