import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExecutionLogsPage from "@/pages/admin/automation/execution-logs";
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

describe("ExecutionLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Auditoria de Execuções de Automação")).toBeInTheDocument();
  });

  it("should render metrics cards", () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Total de Execuções")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Sucesso")).toBeInTheDocument();
    expect(screen.getByText("Esta Semana")).toBeInTheDocument();
    expect(screen.getByText("Duração Média")).toBeInTheDocument();
  });

  it("should render filter controls", async () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for date input placeholders
      const dateInputs = screen.getAllByPlaceholderText(/Data/);
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  it("should render export buttons", async () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const csvButtons = screen.getAllByText("CSV");
      expect(csvButtons.length).toBeGreaterThan(0);
      
      const pdfButtons = screen.getAllByText("PDF");
      expect(pdfButtons.length).toBeGreaterThan(0);
    });
  });

  it("should display loading state initially", () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando registros...")).toBeInTheDocument();
  });

  it("should fetch execution logs on mount", async () => {
    const mockExecutions = [
      {
        id: "1",
        workflow_id: "w1",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 1000,
        error_message: null,
        triggered_by: "user@test.com",
        trigger_data: {},
        execution_log: {},
        automation_workflows: { name: "Test Workflow" },
      },
    ];

    const mockWorkflows = [
      { id: "w1", name: "Test Workflow" },
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "automation_workflows") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockWorkflows,
              error: null,
            }),
          }),
        } as unknown;
      } else if (table === "automation_executions") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockExecutions,
              error: null,
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
    });

    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Workflow")).toBeInTheDocument();
    });
  });

  it("should display empty state when no executions exist", async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    } as unknown));

    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma execução encontrada")).toBeInTheDocument();
    });
  });

  it("should render date filter inputs", () => {
    render(
      <MemoryRouter>
        <ExecutionLogsPage />
      </MemoryRouter>
    );

    const dateInputs = screen.getAllByPlaceholderText(/Data/);
    expect(dateInputs.length).toBeGreaterThan(0);
  });
});
