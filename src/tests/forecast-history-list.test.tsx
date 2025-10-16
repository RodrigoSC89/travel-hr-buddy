/**
 * ForecastHistoryList Component Tests
 * 
 * Tests for the ForecastHistoryList component that displays historical forecast data with filters
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch globally
global.fetch = vi.fn();

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => [],
    });
  });

  describe("Rendering", () => {
    it("should render the component header", () => {
      render(<ForecastHistoryList />);
      expect(screen.getByText(/📊 Histórico de Previsões/i)).toBeDefined();
    });

    it("should render all three filter inputs", () => {
      render(<ForecastHistoryList />);
      expect(screen.getByPlaceholderText(/Filtrar por origem/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Filtrar por responsável/i)).toBeDefined();
      const dateInputs = screen.getAllByDisplayValue("");
      expect(dateInputs.length).toBeGreaterThan(0);
    });

    it("should display loading state initially", () => {
      render(<ForecastHistoryList />);
      expect(screen.getByText(/Carregando previsões/i)).toBeDefined();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch data on component mount", async () => {
      render(<ForecastHistoryList />);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/forecast/list"));
      });
    });

    it("should display empty state when no data is returned", async () => {
      (global.fetch as any).mockResolvedValue({
        json: async () => [],
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão encontrada/i)).toBeDefined();
      });
    });

    it("should display forecast items when data is returned", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast summary",
          source: "test-source",
          created_by: "Test User",
          created_at: "2025-10-15T10:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValue({
        json: async () => mockData,
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test forecast summary/i)).toBeDefined();
      });
    });
  });

  describe("Filter Functionality", () => {
    it("should have source filter input", () => {
      render(<ForecastHistoryList />);
      const sourceInput = screen.getByPlaceholderText(/Filtrar por origem/i);
      expect(sourceInput).toBeDefined();
      expect(sourceInput.getAttribute("type")).toBe("text");
    });

    it("should have created_by filter input", () => {
      render(<ForecastHistoryList />);
      const createdByInput = screen.getByPlaceholderText(/Filtrar por responsável/i);
      expect(createdByInput).toBeDefined();
      expect(createdByInput.getAttribute("type")).toBe("text");
    });

    it("should have date filter input", () => {
      render(<ForecastHistoryList />);
      const inputs = document.querySelectorAll('input[type="date"]');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("Data Display", () => {
    it("should display forecast source", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "jobs-trend",
          created_by: "AI",
          created_at: "2025-10-15T10:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValue({
        json: async () => mockData,
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/jobs-trend/i)).toBeDefined();
      });
    });

    it("should display created_by information", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "test",
          created_by: "AI Assistant",
          created_at: "2025-10-15T10:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValue({
        json: async () => mockData,
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Assistant/i)).toBeDefined();
      });
    });

    it("should display forecast summary", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Análise preditiva de tendências",
          source: "test",
          created_by: "AI",
          created_at: "2025-10-15T10:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValue({
        json: async () => mockData,
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Análise preditiva de tendências/i)).toBeDefined();
      });
    });
  });

  describe("UI Elements", () => {
    it("should apply proper styling classes to cards", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test",
          source: "test",
          created_by: "AI",
          created_at: "2025-10-15T10:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValue({
        json: async () => mockData,
      });

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll(".border.rounded");
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it("should render filter inputs in a flex container", () => {
      render(<ForecastHistoryList />);
      const flexContainer = document.querySelector(".flex.gap-4");
      expect(flexContainer).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão encontrada/i)).toBeDefined();
      });
    });

    it("should reset items to empty array on error", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll(".border.rounded.p-4");
        expect(cards.length).toBe(0);
      });
    });
  });
});
