import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentAIEditorPage from "@/pages/admin/documents/ai-editor";

// Mock TipTap editor
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
      focus: vi.fn(),
      deleteSelection: vi.fn(),
      insertContent: vi.fn(),
    },
    chain: vi.fn(() => ({
      focus: vi.fn().mockReturnThis(),
      deleteSelection: vi.fn().mockReturnThis(),
      insertContent: vi.fn().mockReturnThis(),
      run: vi.fn(),
    })),
    getHTML: vi.fn(() => &quot;<p>Test content</p>"),
    getText: vi.fn(() => "Test content"),
    state: {
      selection: {
        from: 0,
        to: 10,
      },
      doc: {
        textBetween: vi.fn(() => "selected text"),
      },
    },
  })),
  EditorContent: ({ editor }: unknown) => <div data-testid="editor-content">Editor</div>,
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {},
}));

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "test-doc-id" },
            error: null,
          }),
        }),
      }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { rewritten: "Rewritten text" },
        error: null,
      }),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    splitTextToSize: vi.fn(() => ["line 1", "line 2"]),
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("DocumentAIEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render the editor page", () => {
    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    expect(screen.getByText("📝 Editor de Documentos com IA")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do Documento")).toBeInTheDocument();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should apply template from localStorage on mount", async () => {
    const mockSetContent = vi.fn();
    const { useEditor } = await import("@tiptap/react");
    (useEditor as unknown).mockReturnValue({
      commands: {
        setContent: mockSetContent,
      },
      getHTML: vi.fn(() => &quot;<p>Test content</p>"),
      getText: vi.fn(() => "Test content"),
    });

    localStorage.setItem("applied_template", "<p>Template content</p>");
    localStorage.setItem("applied_template_title", "Template Title");

    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSetContent).toHaveBeenCalledWith("<p>Template content</p>");
    });

    const { toast } = await import("@/hooks/use-toast");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Template aplicado",
      })
    );
  });

  it("should navigate to templates page", () => {
    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    const templatesButton = screen.getByText("Templates");
    fireEvent.click(templatesButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/documents/ai/templates");
  });

  it("should save document to database", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { toast } = await import("@/hooks/use-toast");
    
    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByPlaceholderText("Título do Documento");
    fireEvent.change(titleInput, { target: { value: "Test Document" } });

    const saveButton = screen.getByText("Salvar no Supabase");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("ai_generated_documents");
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Documento salvo com sucesso",
        })
      );
    });
  });

  it("should export document as PDF", async () => {
    const { toast } = await import("@/hooks/use-toast");
    
    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByPlaceholderText("Título do Documento");
    fireEvent.change(titleInput, { target: { value: "Test Document" } });

    const exportButton = screen.getByText("Exportar PDF");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "PDF exportado com sucesso",
        })
      );
    });
  });

  it("should show validation error when saving without title", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <DocumentAIEditorPage />
      </MemoryRouter>
    );

    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Título do Documento")).toBeInTheDocument();
    });

    const saveButton = screen.getByText("Salvar no Supabase");
    fireEvent.click(saveButton);

    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that supabase.from was NOT called (validation failed)
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
