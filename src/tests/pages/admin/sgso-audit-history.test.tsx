import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SGSOAuditHistoryPage from "@/pages/admin/sgso/history";

// Mock Supabase client
const mockAudits = [
  {
    id: "audit-1",
    audit_date: "2024-01-15",
    vessel_id: "vessel-1",
    auditor_id: "user-1",
    vessels: { name: "PSV Atlântico" },
    users: { full_name: "João Silva" }
  },
  {
    id: "audit-2",
    audit_date: "2024-01-10",
    vessel_id: "vessel-2",
    auditor_id: "user-2",
    vessels: { name: "AHTS Pacífico" },
    users: { full_name: "Maria Santos" }
  }
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: mockAudits,
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

describe("SGSOAuditHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <BrowserRouter>
        <SGSOAuditHistoryPage />
      </BrowserRouter>
    );
    expect(screen.getByText("🗂️ Histórico de Auditorias SGSO")).toBeInTheDocument();
  });

  it("should render loading state initially", () => {
    const { container } = render(
      <BrowserRouter>
        <SGSOAuditHistoryPage />
      </BrowserRouter>
    );
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render audit cards after loading", async () => {
    render(
      <BrowserRouter>
        <SGSOAuditHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("PSV Atlântico")).toBeInTheDocument();
    });

    expect(screen.getByText("AHTS Pacífico")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  it("should render review links for each audit", async () => {
    render(
      <BrowserRouter>
        <SGSOAuditHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const links = screen.getAllByText("🔍 Reabrir Auditoria");
      expect(links).toHaveLength(2);
    });
  });

  it("should render back button", () => {
    render(
      <BrowserRouter>
        <SGSOAuditHistoryPage />
      </BrowserRouter>
    );
    expect(screen.getByText("Voltar")).toBeInTheDocument();
  });
});
