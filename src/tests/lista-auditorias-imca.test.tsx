import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              navio: "MV Atlantic Star",
              data: "2024-01-15",
              norma: "IMCA M 103",
              item_auditado: "Safety Procedures",
              resultado: "Não Conforme",
              comentarios: "Procedimentos de segurança não estão atualizados",
            },
            {
              id: "2",
              navio: "MV Pacific Dream",
              data: "2024-01-20",
              norma: "IMCA M 182",
              item_auditado: "Equipment Maintenance",
              resultado: "Conforme",
              comentarios: "Todos os equipamentos em conformidade",
            },
          ],
          error: null,
        }),
      }),
    }),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock jsPDF and autoTable
vi.mock("jspdf", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      text: vi.fn(),
      save: vi.fn(),
    })),
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("ListaAuditoriasIMCA", () => {
  it("should render the component", () => {
    render(<ListaAuditoriasIMCA />);
    expect(screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i)).toBeDefined();
  });

  it("should render export buttons", () => {
    render(<ListaAuditoriasIMCA />);
    expect(screen.getByText("Exportar PDF")).toBeDefined();
    expect(screen.getByText("Exportar CSV")).toBeDefined();
  });

  it("should display fleet information section", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/Visão Geral/i)).toBeDefined();
      expect(screen.getByText(/Frota auditada:/i)).toBeDefined();
      expect(screen.getByText(/Total de auditorias:/i)).toBeDefined();
    });
  });

  it("should load and display auditorias", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText("MV Atlantic Star")).toBeDefined();
      expect(screen.getByText("MV Pacific Dream")).toBeDefined();
    });
  });

  it("should display correct badges for results", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText("Não Conforme")).toBeDefined();
      expect(screen.getByText("Conforme")).toBeDefined();
    });
  });

  it("should show AI explanation button for non-compliant audits", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      const aiButtons = screen.queryAllByText(/Explicar com IA/i);
      expect(aiButtons.length).toBeGreaterThan(0);
    });
  });

  it("should render without crashing", () => {
    const { container } = render(<ListaAuditoriasIMCA />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
