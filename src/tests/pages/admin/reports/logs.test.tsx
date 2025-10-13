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

    expect(screen.getByText("Logs de Relatórios")).toBeInTheDocument();
  });

  it("should render back button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("← Voltar")).toBeInTheDocument();
  });

  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component shows a configuration warning instead of loading data
    expect(screen.getByText((content) =>
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });

  it("should render alert with specific table message", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Check that the alert mentions the specific table name
    expect(screen.getByText((content) =>
      content.includes("restore_report_logs")
    )).toBeInTheDocument();
  });
});
