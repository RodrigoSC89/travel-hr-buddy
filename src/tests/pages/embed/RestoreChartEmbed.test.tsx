import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreChartEmbed from "@/pages/embed/RestoreChartEmbed";

// Mock navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams("?token=test-token&email=test@example.com")],
  };
});

// Mock environment variable
vi.stubEnv("VITE_EMBED_ACCESS_TOKEN", "test-token");

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

// Mock Chart.js
interface ChartData {
  labels: string[];
  datasets: Array<{ data: number[] }>;
}

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }: { data: ChartData }) => (
    <div data-testid="chart">
      {data.labels.map((label: string, i: number) => (
        <div key={i} data-testid={`chart-item-${i}`}>
          {label}: {data.datasets[0].data[i]}
        </div>
      ))}
    </div>
  ),
}));

describe("RestoreChartEmbed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it("should render loading state initially", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Setup mocks that never resolve
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as unknown as ReturnType<typeof supabase.rpc>);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(new Promise(() => {})),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should display chart and statistics when data is loaded", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Mock chart data
    vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
      if (funcName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { day: "2024-01-01", count: 5 },
            { day: "2024-01-02", count: 3 },
          ],
          error: null,
        }) as unknown as ReturnType<typeof supabase.rpc>;
      }
      if (funcName === "get_restore_summary") {
        return Promise.resolve({
          data: [
            {
              total: 100,
              unique_docs: 50,
              avg_per_day: 5.5,
            },
          ],
          error: null,
        }) as unknown as ReturnType<typeof supabase.rpc>;
      }
      return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
    });

    // Mock last restore
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { restored_at: "2024-01-02T10:00:00Z" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Restaurações de Documentos")).toBeInTheDocument();
    });

    // Check statistics are displayed
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getAllByText(/100/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Documentos únicos:/)).toBeInTheDocument();
    expect(screen.getAllByText(/50/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Média\/dia:/)).toBeInTheDocument();
    expect(screen.getAllByText(/5\.50/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Última execução:/)).toBeInTheDocument();

    // Check chart is rendered
    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });

  it("should handle empty data gracefully", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    vi.mocked(supabase.rpc).mockImplementation((funcName: string) => {
      if (funcName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({ data: [], error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      }
      if (funcName === "get_restore_summary") {
        return Promise.resolve({ data: [], error: null }) as unknown as ReturnType<typeof supabase.rpc>;
      }
      return Promise.resolve({ data: null, error: null }) as unknown as ReturnType<typeof supabase.rpc>;
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum dado disponível")).toBeInTheDocument();
    });
  });

  it("should set window.chartReady flag when data is loaded", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    vi.mocked(supabase.rpc).mockImplementation(() =>
      Promise.resolve({ data: [], error: null }) as unknown as ReturnType<typeof supabase.rpc>
    );

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect((window as unknown as { chartReady: boolean }).chartReady).toBe(true);
    });
  });

  it("should display error message when data fetching fails", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    vi.mocked(supabase.rpc).mockImplementation(() =>
      Promise.resolve({ 
        data: null, 
        error: { message: "Database error", code: "500" } 
      }) as unknown as ReturnType<typeof supabase.rpc>
    );

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Erro ao Carregar Dados")).toBeInTheDocument();
      expect(screen.getByText(/Erro ao carregar dados do gráfico/)).toBeInTheDocument();
    });
  });

  it("should show improved loading state with spinner", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Setup mocks that never resolve to keep loading state
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as unknown as ReturnType<typeof supabase.rpc>);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(new Promise(() => {})),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });
});

describe("RestoreChartEmbed Token Protection", () => {
  it("should check for token on mount", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    vi.mocked(supabase.rpc).mockImplementation(() =>
      Promise.resolve({ data: [], error: null }) as unknown as ReturnType<typeof supabase.rpc>
    );

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // The component should render if token matches
    await waitFor(() => {
      expect(screen.getByText("Restaurações de Documentos")).toBeInTheDocument();
    });
  });
});
