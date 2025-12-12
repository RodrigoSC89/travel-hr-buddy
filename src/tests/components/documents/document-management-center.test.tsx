import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DocumentManagementCenter } from "@/components/documents/document-management-center";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock AuthContext with admin role
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

// Mock usePermissions hook with admin role
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => ({
    userRole: "admin",
    permissions: [],
    isLoading: false,
    hasPermission: vi.fn(() => true),
    canAccessModule: vi.fn(() => true),
    getRoleDisplayName: vi.fn(() => "Administrador"),
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("DocumentManagementCenter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Centro de Documentos title", async () => {
    render(
      <MemoryRouter>
        <DocumentManagementCenter />
      </MemoryRouter>
    );

    // Wait for the component to render
    expect(await screen.findByText(/Centro de Documentos/i)).toBeInTheDocument();
  });

  it("should render document management description", async () => {
    render(
      <MemoryRouter>
        <DocumentManagementCenter />
      </MemoryRouter>
    );

    // Check for description text
    expect(await screen.findByText(/Gerencie documentos, contratos e certificações da organização/i)).toBeInTheDocument();
  });

  it("should render upload and export buttons", async () => {
    render(
      <MemoryRouter>
        <DocumentManagementCenter />
      </MemoryRouter>
    );

    // Check for buttons
    expect(await screen.findByText(/Upload Documento/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar Lista/i)).toBeInTheDocument();
  });

  it("should render document statistics cards", async () => {
    render(
      <MemoryRouter>
        <DocumentManagementCenter />
      </MemoryRouter>
    );

    // Check for stats cards
    expect(await screen.findByText(/Total de Documentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Uploads Recentes/i)).toBeInTheDocument();
  });

  it("should render document listing tabs", async () => {
    render(
      <MemoryRouter>
        <DocumentManagementCenter />
      </MemoryRouter>
    );

    // Check for tabs (use getAllByText for tabs with multiple matches)
    expect(await screen.findByText(/Todos os Documentos/i)).toBeInTheDocument();
    const recentTabs = screen.getAllByText(/Recentes/i);
    expect(recentTabs.length).toBeGreaterThan(0);
    const reviewTabs = screen.getAllByText(/Em Revisão/i);
    expect(reviewTabs.length).toBeGreaterThan(0);
    const expiredTabs = screen.getAllByText(/Expirados/i);
    expect(expiredTabs.length).toBeGreaterThan(0);
  });
});
