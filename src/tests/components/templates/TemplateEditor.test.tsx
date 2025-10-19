import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TemplateEditor from "@/components/templates/TemplateEditor";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { content: "Test content" }, error: null }),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock TipTap editor
vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => "<p>Test content</p>"),
    commands: {
      setContent: vi.fn(),
    },
  })),
  EditorContent: ({ editor }: unknown) => <div data-testid="editor-content">Editor</div>,
}));

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    from: vi.fn(() => ({
      set: vi.fn(() => ({
        save: vi.fn(),
      })),
    })),
  })),
}));

describe("TemplateEditor Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TemplateEditor />
      </QueryClientProvider>
    );
  };

  it("should render the component successfully", () => {
    renderComponent();
    expect(screen.getByText(/Editor de Templates/i)).toBeInTheDocument();
  });

  it("should render the title input field", () => {
    renderComponent();
    const titleInput = screen.getByPlaceholderText(/Digite o título do template/i);
    expect(titleInput).toBeInTheDocument();
  });

  it("should render all action buttons", () => {
    renderComponent();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole("button", { name: /Gerar com IA/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Salvar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Exportar PDF/i })).toBeInTheDocument();
  });

  it("should render the editor content area", () => {
    renderComponent();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("should display helpful tips", () => {
    renderComponent();
    expect(screen.getByText(/Clique em "Gerar com IA"/i)).toBeInTheDocument();
  });
});
