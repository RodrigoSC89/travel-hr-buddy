import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TemplateEditorWithRewrite from "@/components/templates/template-editor-with-rewrite";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock TipTap Editor
vi.mock("@tiptap/react", () => ({
  useEditor: () => ({
    state: {
      doc: {
        textBetween: vi.fn(() => "Test text to rewrite"),
      },
      selection: {
        from: 0,
        to: 20,
      },
    },
    commands: {
      insertContentAt: vi.fn(),
    },
  }),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">Editor Content</div>
  ),
}));

describe("TemplateEditorWithRewrite Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the editor", () => {
    render(<TemplateEditorWithRewrite />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should render the rewrite button", () => {
    render(<TemplateEditorWithRewrite />);
    expect(
      screen.getByRole("button", { name: /Reescrever seleção com IA/i })
    ).toBeInTheDocument();
  });

  it("should show loading state when rewriting", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.functions.invoke).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { result: "Rewritten text" }, error: null } as any), 100)
        )
    );

    render(<TemplateEditorWithRewrite />);
    const button = screen.getByRole("button", {
      name: /Reescrever seleção com IA/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Reescrevendo.../i)).toBeInTheDocument();
    });
  });

  it("should call supabase function on button click", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { result: "Rewritten text" },
      error: null,
    } as unknown);

    render(<TemplateEditorWithRewrite />);
    const button = screen.getByRole("button", {
      name: /Reescrever seleção com IA/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("rewrite-selection", {
        body: { input: "Test text to rewrite" },
      });
    });
  });

  it("should show success toast on successful rewrite", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { toast } = await import("@/hooks/use-toast");
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { result: "Rewritten text" },
      error: null,
    } as unknown);

    render(<TemplateEditorWithRewrite />);
    const button = screen.getByRole("button", {
      name: /Reescrever seleção com IA/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Texto reescrito com sucesso",
        description: "A seleção foi reformulada com IA.",
      });
    });
  });

  it("should show error toast on failure", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { toast } = await import("@/hooks/use-toast");
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error("API Error"),
    } as unknown);

    render(<TemplateEditorWithRewrite />);
    const button = screen.getByRole("button", {
      name: /Reescrever seleção com IA/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erro ao reescrever",
        description: "Não foi possível reescrever o texto. Tente novamente.",
        variant: "destructive",
      });
    });
  });
});
