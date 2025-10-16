import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComentariosAuditoria } from "@/components/auditoria/ComentariosAuditoria";

// Mock fetch
global.fetch = vi.fn();

// Mock ExportarComentariosPDF
vi.mock("@/components/sgso/ExportarComentariosPDF", () => ({
  ExportarComentariosPDF: () => <button>Exportar PDF</button>,
}));

describe("ComentariosAuditoria Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("should render the component with header", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    expect(screen.getByText(/Comentários da Auditoria/)).toBeDefined();
  });

  it("should display comment count in header", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    expect(screen.getByText(/Comentários da Auditoria \(0\)/)).toBeDefined();
  });

  it("should render PDF export button", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    expect(screen.getByText("Exportar PDF")).toBeDefined();
  });

  it("should show empty state when no comments", async () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    const emptyMessage = await screen.findByText("Nenhum comentário ainda.");
    expect(emptyMessage).toBeDefined();
  });

  it("should render textarea for new comments", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    const textarea = screen.getByPlaceholderText(/Adicione um comentário sobre a auditoria/);
    expect(textarea).toBeDefined();
  });

  it("should render send button", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    expect(screen.getByText("Enviar Comentário")).toBeDefined();
  });

  it("should fetch comments on mount", () => {
    render(<ComentariosAuditoria auditoriaId="test-123" />);
    expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/test-123/comentarios");
  });
});
