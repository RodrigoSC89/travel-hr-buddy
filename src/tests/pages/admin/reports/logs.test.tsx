import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

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

    expect(screen.getByText("Logs de Relatórios")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
  });

  it("should render back button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("← Voltar")).toBeInTheDocument();
  });

  it("should render alert icon", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should mention required table name", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/restore_report_logs/i)).toBeInTheDocument();
  });

  it("should render card layout", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const card = container.querySelector('.rounded-lg.border.bg-card');
    expect(card).toBeInTheDocument();
  });

  it("should show AlertCircle icon", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const svgElement = container.querySelector('.lucide-circle-alert');
    expect(svgElement).toBeInTheDocument();
  });
});
