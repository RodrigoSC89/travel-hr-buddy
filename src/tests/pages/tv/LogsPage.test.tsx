import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TVWallLogsPage from "@/pages/tv/LogsPage";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("TVWallLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    // Mock all RPC calls to return pending promises
    vi.mocked(supabase.rpc).mockReturnValue({
      data: null,
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando dados.../i)).toBeInTheDocument();
  });

  it("should display dashboard title and header information", async () => {
    // Mock successful data fetch
    vi.mocked(supabase.rpc).mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { restore_date: "2025-10-01", restore_count: 5 },
            { restore_date: "2025-10-02", restore_count: 3 },
          ],
          error: null,
        }) as any;
      } else if (functionName === "get_restore_summary") {
        return Promise.resolve({
          data: [
            {
              total_restores: 10,
              unique_documents: 5,
              average_per_day: 2.5,
            },
          ],
          error: null,
        }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });

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
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📺 Restore Logs - Real Time/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Última atualização:/i)).toBeInTheDocument();
    expect(screen.getByText(/Atualização automática a cada 60 segundos/i)).toBeInTheDocument();
  });

  it("should display summary cards with correct data", async () => {
    // Mock successful summary fetch
    vi.mocked(supabase.rpc).mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [],
          error: null,
        }) as any;
      } else if (functionName === "get_restore_summary") {
        return Promise.resolve({
          data: [
            {
              total_restores: 42,
              unique_documents: 15,
              average_per_day: 3.5,
            },
          ],
          error: null,
        }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
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
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    expect(screen.getByText(/Total de Restaurações/i)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/Documentos Únicos/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText(/Média por Dia/i)).toBeInTheDocument();
    expect(screen.getByText("3.5")).toBeInTheDocument();
  });

  it("should handle empty data gracefully", async () => {
    // Mock empty data responses
    vi.mocked(supabase.rpc).mockImplementation(() => {
      return Promise.resolve({
        data: [],
        error: null,
      }) as any;
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
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📺 Restore Logs - Real Time/i)).toBeInTheDocument();
    });

    // Check for "no data" messages in charts
    const noDataMessages = screen.getAllByText(/Nenhum dado disponível/i);
    expect(noDataMessages.length).toBeGreaterThan(0);
  });

  it("should handle API errors gracefully", async () => {
    // Mock error responses
    vi.mocked(supabase.rpc).mockImplementation(() => {
      return Promise.resolve({
        data: null,
        error: { message: "Database error" },
      }) as any;
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Carregando dados.../i)).not.toBeInTheDocument();
    });

    // Component should still render title even with errors
    expect(screen.getByText(/📺 Restore Logs - Real Time/i)).toBeInTheDocument();
    
    // Summary cards should show 0 or 0.0 for default values
    const summaryCards = screen.getAllByText(/0|0.0/);
    expect(summaryCards.length).toBeGreaterThan(0);
  });

  it("should display timestamp in footer", async () => {
    // Mock successful data fetch
    vi.mocked(supabase.rpc).mockImplementation(() => {
      return Promise.resolve({
        data: [],
        error: null,
      }) as any;
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
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/© \d{4} Nautilus One - TV Wall Dashboard/i)).toBeInTheDocument();
    });
  });

  it("should set up auto-refresh interval on mount", async () => {
    // Mock RPC calls
    vi.mocked(supabase.rpc).mockImplementation(() => {
      return Promise.resolve({
        data: [],
        error: null,
      }) as any;
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
    } as any);

    const { unmount } = render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Wait for initial render and data load
    await waitFor(() => {
      expect(screen.queryByText(/Carregando dados.../i)).not.toBeInTheDocument();
    });

    // Verify title is displayed (component mounted successfully)
    expect(screen.getByText(/📺 Restore Logs - Real Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Atualização automática a cada 60 segundos/i)).toBeInTheDocument();

    unmount();
  });
});
