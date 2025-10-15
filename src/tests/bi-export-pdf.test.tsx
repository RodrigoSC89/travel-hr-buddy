import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportBIReport } from "@/components/bi/ExportPDF";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    save: vi.fn(),
  })),
}));

describe("ExportBIReport Component", () => {
  const mockTrendData = [
    { month: "Janeiro", total_jobs: 15 },
    { month: "Fevereiro", total_jobs: 20 },
    { month: "Março", total_jobs: 18 },
  ];

  const mockForecast = "Previsão: Aumento de 10% no próximo mês";

  it("should render the export button", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    expect(screen.getByText(/Exportar Relatório BI/i)).toBeDefined();
  });

  it("should render button with correct icon", () => {
    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar Relatório BI/i);
    expect(button).toBeDefined();
  });

  it("should call html2pdf when button is clicked", async () => {
    const html2pdf = await import("html2pdf.js");
    const mockSave = vi.fn();
    const mockFrom = vi.fn().mockReturnValue({ save: mockSave });
    (html2pdf.default as typeof html2pdf.default).mockReturnValue({ from: mockFrom });

    render(<ExportBIReport trend={mockTrendData} forecast={mockForecast} />);
    const button = screen.getByText(/📄 Exportar Relatório BI/i);
    
    fireEvent.click(button);

    expect(html2pdf.default).toHaveBeenCalled();
  });

  it("should render without errors with empty trend data", () => {
    const { container } = render(<ExportBIReport trend={[]} forecast={mockForecast} />);
    expect(container).toBeDefined();
  });

  it("should render without errors with empty forecast", () => {
    const { container } = render(<ExportBIReport trend={mockTrendData} forecast="" />);
    expect(container).toBeDefined();
  });
});
