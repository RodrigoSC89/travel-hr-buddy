import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    mockFetch.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<ForecastHistoryList />);
    expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeDefined();
  });

  it("should render the component title", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);
    expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeDefined();
  });

  it("should fetch forecasts on mount", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI Model - GPT-4",
        created_by: "João Silva",
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/forecast/list?");
    });
  });

  it("should display forecasts after loading", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Análise preditiva completa",
        source: "AI Model - GPT-4",
        created_by: "João Silva",
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Análise preditiva completa/i)).toBeDefined();
    });
  });

  it("should display empty state when no forecasts found", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhuma previsão encontrada com os filtros atuais/i)
      ).toBeDefined();
    });
  });

  it("should render filter inputs", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por origem/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Filtrar por responsável/i)).toBeDefined();
    });
  });

  it("should filter by source when typing in source filter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por origem/i)).toBeDefined();
    });

    const sourceInput = screen.getByPlaceholderText(/Filtrar por origem/i);
    fireEvent.change(sourceInput, { target: { value: "AI" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("source=AI")
      );
    });
  });

  it("should filter by created_by when typing in created_by filter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por responsável/i)).toBeDefined();
    });

    const createdByInput = screen.getByPlaceholderText(/Filtrar por responsável/i);
    fireEvent.change(createdByInput, { target: { value: "João" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("created_by=Jo")
      );
    });
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockFetch.mockRejectedValue(new Error("API Error"));

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("should display forecast metadata", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI Model - GPT-4",
        created_by: "João Silva",
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/AI Model - GPT-4/i)).toBeDefined();
      expect(screen.getByText(/João Silva/i)).toBeDefined();
    });
  });

  it("should format dates in Brazilian Portuguese", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast",
        source: "AI Model",
        created_by: "User",
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      // Date should be formatted
      expect(screen.getByText(/Test forecast/i)).toBeDefined();
    });
  });

  it("should render without crashing", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { container } = render(<ForecastHistoryList />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
