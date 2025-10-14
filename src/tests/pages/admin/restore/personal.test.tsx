import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PersonalRestoreDashboard from "@/pages/admin/restore/personal";

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar">Bar</div>,
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: { email: "test@example.com" },
              access_token: "test-token",
            },
          },
          error: null,
        })
      ),
    },
    rpc: vi.fn(),
  },
}));

describe("PersonalRestoreDashboard", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import and mock supabase after the module is mocked
    const { supabase } = await import("@/integrations/supabase/client");

    // Default mock implementation for RPC calls
    vi.mocked(supabase.rpc).mockImplementation((functionName: string) => {
      if (functionName === "get_restore_summary") {
        return Promise.resolve({
          data: [
            {
              total: 25,
              unique_docs: 15,
              avg_per_day: 5,
            },
          ],
          error: null,
        }) as any;
      }
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { day: "2025-10-10", count: 5 },
            { day: "2025-10-11", count: 8 },
            { day: "2025-10-12", count: 12 },
          ],
          error: null,
        }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });
  });

  it("renders the page title", async () => {
    render(
      <MemoryRouter>
        <PersonalRestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Seu Painel de Restaurações/i)).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    render(
      <MemoryRouter>
        <PersonalRestoreDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("renders summary cards with data", async () => {
    render(
      <MemoryRouter>
        <PersonalRestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total de restaurações/i)).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText(/Docs únicos/i)).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText(/Média por dia/i)).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("renders the bar chart when data is available", async () => {
    render(
      <MemoryRouter>
        <PersonalRestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Restaurações por Dia/i)).toBeInTheDocument();
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("calls the correct RPC functions with user email", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <PersonalRestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("get_restore_count_by_day_with_email", {
        email_input: "test@example.com",
      });
      expect(supabase.rpc).toHaveBeenCalledWith("get_restore_summary", {
        email_input: "test@example.com",
      });
    });
  });
});
