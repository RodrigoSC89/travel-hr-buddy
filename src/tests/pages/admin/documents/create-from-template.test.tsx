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
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/components/editor/TipTapEditor", () => ({
  default: ({ content, onChange }: any) => (
    <div data-testid="tiptap-editor">
      <textarea
        data-testid="editor-content"
        value={typeof content === "string" ? content : JSON.stringify(content)}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  ),
}));

describe("CreateFromTemplate", () => {
  const mockTemplate = {
    id: "template-123",
    title: "Welcome Letter",
    content: "<p>Dear {{name}}, welcome to {{company}}!</p>",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page with template title", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    expect(screen.getByText(/Criar Documento a partir do Template/i)).toBeInTheDocument();
  });

  it("should display title input with default value", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    const titleInput = screen.getByPlaceholderText("Título do Documento") as HTMLInputElement;
    expect(titleInput.value).toContain("Documento baseado em Welcome Letter");
  });

  it("should extract variables from template content", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    expect(screen.getByText(/Preencha os campos variáveis/i)).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("company")).toBeInTheDocument();
  });

  it("should allow filling variable values", () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Valor para name") as HTMLInputElement;
    const companyInput = screen.getByPlaceholderText("Valor para company") as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(companyInput, { target: { value: "Acme Corp" } });

    expect(nameInput.value).toBe("John Doe");
    expect(companyInput.value).toBe("Acme Corp");
  });

  it("should apply variables when button is clicked", async () => {
    render(<CreateFromTemplate template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Valor para name");
    const companyInput = screen.getByPlaceholderText("Valor para company");
    const applyButton = screen.getByText(/Aplicar Variáveis/i);

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(companyInput, { target: { value: "Acme Corp" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
    });
  });

  it("should show editor immediately if no variables", () => {
    const templateNoVars = {
      id: "template-456",
      title: "Simple Template",
      content: "<p>No variables here</p>",
    };

    render(<CreateFromTemplate template={templateNoVars} />);
    expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
  });

  it("should call createDocument when save button is clicked", async () => {
    vi.mocked(createDocument).mockResolvedValue({
      id: "doc-123",
      content: "test content",
      title: "Test Document",
    });

    const templateNoVars = {
      id: "template-456",
      title: "Simple Template",
      content: "<p>No variables here</p>",
    };

    render(<CreateFromTemplate template={templateNoVars} />);
    
    const saveButton = screen.getByText(/Salvar Documento/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createDocument).toHaveBeenCalled();
    });
  });

  it("should call onSaved callback after successful save", async () => {
    const mockDoc = {
      id: "doc-123",
      content: "test content",
      title: "Test Document",
    };
    
    vi.mocked(createDocument).mockResolvedValue(mockDoc);
    const onSaved = vi.fn();

    const templateNoVars = {
      id: "template-456",
      title: "Simple Template",
      content: "<p>No variables here</p>",
    };

    render(<CreateFromTemplate template={templateNoVars} onSaved={onSaved} />);
    
    const saveButton = screen.getByText(/Salvar Documento/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(mockDoc);
    });
  });

  it("should handle save error gracefully", async () => {
    vi.mocked(createDocument).mockResolvedValue(null);

    const templateNoVars = {
      id: "template-456",
      title: "Simple Template",
      content: "<p>No variables here</p>",
    };

    render(<CreateFromTemplate template={templateNoVars} />);
    
    const saveButton = screen.getByText(/Salvar Documento/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createDocument).toHaveBeenCalled();
    });
  });
});
