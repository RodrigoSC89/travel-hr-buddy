import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("DocumentEditor", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it("renders the document editor with title and content fields", () => {
    render(<DocumentEditor />);
    
    expect(screen.getByPlaceholderText("Título do documento")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite o conteúdo/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Salvar/i })).toBeInTheDocument();
  });

  it("shows initial title and content when provided", () => {
    render(
      <DocumentEditor 
        initialTitle="Test Document" 
        initialContent="Test content" 
      />
    );
    
    expect(screen.getByDisplayValue("Test Document")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test content")).toBeInTheDocument();
  });

  it("disables save button when title or content is empty", () => {
    render(<DocumentEditor />);
    
    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button when both title and content are filled", async () => {
    render(<DocumentEditor />);
    
    const titleInput = screen.getByPlaceholderText("Título do documento");
    const contentTextarea = screen.getByPlaceholderText(/Digite o conteúdo/);
    
    fireEvent.change(titleInput, { target: { value: "New Document" } });
    fireEvent.change(contentTextarea, { target: { value: "Some content" } });
    
    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    expect(saveButton).not.toBeDisabled();
  });

  it("saves new document and version on manual save", async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "doc-123" },
          error: null,
        }),
      }),
    });

    const mockVersionInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return { insert: mockInsert };
      }
      if (table === "document_versions") {
        return { insert: mockVersionInsert };
      }
    });

    const onSave = vi.fn();
    render(<DocumentEditor onSave={onSave} />);
    
    const titleInput = screen.getByPlaceholderText("Título do documento");
    const contentTextarea = screen.getByPlaceholderText(/Digite o conteúdo/);
    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    
    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(contentTextarea, { target: { value: "Test Content" } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
      expect(mockVersionInsert).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith("doc-123");
    });
  });

  it("updates existing document and creates version on save", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockVersionInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return { update: mockUpdate };
      }
      if (table === "document_versions") {
        return { insert: mockVersionInsert };
      }
    });

    render(
      <DocumentEditor 
        documentId="existing-doc-123"
        initialTitle="Existing Title"
        initialContent="Existing Content"
      />
    );
    
    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockVersionInsert).toHaveBeenCalled();
    });
  });

  it("displays version count", async () => {
    render(<DocumentEditor />);
    
    expect(screen.getByText(/Total de versões salvas: 0/)).toBeInTheDocument();
  });

  it("shows auto-save information", () => {
    render(<DocumentEditor />);
    
    expect(screen.getByText(/documento é salvo automaticamente 2 segundos/)).toBeInTheDocument();
  });
});
