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

// Create a promise that we can control
let mockPromiseResolve: (value: { data: unknown[]; error: null }) => void;
let mockPromise: Promise<{ data: unknown[]; error: null }>;

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
              // Create a new promise for each call that can be controlled
              mockPromise = new Promise((resolve) => {
                mockPromiseResolve = resolve;
              });
              // Also auto-resolve after a short delay to not hang tests
              setTimeout(() => {
                if (mockPromiseResolve) {
                  mockPromiseResolve({ data: [], error: null });
                }
              }, 100);
              return mockPromise;
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

  it("should show loading state initially", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    // The loading text includes ellipsis
    expect(screen.getByText(/Carregando histórico\.\.\./i)).toBeInTheDocument();
  });

  it("should display export buttons", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/CSV/i)).toBeInTheDocument();
      expect(screen.getByText(/PDF/i)).toBeInTheDocument();
      expect(screen.getByText(/Enviar E-mail/i)).toBeInTheDocument();
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
