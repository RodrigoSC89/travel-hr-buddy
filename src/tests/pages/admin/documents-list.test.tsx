import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentListPage from "@/pages/admin/documents-list";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => {
  const mockGetUser = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();

  return {
    supabase: {
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    },
    mockGetUser,
    mockSelect,
    mockFrom,
  };
});

import { supabase } from "@/integrations/supabase/client";
const mockGetUser = (supabase as { auth: { getUser: unknown } }).auth.getUser;
const mockFrom = (supabase as { from: unknown }).from;

describe("DocumentListPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [] }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📂 Meus Documentos/i)).toBeInTheDocument();
    });
  });

  it("should show loading message initially", () => {
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando usuário.../i)).toBeInTheDocument();
  });

  it("should show empty message when no documents", async () => {
    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum documento encontrado./i)).toBeInTheDocument();
    });
  });

  it("should display documents when available", async () => {
    const mockDocuments = [
      {
        id: "doc-1",
        title: "Test Document 1",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "doc-2",
        title: "Test Document 2",
        created_at: "2024-01-16T14:45:00Z",
      },
    ];

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockDocuments }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Document 2/i)).toBeInTheDocument();
    });
  });

  it("should render view buttons for each document", async () => {
    const mockDocuments = [
      {
        id: "doc-1",
        title: "Test Document 1",
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockDocuments }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter>
        <DocumentListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const viewButtons = screen.getAllByRole("button", { name: /Visualizar/i });
      expect(viewButtons).toHaveLength(1);
    });
  });
});
