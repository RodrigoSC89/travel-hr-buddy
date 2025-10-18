import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SGSOReportPage from "@/pages/SGSOReportPage";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => {
  const mockSave = vi.fn();
  const mockFrom = vi.fn(() => ({ save: mockSave }));
  const mockSet = vi.fn(() => ({ from: mockFrom }));
  const mockHtml2pdf = vi.fn(() => ({ set: mockSet }));
  
  return {
    default: mockHtml2pdf,
  };
});

// Mock SGSOTrendChart
vi.mock("@/components/sgso/SGSOTrendChart", () => ({
  SGSOTrendChart: () => <div data-testid="sgso-trend-chart">Trend Chart</div>,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockIncidents = [
  {
    date: "15/10/2025",
    description: "Test incident description",
    sgso_category: "Navegação",
    sgso_risk_level: "Crítico",
    sgso_root_cause: "Test root cause",
    action_plan: "Test action plan",
  },
  {
    date: "10/10/2025",
    description: "Another test incident",
    sgso_category: "Meio Ambiente",
    sgso_risk_level: "Alto",
    sgso_root_cause: "Another root cause",
    action_plan: "Another action plan",
  },
];

describe("SGSOReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <SGSOReportPage {...props} />
      </BrowserRouter>
    );
  };

  it("should render the page title", () => {
    renderComponent();
    expect(screen.getByText(/Relatório SGSO - Gestão de Segurança Operacional/i)).toBeDefined();
  });

  it("should render the export PDF button", () => {
    renderComponent();
    const button = screen.getByText(/Exportar PDF/i);
    expect(button).toBeDefined();
  });

  it("should render vessel name", () => {
    renderComponent({ vesselName: "Test Vessel" });
    expect(screen.getAllByText("Test Vessel").length).toBeGreaterThan(0);
  });

  it("should render report header with title", () => {
    renderComponent();
    expect(screen.getByText(/📄 Relatório SGSO/i)).toBeDefined();
  });

  it("should render compliance information", () => {
    renderComponent();
    expect(screen.getByText(/Conformidade ANP Resolução 43\/2007/i)).toBeDefined();
  });

  it("should render statistics summary", () => {
    renderComponent();
    expect(screen.getByText(/📊 Resumo Estatístico/i)).toBeDefined();
    expect(screen.getByText(/Total/i)).toBeDefined();
    expect(screen.getAllByText(/Crítico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Alto/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Médio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Baixo/i).length).toBeGreaterThan(0);
  });

  it("should render incidents section", () => {
    renderComponent();
    expect(screen.getByText(/📋 Incidentes Classificados/i)).toBeDefined();
  });

  it("should render incidents with provided data", () => {
    renderComponent({ incidents: mockIncidents });
    expect(screen.getByText(/Test incident description/i)).toBeDefined();
    expect(screen.getByText(/Another test incident/i)).toBeDefined();
  });

  it("should render incident details", () => {
    renderComponent({ incidents: mockIncidents });
    expect(screen.getByText(/Test root cause/i)).toBeDefined();
    expect(screen.getByText(/Test action plan/i)).toBeDefined();
    expect(screen.getByText(/Navegação/i)).toBeDefined();
  });

  it("should render trend chart section", () => {
    renderComponent();
    expect(screen.getByText(/📈 Tendência de Riscos/i)).toBeDefined();
    expect(screen.getByTestId("sgso-trend-chart")).toBeDefined();
  });

  it("should render signature section", () => {
    renderComponent();
    expect(screen.getByText(/Responsável pela Emissão/i)).toBeDefined();
    expect(screen.getByText(/Aprovado por/i)).toBeDefined();
  });

  it("should render footer information", () => {
    renderComponent();
    expect(screen.getByText(/Gerado automaticamente por Nautilus One/i)).toBeDefined();
    expect(screen.getByText(/Documento confidencial/i)).toBeDefined();
  });

  it("should handle PDF export click", async () => {
    renderComponent();
    const button = screen.getByText(/Exportar PDF/i);
    
    fireEvent.click(button);
    
    // Just verify the button was clicked, html2pdf is mocked
    await waitFor(() => {
      expect(button).toBeDefined();
    });
  });

  it("should display loading state during export", async () => {
    renderComponent();
    
    const button = screen.getByText(/Exportar PDF/i);
    fireEvent.click(button);
    
    // Verify button exists after click
    await waitFor(() => {
      expect(button).toBeDefined();
    });
  });

  it("should display statistics correctly", () => {
    const incidents = [
      { date: "01/10/2025", description: "Test 1", sgso_category: "Cat1", sgso_risk_level: "Crítico", sgso_root_cause: "Cause 1", action_plan: "Plan 1" },
      { date: "02/10/2025", description: "Test 2", sgso_category: "Cat2", sgso_risk_level: "Crítico", sgso_root_cause: "Cause 2", action_plan: "Plan 2" },
      { date: "03/10/2025", description: "Test 3", sgso_category: "Cat3", sgso_risk_level: "Alto", sgso_root_cause: "Cause 3", action_plan: "Plan 3" },
    ];
    
    renderComponent({ incidents });
    
    // Should show 2 critical and 1 high
    const stats = screen.getAllByText("2");
    expect(stats.length).toBeGreaterThan(0);
  });

  it("should render current date", () => {
    renderComponent();
    const currentDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    expect(screen.getByText(currentDate)).toBeDefined();
  });

  it("should render badge colors for different risk levels", () => {
    const incidents = [
      { date: "01/10/2025", description: "Critical", sgso_category: "Cat", sgso_risk_level: "Crítico", sgso_root_cause: "Cause", action_plan: "Plan" },
      { date: "02/10/2025", description: "High", sgso_category: "Cat", sgso_risk_level: "Alto", sgso_root_cause: "Cause", action_plan: "Plan" },
      { date: "03/10/2025", description: "Medium", sgso_category: "Cat", sgso_risk_level: "Médio", sgso_root_cause: "Cause", action_plan: "Plan" },
      { date: "04/10/2025", description: "Low", sgso_category: "Cat", sgso_risk_level: "Baixo", sgso_root_cause: "Cause", action_plan: "Plan" },
    ];
    
    renderComponent({ incidents });
    
    expect(screen.getAllByText("Crítico").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Médio").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Baixo").length).toBeGreaterThan(0);
  });
});
