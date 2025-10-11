import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogs from "@/pages/admin/reports/RestoreReportLogs";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("RestoreReportLogs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    expect(screen.getByText("Logs de Relatórios de Restauração")).toBeInTheDocument();
  });

  it("should render filter controls and export button", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for date inputs
      const dateInputs = screen.getAllByPlaceholderText(/Data/);
      expect(dateInputs.length).toBe(2);
      
      // Check for export button
      expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando registros...")).toBeInTheDocument();
  });

  it("should display empty state when no logs are found", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum log de execução encontrado")).toBeInTheDocument();
    });
  });

  it("should disable export button when no logs are available", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      const exportButton = screen.getByText("Exportar CSV").closest("button");
      expect(exportButton).toBeDisabled();
    });
  });

  it("should render status filter dropdown", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check that the status filter SelectTrigger exists by looking for its role
      const selectTriggers = screen.getAllByRole("combobox");
      expect(selectTriggers.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should render date range filters", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      const dateInputs = screen.getAllByPlaceholderText(/Data/);
      expect(dateInputs[0]).toHaveAttribute("type", "date");
      expect(dateInputs[1]).toHaveAttribute("type", "date");
    });
  });
});
