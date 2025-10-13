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

  it("should render the alert message about database configuration", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esta funcionalidade requer configuração de banco de dados adicional/i)).toBeInTheDocument();
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });

  it("should have the alert icon", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const alertIcon = container.querySelector('svg.lucide-circle-alert');
    expect(alertIcon).toBeInTheDocument();
  });

  it("should center the alert on the page", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const centerDiv = container.querySelector('.flex.items-center.justify-center.min-h-screen');
    expect(centerDiv).toBeInTheDocument();
  });

  it("should have proper styling for the alert", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    const alert = container.querySelector('.max-w-md');
    expect(alert).toBeInTheDocument();
  });
});
