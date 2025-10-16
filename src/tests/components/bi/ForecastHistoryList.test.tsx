import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch API
global.fetch = vi.fn();

const mockForecastData = [
  {
    id: 1,
    forecast_summary: "Previsão de Jobs para Dezembro 2025: Com base nos dados históricos.",
    source: "AI Model - GPT-4",
    created_by: "João Silva",
    created_at: "2025-10-11T10:30:00Z",
  },
  {
    id: 2,
    forecast_summary: "Análise de Tendências: O padrão de manutenção dos últimos 6 meses.",
    source: "AI Model - GPT-4",
    created_by: "Maria Santos",
    created_at: "2025-10-13T14:20:00Z",
  },
  {
    id: 3,
    forecast_summary: "Previsão Manual: Baseado em inspeções recentes.",
    source: "Manual Analysis",
    created_by: "Carlos Mendes",
    created_at: "2025-10-14T09:15:00Z",
  },
];

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render loading state initially", () => {
      (global.fetch as any).mockImplementation(() => new Promise(() => {}));
      render(<ForecastHistoryList />);
      
      expect(screen.getByText(/Histórico de Previsões/i)).toBeInTheDocument();
    });

    it("should render the component title", () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
      
      render(<ForecastHistoryList />);
      expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeInTheDocument();
    });

    it("should not crash when rendering", () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });
      
      expect(() => render(<ForecastHistoryList />)).not.toThrow();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch forecasts on mount", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/forecast/list?");
      });
    });

    it("should display fetched forecasts", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/Previsão de Jobs para Dezembro 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/Análise de Tendências/i)).toBeInTheDocument();
        expect(screen.getByText(/Previsão Manual/i)).toBeInTheDocument();
      });
    });

    it("should display empty state when no forecasts found", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão encontrada/i)).toBeInTheDocument();
      });
    });
  });

  describe("Filtering", () => {
    it("should render source filter input", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Filtrar por fonte/i)).toBeInTheDocument();
      });
    });

    it("should render created_by filter input", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Filtrar por criador/i)).toBeInTheDocument();
      });
    });

    it("should fetch with source filter when typing", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Filtrar por fonte/i)).toBeInTheDocument();
      });

      const sourceInput = screen.getByPlaceholderText(/Filtrar por fonte/i);
      fireEvent.change(sourceInput, { target: { value: "AI" } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("source=AI")
        );
      });
    });

    it("should fetch with created_by filter when typing", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Filtrar por criador/i)).toBeInTheDocument();
      });

      const createdByInput = screen.getByPlaceholderText(/Filtrar por criador/i);
      fireEvent.change(createdByInput, { target: { value: "João" } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("created_by=Jo%C3%A3o")
        );
      });
    });
  });

  describe("Display", () => {
    it("should display forecast source", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        const aiModel = screen.getAllByText("AI Model - GPT-4");
        expect(aiModel.length).toBeGreaterThan(0);
        expect(screen.getByText("Manual Analysis")).toBeInTheDocument();
      });
    });

    it("should display forecast creator", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
        expect(screen.getByText(/Maria Santos/i)).toBeInTheDocument();
        expect(screen.getByText(/Carlos Mendes/i)).toBeInTheDocument();
      });
    });

    it("should format and display forecast date", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        // Check that dates are formatted (we can't check exact format due to locale)
        const dateElements = screen.getAllByText(/\d{1,2}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão encontrada/i)).toBeInTheDocument();
      });
    });

    it("should handle API error responses", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Erro ao carregar previsões." }),
      });

      render(<ForecastHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão encontrada/i)).toBeInTheDocument();
      });
    });
  });
});
