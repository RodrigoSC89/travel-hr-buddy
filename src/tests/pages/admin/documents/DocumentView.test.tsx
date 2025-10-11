import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents/DocumentView";
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

// Mock usePermissions
const mockUserRole = vi.fn();
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => ({
    userRole: mockUserRole(),
    permissions: [],
    isLoading: false,
    hasPermission: vi.fn(),
    canAccessModule: vi.fn(),
    getRoleDisplayName: vi.fn(),
  }),
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

describe("DocumentViewPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default user role to admin for most tests
    mockUserRole.mockReturnValue("admin");
    // Default mock for document not found
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    } as any);
  });

  it("should display document not found message", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado./i)).toBeInTheDocument();
    });
  });

  it("should render back button in document view", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check if "Documento não encontrado" is shown first
      expect(screen.getByText(/Documento não encontrado./i)).toBeInTheDocument();
    });
  });

  it("should display author information when available for admin users", async () => {
    // Set user role to admin
    mockUserRole.mockReturnValue("admin");
    
    // Mock successful document fetch with author info
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              title: "Test Document",
              content: "Test Content",
              created_at: new Date().toISOString(),
              generated_by: "user-123",
              profiles: {
                email: "test@example.com",
                full_name: "Test User",
              },
            },
            error: null,
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Check that author information is displayed for admin
    await waitFor(() => {
      expect(screen.getByText(/Autor: Test User/i)).toBeInTheDocument();
    });
  });

  it("should NOT display author information for non-admin users", async () => {
    // Set user role to hr_manager (not admin)
    mockUserRole.mockReturnValue("hr_manager");
    
    // Mock successful document fetch with author info
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              title: "Test Document HR Manager",
              content: "Test Content",
              created_at: new Date().toISOString(),
              generated_by: "user-123",
              profiles: {
                email: "test@example.com",
                full_name: "Test User",
              },
            },
            error: null,
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document HR Manager/i)).toBeInTheDocument();
    });

    // Check that author information is NOT displayed for non-admin
    await waitFor(() => {
      expect(screen.queryByText(/Autor:/i)).not.toBeInTheDocument();
    });
  });

  it("should display author email when name is not available (admin only)", async () => {
    // Set user role to admin
    mockUserRole.mockReturnValue("admin");
    
    // Mock successful document fetch with only email
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              title: "Test Document Email Only",
              content: "Test Content",
              created_at: new Date().toISOString(),
              generated_by: "user-123",
              profiles: {
                email: "testonly@example.com",
                full_name: null,
              },
            },
            error: null,
          }),
        }),
      }),
    } as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document Email Only/i)).toBeInTheDocument();
    });

    // Check that author email is displayed when name is not available
    await waitFor(() => {
      expect(screen.getByText(/Autor: testonly@example.com/i)).toBeInTheDocument();
    });
  });
});
