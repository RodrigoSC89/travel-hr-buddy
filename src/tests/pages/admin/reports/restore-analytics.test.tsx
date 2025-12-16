import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreAnalyticsPage from "@/pages/admin/reports/restore-analytics";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
    session: { access_token: "test-token" },
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { access_token: "test-token" } },
        error: null,
      })),
    },
  },
}));

describe("RestoreAnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch with a default successful response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          summary: {
            total: 100,
            unique_docs: 50,
            avg_per_day: 10,
          },
          dailyData: [
            { day: "2025-10-01", count: 10 },
            { day: "2025-10-02", count: 15 },
          ],
        }),
      } as Response)
    );
  });

  it("renders the page title", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Painel de Auditoria - Restaurações/i)).toBeInTheDocument();
    });
  });

  it("renders the email filter input", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por e-mail/i)).toBeInTheDocument();
    });
  });

  it("renders the search button", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Buscar/i })).toBeInTheDocument();
    });
  });

  it("renders the back button", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Voltar/i })).toBeInTheDocument();
    });
  });

  it("displays statistics when data is loaded", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Total de restaurações: 100/i)).toBeInTheDocument();
      expect(screen.getByText(/Documentos únicos restaurados: 50/i)).toBeInTheDocument();
      expect(screen.getByText(/Média por dia: 10/i)).toBeInTheDocument();
    });
  });

  it("renders CSV export button", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /CSV/i })).toBeInTheDocument();
    });
  });

  it("renders PDF export button", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /PDF/i })).toBeInTheDocument();
    });
  });

  it("renders the chart section", async () => {
    render(
      <MemoryRouter>
        <RestoreAnalyticsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });
});
