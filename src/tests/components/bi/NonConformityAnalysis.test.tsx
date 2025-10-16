import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NonConformityAnalysis from "@/components/bi/NonConformityAnalysis";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NonConformityAnalysis", () => {
  it("renders non-conformity list", () => {
    render(<NonConformityAnalysis />);

    expect(screen.getByText(/análise ia \+ plano de ação/i)).toBeInTheDocument();
  });

  it("shows generate analysis button for each non-conformity", () => {
    render(<NonConformityAnalysis />);

    const analysisButtons = screen.getAllByText(/gerar análise ia/i);
    expect(analysisButtons.length).toBeGreaterThan(0);
  });

  it("generates AI analysis when button is clicked", async () => {
    render(<NonConformityAnalysis />);

    const analysisButtons = screen.getAllByText(/gerar análise ia/i);
    fireEvent.click(analysisButtons[0]);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/analisando/i)).toBeInTheDocument();
    });

    // Wait for analysis to complete
    await waitFor(
      () => {
        expect(screen.getByText(/causa raiz identificada/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows export PDF button after analysis is generated", async () => {
    render(<NonConformityAnalysis />);

    const analysisButtons = screen.getAllByText(/gerar análise ia/i);
    fireEvent.click(analysisButtons[0]);

    await waitFor(
      () => {
        expect(screen.getByText(/exportar pdf/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
