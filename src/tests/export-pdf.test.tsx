import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportBIReport } from "@/components/bi/ExportPDF";

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("ExportBIReport Component", () => {
  const mockTrendData = [
    { month: "Mai", total_jobs: 23 },
    { month: "Jun", total_jobs: 28 },
  ];
  const mockForecast = "Previsão de manutenção para os próximos meses...";

  it("should render the export button", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should disable button when no trend data is available", () => {
    render(<ExportBIReport trend={[]} forecast={mockForecast} />);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should enable button when trend data is available", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should call export function when button is clicked", async () => {
    const { toast } = await import("sonner");
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByRole("button");
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Gerando PDF...");
    });
  });
});
