import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SGSOReportPage from "@/pages/SGSOReportPage";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock recharts
vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: vi.fn(() => <div />),
  XAxis: vi.fn(() => <div />),
  YAxis: vi.fn(() => <div />),
  CartesianGrid: vi.fn(() => <div />),
  Tooltip: vi.fn(() => <div />),
  Legend: vi.fn(() => <div />),
  ResponsiveContainer: vi.fn(({ children }) => <div>{children}</div>),
}));

// Mock hooks
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe("SGSOReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getAllByText(/Relatório SGSO/i).length).toBeGreaterThan(0);
  });

  it("should render export PDF button", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should render vessel name in report", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/MV Atlântico/i)).toBeDefined();
  });

  it("should render incidents section", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Incidentes Classificados/i)).toBeDefined();
  });

  it("should render trend chart section", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Tendência de Riscos/i)).toBeDefined();
  });

  it("should render statistics summary", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Resumo Estatístico/i)).toBeDefined();
  });

  it("should handle PDF export button click", () => {
    renderWithRouter(<SGSOReportPage />);
    const exportButton = screen.getByText(/Exportar PDF/i);
    fireEvent.click(exportButton);
    // The button should be clickable without errors
    expect(exportButton).toBeDefined();
  });

  it("should render incident details", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Quase colisão durante manobra de aproximação/i)).toBeDefined();
  });

  it("should render action plans for incidents", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getAllByText(/Plano de Ação:/i).length).toBeGreaterThan(0);
  });

  it("should render footer with signature line", () => {
    renderWithRouter(<SGSOReportPage />);
    expect(screen.getByText(/Responsável pela Segurança Operacional/i)).toBeDefined();
  });
});
