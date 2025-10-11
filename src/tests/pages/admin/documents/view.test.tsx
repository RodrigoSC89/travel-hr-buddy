import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents/view";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

const { supabase: mockSupabase } = await import("@/integrations/supabase/client");

describe("DocumentViewPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => new Promise(() => {})), // Never resolves to keep loading
        })),
      })),
    });
    
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Carregando documento.../i)).toBeInTheDocument();
  });

  it("should render document not found error", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    });
    
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should render document details when found", async () => {
    const mockDocument = {
      id: "doc-1",
      title: "Test Document",
      content: "This is test content",
      created_at: "2024-01-01T12:00:00Z",
      updated_at: "2024-01-01T12:00:00Z",
      user_id: "user-1",
    };
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockDocument, error: null })),
        })),
      })),
    });
    
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-1"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Test Document")).toBeInTheDocument();
      expect(screen.getByText("This is test content")).toBeInTheDocument();
    });
  });

  it("should show back button", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    });
    
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Voltar para lista/i)).toBeInTheDocument();
    });
  });

  it("should handle document with no content", async () => {
    const mockDocument = {
      id: "doc-2",
      title: "Empty Document",
      content: null,
      created_at: "2024-01-01T12:00:00Z",
      updated_at: "2024-01-01T12:00:00Z",
      user_id: "user-1",
    };
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockDocument, error: null })),
        })),
      })),
    });
    
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/doc-2"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Empty Document")).toBeInTheDocument();
      expect(screen.getByText(/Este documento não possui conteúdo/i)).toBeInTheDocument();
    });
  });
});
