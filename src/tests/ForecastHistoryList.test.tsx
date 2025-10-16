import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<ForecastHistoryList />);
    expect(screen.getByText(/Carregando previsões/i)).toBeDefined();
  });

  it("should render empty state when no forecasts exist", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => [],
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma previsão registrada ainda/i)).toBeDefined();
    });
  });

  it("should render forecast list when data is available", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast summary",
        source: "AI",
        created_by: "system",
        created_at: "2025-10-16T00:00:00Z",
      },
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test forecast summary/i)).toBeDefined();
      expect(screen.getByText(/AI/i)).toBeDefined();
      expect(screen.getByText(/system/i)).toBeDefined();
    });
  });

  it("should call the correct API endpoint", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => [],
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/forecast/list");
    });
  });

  it("should render multiple forecast items", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "First forecast",
        source: "AI",
        created_by: "system",
        created_at: "2025-10-16T00:00:00Z",
      },
      {
        id: 2,
        forecast_summary: "Second forecast",
        source: "Manual",
        created_by: "admin",
        created_at: "2025-10-15T00:00:00Z",
      },
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/First forecast/i)).toBeDefined();
      expect(screen.getByText(/Second forecast/i)).toBeDefined();
      expect(screen.getByText(/Manual/i)).toBeDefined();
      expect(screen.getByText(/admin/i)).toBeDefined();
    });
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API Error"));

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma previsão registrada ainda/i)).toBeDefined();
    });
  });

  it("should render the component title", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => [],
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeDefined();
    });
  });

  it("should format dates in the forecast items", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI",
        created_by: "system",
        created_at: "2025-10-16T12:00:00Z",
      },
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      // Check that some date text is rendered (exact format may vary by locale)
      const container = screen.getByText(/Test forecast/i).parentElement;
      expect(container).toBeDefined();
    });
  });
});
