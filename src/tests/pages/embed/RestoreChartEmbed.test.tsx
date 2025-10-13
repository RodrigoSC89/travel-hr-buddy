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

  it("should render disabled state message", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
  });

  it("should display alert icon", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Check that the alert is displayed
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should display contact admin message", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });

  it("should render in centered layout", async () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const mainDiv = container.querySelector('.flex.items-center.justify-center.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });

  it("should show AlertCircle icon", async () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const svgElement = container.querySelector('.lucide-circle-alert');
    expect(svgElement).toBeInTheDocument();
  });

  it("should render max-width alert container", async () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const alertContainer = container.querySelector('.max-w-md');
    expect(alertContainer).toBeInTheDocument();
  });
});

describe("RestoreChartEmbed Component - Disabled State", () => {
  it("should render disabled message consistently", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Component should always show disabled state
    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
  });
});
