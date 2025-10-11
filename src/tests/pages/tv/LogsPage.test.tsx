import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TVWallLogs from "@/pages/tv/LogsPage";

// Mock recharts to avoid canvas issues in tests
vi.mock("recharts", () => ({
  BarChart: () => <div data-testid="bar-chart">Mocked Bar Chart</div>,
  Bar: () => <div>Bar</div>,
  PieChart: () => <div data-testid="pie-chart">Mocked Pie Chart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("TVWallLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock RPC functions
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { day: "2025-10-11", count: 5 },
            { day: "2025-10-10", count: 3 },
          ],
        });
      }
      if (functionName === "get_restore_summary") {
        return Promise.resolve({
          data: [{ total: 8, unique_docs: 6, avg_per_day: 4 }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    // Mock from function
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { status: "success" },
          { status: "success" },
          { status: "error" },
        ],
      }),
    });
  });

  it("renders the TV Wall dashboard", async () => {
    render(<TVWallLogs />);

    // Check for title
    expect(screen.getByText(/Restore Logs - Real Time/i)).toBeInTheDocument();
  });

  it("displays summary metrics", async () => {
    render(<TVWallLogs />);

    await waitFor(() => {
      expect(screen.getByText("Total de Restaurações")).toBeInTheDocument();
      expect(screen.getByText("Documentos Únicos")).toBeInTheDocument();
      expect(screen.getByText("Média por Dia")).toBeInTheDocument();
    });
  });

  it("shows chart titles", async () => {
    render(<TVWallLogs />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurações por Dia/i)).toBeInTheDocument();
      expect(screen.getByText(/Status dos Relatórios/i)).toBeInTheDocument();
    });
  });

  it("displays last update timestamp", () => {
    render(<TVWallLogs />);

    expect(screen.getByText(/Última atualização/i)).toBeInTheDocument();
    expect(screen.getByText(/Atualização automática a cada 60s/i)).toBeInTheDocument();
  });
});
