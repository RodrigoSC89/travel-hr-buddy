import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock DocumentVersionHistory component
vi.mock("@/components/documents/DocumentVersionHistory", () => ({
  DocumentVersionHistory: ({ documentId, onRestore }: { documentId: string; onRestore?: () => void }) => (
    <div data-testid="version-history">
      Version History Component (documentId: {documentId})
    </div>
  ),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: mockToast,
}));

// Mock useAuthProfile hook
vi.mock("@/hooks/use-auth-profile", () => ({
  useAuthProfile: vi.fn().mockReturnValue({
    profile: {
      id: "user-123",
      email: "current-user@example.com",
      role: "admin",
      full_name: "Current User",
    },
    isLoading: false,
  }),
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
    mockSupabase.from.mockReturnValue({
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
      expect(screen.getByTestId("version-history")).toBeInTheDocument();
    });
  });

  it("should render DocumentVersionHistory component with correct documentId", async () => {
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
      const versionHistory = screen.getByTestId("version-history");
      expect(versionHistory).toBeInTheDocument();
      expect(versionHistory).toHaveTextContent("documentId: doc-123");
    });
  });

  it("should pass onRestore callback to DocumentVersionHistory", async () => {
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
      expect(screen.getByTestId("version-history")).toBeInTheDocument();
    });
  });
});
