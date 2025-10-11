import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreChartEmbedPage from "@/pages/embed/RestoreChartEmbed";

// Mock Chart.js to avoid canvas issues in tests
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Mocked Bar Chart</div>,
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";
const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;

describe("RestoreChartEmbedPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock restore count by day data
    mockRpc.mockImplementation((functionName: string) => {
      if (functionName === "get_restore_count_by_day_with_email") {
        return Promise.resolve({
          data: [
            { day: "2025-10-11", count: 5 },
            { day: "2025-10-10", count: 3 },
            { day: "2025-10-09", count: 8 },
          ],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    });
  });

  it("renders the embed page with chart", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbedPage />
      </MemoryRouter>
    );

    // Wait for chart to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  it("calls supabase RPC with empty email filter", async () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbedPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_restore_count_by_day_with_email", {
        email_input: "",
      });
    });
  });

  it("renders without navigation or layout components", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbedPage />
      </MemoryRouter>
    );

    // Verify no navigation elements
    expect(container.querySelector("nav")).toBeNull();
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("aside")).toBeNull();
  });

  it("has minimalist styling for embed purposes", () => {
    const { container } = render(
      <MemoryRouter>
        <RestoreChartEmbedPage />
      </MemoryRouter>
    );

    // Check for the main container with inline styles
    const chartContainer = container.querySelector('div[style*="width"]');
    expect(chartContainer).toBeInTheDocument();
  });
});
