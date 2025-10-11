import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentsAIPage from "@/pages/admin/documents-ai";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

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

describe("DocumentsAIPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/📄 Documentos com IA/i)).toBeInTheDocument();
  });

  it("should render title input and prompt textarea", () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText(/Título do Documento/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Descreva o que você quer gerar com a IA.../i)).toBeInTheDocument();
  });

  it("should render generate button", () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    expect(screen.getByRole("button", { name: /Gerar com IA/i })).toBeInTheDocument();
  });

  it("should disable generate button when prompt is empty", () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    const generateButton = screen.getByRole("button", { name: /Gerar com IA/i });
    expect(generateButton).toBeDisabled();
  });

  it("should enable generate button when prompt is filled", async () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    const promptInput = screen.getByPlaceholderText(/Descreva o que você quer gerar com a IA.../i);
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });
    
    await waitFor(() => {
      const generateButton = screen.getByRole("button", { name: /Gerar com IA/i });
      expect(generateButton).not.toBeDisabled();
    });
  });

  it("should not show save and export buttons initially", () => {
    render(
      <MemoryRouter>
        <DocumentsAIPage />
      </MemoryRouter>
    );
    
    expect(screen.queryByText(/Salvar no Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Exportar em PDF/i)).not.toBeInTheDocument();
  });
});
