import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TVWallLogs from "@/pages/tv/LogsPage";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe("TVWallLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("renders loading state initially", () => {
    // Mock RPC calls to delay
    vi.mocked(supabase.rpc).mockReturnValue({
      then: () => new Promise(() => {}),
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            then: () => new Promise(() => {}),
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogs />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("renders dashboard with data successfully", async () => {
    // Mock RPC call for restore count by day
    const mockCountByDay = [
      { day: "2025-10-11", count: 10 },
      { day: "2025-10-12", count: 15 },
    ];

    // Mock RPC call for summary
    const mockSummary = [
      {
        total: 250,
        unique_docs: 200,
        avg_per_day: 8.5,
      },
    ];

    // Mock status data
    const mockStatusData = [
      { status: "success" },
      { status: "success" },
      { status: "error" },
    ];

    vi.mocked(supabase.rpc).mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({ data: mockCountByDay, error: null }) as any;
      } else if (functionName === "get_restore_summary") {
        return Promise.resolve({ data: mockSummary, error: null }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: mockStatusData,
            error: null,
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <TVWallLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText("Total de Restaurações")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("Documentos Únicos")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("Média por Dia")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();

    // Check charts
    expect(screen.getByText("Restaurações por Dia")).toBeInTheDocument();
    expect(screen.getByText("Status dos Relatórios")).toBeInTheDocument();
  });

  it("handles empty data gracefully", async () => {
    // Mock empty data
    vi.mocked(supabase.rpc).mockImplementation(() => {
      return Promise.resolve({ data: [], error: null }) as any;
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
        <TVWallLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
    });

    // Should show 0 for all metrics (3 cards with 0)
    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBe(3);

    // Should show "Nenhum dado disponível" for charts
    expect(screen.getAllByText("Nenhum dado disponível").length).toBeGreaterThan(0);
  });

  it("handles API errors gracefully", async () => {
    // Mock API errors
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
        <TVWallLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("📺 Restore Logs - Real Time")).toBeInTheDocument();
    });

    // Should still render the page even with errors
    expect(screen.getByText("Total de Restaurações")).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("displays last update timestamp", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
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
        <TVWallLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    });

    expect(screen.getByText("Atualiza a cada 60 segundos")).toBeInTheDocument();
  });

  it("displays footer information", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
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
        <TVWallLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("© 2025 Travel HR Buddy - Dashboard de Monitoramento em Tempo Real")
      ).toBeInTheDocument();
    });
  });
});
