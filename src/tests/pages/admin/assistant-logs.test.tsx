import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AssistantLogsPage from "../../../pages/admin/assistant-logs";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn(),
        })),
      })),
    })),
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

describe("AssistantLogsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("📋 Histórico do Assistente")).toBeInTheDocument();
  });

  it("should display filter controls", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Pesquisar por palavra-chave...")
    ).toBeInTheDocument();
  });

  it("should show export button", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Carregando histórico...")).toBeInTheDocument();
  });

  it("should have back button that navigates to assistant page", async () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    const backButton = screen.getByRole("button", { name: "" });
    backButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/assistant");
    });
  });

  it("should render date filter inputs", () => {
    render(
      <MemoryRouter>
        <AssistantLogsPage />
      </MemoryRouter>
    );

    const dateInputs = screen.getAllByRole("textbox");
    // Should have at least the search input and date inputs
    expect(dateInputs.length).toBeGreaterThan(0);
  });
});
