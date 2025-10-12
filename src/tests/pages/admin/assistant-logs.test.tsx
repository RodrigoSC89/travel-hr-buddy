import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AssistantLogsPage from "@/pages/admin/assistant-logs";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase client
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseOrder = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => {
      mockSupabaseFrom(...args);
      return {
        select: (...selectArgs: unknown[]) => {
          mockSupabaseSelect(...selectArgs);
          return {
            order: (...orderArgs: unknown[]) => {
              mockSupabaseOrder(...orderArgs);
              return Promise.resolve({ data: [], error: null });
            },
          };
        },
      };
    },
  },
}));

describe("AssistantLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Histórico do Assistente IA/i)).toBeInTheDocument();
  });

  it("should render filter controls", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Filtros/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar em perguntas ou respostas/i)).toBeInTheDocument();
  });

  it("should navigate back when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    const backButton = screen.getByText(/Voltar/i);
    expect(backButton).toBeInTheDocument();
    
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/assistant");
  });

  it("should show loading state initially", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando histórico/i)).toBeInTheDocument();
  });

  it("should display export button", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Exportar CSV/i)).toBeInTheDocument();
    });
  });

  it("should fetch logs on mount", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSupabaseFrom).toHaveBeenCalledWith("assistant_logs");
      expect(mockSupabaseSelect).toHaveBeenCalledWith("*");
      expect(mockSupabaseOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    });
  });
});
