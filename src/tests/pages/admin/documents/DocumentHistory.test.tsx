import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentHistoryPage from "@/pages/admin/documents/DocumentHistory";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user" } },
        error: null,
      }),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock RoleBasedAccess to always allow access
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DocumentHistoryPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for empty versions
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("should render the page with loading state initially", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show loading state initially
    expect(screen.getByText(/Carregando histórico de versões.../i)).toBeInTheDocument();
  });

  it("should display no versions message when there are no versions", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma versão encontrada/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Este documento ainda não possui versões anteriores./i)).toBeInTheDocument();
    });
  });

  it("should render back button that navigates to document view", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /Voltar/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it("should render filter inputs", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Filtrar por Email do Autor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filtrar por Data/i)).toBeInTheDocument();
    });
  });

  it("should display filter section title", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filtros Avançados/i)).toBeInTheDocument();
    });
  });

  it("should filter versions by email", async () => {
    const mockVersions = [
      {
        id: "v1",
        document_id: "123",
        content: "Version 1 content",
        created_at: "2024-01-01T10:00:00Z",
        updated_by: "user1",
        profiles: { email: "alice@example.com" },
      },
      {
        id: "v2",
        document_id: "123",
        content: "Version 2 content",
        created_at: "2024-01-02T10:00:00Z",
        updated_by: "user2",
        profiles: { email: "bob@example.com" },
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockVersions,
            error: null,
          }),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/Filtrar por Email do Autor/i);
    fireEvent.change(emailInput, { target: { value: "alice" } });

    await waitFor(() => {
      expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
      expect(screen.queryByText(/bob@example.com/i)).not.toBeInTheDocument();
    });
  });

  it("should show clear filters button when filters are applied", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Filtrar por Email do Autor/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/Filtrar por Email do Autor/i);
    fireEvent.change(emailInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText(/Limpar Filtros/i)).toBeInTheDocument();
    });
  });

  it("should clear filters when clear button is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Filtrar por Email do Autor/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/Filtrar por Email do Autor/i) as HTMLInputElement;
    const dateInput = screen.getByLabelText(/Filtrar por Data/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-01" } });

    await waitFor(() => {
      expect(emailInput.value).toBe("test@example.com");
      expect(dateInput.value).toBe("2024-01-01");
    });

    const clearButton = screen.getByText(/Limpar Filtros/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(emailInput.value).toBe("");
      expect(dateInput.value).toBe("");
    });
  });
});
