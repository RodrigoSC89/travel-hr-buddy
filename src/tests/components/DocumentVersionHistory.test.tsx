import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            then: vi.fn(),
          })),
          single: vi.fn(() => ({
            then: vi.fn(),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          then: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        then: vi.fn(),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "test-user-id" } }, error: null })),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("DocumentVersionHistory Component", () => {
  const mockDocumentId = "test-doc-id";
  const mockVersions = [
    {
      id: "version-1",
      document_id: mockDocumentId,
      content: "Latest version content",
      created_at: "2025-10-11T10:00:00Z",
      updated_by: "user-1",
    },
    {
      id: "version-2",
      document_id: mockDocumentId,
      content: "Previous version content",
      created_at: "2025-10-10T10:00:00Z",
      updated_by: "user-1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    // Mock loading state
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => new Promise(() => {})), // Never resolves
        })),
      })),
    }));
    (supabase.from as unknown) = mockFrom;

    render(<DocumentVersionHistory documentId={mockDocumentId} />);
    expect(screen.getByText(/Carregando histórico/i)).toBeInTheDocument();
  });

  it("should render versions list when data is loaded", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockVersions, error: null })),
        })),
      })),
    }));
    (supabase.from as unknown) = mockFrom;

    render(<DocumentVersionHistory documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.getByText(/Histórico de Versões/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Mais recente/i)).toBeInTheDocument();
    });
  });

  it("should display empty state when no versions exist", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    }));
    (supabase.from as unknown) = mockFrom;

    render(<DocumentVersionHistory documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma versão anterior encontrada/i)).toBeInTheDocument();
    });
  });

  it("should show restore button for non-latest versions", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockVersions, error: null })),
        })),
      })),
    }));
    (supabase.from as unknown) = mockFrom;

    render(<DocumentVersionHistory documentId={mockDocumentId} />);

    await waitFor(() => {
      const restoreButtons = screen.getAllByRole("button", { name: /Restaurar/i });
      // Should have 1 restore button (not for the latest version)
      expect(restoreButtons.length).toBe(1);
    });
  });

  it("should display version count correctly", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockVersions, error: null })),
        })),
      })),
    }));
    (supabase.from as unknown) = mockFrom;

    render(<DocumentVersionHistory documentId={mockDocumentId} />);

    await waitFor(() => {
      expect(screen.getByText(/2 versão\(ões\) anterior\(es\) disponível\(is\)/i)).toBeInTheDocument();
    });
  });
});
