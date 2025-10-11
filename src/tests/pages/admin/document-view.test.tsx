import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentView from "@/pages/admin/DocumentView";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      email: "test@example.com",
    },
  }),
}));

// Import the mocked supabase after mocking
import { supabase } from "@/integrations/supabase/client";

describe("DocumentView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Setup mock to never resolve (simulate loading)
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue(new Promise(() => {})),
        }),
      }),
    } as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando documento/i)).toBeInTheDocument();
  });

  it("renders document not found when document does not exist", async () => {
    // Mock user_roles query
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "user_roles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "employee" }, error: null }),
            }),
          }),
        };
      }
      
      if (table === "documents") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    }) as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/non-existent-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado/i)).toBeInTheDocument();
    });
  });

  it("renders document details without author email for non-admin users", async () => {
    const mockDocument = {
      id: "doc-1",
      title: "Test Document",
      content: "This is test content",
      created_at: "2025-01-01T12:00:00Z",
      user_id: "author-id",
    };

    // Mock user_roles query (non-admin)
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "user_roles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "employee" }, error: null }),
            }),
          }),
        };
      }
      
      if (table === "documents") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
            }),
          }),
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    }) as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-1"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/This is test content/i)).toBeInTheDocument();
      expect(screen.queryByText(/Autor:/i)).not.toBeInTheDocument();
    });
  });

  it("renders document details with author email for admin users", async () => {
    const mockDocument = {
      id: "doc-1",
      title: "Test Document",
      content: "This is test content",
      created_at: "2025-01-01T12:00:00Z",
      user_id: "author-id",
    };

    const mockProfile = {
      email: "author@example.com",
    };

    // Mock user_roles query (admin)
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "user_roles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        };
      }
      
      if (table === "documents") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
            }),
          }),
        };
      }
      
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    }) as any);

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-1"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/This is test content/i)).toBeInTheDocument();
      expect(screen.getByText(/Autor: author@example.com/i)).toBeInTheDocument();
    });
  });
});
