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
    "should render disabled state message",
    async () => {
      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
    },
    10000
  );

  it(
    "should display page title",
    async () => {
      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      expect(screen.getByText("TV Wall - Logs")).toBeInTheDocument();
    },
    15000
  );

  it(
    "should display alert icon",
    async () => {
      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    },
    15000
  );

  it(
    "should display contact admin message",
    async () => {
      render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
    },
    15000
  );

  it(
    "should render card layout",
    async () => {
      const { container } = render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      const card = container.querySelector('.rounded-lg.border.bg-card');
      expect(card).toBeInTheDocument();
    },
    15000
  );

  it(
    "should show AlertCircle icon",
    async () => {
      const { container } = render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      const svgElement = container.querySelector('.lucide-circle-alert');
      expect(svgElement).toBeInTheDocument();
    },
    15000
  );

  it(
    "should render minimum screen height layout",
    async () => {
      const { container } = render(
        <MemoryRouter>
          <TVWallLogsPage />
        </MemoryRouter>
      );

      const mainDiv = container.querySelector('.min-h-screen.bg-background');
      expect(mainDiv).toBeInTheDocument();
    },
    15000
  );
});
