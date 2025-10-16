import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BiFilters from "@/components/bi/BiFilters";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn(),
        })),
      })),
    })),
  },
}));

describe("BiFilters", () => {
  it("renders filter inputs", () => {
    const mockOnFilterChange = vi.fn();
    render(<BiFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByLabelText(/data início/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data fim/i)).toBeInTheDocument();
    expect(screen.getByText(/aplicar filtros/i)).toBeInTheDocument();
  });

  it("calls onFilterChange when apply button is clicked", async () => {
    const mockOnFilterChange = vi.fn();
    render(<BiFilters onFilterChange={mockOnFilterChange} />);

    const applyButton = screen.getByText(/aplicar filtros/i);
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });

  it("resets filters when clear button is clicked", async () => {
    const mockOnFilterChange = vi.fn();
    render(<BiFilters onFilterChange={mockOnFilterChange} />);

    const clearButton = screen.getByText(/limpar/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        startDate: "",
        endDate: "",
        vesselId: "all",
        standard: "all",
      });
    });
  });
});
