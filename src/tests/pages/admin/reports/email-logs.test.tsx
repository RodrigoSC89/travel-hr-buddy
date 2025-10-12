import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmailReportLogsPage from "@/pages/admin/reports/email-logs";

// Mock supabase client
const mockSelect = vi.fn(() => ({
  order: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({
      data: [
        {
          id: "1",
          sent_at: "2025-10-12T10:00:00Z",
          status: "success",
          message: "Relatório enviado com sucesso para admin@example.com",
        },
        {
          id: "2",
          sent_at: "2025-10-11T15:30:00Z",
          status: "error",
          message: "Falha ao enviar relatório",
        },
      ],
      error: null,
    })),
    gte: vi.fn(() => ({
      lte: vi.fn(() => Promise.resolve({
        data: [
          {
            id: "1",
            sent_at: "2025-10-12T10:00:00Z",
            status: "success",
            message: "Relatório enviado com sucesso",
          },
        ],
        error: null,
      })),
    })),
  })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe("EmailReportLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      order: vi.fn(() => Promise.resolve({
        data: [
          {
            id: "1",
            sent_at: "2025-10-12T10:00:00Z",
            status: "success",
            message: "Relatório enviado com sucesso para admin@example.com",
          },
          {
            id: "2",
            sent_at: "2025-10-11T15:30:00Z",
            status: "error",
            message: "Falha ao enviar relatório",
          },
        ],
        error: null,
      })),
    });
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/📬 Logs de Envio de Relatórios Diários/i)).toBeInTheDocument();
  });

  it("should render filter inputs", () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText(/Filtrar por status/i)).toBeInTheDocument();
  });

  it("should render date filter inputs", () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    const dateInputs = screen.getAllByDisplayValue("");
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("should render update button", () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/🔍 Atualizar/i)).toBeInTheDocument();
  });

  it("should display email logs after loading", async () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Relatório enviado com sucesso para admin@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Falha ao enviar relatório/i)).toBeInTheDocument();
    });
  });

  it("should display status badges", async () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/SUCCESS/i)).toBeInTheDocument();
      expect(screen.getByText(/ERROR/i)).toBeInTheDocument();
    });
  });

  it("should call fetchLogs on button click", async () => {
    render(
      <MemoryRouter>
        <EmailReportLogsPage />
      </MemoryRouter>
    );
    
    const updateButton = screen.getByText(/🔍 Atualizar/i);
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalled();
    });
  });
});
