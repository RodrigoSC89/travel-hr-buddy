import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OSPage from "@/pages/admin/mmi/os";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: "1",
              job_id: "job-1",
              forecast_id: "forecast-1",
              descricao: "Manutenção preventiva do motor principal",
              status: "pendente",
              created_at: "2025-10-17T10:00:00Z",
            },
            {
              id: "2",
              job_id: "job-2",
              forecast_id: "forecast-2",
              descricao: "Substituição de rolamentos do gerador auxiliar",
              status: "executado",
              created_at: "2025-10-15T10:00:00Z",
            },
            {
              id: "3",
              job_id: "job-3",
              forecast_id: "forecast-3",
              descricao: "Inspeção do sistema de refrigeração",
              status: "atrasado",
              created_at: "2025-10-10T10:00:00Z",
            },
          ],
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  },
}));

describe("OSPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    render(<OSPage />);
    expect(screen.getByText("🔧 Ordens de Serviço (MMI)")).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<OSPage />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renders OS list from database", async () => {
    render(<OSPage />);

    await waitFor(() => {
      expect(screen.getByText("Manutenção preventiva do motor principal")).toBeInTheDocument();
      expect(screen.getByText("Substituição de rolamentos do gerador auxiliar")).toBeInTheDocument();
      expect(screen.getByText("Inspeção do sistema de refrigeração")).toBeInTheDocument();
    });
  });

  it("displays status badges correctly", async () => {
    render(<OSPage />);

    await waitFor(() => {
      const badges = screen.getAllByText(/pendente|executado|atrasado/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("renders action buttons for each OS", async () => {
    render(<OSPage />);

    await waitFor(() => {
      // Each row should have 3 status buttons (pendente, executado, atrasado)
      const pendenteButtons = screen.getAllByRole("button", { name: "pendente" });
      const executadoButtons = screen.getAllByRole("button", { name: "executado" });
      const atrasadoButtons = screen.getAllByRole("button", { name: "atrasado" });

      expect(pendenteButtons.length).toBe(3);
      expect(executadoButtons.length).toBe(3);
      expect(atrasadoButtons.length).toBe(3);
    });
  });

  it("displays formatted dates correctly", async () => {
    render(<OSPage />);

    await waitFor(() => {
      // Dates should be formatted as dd/MM/yyyy
      expect(screen.getByText("17/10/2025")).toBeInTheDocument();
      expect(screen.getByText("15/10/2025")).toBeInTheDocument();
      expect(screen.getByText("10/10/2025")).toBeInTheDocument();
    });
  });

  it("renders table headers", async () => {
    render(<OSPage />);

    await waitFor(() => {
      expect(screen.getByText("Descrição")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Criado em")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });
  });
});
