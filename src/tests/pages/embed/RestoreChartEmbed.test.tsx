import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Component now shows a configuration warning instead of loading data
    expect(screen.getByText((content) => 
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });

  it("should render alert with configuration message", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Check that the alert description is present
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });
});

describe("RestoreChartEmbed Token Protection", () => {
  it("should render configuration warning regardless of token", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Component shows configuration warning
    expect(screen.getByText((content) =>
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });
});
