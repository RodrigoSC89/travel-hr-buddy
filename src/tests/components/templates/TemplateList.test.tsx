import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TemplateList from "@/components/templates/TemplateList";
import * as supabaseClient from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
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

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe("TemplateList", () => {
  const mockTemplates = [
    {
      id: "1",
      title: "Template 1",
      content: "<p>Content 1</p>",
      is_favorite: true,
      is_private: false,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Template 2",
      content: "<p>Content 2</p>",
      is_favorite: false,
      is_private: true,
      created_at: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      title: "Template 3",
      content: "<p>Content 3</p>",
      is_favorite: false,
      is_private: false,
      created_at: "2024-01-03T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the Supabase query chain
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);
  });

  it("renders without crashing", () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ data: [], error: null });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    expect(screen.getByText("Todos")).toBeInTheDocument();
    expect(screen.getByText("Favoritos")).toBeInTheDocument();
    expect(screen.getByText("Privados")).toBeInTheDocument();
  });

  it("displays templates when loaded", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ data: mockTemplates, error: null });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
      expect(screen.getByText("Template 2")).toBeInTheDocument();
      expect(screen.getByText("Template 3")).toBeInTheDocument();
    });
  });

  it("filters templates by favorites", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    // First call returns all templates
    mockQuery.order.mockResolvedValueOnce({ data: mockTemplates, error: null });
    
    // Second call returns only favorites
    mockQuery.eq.mockResolvedValueOnce({ 
      data: mockTemplates.filter(t => t.is_favorite), 
      error: null 
    });

    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const favoritosButton = screen.getByText("Favoritos");
    fireEvent.click(favoritosButton);

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith("is_favorite", true);
    });
  });

  it("handles apply template action", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ data: mockTemplates, error: null });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const applyButtons = screen.getAllByText("Aplicar");
    fireEvent.click(applyButtons[0]);

    expect(localStorage.getItem("applied_template")).toBe("<p>Content 1</p>");
    expect(mockNavigate).toHaveBeenCalledWith("/admin/documents/ai");
  });

  it("handles copy to clipboard action", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ data: mockTemplates, error: null });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Template 1")).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByText("Copiar");
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("<p>Content 1</p>");
      expect(mockToast).toHaveBeenCalledWith({
        title: "Sucesso",
        description: "Conteúdo copiado para a área de transferência",
      });
    });
  });

  it("shows error message when fetch fails", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ 
      data: null, 
      error: { message: "Database error" } 
    });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro",
        description: "Erro ao buscar templates",
        variant: "destructive",
      });
    });
  });

  it("displays empty state when no templates", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    mockQuery.order.mockResolvedValue({ data: [], error: null });
    vi.mocked(supabaseClient.supabase.from).mockReturnValue(mockQuery as any);

    render(
      <BrowserRouter>
        <TemplateList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum template encontrado")).toBeInTheDocument();
    });
  });
});
