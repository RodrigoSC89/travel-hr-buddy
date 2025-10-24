import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreDashboard from "@/pages/admin/documents/restore-dashboard";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock Chart.js to avoid canvas issues in tests
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock QRCodeSVG
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>QR Code</div>
  ),
}));

describe("RestoreDashboard - New Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and display monthly department summary", async () => {
    // Mock RPC responses
    const mockSummary = [{ total: 100, unique_docs: 50, avg_per_day: 5.5 }];
    const mockDailyData = [
      { day: "2025-10-13", count: 10 },
      { day: "2025-10-12", count: 8 },
    ];
    const mockDepartmentData = [
      { department: "TI", count: 25 },
      { department: "RH", count: 15 },
      { department: "Vendas", count: 10 },
    ];

    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_restore_summary") {
        return Promise.resolve({ data: mockSummary, error: null }) as unknown;
      }
      if (fnName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({ data: mockDailyData, error: null }) as unknown;
      }
      if (fnName === "get_monthly_restore_summary_by_department") {
        return Promise.resolve({ data: mockDepartmentData, error: null }) as unknown;
      }
      return Promise.resolve({ data: null, error: null }) as unknown;
    });

    render(
      <MemoryRouter>
        <RestoreDashboard />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("get_monthly_restore_summary_by_department");
    });

    // Check if department comparison section is rendered
    await waitFor(() => {
      expect(screen.getByText(/Comparativo Mensal por Departamento/i)).toBeInTheDocument();
    });
  });

  it("should display QR code for public access in non-public mode", async () => {
    // Mock RPC responses with minimal data
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as unknown);

    render(
      <MemoryRouter>
        <RestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Link Público com QR Code/i)).toBeInTheDocument();
    });

    // Check QR code is rendered
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute("data-value", expect.stringContaining("public=1"));

    // Check public URL text is displayed
    expect(screen.getByText(/Link de acesso público/i)).toBeInTheDocument();
  });

  it("should hide QR code in public view mode", async () => {
    // Mock RPC responses
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/documents/restore-dashboard?public=1"]}>
        <RestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Link Público com QR Code/i)).not.toBeInTheDocument();
    });

    // Should show TV Wall indicator instead
    await waitFor(() => {
      expect(screen.getByText(/TV Wall Ativado/i)).toBeInTheDocument();
    });
  });

  it("should display enhanced public mode indicator", async () => {
    // Mock RPC responses
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/documents/restore-dashboard?public=1"]}>
        <RestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const publicIndicator = screen.getByText(/TV Wall Ativado/i);
      expect(publicIndicator).toBeInTheDocument();
      expect(publicIndicator).toHaveTextContent("Modo público somente leitura");
    });
  });

  it("should render department summary chart when data is available", async () => {
    const mockDepartmentData = [
      { department: "TI", count: 25 },
      { department: "RH", count: 15 },
    ];

    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_monthly_restore_summary_by_department") {
        return Promise.resolve({ data: mockDepartmentData, error: null }) as unknown;
      }
      if (fnName === "get_restore_count_by_day_with_email") {
        // Return some daily data so the first chart renders
        return Promise.resolve({ 
          data: [{ day: "2025-10-13", count: 10 }], 
          error: null 
        }) as unknown;
      }
      return Promise.resolve({ data: [], error: null }) as unknown;
    });

    render(
      <MemoryRouter>
        <RestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should render both charts: daily chart + department chart
      const charts = screen.getAllByTestId("bar-chart");
      expect(charts.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should not render department chart when no data is available", async () => {
    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_monthly_restore_summary_by_department") {
        return Promise.resolve({ data: [], error: null }) as unknown;
      }
      return Promise.resolve({ data: [], error: null }) as unknown;
    });

    render(
      <MemoryRouter>
        <RestoreDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should not find department comparison text
      expect(screen.queryByText(/Comparativo Mensal por Departamento/i)).not.toBeInTheDocument();
    });
  });
});
