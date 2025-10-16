import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch
global.fetch = vi.fn();

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<ForecastHistoryList />);
    expect(screen.getByText("Carregando previsões...")).toBeInTheDocument();
  });

  it("should render forecast items when data is fetched", async () => {
    const mockData = [
      {
        id: 1,
        forecast_summary: "Test forecast summary",
        source: "AI Model",
        created_by: "John Doe",
        created_at: "2025-10-16T00:00:00Z"
      }
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => mockData,
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText("Test forecast summary")).toBeInTheDocument();
    });

    expect(screen.getByText(/AI Model/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("should show empty state when no items are found", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    await waitFor(() => {
      expect(screen.getByText("Nenhuma previsão encontrada com os filtros atuais.")).toBeInTheDocument();
    });
  });

  it("should apply filters when typing", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => [],
    });

    render(<ForecastHistoryList />);

    const sourceInput = screen.getByPlaceholderText("Filtrar por origem (source)");
    const createdByInput = screen.getByPlaceholderText("Filtrar por responsável (created_by)");

    fireEvent.change(sourceInput, { target: { value: "AI" } });
    fireEvent.change(createdByInput, { target: { value: "John" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("source=AI")
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("created_by=John")
      );
    });
  });

  it("should render title correctly", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<ForecastHistoryList />);
    expect(screen.getByText("📊 Histórico de Previsões")).toBeInTheDocument();
  });
});
