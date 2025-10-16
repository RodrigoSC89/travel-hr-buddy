import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

describe("ExportarComentariosPDF", () => {
  const mockComentarios = [
    {
      user_id: "user-123",
      created_at: "2025-10-16T10:00:00Z",
      comentario: "Este é um comentário de teste sobre a auditoria.",
    },
    {
      user_id: "user-456",
      created_at: "2025-10-16T11:00:00Z",
      comentario: "Segundo comentário com informações adicionais.",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the export button", () => {
    render(<ExportarComentariosPDF comentarios={mockComentarios} />);
    expect(screen.getByText(/Exportar Comentários \(PDF\)/i)).toBeDefined();
  });

  it("should render button with icon", () => {
    const { container } = render(<ExportarComentariosPDF comentarios={mockComentarios} />);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    // Check for the FileDown icon (lucide-react adds an svg)
    const svg = button?.querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("should be disabled when there are no comments", () => {
    render(<ExportarComentariosPDF comentarios={[]} />);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", true);
  });

  it("should be enabled when there are comments", () => {
    render(<ExportarComentariosPDF comentarios={mockComentarios} />);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", false);
  });

  it("should call html2pdf when button is clicked", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    render(<ExportarComentariosPDF comentarios={mockComentarios} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(html2pdf).toHaveBeenCalled();
  });

  it("should not call html2pdf when there are no comments", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    render(<ExportarComentariosPDF comentarios={[]} />);
    
    const button = screen.getByRole("button");
    // Button is disabled, so click should not work
    fireEvent.click(button);

    expect(html2pdf).not.toHaveBeenCalled();
  });

  it("should render with correct styling classes", () => {
    const { container } = render(<ExportarComentariosPDF comentarios={mockComentarios} />);
    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-slate-700");
    expect(button?.className).toContain("text-white");
  });
});
