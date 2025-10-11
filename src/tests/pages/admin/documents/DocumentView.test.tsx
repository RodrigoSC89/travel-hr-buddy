import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents/DocumentView";

// Mock supabase client
const mockSupabaseFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockSupabaseFrom,
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

// Mock usePermissions
const mockUsePermissions = vi.fn();
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: mockUsePermissions,
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
    
    // Default mock implementation for usePermissions
    mockUsePermissions.mockReturnValue({
      userRole: "employee",
      permissions: [],
      isLoading: false,
      hasPermission: vi.fn(),
      canAccessModule: vi.fn(),
      getRoleDisplayName: vi.fn(),
    });
    
    // Default mock for document not found
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    });
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

  it("should display author email for admin users", async () => {
    // Mock admin user
    mockUsePermissions.mockReturnValue({
      userRole: "admin",
      permissions: [],
      isLoading: false,
      hasPermission: vi.fn(),
      canAccessModule: vi.fn(),
      getRoleDisplayName: vi.fn(),
    });

    // Mock document with email
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              title: "Test Document",
              content: "Test content",
              created_at: "2024-01-01T00:00:00Z",
              generated_by: "user-123",
              profiles: { email: "author@example.com" },
            },
            error: null,
          }),
        }),
      }),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/author@example.com/i)).toBeInTheDocument();
    });
  });

  it("should not display author email for non-admin users", async () => {
    // Mock non-admin user
    mockUsePermissions.mockReturnValue({
      userRole: "employee",
      permissions: [],
      isLoading: false,
      hasPermission: vi.fn(),
      canAccessModule: vi.fn(),
      getRoleDisplayName: vi.fn(),
    });

    // Mock document with email
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              title: "Test Document",
              content: "Test content",
              created_at: "2024-01-01T00:00:00Z",
              generated_by: "user-123",
              profiles: { email: "author@example.com" },
            },
            error: null,
          }),
        }),
      }),
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.queryByText(/author@example.com/i)).not.toBeInTheDocument();
    });
  });
});
