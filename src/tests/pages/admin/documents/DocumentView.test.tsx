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
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock useAuthProfile hook
vi.mock("@/hooks/use-auth-profile", () => ({
  useAuthProfile: vi.fn().mockReturnValue({
    profile: {
      id: "test-user",
      email: "current-user@example.com",
      role: "admin",
      full_name: "Current User",
    },
    isLoading: false,
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
    } as unknown);
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

  it("should display author information when available", async () => {
    // Mock successful document fetch with author info
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
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
        } as unknown;
      } else if (table === "document_versions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
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
    });

    // Check that author information is displayed
    await waitFor(() => {
      expect(screen.getByText(/Autor: Test User/i)).toBeInTheDocument();
    });
  });

  it("should display author email to admin users", async () => {
    // Mock useAuthProfile to return admin role
    const { useAuthProfile } = await import("@/hooks/use-auth-profile");
    vi.mocked(useAuthProfile).mockReturnValue({
      profile: {
        id: "test-admin",
        email: "admin@example.com",
        role: "admin",
        full_name: "Admin User",
        avatar_url: null,
        department: null,
        position: null,
        phone: null,
        preferences: {
          theme: "system",
          notifications: true,
          language: "pt",
        },
      },
      isLoading: false,
      isUpdating: false,
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
    });

    // Mock successful document fetch with author info
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  title: "Test Document",
                  content: "Test Content",
                  created_at: new Date().toISOString(),
                  generated_by: "user-123",
                  profiles: {
                    email: "author@example.com",
                    full_name: "Document Author",
                  },
                },
                error: null,
              }),
            }),
          }),
        } as unknown;
      } else if (table === "document_versions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
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
    });

    // Check that author email is displayed for admin
    await waitFor(() => {
      expect(screen.getByText(/author@example.com/i)).toBeInTheDocument();
    });
  });

  it("should NOT display author email to non-admin users", async () => {
    // Mock useAuthProfile to return non-admin role (hr_manager)
    const { useAuthProfile } = await import("@/hooks/use-auth-profile");
    vi.mocked(useAuthProfile).mockReturnValue({
      profile: {
        id: "test-hr-manager",
        email: "hr@example.com",
        role: "user", // Non-admin role
        full_name: "HR Manager",
        avatar_url: null,
        department: null,
        position: null,
        phone: null,
        preferences: {
          theme: "system",
          notifications: true,
          language: "pt",
        },
      },
      isLoading: false,
      isUpdating: false,
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
    });

    // Mock successful document fetch with author info
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  title: "Test Document",
                  content: "Test Content",
                  created_at: new Date().toISOString(),
                  generated_by: "user-123",
                  profiles: {
                    email: "author@example.com",
                    full_name: "Document Author",
                  },
                },
                error: null,
              }),
            }),
          }),
        } as unknown;
      } else if (table === "document_versions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
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
    });

    // Check that author name is displayed
    await waitFor(() => {
      expect(screen.getByText(/Autor: Document Author/i)).toBeInTheDocument();
    });

    // Check that author email is NOT displayed for non-admin
    expect(screen.queryByText(/author@example.com/i)).not.toBeInTheDocument();
  });
});
