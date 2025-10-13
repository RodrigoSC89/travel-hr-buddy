import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the Restore Report Logs audit page functionality with filters, infinite scroll, and export.
 */

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Supabase client with proper chain
const mockRange = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect
    }))
  }
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
} as any;

describe("RestoreReportLogsPage Component", () => {
  const mockLogs = [
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock chain for successful data fetch
    mockRange.mockResolvedValue({
      data: mockLogs,
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
      order: mockOrder,
      range: mockRange
    });
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("🧠 Auditoria de Relatórios Enviados")).toBeInTheDocument();
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

  it("should display total count in header", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\(2 total\)/)).toBeInTheDocument();
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

  it("should render filter controls", async () => {
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

  it("should use infinite scroll with range query", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockRange).toHaveBeenCalledWith(0, 19); // First page: 0-19
    });
  });

  it("should fetch logs with exact count", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact" });
    });
  });
});

