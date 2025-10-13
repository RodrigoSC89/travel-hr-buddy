import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreAnalyticsPage from "@/pages/admin/reports/restore-analytics";

// Mock Chart.js to avoid canvas issues in tests
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="mock-bar-chart">Chart</div>,
}));

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("RestoreAnalyticsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("📊 Painel de Auditoria - Restaurações")).toBeInTheDocument();
  });

  it("should render filter input", () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Filtrar por e-mail")).toBeInTheDocument();
  });

  it("should render export buttons", () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("📤 CSV")).toBeInTheDocument();
    expect(screen.getByText("📄 PDF")).toBeInTheDocument();
  });

  it("should render search button", () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("🔍 Buscar")).toBeInTheDocument();
  });

  it("should render chart section", () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("📅 Gráfico de Restaurações")).toBeInTheDocument();
    expect(screen.getByTestId("mock-bar-chart")).toBeInTheDocument();
  });
});
