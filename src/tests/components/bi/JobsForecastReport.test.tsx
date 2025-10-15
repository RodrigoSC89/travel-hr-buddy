import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe("JobsForecastReport Component", () => {
  it("should render the component with title", () => {
    render(<JobsForecastReport trend={[]} />);
    expect(screen.getByText(/🔮 Previsão IA de Jobs/i)).toBeDefined();
  });

  it("should render the 'Gerar Previsão' button when there is no forecast", () => {
    render(<JobsForecastReport trend={[]} />);
    expect(screen.getByText(/Gerar Previsão/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobsForecastReport trend={[]} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should accept trend data with different properties", () => {
    const trendData = [
      { date: "2024-01-01", value: 100 },
      { date: "2024-01-02", count: 150 },
      { date: "2024-01-03", total: 200 }
    ];
    
    const { container } = render(<JobsForecastReport trend={trendData} />);
    expect(container).toBeDefined();
  });
});
