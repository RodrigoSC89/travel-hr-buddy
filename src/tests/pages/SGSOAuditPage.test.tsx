import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SGSOAuditPage from "@/pages/SGSOAuditPage";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock AuthContext
const mockUser = { id: "user-123", email: "test@example.com" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    session: null,
    isLoading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

// Mock Supabase client
const mockVessels = [
  { id: "1", name: "PSV Atlântico" },
  { id: "2", name: "AHTS Pacífico" },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: mockVessels,
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: "audit-123" },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock submit function
vi.mock("@/lib/sgso/submit", () => ({
  submitSGSOAudit: vi.fn(),
}));

// Mock loadSGSOAudit function
vi.mock("@/services/sgso-audit-service", () => ({
  loadSGSOAudit: vi.fn(),
}));

describe("SGSOAuditPage", () => {
  let mockLoadSGSOAudit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const sgsoService = await import("@/services/sgso-audit-service");
    mockLoadSGSOAudit = sgsoService.loadSGSOAudit as ReturnType<typeof vi.fn>;
  });

  it("should render the page title", () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("🛡️ Auditoria SGSO - IBAMA")).toBeInTheDocument();
  });

  it("should render vessel selector", async () => {
    render(<SGSOAuditPage />);
    expect(screen.getByText("Selecione a Embarcação")).toBeInTheDocument();
    
    // Wait for vessels to be loaded
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
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

  it("should not load audit when no vessel is selected", async () => {
    mockLoadSGSOAudit.mockResolvedValue([]);
    
    render(<SGSOAuditPage />);
    
    // Wait a bit to ensure no async calls happen
    await waitFor(() => {
      expect(mockLoadSGSOAudit).not.toHaveBeenCalled();
    });
  });

  it("should load and populate audit data when vessel is selected", async () => {
    const { toast } = await import("sonner");
    const mockAuditData = [
      {
        id: "audit-123",
        audit_date: "2025-10-15",
        auditor_id: "auditor-456",
        sgso_audit_items: [
          {
            requirement_number: 1,
            requirement_title: "Política de SMS",
            compliance_status: "compliant",
            evidence: "Documento aprovado",
            comment: "Tudo conforme"
          },
          {
            requirement_number: 2,
            requirement_title: "Planejamento Operacional",
            compliance_status: "partial",
            evidence: "Parcialmente implementado",
            comment: "Necessita ajustes"
          }
        ]
      }
    ];
    
    mockLoadSGSOAudit.mockResolvedValue(mockAuditData);
    
    render(<SGSOAuditPage />);
    
    // Simulate vessel selection
    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    
    await waitFor(() => {
      const vesselOption = screen.getByText("PSV Atlântico");
      fireEvent.click(vesselOption);
    });
    
    // Wait for the audit to be loaded
    await waitFor(() => {
      expect(mockLoadSGSOAudit).toHaveBeenCalledWith("1");
      expect(toast.success).toHaveBeenCalledWith("✅ Última auditoria carregada.");
    });
  });

  it("should show error toast when loading audit fails", async () => {
    const { toast } = await import("sonner");
    const errorMessage = "Network error";
    mockLoadSGSOAudit.mockRejectedValue(new Error(errorMessage));
    
    render(<SGSOAuditPage />);
    
    // Simulate vessel selection
    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    
    await waitFor(() => {
      const vesselOption = screen.getByText("PSV Atlântico");
      fireEvent.click(vesselOption);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Erro ao carregar auditoria: ${errorMessage}`);
    });
  });

  it("should not show notification when no audits exist", async () => {
    const { toast } = await import("sonner");
    mockLoadSGSOAudit.mockResolvedValue([]);
    
    render(<SGSOAuditPage />);
    
    // Simulate vessel selection
    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    
    await waitFor(() => {
      const vesselOption = screen.getByText("PSV Atlântico");
      fireEvent.click(vesselOption);
    });
    
    await waitFor(() => {
      expect(mockLoadSGSOAudit).toHaveBeenCalledWith("1");
    });
    
    // Should not show success toast when no audits exist
    expect(toast.success).not.toHaveBeenCalled();
  });
});
