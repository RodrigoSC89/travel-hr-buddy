import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportBIReport } from "@/components/bi/ExportPDF";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ExportBIReport Component", () => {
  const mockTrendData = [
    { month: "2025-05", total_jobs: 15, monthLabel: "mai de 2025" },
    { month: "2025-06", total_jobs: 20, monthLabel: "jun de 2025" },
    { month: "2025-07", total_jobs: 18, monthLabel: "jul de 2025" },
  ];

  const mockForecast = "Previsão: Aumento de 10% no próximo mês";

  it("should render the export button", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should render button with correct icon", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar PDF/i);
    expect(button).toBeDefined();
  });

  it("should call html2pdf when button is clicked", async () => {
    const html2pdf = await import("html2pdf.js");
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockFrom = vi.fn().mockReturnValue({ save: mockSave });
    const mockSet = vi.fn().mockReturnValue({ from: mockFrom });
    (html2pdf.default as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar PDF/i);
    
    fireEvent.click(button);

    expect(html2pdf.default).toHaveBeenCalled();
  });

  it("should be disabled when no trend data is provided", () => {
    render(<ExportBIReport trend={[]} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar PDF/i);
    expect(button).toHaveProperty('disabled', true);
  });

  it("should be enabled when trend data is provided", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar PDF/i);
    expect(button).toHaveProperty('disabled', false);
  });

  it("should render without errors with empty forecast", () => {
    const { container } = render(<ExportBIReport trend={mockTrendData} forecast="" />);
    expect(container).toBeDefined();
  });
});
