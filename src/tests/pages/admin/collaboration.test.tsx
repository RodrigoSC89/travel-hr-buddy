import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CollaborationPage from "@/pages/admin/collaboration";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({
        data: null,
        error: null,
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({}),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn(() => "12/10/2025, 22:08"),
}));

vi.mock("date-fns/locale", () => ({
  ptBR: {},
}));

describe("CollaborationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the collaboration page with header", () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Colaboração/i)).toBeInTheDocument();
  });

  it("shows refresh button", () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Atualizar/i)).toBeInTheDocument();
  });

  it("shows comment input area", () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );
    
    const textarea = screen.getByPlaceholderText(/Deixe seu comentário/i);
    expect(textarea).toBeInTheDocument();
  });

  it("shows comments section title", () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Comentários da Equipe/i)).toBeInTheDocument();
  });

  it("sets up real-time subscription on mount", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("colab-comments-changes");
    });
  });

  it("shows back button", () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Voltar/i)).toBeInTheDocument();
  });
});
