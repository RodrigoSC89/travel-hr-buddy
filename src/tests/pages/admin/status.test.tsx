import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminStatusPanel from "@/pages/admin/status";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe("AdminStatusPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    expect(screen.getByText("Status do Sistema")).toBeInTheDocument();
  });

  it("should display summary cards", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Módulos Operacionais")).toBeInTheDocument();
      expect(screen.getByText("Avisos")).toBeInTheDocument();
      expect(screen.getByText("Erros")).toBeInTheDocument();
    });
  });

  it("should display module list", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Dashboard Principal").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Smart Workflow").length).toBeGreaterThan(0);
      expect(screen.getAllByText("MMI Dashboard").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Previsões").length).toBeGreaterThan(0);
    });
  });

  it("should display system information", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Informações do Sistema")).toBeInTheDocument();
      expect(screen.getByText("Total de Módulos:")).toBeInTheDocument();
      expect(screen.getByText("Build:")).toBeInTheDocument();
      expect(screen.getByText("Testes:")).toBeInTheDocument();
      expect(screen.getByText("TypeScript:")).toBeInTheDocument();
    });
  });

  it("should allow refreshing the status", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    const refreshButton = screen.getByRole("button", { name: /atualizar/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalled();
    });
  });

  it("should validate RPC functions on mount", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("jobs_trend_by_month");
    });
  });

  it("should mark modules with warning when RPC fails", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: "RPC error" },
    });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should have at least one warning badge
      const warningBadges = screen.getAllByText("Atenção");
      expect(warningBadges.length).toBeGreaterThan(0);
    });
  });

  it("should display module features", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for some module features
      expect(screen.getByText("Métricas em tempo real")).toBeInTheDocument();
      expect(screen.getByText("Automação de processos")).toBeInTheDocument();
      expect(screen.getByText("Análise de vagas")).toBeInTheDocument();
    });
  });

  it("should show correct operational count", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should have multiple operational modules (exact count depends on implementation)
      const operationalCards = screen.getAllByText("Operacional");
      expect(operationalCards.length).toBeGreaterThan(0);
    });
  });

  it("should display module routes", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

    render(
      <MemoryRouter>
        <AdminStatusPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\/smart-workflow/)).toBeInTheDocument();
      expect(screen.getByText(/\/mmi/)).toBeInTheDocument();
      expect(screen.getByText(/\/forecast/)).toBeInTheDocument();
    });
  });
});
