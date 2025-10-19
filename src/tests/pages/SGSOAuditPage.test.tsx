import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SGSOAuditPage from "@/pages/SGSOAuditPage";
import { loadSGSOAudit } from "@/services/sgso-audit-service";
import { toast } from "@/hooks/use-toast";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Mock sgso-audit-service
vi.mock("@/services/sgso-audit-service", () => ({
  loadSGSOAudit: vi.fn(),
}));

// Mock toast hook
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
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

  it("should not load audit data when no vessel is selected", async () => {
    render(<SGSOAuditPage />);
    
    await waitFor(() => {
      expect(loadSGSOAudit).not.toHaveBeenCalled();
    });
  });

  it("should load and populate audit data when vessel is selected", async () => {
    const mockAudits = [
      {
        id: "audit-1",
        audit_date: "2025-10-15",
        auditor_id: "auditor-1",
        sgso_audit_items: [
          {
            id: "item-1",
            requirement_number: 1,
            requirement_title: "Política de SMS",
            compliance_status: "partial" as const,
            evidence: "Evidência de teste",
            comment: "Comentário de teste"
          },
          {
            id: "item-2",
            requirement_number: 2,
            requirement_title: "Planejamento Operacional",
            compliance_status: "non-compliant" as const,
            evidence: "Sem evidência",
            comment: "Precisa melhorar"
          }
        ]
      }
    ];

    vi.mocked(loadSGSOAudit).mockResolvedValue(mockAudits);

    render(<SGSOAuditPage />);
    
    // Open the select dropdown and choose a vessel
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);
    
    // Wait for options to appear and select one
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(loadSGSOAudit).toHaveBeenCalledWith("1");
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "✅ Última auditoria carregada",
        description: "Os dados da auditoria anterior foram carregados com sucesso."
      });
    });
  });

  it("should show error toast when loading audit fails", async () => {
    const errorMessage = "Network error";
    vi.mocked(loadSGSOAudit).mockRejectedValue(new Error(errorMessage));

    render(<SGSOAuditPage />);
    
    // Open the select dropdown and choose a vessel
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);
    
    // Wait for options to appear and select one
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(loadSGSOAudit).toHaveBeenCalledWith("1");
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erro ao carregar auditoria",
        description: errorMessage,
        variant: "destructive"
      });
    });
  });

  it("should not show toast when no audits are found for vessel", async () => {
    vi.mocked(loadSGSOAudit).mockResolvedValue([]);

    render(<SGSOAuditPage />);
    
    // Open the select dropdown and choose a vessel
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);
    
    // Wait for options to appear and select one
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(loadSGSOAudit).toHaveBeenCalledWith("1");
    });

    // Toast should not be called when no audits are found
    await waitFor(() => {
      expect(toast).not.toHaveBeenCalled();
    });
  });
});
