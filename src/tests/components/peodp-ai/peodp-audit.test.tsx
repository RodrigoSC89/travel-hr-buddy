/**
 * PEO-DP Audit Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PEODPAuditComponent } from "@/components/peodp-ai/peodp-audit-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("PEODPAuditComponent", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PEODPAuditComponent />
      </QueryClientProvider>
    );
  };

  it("renders the component with title", () => {
    renderComponent();
    expect(screen.getByText("PEO-DP Inteligente")).toBeInTheDocument();
  });

  it("displays the correct description", () => {
    renderComponent();
    expect(
      screen.getByText(/Auditoria de Conformidade DP baseada em NORMAM-101 e IMCA M 117/i)
    ).toBeInTheDocument();
  });

  it("shows vessel name input field", () => {
    renderComponent();
    expect(screen.getByLabelText(/Nome da Embarcação/i)).toBeInTheDocument();
  });

  it("shows DP class selector", () => {
    renderComponent();
    expect(screen.getByText(/Classe DP/i)).toBeInTheDocument();
  });

  it("displays the audit initiation button", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /Iniciar Auditoria PEO-DP/i })).toBeInTheDocument();
  });

  it("shows information alert about standards", () => {
    renderComponent();
    expect(
      screen.getByText(/A auditoria verificará conformidade com NORMAM-101/i)
    ).toBeInTheDocument();
  });
});
