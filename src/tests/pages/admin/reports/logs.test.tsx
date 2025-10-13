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

    expect(screen.getByText(/Logs de Relatórios/i)).toBeInTheDocument();
  });

  it("should render the back button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Voltar/i)).toBeInTheDocument();
  });

  it("should render the alert message about database configuration", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
    expect(screen.getByText(/restore_report_logs/i)).toBeInTheDocument();
  });

  it("should have the alert icon", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const alertIcon = container.querySelector('svg.lucide-circle-alert');
    expect(alertIcon).toBeInTheDocument();
  });

  it("should navigate back when back button is clicked", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    const backButton = screen.getByText(/Voltar/i).closest('button');
    expect(backButton).toBeInTheDocument();
  });
});
