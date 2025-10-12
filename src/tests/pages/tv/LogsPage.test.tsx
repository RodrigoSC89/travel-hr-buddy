import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TVWallLogsPage from "@/pages/tv/LogsPage";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

// Mock recharts
interface RechartsContainerProps {
  children: React.ReactNode;
}

vi.mock("recharts", () => ({
  BarChart: ({ children }: RechartsContainerProps) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: RechartsContainerProps) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: RechartsContainerProps) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("TVWallLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "should render loading state initially",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      // Setup mocks that never resolve
      vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as unknown as ReturnType<typeof supabase.rpc>);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue(new Promise(() => {})),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
    },
    10000
  );

  it(
    "should display header and metrics when data is loaded",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      // Mock RPC calls
      vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
        if (funcName === "get_restore_summary") {
          return Promise.resolve({
            data: [
              {
                total: 250,
                unique_docs: 75,
                avg_per_day: 8.3,
              },
            ],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        if (funcName === "get_restore_count_by_day_with_email") {
          return Promise.resolve({
            data: [
              { day: "2024-01-01", count: 10 },
              { day: "2024-01-02", count: 8 },
              { day: "2024-01-03", count: 12 },
            ],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      // Mock status data
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                { status: "success" },
                { status: "success" },
                { status: "error" },
              ],
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Check metrics are displayed
      expect(screen.getByText("Total de Restaurações")).toBeInTheDocument();
      expect(screen.getByText("250")).toBeInTheDocument();
      expect(screen.getByText("Documentos Únicos")).toBeInTheDocument();
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("Média por Dia")).toBeInTheDocument();
      expect(screen.getByText("8.3")).toBeInTheDocument();

      // Check last update timestamp is shown
      expect(screen.getByText("Última atualização")).toBeInTheDocument();
    },
    15000
  );

  it(
    "should display charts when data is available",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
        if (funcName === "get_restore_summary") {
          return Promise.resolve({
            data: [{ total: 100, unique_docs: 50, avg_per_day: 5.0 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        if (funcName === "get_restore_count_by_day_with_email") {
          return Promise.resolve({
            data: [{ day: "2024-01-01", count: 10 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ status: "success" }, { status: "error" }],
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("Restaurações por Dia (Últimos 15 dias)")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.getByText("Status dos Relatórios (Últimos 100)")).toBeInTheDocument();
      expect(screen.getAllByTestId("responsive-container")).toHaveLength(2);
    },
    15000
  );

  it(
    "should handle empty data gracefully",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
        if (funcName === "get_restore_summary") {
          return Promise.resolve({
            data: [{ total: 0, unique_docs: 0, avg_per_day: 0 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        if (funcName === "get_restore_count_by_day_with_email") {
          return Promise.resolve({ data: [], error: null }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Check that empty state displays
      expect(screen.getByText("Total de Restaurações")).toBeInTheDocument();
      expect(screen.getByText("Documentos Únicos")).toBeInTheDocument();
      expect(screen.getByText("Média por Dia")).toBeInTheDocument();

      // Should show empty state for charts
      expect(screen.getAllByText("Sem dados disponíveis")).toHaveLength(2);
    },
    15000
  );

  it(
    "should display error state when data fetch fails",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      vi.mocked(supabase.rpc).mockImplementation(() => {
        return Promise.resolve({
          data: null,
          error: { message: "Database error" },
        }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("Erro ao carregar dados")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    },
    15000
  );

  it(
    "should setup auto-refresh interval",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      const mockRpc = vi.fn().mockImplementation((funcName: string) => {
        if (funcName === "get_restore_summary") {
          return Promise.resolve({
            data: [{ total: 100, unique_docs: 50, avg_per_day: 5.0 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        if (funcName === "get_restore_count_by_day_with_email") {
          return Promise.resolve({
            data: [{ day: "2024-01-01", count: 10 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ status: "success" }],
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Initial call count should have both RPC calls
      expect(mockRpc).toHaveBeenCalled();
      expect(mockRpc.mock.calls.length).toBeGreaterThanOrEqual(2);
    },
    15000
  );

  it(
    "should display auto-refresh indicator in header",
    async () => {
      const { supabase } = await import("@/integrations/supabase/client");

      vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
        if (funcName === "get_restore_summary") {
          return Promise.resolve({
            data: [{ total: 100, unique_docs: 50, avg_per_day: 5.0 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        if (funcName === "get_restore_count_by_day_with_email") {
          return Promise.resolve({
            data: [{ day: "2024-01-01", count: 10 }],
            error: null,
          }) as unknown as ReturnType<typeof supabase.rpc>;
        }
        return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ status: "success" }],
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText("Auto-refresh: 60s")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    },
    15000
  );
});
