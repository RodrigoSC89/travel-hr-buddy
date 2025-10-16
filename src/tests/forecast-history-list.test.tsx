/**
 * ForecastHistoryList Component Tests
 * 
 * Tests for the ForecastHistoryList component that displays AI forecast history
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Mock fetch globally
global.fetch = vi.fn();

describe("ForecastHistoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render loading state initially", () => {
      (global.fetch as typeof fetch) = vi.fn(() => 
        new Promise(() => {}) // Never resolves to keep loading state
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      expect(screen.getByText("Carregando previsões...")).toBeInTheDocument();
    });

    it("should render the component title", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("📊 Histórico de Previsões")).toBeInTheDocument();
      });
    });

    it("should render empty state when no forecasts exist", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhuma previsão registrada ainda.")).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch forecast data from API", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/forecast/list");
      });
    });

    it("should display forecast items when data is returned", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Previsão de aumento de 15% nos jobs para o próximo mês...",
          source: "AI",
          created_by: "bi-jobs-forecast",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Previsão de aumento de 15%/)).toBeInTheDocument();
      });
    });

    it("should handle multiple forecast items", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Primeira previsão",
          source: "AI",
          created_by: "bi-jobs-forecast",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          forecast_summary: "Segunda previsão",
          source: "AI",
          created_by: "bi-jobs-forecast",
          created_at: "2024-01-14T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("Primeira previsão")).toBeInTheDocument();
        expect(screen.getByText("Segunda previsão")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it("should show empty state after error", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhuma previsão registrada ainda.")).toBeInTheDocument();
      });
    });
  });

  describe("Forecast Item Display", () => {
    it("should display forecast metadata correctly", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "AI",
          created_by: "bi-jobs-forecast",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI por bi-jobs-forecast/)).toBeInTheDocument();
      });
    });

    it("should format timestamps as locale string", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "AI",
          created_by: "system",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const date = new Date("2024-01-15T10:30:00Z");
        const expectedText = date.toLocaleString();
        expect(screen.getByText(new RegExp(expectedText.split(",")[0]))).toBeInTheDocument();
      });
    });

    it("should display source information", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "Manual",
          created_by: "admin",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText(/Manual por admin/)).toBeInTheDocument();
      });
    });
  });

  describe("Component Structure", () => {
    it("should render within a Card component", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      const { container } = render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(container.querySelector(".bg-card")).toBeInTheDocument();
      });
    });

    it("should use proper spacing for forecast items", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "First",
          source: "AI",
          created_by: "system",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          forecast_summary: "Second",
          source: "AI",
          created_by: "system",
          created_at: "2024-01-14T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      const { container } = render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const spaceContainer = container.querySelector(".space-y-3");
        expect(spaceContainer).toBeInTheDocument();
      });
    });
  });

  describe("Integration Tests", () => {
    it("should be ready for integration with MmiBI page", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      const { container } = render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it("should handle rapid re-renders", async () => {
      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        } as Response)
      ) as typeof fetch;

      const { rerender } = render(<ForecastHistoryList />);
      
      rerender(<ForecastHistoryList />);
      rerender(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("📊 Histórico de Previsões")).toBeInTheDocument();
      });
    });
  });

  describe("Data Validation", () => {
    it("should handle forecast items with all required fields", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Complete forecast data",
          source: "AI",
          created_by: "bi-jobs-forecast",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      render(<ForecastHistoryList />);
      
      await waitFor(() => {
        expect(screen.getByText("Complete forecast data")).toBeInTheDocument();
      });
    });

    it("should validate forecast item structure", () => {
      const validItem = {
        id: 1,
        forecast_summary: "Test",
        source: "AI",
        created_by: "system",
        created_at: "2024-01-15T10:30:00Z",
      };

      expect(validItem).toHaveProperty("id");
      expect(validItem).toHaveProperty("forecast_summary");
      expect(validItem).toHaveProperty("source");
      expect(validItem).toHaveProperty("created_by");
      expect(validItem).toHaveProperty("created_at");
      expect(typeof validItem.id).toBe("number");
      expect(typeof validItem.forecast_summary).toBe("string");
    });
  });

  describe("UI/UX Tests", () => {
    it("should apply hover styles to forecast items", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "AI",
          created_by: "system",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      const { container } = render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const forecastItem = container.querySelector(".hover\\:bg-accent");
        expect(forecastItem).toBeInTheDocument();
      });
    });

    it("should use appropriate text sizing", async () => {
      const mockData = [
        {
          id: 1,
          forecast_summary: "Test forecast",
          source: "AI",
          created_by: "system",
          created_at: "2024-01-15T10:30:00Z",
        },
      ];

      (global.fetch as typeof fetch) = vi.fn(() =>
        Promise.resolve({
          json: async () => mockData,
        } as Response)
      ) as typeof fetch;

      const { container } = render(<ForecastHistoryList />);
      
      await waitFor(() => {
        const textElement = container.querySelector(".text-sm");
        expect(textElement).toBeInTheDocument();
      });
    });
  });
});
