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

  it("should render TV Wall title", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("TV Wall - Logs")).toBeInTheDocument();
  });

  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Component shows a configuration warning instead of loading data
    expect(screen.getByText((content) =>
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });

  it("should render alert with configuration message", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Check that the alert description is present
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });
});
