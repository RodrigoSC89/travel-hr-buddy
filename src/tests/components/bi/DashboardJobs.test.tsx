import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: [], error: null }),
    },
  },
}));

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("DashboardJobs", () => {
  it("renders the component title", () => {
    render(<DashboardJobs />);
    expect(screen.getByText("📊 Falhas por Componente + Tempo Médio")).toBeInTheDocument();
  });

  it("renders chart components", async () => {
    render(<DashboardJobs />);
    
    // The chart should eventually render after data loads
    await vi.waitFor(() => {
      expect(screen.queryByTestId("bar-chart")).toBeInTheDocument();
    });
  });
});
