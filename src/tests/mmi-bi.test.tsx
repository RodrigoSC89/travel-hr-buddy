import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MmiBI from "@/pages/MmiBI";

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
});
