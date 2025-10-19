import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ApplyTemplateModal from "@/_legacy/ApplyTemplateModal";

// Mock templates data
const mockTemplates = [
  {
    id: "1",
    title: "Template 1",
    content: "Hello {{name}}",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Template 2",
    content: "Dear {{recipient}}, this is about {{subject}}",
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Simple Template",
    content: "No variables here",
    created_at: "2024-01-03T00:00:00Z",
  },
];

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: mockTemplates, error: null }),
      })),
    })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

// Import mocked modules
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Mock window.prompt
const originalPrompt = window.prompt;
beforeEach(() => {
  window.prompt = vi.fn();
  vi.clearAllMocks();
});

describe("ApplyTemplateModal Component", () => {
  it("should render the trigger button", () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    expect(screen.getByRole("button", { name: /Aplicar Template/i })).toBeInTheDocument();
  });

  it("should open modal when trigger button is clicked", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Aplicar Template")).toBeInTheDocument();
      expect(screen.getByText(/Selecione um template para aplicar/i)).toBeInTheDocument();
    });
  });

  it("should fetch templates when modal opens", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("ai_document_templates");
    });
  });

  it("should display templates in the list", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.getByText("Template 2")).toBeInTheDocument();
      expect(screen.getByText("Simple Template")).toBeInTheDocument();
    });
  });

  it("should filter templates based on search input", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar template/i);
    fireEvent.change(searchInput, { target: { value: "Simple" } });
    
    await waitFor(() => {
      expect(screen.getByText("Simple Template")).toBeInTheDocument();
      expect(screen.queryByText("Template 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Template 2")).not.toBeInTheDocument();
    });
  });

  it("should show message when no templates match search", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar template/i);
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });
    
    await waitFor(() => {
      expect(screen.getByText("Nenhum template encontrado")).toBeInTheDocument();
    });
  });

  it("should apply template without variables directly", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Simple Template")).toBeInTheDocument();
    });
    
    const templateButton = screen.getByText("Simple Template").closest("button");
    fireEvent.click(templateButton!);
    
    expect(onApply).toHaveBeenCalledWith("No variables here");
    expect(toast).toHaveBeenCalledWith({
      title: "Template aplicado com sucesso",
      description: "O template foi aplicado ao editor.",
    });
  });

  it("should detect and replace single variable in template", async () => {
    window.prompt = vi.fn().mockReturnValue("John");
    
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });
    
    const templateButton = screen.getByText("Template 1").closest("button");
    fireEvent.click(templateButton!);
    
    expect(window.prompt).toHaveBeenCalledWith("Preencha o campo: name");
    expect(onApply).toHaveBeenCalledWith("Hello John");
  });

  it("should detect and replace multiple variables in template", async () => {
    const promptMock = vi.fn();
    promptMock.mockReturnValueOnce("Jane");
    promptMock.mockReturnValueOnce("Meeting");
    window.prompt = promptMock;
    
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 2")).toBeInTheDocument();
    });
    
    const templateButton = screen.getByText("Template 2").closest("button");
    fireEvent.click(templateButton!);
    
    expect(window.prompt).toHaveBeenCalledWith("Preencha o campo: recipient");
    expect(window.prompt).toHaveBeenCalledWith("Preencha o campo: subject");
    expect(onApply).toHaveBeenCalledWith("Dear Jane, this is about Meeting");
  });

  it("should handle user canceling variable input", async () => {
    window.prompt = vi.fn().mockReturnValue(null);
    
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });
    
    const templateButton = screen.getByText("Template 1").closest("button");
    fireEvent.click(templateButton!);
    
    // Variable should remain unchanged when user cancels
    expect(onApply).toHaveBeenCalledWith("Hello {{name}}");
  });

  it("should handle fetch error gracefully", async () => {
    // Override the mock for this test
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error("Fetch failed") }),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown);
    
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    });
  });

  it("should close modal after applying template", async () => {
    const onApply = vi.fn();
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Simple Template")).toBeInTheDocument();
    });
    
    const templateButton = screen.getByText("Simple Template").closest("button");
    fireEvent.click(templateButton!);
    
    await waitFor(() => {
      expect(screen.queryByText("Aplicar Template")).not.toBeInTheDocument();
    });
  });
});

afterEach(() => {
  window.prompt = originalPrompt;
});
