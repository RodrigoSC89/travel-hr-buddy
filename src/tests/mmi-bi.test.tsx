import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MmiBI from "@/pages/MmiBI";

describe("MmiBI Dashboard", () => {
  beforeEach(() => {
    // Mock fetch for DashboardJobs component
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("should render the dashboard title", () => {
    render(<MmiBI />);
    expect(screen.getByText(/BI - Efetividade da IA na Manutenção/i)).toBeDefined();
  });

  it("should render the chart title", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Efetividade das Sugestões da IA/i)).toBeDefined();
  });

  it("should render the jobs by component chart", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Falhas por Componente \+ Tempo Médio/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<MmiBI />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
