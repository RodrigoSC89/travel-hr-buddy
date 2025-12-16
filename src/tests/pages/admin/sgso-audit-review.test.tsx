import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SGSOAuditReviewPage from "@/pages/admin/sgso/review/[id]";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Mock audit data
const mockAudit = {
  id: "audit-1",
  audit_date: "2024-01-15",
  vessel_id: "vessel-1",
  auditor_id: "user-1",
  vessels: { name: "PSV Atlântico" },
  users: { full_name: "João Silva" },
  sgso_audit_items: [
    {
      id: "item-1",
      requirement_number: 1,
      requirement_title: "Liderança e Responsabilidade",
      compliance_status: "compliant",
      evidence: "Evidência teste",
      comment: "Comentário teste"
    },
    {
      id: "item-2",
      requirement_number: 2,
      requirement_title: "Identificação de Perigos",
      compliance_status: "partial",
      evidence: "Evidência parcial",
      comment: "Necessita melhorias"
    }
  ]
};

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: mockAudit,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          error: null
        }))
      }))
    }))
  }
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe("SGSOAuditReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialPath = "/admin/sgso/review/audit-1") => {
    window.history.pushState({}, "", initialPath);
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/admin/sgso/review/:id" element={<SGSOAuditReviewPage />} />
        </Routes>
      </BrowserRouter>
    );
  };

  it("should render loading state initially", () => {
    const { container } = renderWithRouter();
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render page title after loading", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Revisão de Auditoria SGSO")).toBeInTheDocument();
    });
  });

  it("should render audit information", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("PSV Atlântico")).toBeInTheDocument();
    });

    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("should render audit items", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Liderança e Responsabilidade/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Identificação de Perigos/)).toBeInTheDocument();
  });

  it("should render action buttons", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Salvar Alterações")).toBeInTheDocument();
    });

    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getByText("Voltar")).toBeInTheDocument();
  });

  it("should render compliance status badges", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getAllByText("Conforme").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("Parcialmente Conforme").length).toBeGreaterThan(0);
  });
});
