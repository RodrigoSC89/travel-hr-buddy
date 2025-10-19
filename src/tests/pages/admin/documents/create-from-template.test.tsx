import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateFromTemplate from "@/pages/admin/documents/create-from-template";
import { toast } from "@/hooks/use-toast";

// Mock dependencies
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/documents/api", () => ({
  createDocument: vi.fn().mockResolvedValue("doc-id-123"),
}));

vi.mock("@/components/editor/tiptap", () => ({
  default: ({ content, onChange }: { content: string; onChange: (c: string) => void }) => (
    <div data-testid="tiptap-editor">
      <textarea
        data-testid="editor-content"
        value={typeof content === "string" ? content : JSON.stringify(content)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

describe("CreateFromTemplate Component", () => {
  const mockTemplate = {
    id: "template-1",
    title: "Test Template",
    content: "Hello {{name}}, welcome to {{company}}!",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with template title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    expect(screen.getByText("📄 Criar Documento a partir do Template")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Documento baseado em Test Template")).toBeInTheDocument();
  });

  it("should extract and display variable inputs", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    expect(screen.getByText("🔧 Preencha os campos variáveis:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Valor para name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Valor para company")).toBeInTheDocument();
  });

  it("should apply variables when button is clicked", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Valor para name");
    const companyInput = screen.getByPlaceholderText("Valor para company");
    
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.change(companyInput, { target: { value: "Acme Corp" } });
    
    const applyButton = screen.getByText("⚙️ Aplicar Variáveis");
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Variáveis aplicadas",
        description: "As variáveis foram substituídas com sucesso.",
      });
    });
  });

  it("should hide variable inputs after applying", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Valor para name");
    const companyInput = screen.getByPlaceholderText("Valor para company");
    
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.change(companyInput, { target: { value: "Acme Corp" } });
    
    const applyButton = screen.getByText("⚙️ Aplicar Variáveis");
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.queryByText("🔧 Preencha os campos variáveis:")).not.toBeInTheDocument();
    });
  });

  it("should save document when save button is clicked", async () => {
    const { createDocument } = await import("@/lib/documents/api");
    
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(createDocument).toHaveBeenCalledWith({
        title: "Documento baseado em Test Template",
        content: mockTemplate.content,
      });
    });
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "✅ Documento salvo com sucesso!",
        description: expect.stringContaining("Documento baseado em Test Template"),
      });
    });
  });

  it("should handle template without variables", () => {
    const simpleTemplate = {
      id: "template-2",
      title: "Simple Template",
      content: "This is a simple template without variables.",
    };
    
    render(<CreateFromTemplate template={simpleTemplate} />);
    
    expect(screen.queryByText("🔧 Preencha os campos variáveis:")).not.toBeInTheDocument();
    expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
  });

  it("should allow editing document title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const titleInput = screen.getByPlaceholderText("Título do Documento");
    fireEvent.change(titleInput, { target: { value: "My Custom Title" } });
    
    expect(screen.getByDisplayValue("My Custom Title")).toBeInTheDocument();
  });

  it("should trigger print when export PDF button is clicked", () => {
    const printMock = vi.fn();
    window.print = printMock;
    
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const exportButton = screen.getByText("🖨️ Exportar PDF");
    fireEvent.click(exportButton);
    
    expect(printMock).toHaveBeenCalled();
  });

  it("should handle JSON template content", () => {
    const jsonTemplate = {
      id: "template-3",
      title: "JSON Template",
      content: { type: "doc", content: "Test content with {{variable}}" },
    };
    
    render(<CreateFromTemplate template={jsonTemplate} />);
    
    expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
  });
});
