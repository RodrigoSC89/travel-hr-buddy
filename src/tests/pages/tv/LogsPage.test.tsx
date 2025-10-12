import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LogsPage from "@/pages/tv/LogsPage";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe("LogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    // Mock empty data
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Carregando dados.../i)).toBeInTheDocument();
  });

  it("should render dashboard with data successfully", async () => {
    // Mock restore count by day
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({
        data: [
          { restore_date: "2025-10-01", restore_count: 5 },
          { restore_date: "2025-10-02", restore_count: 8 },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            total_restores: 100,
            unique_documents: 50,
            avg_per_day: 10.5,
          },
        ],
        error: null,
      });

    // Mock status logs
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Restore Logs - Real Time/i)).toBeInTheDocument();
    });

    // Check summary cards
    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument(); // Total restores
      expect(screen.getByText("50")).toBeInTheDocument(); // Unique documents
      expect(screen.getByText("10.5")).toBeInTheDocument(); // Average per day
    });

    // Check chart titles
    expect(screen.getByText(/Restaurações por Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Status dos Relatórios/i)).toBeInTheDocument();
  });

  it("should handle empty data gracefully", async () => {
    // Mock empty responses
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [
          {
            total_restores: 0,
            unique_documents: 0,
            avg_per_day: 0,
          },
        ],
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Restore Logs - Real Time/i)).toBeInTheDocument();
    });

    // Check empty states
    await waitFor(() => {
      const emptyMessages = screen.getAllByText(/Nenhum dado disponível/i);
      expect(emptyMessages.length).toBeGreaterThan(0);
    });
  });

  it("should handle API errors gracefully", async () => {
    // Mock error responses
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: "API Error" },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "API Error" },
          }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    // Should still render dashboard with empty data, not error message
    // This provides graceful degradation for TV displays
    await waitFor(() => {
      expect(screen.getByText(/Restore Logs - Real Time/i)).toBeInTheDocument();
    });

    // Check that it shows empty states instead of crashing
    await waitFor(() => {
      const emptyMessages = screen.getAllByText(/Nenhum dado disponível/i);
      expect(emptyMessages.length).toBeGreaterThan(0);
    });
  });

  it("should display last update timestamp", async () => {
    // Mock data
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [{ total_restores: 0, unique_documents: 0, avg_per_day: 0 }],
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Última atualização:/i)).toBeInTheDocument();
    });
  });

  it("should display footer information", async () => {
    // Mock data
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [{ total_restores: 0, unique_documents: 0, avg_per_day: 0 }],
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Travel HR Buddy - TV Wall Dashboard/i)).toBeInTheDocument();
    });
  });
});
