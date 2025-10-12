import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogs from "@/pages/admin/reports/RestoreReportLogs";
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

describe("RestoreReportLogs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any));

    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Logs de Relatórios de Restauração")).toBeInTheDocument();
    });
  });

  it("should render filter controls and export button", async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any));

    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Filtros")).toBeInTheDocument();
      expect(screen.getByText("CSV")).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    // Check for loading spinner (Loader2 component)
    const loadingElement = document.querySelector(".animate-spin");
    expect(loadingElement).toBeInTheDocument();
  });

  it("should display empty state when no logs exist", async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any));

    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
    });
  });

  it("should disable export button when no logs", async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as any));

    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      const csvButton = screen.getByText("CSV").closest("button");
      expect(csvButton).toBeDisabled();
    });
  });

  it("should render status filter", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  it("should render date filters", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Data Inicial")).toBeInTheDocument();
      expect(screen.getByText("Data Final")).toBeInTheDocument();
    });
  });

  it("should fetch restore report logs on mount", async () => {
    const mockLogs = [
      {
        id: "1",
        executed_at: new Date().toISOString(),
        status: "success",
        message: "Relatório enviado com sucesso.",
        error_details: null,
        triggered_by: "automated",
      },
    ];

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      }),
    } as any));

    render(
      <MemoryRouter>
        <RestoreReportLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Relatório enviado com sucesso.")).toBeInTheDocument();
    });
  });
});
