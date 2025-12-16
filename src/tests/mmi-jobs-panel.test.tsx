import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MMIJobsPanel from "@/pages/MMIJobsPanel";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    }))
  }))
}));

describe("MMI Jobs Forecast Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the panel title", async () => {
    render(<MMIJobsPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Painel de Forecast MMI/i)).toBeDefined();
    });
  });

  it("should render the search input", async () => {
    render(<MMIJobsPanel />);
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Buscar por sistema, componente/i);
      expect(searchInput).toBeDefined();
    });
  });

  it("should have the correct title with emoji", async () => {
    render(<MMIJobsPanel />);
    await waitFor(() => {
      const title = screen.getByText(/🛠 Painel de Forecast MMI/i);
      expect(title).toBeDefined();
    });
  });
});
