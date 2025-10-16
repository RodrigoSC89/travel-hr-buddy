/**
 * Dashboard Auditorias Tests
 * 
 * Tests for the audit dashboard page that displays audit summary
 * data grouped by vessel with filtering capabilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashboardAuditorias from "@/pages/admin/dashboard-auditorias";

// Mock Recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("DashboardAuditorias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { nome_navio: "Vessel A", total: 15 },
        { nome_navio: "Vessel B", total: 8 },
        { nome_navio: "Vessel C", total: 3 },
      ]),
    });
  });

  describe("Component Rendering", () => {
    it("should render dashboard title", async () => {
      render(<DashboardAuditorias />);
      
      expect(screen.getByText("Dashboard de Auditorias")).toBeInTheDocument();
    });

    it("should render filter inputs", async () => {
      render(<DashboardAuditorias />);
      
      expect(screen.getByLabelText("Início")).toBeInTheDocument();
      expect(screen.getByLabelText("Fim")).toBeInTheDocument();
      expect(screen.getByLabelText("Usuário (ID)")).toBeInTheDocument();
    });

    it("should render filter button", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /filtrar/i });
        expect(filterButton).toBeInTheDocument();
      });
    });

    it("should render chart title", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Auditorias por Navio")).toBeInTheDocument();
      });
    });

    it("should render bar chart components", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch data on component mount", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/resumo?");
      });
    });

    it("should fetch data with start date parameter", async () => {
      render(<DashboardAuditorias />);
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const startInput = screen.getByLabelText("Início");
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("start=2025-01-01")
        );
      });
    });

    it("should fetch data with end date parameter", async () => {
      render(<DashboardAuditorias />);
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const endInput = screen.getByLabelText("Fim");
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("end=2025-12-31")
        );
      });
    });

    it("should fetch data with user_id parameter", async () => {
      render(<DashboardAuditorias />);
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const userIdInput = screen.getByLabelText("Usuário (ID)");
      fireEvent.change(userIdInput, { target: { value: "abc123" } });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("user_id=abc123")
        );
      });
    });

    it("should fetch data with all parameters", async () => {
      render(<DashboardAuditorias />);
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const startInput = screen.getByLabelText("Início");
      const endInput = screen.getByLabelText("Fim");
      const userIdInput = screen.getByLabelText("Usuário (ID)");
      
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });
      fireEvent.change(userIdInput, { target: { value: "abc123" } });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        const lastCall = (global.fetch as any).mock.calls.slice(-1)[0][0];
        expect(lastCall).toContain("start=2025-01-01");
        expect(lastCall).toContain("end=2025-12-31");
        expect(lastCall).toContain("user_id=abc123");
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading text while fetching", async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<DashboardAuditorias />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
      });
    });

    it("should disable button while loading", async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<DashboardAuditorias />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /filtrar/i })).toBeInTheDocument();
      });
      
      const filterButton = screen.getByRole("button", { name: /filtrar/i });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        const button = screen.getByRole("button", { name: /carregando/i });
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Empty State", () => {
    it("should display message when no data available", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
      
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByText("Nenhum dado disponível")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Filter Interactions", () => {
    it("should update start date input value", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByLabelText("Início")).toBeInTheDocument();
      });
      
      const startInput = screen.getByLabelText("Início") as HTMLInputElement;
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      
      expect(startInput.value).toBe("2025-01-01");
    });

    it("should update end date input value", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByLabelText("Fim")).toBeInTheDocument();
      });
      
      const endInput = screen.getByLabelText("Fim") as HTMLInputElement;
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });
      
      expect(endInput.value).toBe("2025-12-31");
    });

    it("should update user ID input value", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByLabelText("Usuário (ID)")).toBeInTheDocument();
      });
      
      const userIdInput = screen.getByLabelText("Usuário (ID)") as HTMLInputElement;
      fireEvent.change(userIdInput, { target: { value: "test-user-123" } });
      
      expect(userIdInput.value).toBe("test-user-123");
    });
  });

  describe("Data Display", () => {
    it("should display data after successful fetch", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.queryByText("Nenhum dado disponível")).not.toBeInTheDocument();
      });
    });

    it("should render chart with fetched data", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design", () => {
    it("should have grid layout for filters", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        expect(screen.getByLabelText("Início")).toBeInTheDocument();
      });
      
      const filterInputs = screen.getByLabelText("Início").parentElement?.parentElement;
      expect(filterInputs?.className).toContain("grid");
    });
  });

  describe("Component Structure", () => {
    it("should have proper card structure", async () => {
      render(<DashboardAuditorias />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll('[class*="card"]');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it("should have spacing between sections", () => {
      render(<DashboardAuditorias />);
      
      const mainDiv = screen.getByText("Dashboard de Auditorias").parentElement;
      expect(mainDiv?.className).toContain("space-y-6");
    });
  });
});
