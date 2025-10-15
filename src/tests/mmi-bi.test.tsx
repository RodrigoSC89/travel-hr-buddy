import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MmiBI from "@/pages/MmiBI";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null })
    }
  }
}));

describe("MmiBI Dashboard", () => {
  it("should render the dashboard title", () => {
    render(<MmiBI />);
    expect(screen.getByText(/BI - Efetividade da IA na Manutenção/i)).toBeDefined();
  });

  it("should render the chart title", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Efetividade das Sugestões da IA/i)).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<MmiBI />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it("should render the export PDF button", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
  });

  it("should render the jobs trend chart section", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Tendência de Jobs/i)).toBeDefined();
  });

  it("should render the forecast section", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Previsão IA de Jobs/i)).toBeDefined();
  });
});
