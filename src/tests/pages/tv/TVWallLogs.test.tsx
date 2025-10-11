import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TVWallLogs from "@/pages/tv/TVWallLogs";

// Mock fetch globally
global.fetch = vi.fn();

// Mock environment variables
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

describe("TVWallLogs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    import.meta.env.VITE_SUPABASE_URL = "https://test.supabase.co";
  });

  it("should render page title", () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          byDay: [],
          byStatus: [],
          total: 0,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    render(<TVWallLogs />);
    expect(screen.getByText(/📺 Restore Logs - Real Time/i)).toBeInTheDocument();
  });

  it("should display total count", async () => {
    const mockData = {
      success: true,
      data: {
        byDay: [
          { day: "01/10", count: 5 },
          { day: "02/10", count: 3 },
        ],
        byStatus: [
          { name: "Success", value: 10 },
          { name: "Warning", value: 2 },
          { name: "Error", value: 1 },
        ],
        total: 13,
        lastUpdated: new Date().toISOString(),
      },
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<TVWallLogs />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 13/i)).toBeInTheDocument();
    });
  });

  it("should render chart titles", () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          byDay: [],
          byStatus: [],
          total: 0,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    render(<TVWallLogs />);
    expect(screen.getByText(/📆 Restaurações por Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/📊 Por Status/i)).toBeInTheDocument();
  });

  it("should display auto-refresh message", () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          byDay: [],
          byStatus: [],
          total: 0,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    render(<TVWallLogs />);
    expect(screen.getByText(/Atualização automática a cada 60 segundos/i)).toBeInTheDocument();
  });

  it("should display error message on fetch failure", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    render(<TVWallLogs />);

    await waitFor(() => {
      expect(screen.getByText(/⚠️.*Network error/i)).toBeInTheDocument();
    });
  });

  it("should display no data message when charts are empty", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          byDay: [],
          byStatus: [],
          total: 0,
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    render(<TVWallLogs />);

    await waitFor(() => {
      const noDataMessages = screen.getAllByText(/Nenhum dado disponível/i);
      expect(noDataMessages.length).toBeGreaterThan(0);
    });
  });
});
