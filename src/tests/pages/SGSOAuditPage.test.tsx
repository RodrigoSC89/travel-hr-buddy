import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SGSOAuditPage from "@/pages/SGSOAuditPage";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

describe("SGSOAuditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("🛡️ Auditoria SGSO - IBAMA")).toBeInTheDocument();
  });

  it("should render vessel selector", () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("Selecione a Embarcação")).toBeInTheDocument();
  });

  it("should render all 17 SGSO requirements", () => {
    render(<SGSOAuditPage />);
    expect(screen.getAllByText(/1\. Política de SMS/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/17\. Melhoria Contínua/)[0]).toBeInTheDocument();
  });

  it("should render export PDF button", () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("📄 Exportar PDF")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("📤 Enviar Auditoria SGSO")).toBeInTheDocument();
  });

  it("should call html2pdf when export PDF button is clicked", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    render(<SGSOAuditPage />);
    
    const exportButton = screen.getByText("📄 Exportar PDF");
    fireEvent.click(exportButton);

    expect(html2pdf).toHaveBeenCalled();
  });

  it("should have hidden PDF container with correct id", () => {
    const { container } = render(<SGSOAuditPage />);
    const pdfContainer = container.querySelector("#sgso-audit-pdf");
    expect(pdfContainer).toBeInTheDocument();
    expect(pdfContainer).toHaveClass("hidden");
  });

  it("should update audit data when evidence is entered", () => {
    render(<SGSOAuditPage />);
    const evidenceInputs = screen.getAllByPlaceholderText("📄 Descreva a evidência observada");
    
    fireEvent.change(evidenceInputs[0], { target: { value: "Evidência teste" } });
    expect(evidenceInputs[0]).toHaveValue("Evidência teste");
  });

  it("should update audit data when comment is entered", () => {
    render(<SGSOAuditPage />);
    const commentInputs = screen.getAllByPlaceholderText("💬 Comentário adicional ou observação");
    
    fireEvent.change(commentInputs[0], { target: { value: "Comentário teste" } });
    expect(commentInputs[0]).toHaveValue("Comentário teste");
  });
});
