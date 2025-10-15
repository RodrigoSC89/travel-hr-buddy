import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("DashboardJobs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton initially", () => {
    // Mock pending state
    vi.mocked(supabase.functions.invoke).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente/i)).toBeDefined();
  });

  it("should render the chart title", () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<DashboardJobs />);
    expect(screen.getByText(/📊 Falhas por Componente/i)).toBeDefined();
  });

  it("should call the bi-jobs-by-component function on mount", async () => {
    const mockData = [
      { component_id: "comp-1", count: 5, avg_duration: 2.5 },
      { component_id: "comp-2", count: 3, avg_duration: 3.2 },
    ];

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockData,
      error: null,
    });

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("bi-jobs-by-component");
    });
  });

  it("should handle errors gracefully", async () => {
    const mockError = new Error("API Error");
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<DashboardJobs />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("should render without crashing", () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: [],
      error: null,
    });

    const { container } = render(<DashboardJobs />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should display title with both metrics mentioned", () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<DashboardJobs />);
    expect(screen.getByText(/Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });
});
