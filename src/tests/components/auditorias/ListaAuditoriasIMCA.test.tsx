import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";

// Mock fetch for API calls
global.fetch = vi.fn();

describe("ListaAuditoriasIMCA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => [],
      ok: true,
    });
  });

  it("should render the component title", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/📋 Auditorias Técnicas Registradas/i)).toBeDefined();
    });
  });

  it("should render the filter input", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      const filterInput = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado/i);
      expect(filterInput).toBeDefined();
    });
  });

  it("should render export buttons", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      const csvButton = screen.getByText(/Exportar CSV/i);
      const pdfButton = screen.getByText(/Exportar PDF/i);
      expect(csvButton).toBeDefined();
      expect(pdfButton).toBeDefined();
    });
  });

  it("should display message when no auditorias are found", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma auditoria registrada/i)).toBeDefined();
    });
  });

  it("should fetch auditorias from API on mount", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auditorias/list");
    });
  });

  it("should display auditorias when data is loaded", async () => {
    const mockAuditorias = [
      {
        id: "1",
        navio: "Navio Teste",
        data: "2024-10-15",
        norma: "IMCA 001",
        item_auditado: "Item de Teste",
        resultado: "Conforme",
        comentarios: "Teste comentario"
      }
    ];

    (global.fetch as any).mockResolvedValue({
      json: async () => mockAuditorias,
      ok: true,
    });

    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Navio Teste/i)).toBeDefined();
      expect(screen.getByText(/IMCA 001/i)).toBeDefined();
      expect(screen.getByText(/Conforme/i)).toBeDefined();
    });
  });
});
