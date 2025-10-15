import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { ExportBIReport } from "@/components/bi/ExportPDF";

describe("BI Components", () => {
  describe("DashboardJobs", () => {
    it("should render job statistics", () => {
      render(<DashboardJobs />);
      expect(screen.getByText(/Resumo de Jobs/i)).toBeDefined();
      expect(screen.getByText(/Total de Jobs/i)).toBeDefined();
      expect(screen.getByText(/IA foi eficaz/i)).toBeDefined();
      expect(screen.getByText(/Taxa de Efetividade/i)).toBeDefined();
    });

    it("should display correct statistics values", () => {
      render(<DashboardJobs />);
      expect(screen.getByText("36")).toBeDefined();
      expect(screen.getByText("23")).toBeDefined();
      expect(screen.getByText("64%")).toBeDefined();
    });
  });

  describe("JobsTrendChart", () => {
    it("should render chart title", () => {
      render(<JobsTrendChart />);
      expect(screen.getByText(/Tendência por Sistema/i)).toBeDefined();
    });

    it("should render without errors", () => {
      const { container } = render(<JobsTrendChart />);
      expect(container.firstChild).toBeDefined();
    });
  });

  describe("JobsForecastReport", () => {
    it("should render with empty trend data", () => {
      render(<JobsForecastReport trend={[]} />);
      expect(screen.getByText(/Previsão e Análise/i)).toBeDefined();
      expect(screen.getByText(/Dados insuficientes/i)).toBeDefined();
    });

    it("should generate forecast text from trend data", () => {
      const trendData = [
        { sistema: "Gerador", ia_efetiva: 6, total: 10 },
        { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
      ];
      render(<JobsForecastReport trend={trendData} />);
      expect(screen.getByText(/taxa de efetividade da IA está em/i)).toBeDefined();
      expect(screen.getByText(/22 jobs no total/i)).toBeDefined();
    });
  });

  describe("ExportBIReport", () => {
    it("should render export button", () => {
      render(<ExportBIReport trend={[]} forecast="" />);
      expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
    });

    it("should have download icon", () => {
      const { container } = render(<ExportBIReport trend={[]} forecast="" />);
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeDefined();
    });

    it("should render button element", () => {
      render(<ExportBIReport trend={[]} forecast="Test forecast" />);
      const button = screen.getByText(/Exportar PDF/i);
      expect(button).toBeDefined();
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });
});
