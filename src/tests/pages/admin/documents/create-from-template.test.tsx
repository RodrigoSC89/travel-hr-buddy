import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateFromTemplate from "@/pages/admin/documents/create-from-template";
import { createDocument } from "@/lib/documents/api";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("@/lib/documents/api", () => ({
  createDocument: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/components/editor/TipTapEditor", () => ({
  default: ({ content, onChange }: any) => (
    <div data-testid="tiptap-editor" onClick={() => onChange("<p>Updated content</p>")}>
      {content}
    </div>
  ),
}));

describe("CreateFromTemplate", () => {
  const mockTemplate = {
    id: "template-123",
    title: "Test Template",
    content: "<p>Hello {{name}}, welcome to {{company}}!</p>",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page with template information", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    expect(screen.getByText("📄 Criar Documento a partir do Template")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do Documento")).toBeInTheDocument();
  });

  it("extracts and displays variable input fields", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    expect(screen.getByText("🔧 Preencha os campos variáveis:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Valor para name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Valor para company")).toBeInTheDocument();
  });

  it("applies variables when the button is clicked", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Valor para name");
    const companyInput = screen.getByPlaceholderText("Valor para company");
    const applyButton = screen.getByText("⚙️ Aplicar Variáveis");
    
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.change(companyInput, { target: { value: "ACME Corp" } });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      // Variables should be applied to content
      const editor = screen.getByTestId("tiptap-editor");
      expect(editor).toBeInTheDocument();
    });
  });

  it("allows editing the title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const titleInput = screen.getByPlaceholderText("Título do Documento") as HTMLInputElement;
    
    fireEvent.change(titleInput, { target: { value: "My Custom Document" } });
    
    expect(titleInput.value).toBe("My Custom Document");
  });

  it("saves the document when save button is clicked", async () => {
    (createDocument as any).mockResolvedValue({ id: "doc-123" });
    
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(createDocument).toHaveBeenCalled();
    });
  });

  it("handles save errors gracefully", async () => {
    (createDocument as any).mockRejectedValue(new Error("Save failed"));
    
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(createDocument).toHaveBeenCalled();
    });
  });

  it("displays export PDF button", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    expect(screen.getByText("🖨️ Exportar PDF")).toBeInTheDocument();
  });

  it("does not show variable inputs when template has no variables", () => {
    const templateNoVars = {
      id: "template-456",
      title: "Simple Template",
      content: "<p>This is a simple template</p>",
    };
    
    render(<CreateFromTemplate template={templateNoVars} />);
    
    expect(screen.queryByText("🔧 Preencha os campos variáveis:")).not.toBeInTheDocument();
  });
});
