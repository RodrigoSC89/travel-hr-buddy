import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplyTemplate from "@/pages/admin/documents/apply-template";
import { toast } from "@/hooks/use-toast";

// Mock dependencies
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/documents/api", () => ({
  createDocument: vi.fn().mockResolvedValue({ id: "test-doc-id" }),
}));

vi.mock("@/components/editor/tiptap-preview", () => ({
  default: ({ content }: { content: string }) => <div data-testid="tiptap-preview">{content}</div>,
}));

describe("ApplyTemplate", () => {
  const mockTemplate = {
    id: "template-1",
    title: "Test Template",
    content: "Hello {{name}}, your {{item}} is ready!",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    is_favorite: false,
    is_private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with template title", () => {
    render(<ApplyTemplate template={mockTemplate} />);
    expect(screen.getByText("📄 Aplicar Template")).toBeInTheDocument();
  });

  it("should extract variables from template content", () => {
    render(<ApplyTemplate template={mockTemplate} />);
    expect(screen.getByPlaceholderText("Preencher: name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Preencher: item")).toBeInTheDocument();
  });

  it("should show message when no variables found", () => {
    const templateNoVars = {
      ...mockTemplate,
      content: "No variables here!",
    };
    render(<ApplyTemplate template={templateNoVars} />);
    expect(screen.getByText("✅ Nenhuma variável para preencher.")).toBeInTheDocument();
  });

  it("should update variable values on input change", () => {
    render(<ApplyTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Preencher: name");
    fireEvent.change(nameInput, { target: { value: "John" } });
    
    expect(nameInput).toHaveValue("John");
  });

  it("should generate preview with substituted variables", async () => {
    render(<ApplyTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Preencher: name");
    const itemInput = screen.getByPlaceholderText("Preencher: item");
    
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.change(itemInput, { target: { value: "order" } });
    
    const previewButton = screen.getByText("👁️ Gerar Preview");
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText("📋 Preview:")).toBeInTheDocument();
      expect(screen.getByTestId("tiptap-preview")).toHaveTextContent("Hello John, your order is ready!");
    });
  });

  it("should show error toast when trying to save without preview", async () => {
    render(<ApplyTemplate template={mockTemplate} />);
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erro",
        description: "Por favor, gere o preview antes de salvar.",
        variant: "destructive",
      });
    });
  });

  it("should save document and show success toast", async () => {
    const { createDocument } = await import("@/lib/documents/api");
    
    render(<ApplyTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Preencher: name");
    fireEvent.change(nameInput, { target: { value: "John" } });
    
    const previewButton = screen.getByText("👁️ Gerar Preview");
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText("📋 Preview:")).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(createDocument).toHaveBeenCalledWith({
        title: "Doc: Test Template",
        content: expect.stringContaining("John"),
      });
      expect(toast).toHaveBeenCalledWith({
        title: "Sucesso",
        description: "Documento salvo com sucesso!",
      });
    });
  });

  it("should handle save failure gracefully", async () => {
    const { createDocument } = await import("@/lib/documents/api");
    vi.mocked(createDocument).mockResolvedValueOnce(null);
    
    render(<ApplyTemplate template={mockTemplate} />);
    
    const previewButton = screen.getByText("👁️ Gerar Preview");
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText("📋 Preview:")).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText("💾 Salvar Documento");
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erro",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    });
  });

  it("should handle duplicate variable names correctly", () => {
    const templateDuplicateVars = {
      ...mockTemplate,
      content: "{{name}} is {{name}}'s name",
    };
    
    render(<ApplyTemplate template={templateDuplicateVars} />);
    
    // Should only show one input for 'name'
    const nameInputs = screen.getAllByPlaceholderText("Preencher: name");
    expect(nameInputs).toHaveLength(1);
  });
});
