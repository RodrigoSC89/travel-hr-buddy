import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AnalyticsDashboard from "@/pages/admin/analytics";

// Mock fetch
global.fetch = vi.fn();

describe("AnalyticsDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve([]),
    });
  });

  it("should render date filters", () => {
    render(<AnalyticsDashboard />);
    
    const dateInputs = screen.getAllByDisplayValue("");
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("should render PDF export button", () => {
    render(<AnalyticsDashboard />);
    
    const exportButton = screen.getByText(/📄 Exportar PDF/i);
    expect(exportButton).toBeInTheDocument();
  });

  it("should render chart titles", () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText(/🚀 Builds por Branch/i)).toBeInTheDocument();
    expect(screen.getByText(/📦 Builds por Status/i)).toBeInTheDocument();
    expect(screen.getByText(/📈 Tendência de Cobertura/i)).toBeInTheDocument();
  });

  it("should fetch data on mount", () => {
    render(<AnalyticsDashboard />);
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
