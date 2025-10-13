import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the Restore Report Logs audit page functionality.
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
      select: mockSelect,
    }))
  }
}));

// Mock useToast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("RestoreReportLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock chain
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      range: mockRange,
    });
    mockRange.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      gte: mockGte,
    });
    mockGte.mockReturnValue({
      lte: mockLte,
    });
    mockLte.mockResolvedValue({
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
      count: 2,
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

  it("should render filter section", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Data Inicial")).toBeInTheDocument();
    expect(screen.getByText("Data Final")).toBeInTheDocument();
  });

  it("should render export buttons", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
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

  it("should display total count", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total: 2 registros/)).toBeInTheDocument();
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

  it("should export buttons be disabled when no logs", async () => {
    // Setup empty data
    mockLte.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
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
});
