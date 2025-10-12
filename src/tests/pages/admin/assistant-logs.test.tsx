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
const mockSupabaseFunctions = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => {
        mockSupabaseFunctions(...args);
        // Return mock data with user_email
        return Promise.resolve({
          data: [
            {
              id: "1",
              user_id: "user1",
              question: "Test question",
              answer: "Test answer",
              origin: "assistant",
              created_at: new Date().toISOString(),
              user_email: "test@example.com",
            },
          ],
          error: null,
        });
      },
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

  it("should render email filter input", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por e-mail/i)).toBeInTheDocument();
    });
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
      expect(mockSupabaseFunctions).toHaveBeenCalledWith("assistant-logs");
    });
  });
});
