import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateFromTemplate from "@/pages/admin/documents/create-from-template";
import { createDocument } from "@/lib/documents/api";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/lib/documents/api", () => ({
  createDocument: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/editor/tiptap", () => ({
  default: ({ content, onChange }: any) => (
    <div data-testid="tiptap-editor">
      <div>{content}</div>
      <button onClick={() => onChange && onChange("edited content")}>Edit</button>
    </div>
  ),
}));

describe("CreateFromTemplate Component", () => {
  const mockTemplate = {
    title: "Test Template",
    content: "<p>Hello {{name}}, welcome to {{company}}!</p>",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with template title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    expect(screen.getByText(/📄 Criar Documento a partir do Template/i)).toBeDefined();
  });

  it("should extract and display variable inputs", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    expect(screen.getByPlaceholderText(/Valor para name/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Valor para company/i)).toBeDefined();
  });

  it("should apply variables when button clicked", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText(/Valor para name/i);
    const companyInput = screen.getByPlaceholderText(/Valor para company/i);
    const applyButton = screen.getByText(/⚙️ Aplicar Variáveis/i);

    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.change(companyInput, { target: { value: "Acme Corp" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Variáveis aplicadas com sucesso!");
    });
  });

  it("should hide variable inputs after applying", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const applyButton = screen.getByText(/⚙️ Aplicar Variáveis/i);
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Valor para name/i)).toBeNull();
    });
  });

  it("should save document when save button clicked", async () => {
    vi.mocked(createDocument).mockResolvedValue({ id: "123", content: "test", title: "test" });

    render(<CreateFromTemplate template={mockTemplate} />);
    
    const saveButton = screen.getByText(/💾 Salvar Documento/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createDocument).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("✅ Documento salvo com sucesso!");
    });
  });

  it("should handle templates without variables", () => {
    const simpleTemplate = {
      title: "Simple Template",
      content: "<p>No variables here</p>",
    };

    render(<CreateFromTemplate template={simpleTemplate} />);
    
    expect(screen.queryByText(/🔧 Preencha os campos variáveis/i)).toBeNull();
  });

  it("should allow editing document title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const titleInput = screen.getByPlaceholderText(/Título do Documento/i);
    fireEvent.change(titleInput, { target: { value: "My Custom Title" } });

    expect(titleInput).toHaveProperty("value", "My Custom Title");
  });

  it("should trigger print for PDF export", () => {
    const printMock = vi.fn();
    window.print = printMock;

    render(<CreateFromTemplate template={mockTemplate} />);
    
    const exportButton = screen.getByText(/🖨️ Exportar PDF/i);
    fireEvent.click(exportButton);

    expect(printMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("🖨️ Abrindo diálogo de impressão...");
  });

  it("should handle JSON template content", () => {
    const jsonTemplate = {
      title: "JSON Template",
      content: JSON.stringify({ text: "Hello {{user}}" }),
    };

    render(<CreateFromTemplate template={jsonTemplate} />);
    
    expect(screen.getByPlaceholderText(/Valor para user/i)).toBeDefined();
  });
});
