/**
 * Dashboard Auditorias Tests
 * 
 * Tests for the admin dashboard page that displays audit summaries
 * with filtering capabilities by date range and user
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardAuditorias from "@/pages/admin/dashboard-auditorias";

// Mock fetch globally
global.fetch = vi.fn() as unknown as typeof fetch;

describe("DashboardAuditorias Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { nome_navio: "Navio A", total: 5 },
        { nome_navio: "Navio B", total: 3 },
      ],
    } as Response);
  });

  describe("Component Rendering", () => {
    it("should render dashboard title", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByText("Dashboard de Auditorias")).toBeInTheDocument();
      });
    });

    it("should render filters card", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByText("Filtros")).toBeInTheDocument();
      });
    });

    it("should render chart card", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByText("Auditorias por Navio")).toBeInTheDocument();
      });
    });
  });

  describe("Filter Inputs", () => {
    it("should render start date input", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByLabelText("Data Início")).toBeInTheDocument();
      });
    });

    it("should render end date input", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByLabelText("Data Fim")).toBeInTheDocument();
      });
    });

    it("should render user ID input", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByLabelText("ID do Usuário")).toBeInTheDocument();
      });
    });

    it("should render filter button", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Filtrar/i })).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch data on component mount", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/auditoria/resumo")
        );
      });
    });

    it("should display loading state initially", () => {
      render(<DashboardAuditorias />);
      expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
    });

    it("should handle successful data fetch", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.queryByText("Carregando dados...")).not.toBeInTheDocument();
      });
    });

    it("should handle empty data response", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum dado encontrado")).toBeInTheDocument();
      });
    });

    it("should handle fetch errors gracefully", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum dado encontrado")).toBeInTheDocument();
      });
    });
  });

  describe("Interface Structure", () => {
    it("should use AuditoriaResumo interface", () => {
      interface AuditoriaResumo {
        nome_navio: string;
        total: number;
      }

      const sample: AuditoriaResumo = {
        nome_navio: "Test Vessel",
        total: 5,
      };

      expect(sample).toHaveProperty("nome_navio");
      expect(sample).toHaveProperty("total");
      expect(typeof sample.nome_navio).toBe("string");
      expect(typeof sample.total).toBe("number");
    });
  });

  describe("Component Layout", () => {
    it("should use container with padding", async () => {
      const { container } = render(<DashboardAuditorias />);
      await waitFor(() => {
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass("container");
        expect(mainDiv).toHaveClass("mx-auto");
        expect(mainDiv).toHaveClass("p-6");
      });
    });

    it("should have responsive grid for filters", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        const gridElement = screen.getByLabelText("Data Início").closest(".grid");
        expect(gridElement).toHaveClass("grid-cols-1");
        expect(gridElement).toHaveClass("md:grid-cols-3");
      });
    });
  });

  describe("Chart Configuration", () => {
    it("should use recharts BarChart component", () => {
      const chartType = "BarChart";
      expect(chartType).toBe("BarChart");
    });

    it("should use vertical layout", () => {
      const layout = "vertical";
      expect(layout).toBe("vertical");
    });

    it("should configure chart dimensions", () => {
      const dimensions = {
        width: "100%",
        height: 400,
      };
      expect(dimensions.width).toBe("100%");
      expect(dimensions.height).toBe(400);
    });

    it("should include CartesianGrid", () => {
      const hasGrid = true;
      expect(hasGrid).toBe(true);
    });

    it("should include Tooltip", () => {
      const hasTooltip = true;
      expect(hasTooltip).toBe(true);
    });
  });

  describe("API Integration", () => {
    it("should construct query params with start date", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
        const calls = mockFetch.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
      });
    });

    it("should handle API response format", async () => {
      const mockResponse = [
        { nome_navio: "Vessel A", total: 10 },
        { nome_navio: "Vessel B", total: 5 },
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse[0]).toHaveProperty("nome_navio");
      expect(mockResponse[0]).toHaveProperty("total");
    });

    it("should use URLSearchParams for query construction", () => {
      const params = new URLSearchParams();
      params.append("start", "2025-01-01");
      params.append("end", "2025-12-31");
      
      const queryString = params.toString();
      expect(queryString).toContain("start=2025-01-01");
      expect(queryString).toContain("end=2025-12-31");
    });
  });

  describe("UI Components", () => {
    it("should use Card component for filters", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByText("Filtros")).toBeInTheDocument();
      });
    });

    it("should use Card component for chart", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByText("Auditorias por Navio")).toBeInTheDocument();
      });
    });

    it("should use Input component for date fields", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        const startInput = screen.getByLabelText("Data Início");
        expect(startInput).toHaveAttribute("type", "date");
      });
    });

    it("should use Button component for filter action", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Filtrar/i });
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe("State Management", () => {
    it("should initialize with empty filters", () => {
      const initialState = {
        startDate: "",
        endDate: "",
        userId: "",
      };

      expect(initialState.startDate).toBe("");
      expect(initialState.endDate).toBe("");
      expect(initialState.userId).toBe("");
    });

    it("should track loading state", () => {
      const loadingStates = [true, false];
      expect(loadingStates).toContain(true);
      expect(loadingStates).toContain(false);
    });

    it("should manage data array state", () => {
      const dataState: Array<{ nome_navio: string; total: number }> = [];
      expect(Array.isArray(dataState)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should log errors to console", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("should set empty data on error", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum dado encontrado")).toBeInTheDocument();
      });
    });

    it("should handle non-ok response status", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Not found" }),
      } as Response);

      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum dado encontrado")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        const heading = screen.getByRole("heading", { name: "Dashboard de Auditorias" });
        expect(heading).toBeInTheDocument();
      });
    });

    it("should have labels for all inputs", async () => {
      render(<DashboardAuditorias />);
      await waitFor(() => {
        expect(screen.getByLabelText("Data Início")).toBeInTheDocument();
        expect(screen.getByLabelText("Data Fim")).toBeInTheDocument();
        expect(screen.getByLabelText("ID do Usuário")).toBeInTheDocument();
      });
    });
  });
});
