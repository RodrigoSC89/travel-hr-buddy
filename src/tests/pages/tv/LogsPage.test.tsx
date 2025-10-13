import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/TV Wall - Logs/i)).toBeInTheDocument();
  });

  it("should render the alert message about database configuration", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });

  it("should have the alert icon", () => {
    const { container } = render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    const alertIcon = container.querySelector("svg.lucide-circle-alert");
    expect(alertIcon).toBeInTheDocument();
  });

  it("should have dark background styling", () => {
    const { container } = render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    const mainDiv = container.querySelector(".min-h-screen.bg-background.p-6");
    expect(mainDiv).toBeInTheDocument();
  });

  it("should render card component with proper styling", () => {
    const { container } = render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    const card = container.querySelector(".rounded-lg.border");
    expect(card).toBeInTheDocument();
  });
});
