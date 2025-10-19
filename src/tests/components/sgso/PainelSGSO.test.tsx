import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PainelSGSO } from "@/components/sgso/PainelSGSO";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Mock file-saver
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

// Mock recharts
vi.mock("recharts", () => ({
  BarChart: vi.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: vi.fn(() => <div />),
  XAxis: vi.fn(() => <div />),
  YAxis: vi.fn(() => <div />),
  Tooltip: vi.fn(() => <div />),
  Legend: vi.fn(() => <div />),
  ResponsiveContainer: vi.fn(({ children }) => <div>{children}</div>),
}));

describe("PainelSGSO", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the panel title", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Painel SGSO - Risco Operacional por Embarcação/i)).toBeDefined();
  });

  it("should render export CSV button", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Exportar CSV/i)).toBeDefined();
  });

  it("should render export PDF button", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should render vessel cards", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/PSV Atlântico/i)).toBeDefined();
    expect(screen.getByText(/AHTS Pacífico/i)).toBeDefined();
    expect(screen.getByText(/OSV Caribe/i)).toBeDefined();
    expect(screen.getByText(/PLSV Mediterrâneo/i)).toBeDefined();
  });

  it("should render risk levels", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Risco: CRÍTICO/i)).toBeDefined();
    expect(screen.getByText(/Risco: ALTO/i)).toBeDefined();
    expect(screen.getByText(/Risco: MÉDIO/i)).toBeDefined();
    expect(screen.getByText(/Risco: BAIXO/i)).toBeDefined();
  });

  it("should render failure counts", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Falhas críticas: 12/i)).toBeDefined();
    expect(screen.getByText(/Falhas críticas: 8/i)).toBeDefined();
    expect(screen.getByText(/Falhas críticas: 4/i)).toBeDefined();
    expect(screen.getByText(/Falhas críticas: 2/i)).toBeDefined();
  });

  it("should render monthly comparison chart title", () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Comparativo Mensal de Falhas/i)).toBeDefined();
  });

  it("should render bar chart", () => {
    const { container } = render(<PainelSGSO />);
    expect(container.querySelector("[data-testid=\"bar-chart\"]")).toBeDefined();
  });

  it("should call saveAs when CSV export button is clicked", async () => {
    const { saveAs } = await import("file-saver");
    render(<PainelSGSO />);
    
    const csvButton = screen.getByText(/Exportar CSV/i);
    fireEvent.click(csvButton);

    expect(saveAs).toHaveBeenCalled();
    const blob = (saveAs as unknown).mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect((saveAs as unknown).mock.calls[0][1]).toBe("relatorio_sgso.csv");
  });

  it("should call html2pdf when PDF export button is clicked", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    render(<PainelSGSO />);
    
    const pdfButton = screen.getByText(/Exportar PDF/i);
    fireEvent.click(pdfButton);

    expect(html2pdf).toHaveBeenCalled();
  });

  it("should have correct button styling", () => {
    const { container } = render(<PainelSGSO />);
    const buttons = container.querySelectorAll("button");
    
    // CSV button should have blue background
    const csvButton = Array.from(buttons).find(btn => btn.textContent?.includes("Exportar CSV"));
    expect(csvButton?.className).toContain("bg-blue-600");
    
    // PDF button should have zinc background
    const pdfButton = Array.from(buttons).find(btn => btn.textContent?.includes("Exportar PDF"));
    expect(pdfButton?.className).toContain("bg-zinc-800");
  });
});
