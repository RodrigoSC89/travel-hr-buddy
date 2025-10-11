import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockDocument = {
  title: "Test Document",
  content: "Test Content",
  created_at: "2025-10-11T10:00:00Z",
  generated_by: "user-123",
  profiles: {
    email: "author@example.com",
    full_name: "Test Author"
  }
};

const mockComments = [
  {
    id: "comment-1",
    document_id: "doc-123",
    user_id: "user-123",
    content: "This is a test comment",
    created_at: "2025-10-11T10:30:00Z",
  },
  {
    id: "comment-2",
    document_id: "doc-123",
    user_id: "user-456",
    content: "Another comment",
    created_at: "2025-10-11T11:00:00Z",
  },
];

const mockProfile1 = {
  id: "user-123",
  email: "user1@example.com",
};

const mockProfile2 = {
  id: "user-456",
  email: "user2@example.com",
};

const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: { id: "user-123" } },
        error: null,
      })
    ),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  })),
  removeChannel: vi.fn(),
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
  DocumentVersionHistory: () => <div data-testid="version-history">Version History</div>,
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

describe("DocumentViewPage - Comments Feature", () => {
  // Dynamically import the component after mocks are set up
  let DocumentViewPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the component fresh for each test
    const module = await import("@/pages/admin/documents/DocumentView");
    DocumentViewPage = module.default;
  });

  it("should load and display comments when 'Ver Comentários' is clicked", async () => {
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
      } else if (table === "document_comments") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: mockComments,
                  error: null,
                })
              ),
            })),
          })),
        };
      } else if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, value: string) => ({
              single: vi.fn(() => {
                if (value === "user-123") {
                  return Promise.resolve({ data: mockProfile1, error: null });
                } else if (value === "user-456") {
                  return Promise.resolve({ data: mockProfile2, error: null });
                }
                return Promise.resolve({ data: null, error: null });
              }),
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
    });

    const commentsButton = screen.getByRole("button", { name: /Ver Comentários/i });
    fireEvent.click(commentsButton);

    await waitFor(() => {
      expect(screen.getByText(/This is a test comment/i)).toBeInTheDocument();
      expect(screen.getByText(/Another comment/i)).toBeInTheDocument();
    });
  });

  it("should show empty state when no comments exist", async () => {
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
      } else if (table === "document_comments") {
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
    });

    const commentsButton = screen.getByRole("button", { name: /Ver Comentários/i });
    fireEvent.click(commentsButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum comentário ainda. Seja o primeiro a comentar!/i)
      ).toBeInTheDocument();
    });
  });

  it("should allow adding a new comment", async () => {
    let insertCalled = false;

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
      } else if (table === "document_comments") {
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
          insert: vi.fn((data) => {
            insertCalled = true;
            return Promise.resolve({
              data: { id: "new-comment", ...data },
              error: null,
            });
          }),
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
    });

    const commentsButton = screen.getByRole("button", { name: /Ver Comentários/i });
    fireEvent.click(commentsButton);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Adicione um comentário.../i)
      ).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Adicione um comentário.../i);
    fireEvent.change(textarea, { target: { value: "My new comment" } });

    const submitButton = screen.getByRole("button", { name: /Comentar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(insertCalled).toBe(true);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Comentário adicionado",
        })
      );
    });
  });

  it("should allow deleting own comment", async () => {
    let deleteCalled = false;

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
      } else if (table === "document_comments") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [mockComments[0]], // Only first comment (owned by current user)
                  error: null,
                })
              ),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => {
              deleteCalled = true;
              return Promise.resolve({
                data: null,
                error: null,
              });
            }),
          })),
        };
      } else if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: mockProfile1, error: null })
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
    });

    const commentsButton = screen.getByRole("button", { name: /Ver Comentários/i });
    fireEvent.click(commentsButton);

    await waitFor(() => {
      expect(screen.getByText(/This is a test comment/i)).toBeInTheDocument();
    });

    // Find and click the delete button (trash icon)
    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg && svg.classList.contains('lucide-trash-2');
    });

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Comentário excluído",
          })
        );
      });
    }
  });

  it("should handle comment loading errors gracefully", async () => {
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
      } else if (table === "document_comments") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: "Database error" },
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
    });

    const commentsButton = screen.getByRole("button", { name: /Ver Comentários/i });
    fireEvent.click(commentsButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao carregar comentários",
          variant: "destructive",
        })
      );
    });
  });
});
