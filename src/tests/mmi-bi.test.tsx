import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MmiBI from "@/pages/MmiBI";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({
      data: [
        { month: "2025-05", total_jobs: 12, monthLabel: "mai de 2025" },
        { month: "2025-06", total_jobs: 15, monthLabel: "jun de 2025" },
      ],
      error: null,
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { forecast: "Test forecast" },
        error: null,
      }),
    },
  },
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

  it("should render PDF export button", async () => {
    render(<MmiBI />);
    await waitFor(() => {
      expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
    });
  });

  it("should render forecast section", async () => {
    render(<MmiBI />);
    await waitFor(() => {
      expect(screen.getByText(/Previsão IA de Jobs/i)).toBeDefined();
    });
  });

  it("should render trend chart section", () => {
    render(<MmiBI />);
    expect(screen.getByText(/Tendência de Jobs Finalizados/i)).toBeDefined();
  });
});
