import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MmiBI from "@/pages/MmiBI";

describe("MmiBI Dashboard", () => {
  it("should render the dashboard title", () => {
    render(<MmiBI />);
    expect(screen.getByText(/BI - Efetividade da IA na Manutenção/i)).toBeDefined();
  });

  it("should render all component sections", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Resumo de Jobs/i)).toBeDefined();
    expect(screen.getByText(/Tendência por Sistema/i)).toBeDefined();
    expect(screen.getByText(/Previsão e Análise/i)).toBeDefined();
  });

  it("should render the export button", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<MmiBI />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
