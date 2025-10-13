import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentHistory from "@/pages/admin/documents/DocumentHistory";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { title: "Test Document" }, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "user-123" } }, error: null })),
    },
  },
}));

// Mock the AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-123" },
    profile: { role: "admin" },
  })),
}));

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock the RoleBasedAccess component
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DocumentHistory Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistory />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should render loading state initially", () => {
    renderComponent();
    expect(screen.getByText("Carregando histórico de versões...")).toBeInTheDocument();
  });

  it("should render the page title and document name after loading", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Histórico Completo de Versões")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Documento:/)).toBeInTheDocument();
    });
  });

  it("should render filter inputs", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("🔍 Filtros Avançados")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Digite o e-mail/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por Data de Criação/)).toBeInTheDocument();
  });

  it("should render back button", async () => {
    renderComponent();

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /Voltar ao Documento/ });
      expect(backButton).toBeInTheDocument();
    });
  });

  it("should display empty state when no versions exist", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma versão encontrada para este documento/)).toBeInTheDocument();
    });
  });

  it("should handle email filter input", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Digite o e-mail/)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/Digite o e-mail/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should handle date filter input", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/Filtrar por Data de Criação/)).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/Filtrar por Data de Criação/);
    fireEvent.change(dateInput, { target: { value: "2024-01-01" } });

    expect(dateInput).toHaveValue("2024-01-01");
  });

  it("should show clear filters button when filters are applied", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Digite o e-mail/)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/Digite o e-mail/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Limpar Filtros/ })).toBeInTheDocument();
    });
  });

  it("should clear filters when clear button is clicked", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Digite o e-mail/)).toBeInTheDocument();
    });

    // Apply filter
    const emailInput = screen.getByPlaceholderText(/Digite o e-mail/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Clear filters
    const clearButton = await screen.findByRole("button", { name: /Limpar Filtros/ });
    fireEvent.click(clearButton);

    expect(emailInput).toHaveValue("");
  });
});
