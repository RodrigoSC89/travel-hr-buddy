import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(function (this: any) {
          return this;
        }),
        gte: vi.fn(function (this: any) {
          return this;
        }),
        lte: vi.fn(function (this: any) {
          return this;
        }),
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({
            data: [],
            count: 0,
            error: null,
          })),
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

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the Restore Report Logs page functionality.
 */
describe("RestoreReportLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🧠 Auditoria de Relatórios Enviados")).toBeInTheDocument();
    });
  });

  it("should render total count display", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total de registros encontrados:/)).toBeInTheDocument();
    });
  });

  it("should render filter inputs", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Status (success/error)")).toBeInTheDocument();
      const dateInputs = screen.getAllByDisplayValue("");
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  it("should render search button", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🔍 Buscar")).toBeInTheDocument();
    });
  });

  it("should render export buttons", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("📤 Exportar CSV")).toBeInTheDocument();
      expect(screen.getByText("📄 Exportar PDF")).toBeInTheDocument();
    });
  });
});
