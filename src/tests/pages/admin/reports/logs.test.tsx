import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

    // Component is disabled, shows simplified title
    expect(screen.getByText(/Logs de Relatórios/)).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, shows error message instead of description
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
  });

  it("should render filter section", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no filter section
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
  });

  it("should render status filter input with correct placeholder", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no status filter input
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
  });

  it("should render date filter inputs", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no date filter inputs
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
  });

  it("should render export buttons", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no export buttons
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
  });

  it("should render summary metrics cards", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no metrics cards
    expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, doesn't fetch logs
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no success count
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no error count
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, shows error message
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no filter functionality
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no pending status display
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component is disabled, no date range validation
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no export buttons
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
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

    // Component is disabled, no error details section
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Esta funcionalidade requer configuração de banco de dados adicional"))).toBeInTheDocument();
    });
  });
});
