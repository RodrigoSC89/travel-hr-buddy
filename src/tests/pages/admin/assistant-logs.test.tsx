import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AssistantLogsPage from "@/pages/admin/assistant-logs";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("AssistantLogsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Logs do Assistente IA")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Histórico completo de interações/)).toBeInTheDocument();
  });

  it("should render filters section", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });
  });

  it("should render keyword search input", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Buscar em perguntas e respostas")).toBeInTheDocument();
    });
  });

  it("should render export button", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    // The loading spinner should be present initially
    expect(screen.getByRole("heading", { name: /Logs do Assistente IA/i })).toBeInTheDocument();
  });
});
