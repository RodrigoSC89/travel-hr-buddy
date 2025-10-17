import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListaAuditoriasIMCA } from "@/components/sgso/ListaAuditoriasIMCA";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Mock file-saver
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

// Mock fetch API
global.fetch = vi.fn();

const mockAuditorias = [
  {
    id: "1",
    navio: "PSV Atlântico",
    data: "2024-10-15",
    norma: "IMCA M 179",
    item_auditado: "Sistema de Propulsão",
    resultado: "Conforme",
    comentarios: "Sistema operando dentro dos parâmetros",
  },
  {
    id: "2",
    navio: "AHTS Pacífico",
    data: "2024-10-14",
    norma: "IMCA M 189",
    item_auditado: "Sistema de Emergência",
    resultado: "Não Conforme",
    comentarios: "Necessita manutenção imediata",
  },
  {
    id: "3",
    navio: "OSV Caribe",
    data: "2024-10-13",
    norma: "IMCA M 220",
    item_auditado: "Sistema de Navegação",
    resultado: "Observação",
    comentarios: "Monitorar comportamento",
  },
];

describe("ListaAuditoriasIMCA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ success: true, data: mockAuditorias }),
    });
  });

  it("should render loading state initially", () => {
    render(<ListaAuditoriasIMCA />);
    expect(screen.getByText(/Carregando auditorias.../i)).toBeDefined();
  });

  it("should render component title after loading", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/📋 Auditorias Técnicas Registradas/i)).toBeDefined();
    });
  });

  it("should fetch auditorias on mount", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auditorias/list");
    });
  });

  it("should render export buttons", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/Exportar CSV/i)).toBeDefined();
      expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
    });
  });

  it("should render filter input", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i)).toBeDefined();
    });
  });

  it("should render all auditorias", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/PSV Atlântico/i)).toBeDefined();
      expect(screen.getByText(/AHTS Pacífico/i)).toBeDefined();
      expect(screen.getByText(/OSV Caribe/i)).toBeDefined();
    });
  });

  it("should render auditoria details", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/Sistema de Propulsão/i)).toBeDefined();
      expect(screen.getByText(/Sistema de Emergência/i)).toBeDefined();
      expect(screen.getByText(/Sistema de Navegação/i)).toBeDefined();
    });
  });

  it("should render resultado badges with correct styles", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText("Conforme")).toBeDefined();
      expect(screen.getByText("Não Conforme")).toBeDefined();
      expect(screen.getByText("Observação")).toBeDefined();
    });
  });

  it("should filter auditorias by navio", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/PSV Atlântico/i)).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i);
    fireEvent.change(filterInput, { target: { value: "Pacífico" } });

    await waitFor(() => {
      expect(screen.getByText(/AHTS Pacífico/i)).toBeDefined();
      expect(screen.queryByText(/PSV Atlântico/i)).toBeNull();
    });
  });

  it("should filter auditorias by norma", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/IMCA M 179/i)).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i);
    fireEvent.change(filterInput, { target: { value: "M 189" } });

    await waitFor(() => {
      expect(screen.getByText(/IMCA M 189/i)).toBeDefined();
      expect(screen.queryByText(/IMCA M 179/i)).toBeNull();
    });
  });

  it("should filter auditorias by resultado", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText("Conforme")).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i);
    fireEvent.change(filterInput, { target: { value: "Não Conforme" } });

    await waitFor(() => {
      expect(screen.getByText("Não Conforme")).toBeDefined();
      expect(screen.queryByText("Conforme")).toBeNull();
    });
  });

  it("should show empty state when no auditorias match filter", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/PSV Atlântico/i)).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado.../i);
    fireEvent.change(filterInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma auditoria encontrada/i)).toBeDefined();
      expect(screen.getByText(/Tente ajustar os filtros de busca/i)).toBeDefined();
    });
  });

  it("should call saveAs when CSV export button is clicked", async () => {
    const { saveAs } = await import("file-saver");
    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Exportar CSV/i)).toBeDefined();
    });

    const csvButton = screen.getByText(/Exportar CSV/i);
    fireEvent.click(csvButton);

    expect(saveAs).toHaveBeenCalled();
    const blob = (saveAs as any).mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect((saveAs as any).mock.calls[0][1]).toBe("auditorias_imca.csv");
  });

  it("should call html2pdf when PDF export button is clicked", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
    });

    const pdfButton = screen.getByText(/Exportar PDF/i);
    fireEvent.click(pdfButton);

    expect(html2pdf).toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: false, error: "Database error" }),
    });

    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar auditorias/i)).toBeDefined();
      expect(screen.getByText(/Database error/i)).toBeDefined();
    });
  });

  it("should handle fetch failure", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar auditorias/i)).toBeDefined();
      expect(screen.getByText(/Erro ao conectar com o servidor/i)).toBeDefined();
    });
  });

  it("should display empty state when no auditorias exist", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<ListaAuditoriasIMCA />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma auditoria encontrada/i)).toBeDefined();
    });
  });

  it("should render comentarios when present", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/Sistema operando dentro dos parâmetros/i)).toBeDefined();
      expect(screen.getByText(/Necessita manutenção imediata/i)).toBeDefined();
    });
  });

  it("should format dates correctly", async () => {
    render(<ListaAuditoriasIMCA />);
    await waitFor(() => {
      expect(screen.getByText(/15\/10\/2024/i)).toBeDefined();
      expect(screen.getByText(/14\/10\/2024/i)).toBeDefined();
      expect(screen.getByText(/13\/10\/2024/i)).toBeDefined();
    });
  });
});
