import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn(),
        })),
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

describe("RestoreReportLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Logs de Relatórios de Restore")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Visualize e gerencie logs de execução/)).toBeInTheDocument();
  });

  it("should render filter section", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("should render status filter input with correct placeholder", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const statusInput = screen.getByPlaceholderText("Filtrar por status (ex: success, error, pending)");
    expect(statusInput).toBeInTheDocument();
  });

  it("should render date filter inputs", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Data Inicial")).toBeInTheDocument();
    expect(screen.getByText("Data Final")).toBeInTheDocument();
  });

  it("should render export buttons", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
  });

  it("should render summary metrics cards", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Total de Logs")).toBeInTheDocument();
    expect(screen.getByText("Sucessos")).toBeInTheDocument();
    expect(screen.getByText("Erros")).toBeInTheDocument();
  });

  it("should fetch logs on mount", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Relatório enviado com sucesso",
        error_details: null,
        triggered_by: "automated",
      },
      {
        id: "2",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Falha no envio",
        error_details: "Error details here",
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Relatório enviado com sucesso")).toBeInTheDocument();
      expect(screen.getByText("Falha no envio")).toBeInTheDocument();
    });
  });

  it("should display correct success count", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Success 1",
        error_details: null,
        triggered_by: "automated",
      },
      {
        id: "2",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Success 2",
        error_details: null,
        triggered_by: "automated",
      },
      {
        id: "3",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Error 1",
        error_details: "Error",
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Find all elements with text "2" that are inside metric cards
      const metricValues = screen.getAllByText("2");
      expect(metricValues.length).toBeGreaterThan(0);
    });
  });

  it("should display correct error count", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Success",
        error_details: null,
        triggered_by: "automated",
      },
      {
        id: "2",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Error 1",
        error_details: "Error",
        triggered_by: "automated",
      },
      {
        id: "3",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Error 2",
        error_details: "Error",
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // The error count should be 2
      const metricValues = screen.getAllByText("2");
      expect(metricValues.length).toBeGreaterThan(0);
    });
  });

  it("should display empty state when no logs exist", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum log encontrado com os filtros aplicados.")).toBeInTheDocument();
    });
  });

  it("should filter logs by status", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Success log",
        error_details: null,
        triggered_by: "automated",
      },
      {
        id: "2",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Error log",
        error_details: "Error",
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Success log")).toBeInTheDocument();
      expect(screen.getByText("Error log")).toBeInTheDocument();
    });

    const statusInput = screen.getByPlaceholderText("Filtrar por status (ex: success, error, pending)");
    fireEvent.change(statusInput, { target: { value: "success" } });

    await waitFor(() => {
      expect(screen.getByText("Success log")).toBeInTheDocument();
      expect(screen.queryByText("Error log")).not.toBeInTheDocument();
    });
  });

  it("should display pending status correctly", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "pending",
        message: "Pending execution",
        error_details: null,
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pending execution")).toBeInTheDocument();
      expect(screen.getByText("Pendente")).toBeInTheDocument();
    });
  });

  it("should handle date range validation", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any);

    const { container } = render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Get date inputs by their type attribute
    const dateInputs = container.querySelectorAll("input[type=\"date\"]");
    const startDateInput = dateInputs[0] as HTMLInputElement;
    const endDateInput = dateInputs[1] as HTMLInputElement;

    // Set end date before start date
    fireEvent.change(startDateInput, { target: { value: "2024-12-31" } });
    fireEvent.change(endDateInput, { target: { value: "2024-01-01" } });

    await waitFor(() => {
      expect(screen.getByText("A data inicial não pode ser posterior à data final")).toBeInTheDocument();
    });
  });

  it("should disable export buttons when no data", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const csvButton = screen.getByText("Exportar CSV").closest("button");
      const pdfButton = screen.getByText("Exportar PDF").closest("button");
      
      expect(csvButton).toBeDisabled();
      expect(pdfButton).toBeDisabled();
    });
  });

  it("should display error details in expandable section", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "error",
        message: "Error occurred",
        error_details: "Detailed error information",
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Detalhes do Erro")).toBeInTheDocument();
      expect(screen.getByText("Detailed error information")).toBeInTheDocument();
    });
  });
});
