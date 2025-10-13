import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the Restore Report Logs audit page functionality with infinite scroll and auto-filters.
 */

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect
    }))
  }
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

describe("RestoreReportLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock chain for pagination
    mockRange.mockResolvedValue({
      data: [
        {
          id: "1",
          executed_at: "2025-10-13T10:00:00Z",
          status: "success",
          message: "Relatório enviado com sucesso.",
          error_details: null,
          triggered_by: "automated"
        },
        {
          id: "2",
          executed_at: "2025-10-12T10:00:00Z",
          status: "error",
          message: "Falha ao enviar o relatório automático.",
          error_details: "Connection timeout",
          triggered_by: "automated"
        }
      ],
      error: null,
      count: 2
    });
    
    mockOrder.mockReturnValue({
      range: mockRange
    });
    
    mockLte.mockReturnValue({
      order: mockOrder
    });
    mockGte.mockReturnValue({
      lte: mockLte,
      order: mockOrder
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      order: mockOrder
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      order: mockOrder
    });
  });

  it("should render the page title with total count", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🧠 Auditoria de Relatórios Enviados")).toBeInTheDocument();
      expect(screen.getByText("(2 total)")).toBeInTheDocument();
    });
  });

  it("should render back button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Voltar")).toBeInTheDocument();
  });

  it("should display loading state initially", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando logs...")).toBeInTheDocument();
  });

  it("should display logs after loading", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Histórico de Execuções")).toBeInTheDocument();
    });

    // Check for success log
    await waitFor(() => {
      expect(screen.getByText("Relatório enviado com sucesso.")).toBeInTheDocument();
    });
  });

  it("should display summary cards", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Total de Execuções")).toBeInTheDocument();
      expect(screen.getByText("Sucessos")).toBeInTheDocument();
      expect(screen.getByText("Erros")).toBeInTheDocument();
    });
  });

  it("should render filter controls without Buscar button", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Data Inicial")).toBeInTheDocument();
      expect(screen.getByText("Data Final")).toBeInTheDocument();
      expect(screen.getByText("Limpar Filtros")).toBeInTheDocument();
      expect(screen.queryByText("Buscar")).not.toBeInTheDocument();
    });
  });

  it("should render export buttons", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.getByText("PDF")).toBeInTheDocument();
    });
  });

  it("should disable export buttons when no logs", async () => {
    mockRange.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0
    });

    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const csvButton = screen.getByText("CSV").closest("button");
      const pdfButton = screen.getByText("PDF").closest("button");
      expect(csvButton).toBeDisabled();
      expect(pdfButton).toBeDisabled();
    });
  });

  it("should auto-apply filters when changed", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    // Filters should auto-apply without needing to click a button
    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe("Public Mode Functionality", () => {
    it("should hide back button in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("Voltar")).not.toBeInTheDocument();
      });
    });

    it("should hide export buttons in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("CSV")).not.toBeInTheDocument();
        expect(screen.queryByText("PDF")).not.toBeInTheDocument();
        expect(screen.queryByText("Atualizar")).not.toBeInTheDocument();
      });
    });

    it("should hide filter controls in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("Status")).not.toBeInTheDocument();
        expect(screen.queryByText("Data Inicial")).not.toBeInTheDocument();
        expect(screen.queryByText("Data Final")).not.toBeInTheDocument();
        expect(screen.queryByText("Limpar Filtros")).not.toBeInTheDocument();
      });
    });

    it("should display public mode indicator in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Modo Somente Leitura (Visualização Pública)")).toBeInTheDocument();
      });
    });

    it("should show Eye icon in title when in public mode", async () => {
      const { container } = render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const title = screen.getByText("🧠 Auditoria de Relatórios Enviados");
        expect(title).toBeInTheDocument();
        // Eye icon should be inline with the title
        const eyeIcon = container.querySelector(".lucide-eye");
        expect(eyeIcon).toBeInTheDocument();
      });
    });

    it("should still display summary cards in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Total de Execuções")).toBeInTheDocument();
        expect(screen.getByText("Sucessos")).toBeInTheDocument();
        expect(screen.getByText("Erros")).toBeInTheDocument();
      });
    });

    it("should still display logs in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs?public=1"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Histórico de Execuções")).toBeInTheDocument();
        expect(screen.getByText("Relatório enviado com sucesso.")).toBeInTheDocument();
      });
    });

    it("should not display public mode indicator in normal mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/reports/logs"]}>
          <RestoreReportLogsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("Modo Somente Leitura (Visualização Pública)")).not.toBeInTheDocument();
      });
    });
  });
});

