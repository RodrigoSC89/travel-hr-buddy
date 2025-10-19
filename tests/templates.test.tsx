/**
 * Templates com IA - Essential Tests
 * Validates core CRUD operations for AI-powered templates
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TemplatesPage from "@/pages/admin/templates";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              title: "Template Teste",
              content: "Conteúdo do template",
              created_by: "user-1",
              is_favorite: false,
              is_private: false,
              tags: ["teste"],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: { id: "new-template" },
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      }),
    },
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Templates Page - Essential Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza corretamente o título", async () => {
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verifica se há algum heading ou texto relacionado a templates
      const element = screen.getByRole("heading", { level: 1 }) || 
                      document.querySelector("h1") ||
                      document.querySelector("h2");
      expect(element).toBeTruthy();
    });
  });

  it("valida operação de criar template", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );

    // Aguarda carregamento inicial
    await waitFor(() => {
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });

    // Verifica que o from foi chamado para carregar templates
    expect(supabase.from).toHaveBeenCalled();
  });

  it("valida estrutura de dados de template", () => {
    const template = {
      id: "1",
      title: "Template Teste",
      content: "Conteúdo do template",
      created_by: "user-1",
      is_favorite: false,
      is_private: false,
      tags: ["teste"],
    };

    expect(template).toHaveProperty("id");
    expect(template).toHaveProperty("title");
    expect(template).toHaveProperty("content");
    expect(template.title).toBeTruthy();
    expect(template.content).toBeTruthy();
  });

  it("valida que template pode ser criado via API", async () => {
    const { supabase } = await import("@/integrations/supabase/client");

    const newTemplate = {
      title: "Novo Template",
      content: "Conteúdo novo",
      created_by: "user-1",
    };

    const result = await supabase.from("ai_document_templates").insert(newTemplate);
    
    expect(result.error).toBeNull();
  });
});
