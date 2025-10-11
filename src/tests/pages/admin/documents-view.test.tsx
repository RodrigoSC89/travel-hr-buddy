import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents-view";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => {
  const mockFrom = vi.fn();

  return {
    supabase: {
      from: mockFrom,
    },
    mockFrom,
  };
});

import { supabase } from "@/integrations/supabase/client";
const mockFrom = (supabase as { from: unknown }).from;

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock jsPDF
vi.mock("jspdf", () => ({
  default: vi.fn(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    splitTextToSize: vi.fn(() => ["line1", "line2"]),
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

describe("DocumentViewPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading message initially", () => {
    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando documento.../i)).toBeInTheDocument();
  });

  it("should show not found message when document doesn't exist", async () => {
    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should display document when loaded", async () => {
    const mockDocument = {
      id: "test-id",
      title: "Test Document",
      content: "This is test content",
      prompt: "Test prompt",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/This is test content/i)).toBeInTheDocument();
      expect(screen.getByText(/Test prompt/i)).toBeInTheDocument();
    });
  });

  it("should render back button", async () => {
    const mockDocument = {
      id: "test-id",
      title: "Test Document",
      content: "This is test content",
      prompt: "Test prompt",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Voltar/i })).toBeInTheDocument();
    });
  });

  it("should render export PDF button", async () => {
    const mockDocument = {
      id: "test-id",
      title: "Test Document",
      content: "This is test content",
      prompt: "Test prompt",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };

    const mockSelect = vi.fn();
    const mockChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockDocument, error: null }),
    };
    
    mockSelect.mockReturnValue(mockChain);
    mockFrom.mockReturnValue({ select: mockSelect });

    render(
      <MemoryRouter initialEntries={["/admin/documents/view/test-id"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Exportar PDF/i })).toBeInTheDocument();
    });
  });
});
