import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentListPage from "@/pages/admin/documents/list";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            then: vi.fn(),
          })),
          then: vi.fn(),
        })),
      })),
    })),
  },
}));

const { supabase: mockSupabase } = await import("@/integrations/supabase/client");

describe("DocumentListPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: null });
    
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Carregando usuário.../i)).toBeInTheDocument();
  });

  it("should render page title for regular user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });
    
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Meus Documentos/i)).toBeInTheDocument();
    });
  });

  it("should render page title for admin user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@empresa.com" } },
    });
    
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Todos os Documentos/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    });
  });

  it("should show empty state when no documents", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });
    
    const mockSelect = vi.fn(() => ({
      order: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }));
    
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    });
    
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhum documento encontrado/i)).toBeInTheDocument();
    });
  });
});
