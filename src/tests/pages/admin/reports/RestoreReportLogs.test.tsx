import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/RestoreReportLogs";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("RestoreReportLogsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Logs de Envio Diário de Relatório/i)).toBeInTheDocument();
  });

  it("should render filter inputs and export button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText(/Status \(success, error\.\.\.\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Exportar CSV/i })).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Carregando logs\.\.\./i)).toBeInTheDocument();
  });

  it("should show empty state when no logs", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhum log encontrado/i)).toBeInTheDocument();
    });
  });

  it("should disable export button when no logs", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const exportButton = screen.getByRole("button", { name: /Exportar CSV/i });
      expect(exportButton).toBeDisabled();
    });
  });

  it("should update status filter", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    const statusInput = screen.getByPlaceholderText(/Status \(success, error\.\.\.\)/i);
    fireEvent.change(statusInput, { target: { value: "success" } });
    
    expect(statusInput).toHaveValue("success");
  });

  it("should update date filters", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );
    
    const dateInputs = screen.getAllByDisplayValue("");
    const startDateInput = dateInputs[1]; // First date input after status filter
    const endDateInput = dateInputs[2]; // Second date input
    
    fireEvent.change(startDateInput, { target: { value: "2025-10-01" } });
    fireEvent.change(endDateInput, { target: { value: "2025-10-11" } });
    
    expect(startDateInput).toHaveValue("2025-10-01");
    expect(endDateInput).toHaveValue("2025-10-11");
  });
});
