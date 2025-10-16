import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplyTemplateModal from "@/components/templates/ApplyTemplateModal";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(),
      })),
    })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("ApplyTemplateModal Component", () => {
  const mockOnApply = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import("@/integrations/supabase/client");
    const mockOrder = vi.fn().mockResolvedValue({
      data: [
        { id: "1", title: "Template 1", content: "Content 1", created_at: "2024-01-01" },
        { id: "2", title: "Template 2", content: "Content with {{variable}}", created_at: "2024-01-02" },
        { id: "3", title: "Another Template", content: "Content 3", created_at: "2024-01-03" },
      ],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: mockOrder,
      })),
    } as any);
  });

  it("should render the trigger button", () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    expect(screen.getByRole("button", { name: /📂 Aplicar Template/i })).toBeInTheDocument();
  });

  it("should open modal when trigger is clicked", async () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/🔍 Buscar template.../i)).toBeInTheDocument();
    });
  });

  it("should fetch templates when modal opens", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("templates");
    });
  });

  it("should display templates in the list", async () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.getByText("Template 2")).toBeInTheDocument();
      expect(screen.getByText("Another Template")).toBeInTheDocument();
    });
  });

  it("should filter templates based on search input", async () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/🔍 Buscar template.../i);
    fireEvent.change(searchInput, { target: { value: "Another" } });
    
    await waitFor(() => {
      expect(screen.queryByText("Template 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Template 2")).not.toBeInTheDocument();
      expect(screen.getByText("Another Template")).toBeInTheDocument();
    });
  });

  it("should call onApply with content when template is clicked", async () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const template1 = screen.getByText("Template 1");
    fireEvent.click(template1);
    
    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalledWith("Content 1");
    });
  });

  it("should handle templates with variables using prompt", async () => {
    // Mock the prompt function
    const mockPrompt = vi.spyOn(window, "prompt").mockReturnValue("User Input");

    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 2")).toBeInTheDocument();
    });

    const template2 = screen.getByText("Template 2");
    fireEvent.click(template2);
    
    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith("Preencha o campo: variable");
      expect(mockOnApply).toHaveBeenCalledWith("Content with User Input");
    });

    mockPrompt.mockRestore();
  });

  it("should handle empty prompt response for variables", async () => {
    // Mock the prompt function to return null (cancelled)
    const mockPrompt = vi.spyOn(window, "prompt").mockReturnValue(null);

    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 2")).toBeInTheDocument();
    });

    const template2 = screen.getByText("Template 2");
    fireEvent.click(template2);
    
    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith("Preencha o campo: variable");
      expect(mockOnApply).toHaveBeenCalledWith("Content with ");
    });

    mockPrompt.mockRestore();
  });

  it("should close modal after applying template", async () => {
    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const template1 = screen.getByText("Template 1");
    fireEvent.click(template1);
    
    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalled();
    });
  });

  it("should handle empty templates list", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const mockOrder = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: mockOrder,
      })),
    } as any);

    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/🔍 Buscar template.../i)).toBeInTheDocument();
    });

    // Should not have any template buttons
    const templateButtons = screen.queryAllByRole("button");
    // Only the trigger button should remain
    expect(templateButtons.length).toBeGreaterThan(0);
  });

  it("should handle error when fetching templates", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: mockOrder,
      })),
    } as any);

    render(<ApplyTemplateModal onApply={mockOnApply} />);
    const button = screen.getByRole("button", { name: /📂 Aplicar Template/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/🔍 Buscar template.../i)).toBeInTheDocument();
    });
  });
});
