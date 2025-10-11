import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentView from "@/pages/admin/DocumentView";

// Mock data
const mockDocument = {
  id: "doc-123",
  title: "Test Document",
  content: "This is test content",
  created_at: "2024-01-01T12:00:00Z",
  user_id: "user-123",
};

const mockAuthor = {
  email: "author@example.com",
};

const mockUser = {
  id: "current-user-123",
  email: "current@example.com",
};

const mockAdminProfile = {
  role: "admin",
};

const mockEmployeeProfile = {
  role: "employee",
};

// Mock supabase client with factory function
vi.mock("@/integrations/supabase/client", () => {
  const mockSupabaseFrom = vi.fn();
  const mockSupabaseAuth = vi.fn();

  return {
    supabase: {
      auth: {
        getUser: mockSupabaseAuth,
      },
      from: mockSupabaseFrom,
    },
  };
});

describe("DocumentView Component", () => {
  let mockSupabaseAuth: ReturnType<typeof vi.fn>;
  let mockSupabaseFrom: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get mocked supabase
    const { supabase } = await import("@/integrations/supabase/client");
    mockSupabaseAuth = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockSupabaseFrom = supabase.from as ReturnType<typeof vi.fn>;
  });

  it("should render loading state initially", () => {
    // Setup mock for auth
    mockSupabaseAuth.mockResolvedValue({
      data: { user: mockUser },
    });

    // Setup mock for profiles
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEmployeeProfile })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => new Promise(() => {})), // Never resolves to keep loading
          })),
        })),
      };
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando documento.../i)).toBeInTheDocument();
  });

  it("should render document title and content for non-admin users", async () => {
    // Setup mock for auth
    mockSupabaseAuth.mockResolvedValue({
      data: { user: mockUser },
    });

    // Setup mock for profiles and documents
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEmployeeProfile })),
            })),
          })),
        };
      }
      if (table === "documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockDocument })),
            })),
          })),
        };
      }
      return {};
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📄 Test Document/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/This is test content/i)).toBeInTheDocument();
    expect(screen.queryByText(/Autor:/i)).not.toBeInTheDocument();
  });

  it("should show author email only for admin users", async () => {
    // Setup mock for auth
    mockSupabaseAuth.mockResolvedValue({
      data: { user: mockUser },
    });

    // Setup mock for profiles and documents
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn((fields: string) => {
            if (fields === "role") {
              return {
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: mockAdminProfile })),
                })),
              };
            }
            if (fields === "email") {
              return {
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: mockAuthor })),
                })),
              };
            }
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockAdminProfile })),
              })),
            };
          }),
        };
      }
      if (table === "documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockDocument })),
            })),
          })),
        };
      }
      return {};
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📄 Test Document/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Autor: author@example.com/i)).toBeInTheDocument();
    });
  });

  it("should show error message when document is not found", async () => {
    // Setup mock for auth
    mockSupabaseAuth.mockResolvedValue({
      data: { user: mockUser },
    });

    // Setup mock for profiles and documents
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEmployeeProfile })),
            })),
          })),
        };
      }
      if (table === "documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null })),
            })),
          })),
        };
      }
      return {};
    });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado./i)).toBeInTheDocument();
    });
  });
});
