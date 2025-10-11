import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockDocument = {
  title: "Test Document",
  content: "Test Content",
  created_at: "2025-10-11T10:00:00Z",
};

const mockVersions = [
  {
    id: "version-1",
    document_id: "doc-123",
    content: "Old content version 1",
    created_at: "2025-10-10T10:00:00Z",
    updated_by: null,
  },
  {
    id: "version-2",
    document_id: "doc-123",
    content: "Old content version 2",
    created_at: "2025-10-09T10:00:00Z",
    updated_by: null,
  },
];

const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: "user-123" } },
      error: null,
    })),
  },
};

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock RoleBasedAccess to just render children
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: mockToast,
}));

describe("DocumentViewPage - Version Restoration", () => {
  // Dynamically import the component after mocks are set up
  let DocumentViewPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the component fresh for each test
    const module = await import("@/pages/admin/documents/DocumentView");
    DocumentViewPage = module.default;
  });

  it("should render document with version history component", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => 
                Promise.resolve({
                  data: mockDocument,
                  error: null,
                })
              ),
            })),
          })),
        };
      } else if (table === "document_versions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => 
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {};
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
      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText(/Histórico de Versões/i)).toBeInTheDocument();
    });
  });

  it("should load and display version history automatically", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => 
                Promise.resolve({
                  data: mockDocument,
                  error: null,
                })
              ),
            })),
          })),
        };
      } else if (table === "document_versions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => 
                Promise.resolve({
                  data: mockVersions,
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {};
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
      expect(screen.getByText(/Histórico de Versões/i)).toBeInTheDocument();
      expect(screen.getByText(/Old content version 1/i)).toBeInTheDocument();
    });
  });

  it("should have restore buttons for each version", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => 
                Promise.resolve({
                  data: mockDocument,
                  error: null,
                })
              ),
            })),
          })),
        };
      } else if (table === "document_versions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => 
                Promise.resolve({
                  data: mockVersions,
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {};
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
      const restoreButtons = screen.getAllByRole("button", { name: /Restaurar/i });
      // Only non-latest versions should have restore buttons (mockVersions has 2 versions, so 1 restore button)
      expect(restoreButtons.length).toBe(1);
    });
  });

  it("should display empty state when no versions exist", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => 
                Promise.resolve({
                  data: mockDocument,
                  error: null,
                })
              ),
            })),
          })),
        };
      } else if (table === "document_versions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => 
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {};
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
      expect(screen.getByText(/Nenhuma versão anterior encontrada/i)).toBeInTheDocument();
    });
  });
});
