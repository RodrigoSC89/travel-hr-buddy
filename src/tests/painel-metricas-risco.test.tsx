import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PainelMetricasRisco } from "@/components/admin/PainelMetricasRisco";

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as unknown;

describe("PainelMetricasRisco", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component title", () => {
    render(<PainelMetricasRisco />);
    expect(screen.getByText("📊 Métricas de Risco por Auditoria")).toBeInTheDocument();
  });

  it("should render a card component", () => {
    const { container } = render(<PainelMetricasRisco />);
    const card = container.querySelector("[class*=\"space-y-4\"]");
    expect(card).toBeInTheDocument();
  });
});
