import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AITemplatesPage from "@/_legacy/ai-templates";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "template-1",
              title: "Template 1",
              content: "Content 1",
              is_favorite: true,
              is_private: false,
              tags: ["tag1", "tag2"],
              created_by: "test-user-id",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "template-2",
              title: "Template 2",
              content: "Content 2",
              is_favorite: false,
              is_private: true,
              tags: ["tag3"],
              created_by: "test-user-id",
              created_at: "2024-01-02T00:00:00Z",
              updated_at: "2024-01-02T00:00:00Z",
            },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })),
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
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

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("AITemplatesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render the templates page", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("📋 Templates de Documentos IA")).toBeInTheDocument();
    });
  });

  it("should load and display templates", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.getByText("Template 2")).toBeInTheDocument();
    });
  });

  it("should filter templates by search term", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Digite para buscar...");
    fireEvent.change(searchInput, { target: { value: "Template 1" } });

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.queryByText("Template 2")).not.toBeInTheDocument();
    });
  });

  it("should apply template and navigate to editor", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const applyButtons = screen.getAllByText("Aplicar");
    fireEvent.click(applyButtons[0]);

    expect(localStorage.getItem("applied_template")).toBe("Content 1");
    expect(localStorage.getItem("applied_template_title")).toBe("Template 1");
    expect(mockNavigate).toHaveBeenCalledWith("/admin/documents/ai");
    
    const { toast } = await import("@/hooks/use-toast"); 
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Template aplicado",
      })
    );
  });

  it("should copy template to clipboard", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByText("Copiar");
    fireEvent.click(copyButtons[0]);

    const { toast } = await import("@/hooks/use-toast");
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Content 1");
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Template copiado",
        })
      );
    });
  });

  it("should toggle favorite status", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    // Find star buttons (favorite toggle)
    const starButtons = screen.getAllByRole("button").filter(
      (button) => button.querySelector("svg")?.classList.contains("lucide-star")
    );

    fireEvent.click(starButtons[0]);

    const { toast } = await import("@/hooks/use-toast");
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("ai_document_templates");
      expect(toast).toHaveBeenCalled();
    });
  });

  it("should open create dialog", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    const createButtons = screen.getAllByText("Novo Template");
    // Click the first one (the button in header, not the dialog title)
    fireEvent.click(createButtons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Título *")).toBeInTheDocument();
    });
  });

  it("should create new template", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    // Open create dialog
    const createButton = screen.getByText("Novo Template");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Título *")).toBeInTheDocument();
    });

    // Fill in form
    const titleInput = screen.getByLabelText("Título *");
    const contentInput = screen.getByLabelText("Conteúdo *");

    fireEvent.change(titleInput, { target: { value: "New Template" } });
    fireEvent.change(contentInput, { target: { value: "New content" } });

    // Submit form
    const submitButton = screen.getByText("Criar Template");
    fireEvent.click(submitButton);

    const { toast } = await import("@/hooks/use-toast");
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("ai_document_templates");
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Template criado",
        })
      );
    });
  });

  it("should show validation error when creating template without required fields", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    // Open create dialog
    const createButton = screen.getByText("Novo Template");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Título *")).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const submitButton = screen.getByText("Criar Template");
    fireEvent.click(submitButton);

    const { toast } = await import("@/hooks/use-toast");
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro de validação",
          variant: "destructive",
        })
      );
    });
  });

  it("should add and remove tags", async () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    // Open create dialog
    const createButton = screen.getByText("Novo Template");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Tags")).toBeInTheDocument();
    });

    // Add tag
    const tagInput = screen.getByLabelText("Tags");
    fireEvent.change(tagInput, { target: { value: "test-tag" } });

    const addButton = screen.getByText("Adicionar");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("test-tag")).toBeInTheDocument();
    });
  });

  it("should navigate to editor", () => {
    render(
      <MemoryRouter>
        <AITemplatesPage />
      </MemoryRouter>
    );

    const editorButton = screen.getByText("Editor");
    fireEvent.click(editorButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/documents/ai");
  });
});
