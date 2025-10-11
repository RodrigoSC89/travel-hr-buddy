import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreDashboardPage from "@/pages/admin/documents/restore-dashboard";

// Mock Chart.js to avoid canvas issues in tests
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Mocked Bar Chart</div>,
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";
const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;

describe("RestoreDashboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    mockRpc.mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { day: "2025-10-11", count: 5 },
            { day: "2025-10-10", count: 3 },
            { day: "2025-10-09", count: 8 },
          ],
          error: null,
        });
      } else if (functionName === "get_restore_summary") {
        return Promise.resolve({
          data: [
            {
              total: 16,
              unique_docs: 12,
              avg_per_day: 5.33,
            },
          ],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    });
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/📊 Painel de Métricas de Restauração/i)).toBeInTheDocument();
  });

  it("should render email filter input", () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText(/Filtrar por e-mail do restaurador/i)).toBeInTheDocument();
  });

  it("should render the bar chart", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("should render summary statistics section", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/📈 Resumo/i)).toBeInTheDocument();
    });
  });

  it("should display total restorations in summary", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Total de Restaurações:/i)).toBeInTheDocument();
      expect(screen.getByText(/16/)).toBeInTheDocument();
    });
  });

  it("should display unique documents in summary", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Documentos únicos:/i)).toBeInTheDocument();
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });
  });

  it("should display average per day in summary", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Média diária:/i)).toBeInTheDocument();
      expect(screen.getByText(/5.33/)).toBeInTheDocument();
    });
  });

  it("should call RPC functions on mount", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_restore_count_by_day_with_email", {
        email_input: "",
      });
      expect(mockRpc).toHaveBeenCalledWith("get_restore_summary", {
        email_input: "",
      });
    });
  });

  it("should filter data when email input changes", async () => {
    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/Filtrar por e-mail do restaurador/i);
    
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_restore_count_by_day_with_email", {
        email_input: "user@example.com",
      });
      expect(mockRpc).toHaveBeenCalledWith("get_restore_summary", {
        email_input: "user@example.com",
      });
    });
  });

  it("should handle empty data from RPC functions", async () => {
    mockRpc.mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({ data: [], error: null });
      } else if (functionName === "get_restore_summary") {
        return Promise.resolve({ data: [], error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });

    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Total de Restaurações:/i)).toBeInTheDocument();
      const allZeros = screen.getAllByText(/0/);
      expect(allZeros.length).toBeGreaterThan(0);
    });
  });

  it("should handle null data from RPC functions", async () => {
    mockRpc.mockImplementation(() => {
      return Promise.resolve({ data: null, error: null });
    });

    render(
      <MemoryRouter>
        <RestoreDashboardPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Total de Restaurações:/i)).toBeInTheDocument();
      const allZeros = screen.getAllByText(/0/);
      expect(allZeros.length).toBeGreaterThan(0);
    });
  });
});
