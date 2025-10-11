import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents/DocumentView";

// Mock variables
const mockUser = { id: "user-123", email: "test@example.com" };
const mockPermissions = {
  userRole: "employee" as const,
  permissions: [],
  isLoading: false,
  hasPermission: vi.fn(() => false),
  canAccessModule: vi.fn(() => false),
  getRoleDisplayName: vi.fn(() => "Funcionário"),
};
const mockSupabaseSelect = vi.fn();

// Mock AuthContext
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
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock usePermissions hook
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => mockPermissions,
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser } })),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("DocumentViewPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => new Promise(() => {})), // Never resolves
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando documento.../i)).toBeInTheDocument();
  });

  it("should display document when user is the owner", async () => {
    const mockDoc = {
      title: "Test Document",
      content: "This is test content",
      created_at: "2024-01-15T10:00:00Z",
      generated_by: "user-123", // Same as mockUser.id
    };

    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockDoc, error: null })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/This is test content/i)).toBeInTheDocument();
    });
  });

  it("should display access denied when user is not owner and not admin", async () => {
    const mockDoc = {
      title: "Test Document",
      content: "This is test content",
      created_at: "2024-01-15T10:00:00Z",
      generated_by: "other-user-456", // Different from mockUser.id
    };

    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockDoc, error: null })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Acesso Negado/i)).toBeInTheDocument();
    });
  });

  it("should display document when user is admin regardless of ownership", async () => {
    // Update mock to return admin role
    mockPermissions.userRole = "admin";

    const mockDoc = {
      title: "Admin View Document",
      content: "Admin can view this",
      created_at: "2024-01-15T10:00:00Z",
      generated_by: "other-user-456", // Different from mockUser.id
    };

    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockDoc, error: null })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Admin View Document/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin can view this/i)).toBeInTheDocument();
    });

    // Reset role for other tests
    mockPermissions.userRole = "employee";
  });

  it("should display document when user is hr_manager regardless of ownership", async () => {
    // Update mock to return hr_manager role
    mockPermissions.userRole = "hr_manager";

    const mockDoc = {
      title: "HR Manager View Document",
      content: "HR Manager can view this",
      created_at: "2024-01-15T10:00:00Z",
      generated_by: "other-user-456", // Different from mockUser.id
    };

    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockDoc, error: null })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/HR Manager View Document/i)).toBeInTheDocument();
      expect(screen.getByText(/HR Manager can view this/i)).toBeInTheDocument();
    });

    // Reset role for other tests
    mockPermissions.userRole = "employee";
  });

  it("should display not found message when document does not exist", async () => {
    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: { message: "Not found" } })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should format creation date correctly", async () => {
    const mockDoc = {
      title: "Date Test Document",
      content: "Test content",
      created_at: "2024-01-15T10:30:00Z",
      generated_by: "user-123",
    };

    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockDoc, error: null })),
      })),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Criado em/i)).toBeInTheDocument();
    });
  });
});
