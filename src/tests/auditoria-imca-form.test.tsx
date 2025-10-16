import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuditoriaIMCAForm } from "@/components/auditorias/AuditoriaIMCAForm";

// Mock the AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id" },
    session: null,
    isLoading: false,
  })),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AuditoriaIMCAForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form title", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      expect(screen.getByText(/📋 Nova Auditoria Técnica IMCA/i)).toBeDefined();
    });
  });

  it("should render all form fields", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      // Check for label texts
      expect(screen.getByText(/Navio \*/i)).toBeDefined();
      expect(screen.getByText(/Data \*/i)).toBeDefined();
      expect(screen.getByText(/Norma IMCA \*/i)).toBeDefined();
      expect(screen.getByText(/Item Auditado \*/i)).toBeDefined();
      expect(screen.getByText(/Resultado \*/i)).toBeDefined();
      expect(screen.getByText(/Comentários \/ Ações Corretivas/i)).toBeDefined();
    });
  });

  it("should render the submit button", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      const button = screen.getByText(/Salvar Auditoria/i);
      expect(button).toBeDefined();
    });
  });

  it("should render select options for navio", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      const selects = screen.getAllByText(/Selecione/i);
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it("should render IMCA standards in select", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      // Check for at least one IMCA standard
      expect(screen.getByText(/IMCA M103/i)).toBeDefined();
    });
  });

  it("should render resultado options", async () => {
    render(<AuditoriaIMCAForm />);
    await waitFor(() => {
      expect(screen.getByText(/✅ Conforme/i)).toBeDefined();
      expect(screen.getByText(/❌ Não Conforme/i)).toBeDefined();
      expect(screen.getByText(/⚠️ Observação/i)).toBeDefined();
    });
  });
});
