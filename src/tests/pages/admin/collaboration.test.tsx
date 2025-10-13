import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CollaborationPage from "@/pages/admin/collaboration";

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
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Supabase with real-time subscription support
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null,
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
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe("CollaborationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the collaboration page with header", async () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🤝 Colaboração em Tempo Real")).toBeInTheDocument();
    });
  });

  it("shows refresh button", async () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Atualizar")).toBeInTheDocument();
    });
  });

  it("shows comment input area", async () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("💬 Deixe seu comentário ou sugestão...")).toBeInTheDocument();
      expect(screen.getByText("✉️ Enviar Comentário")).toBeInTheDocument();
    });
  });

  it("shows comments section title", async () => {
    render(
      <MemoryRouter>
        <CollaborationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Comentários da Equipe")).toBeInTheDocument();
    });
  });
});
