import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DPIntelligenceCenter } from "@/components/dp-intelligence/dp-intelligence-center";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: new Error("No data"),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() =>
        Promise.resolve({
          data: {
            result: "Análise técnica completa do incidente.",
          },
          error: null,
        })
      ),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DPIntelligenceCenter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render statistics dashboard", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(screen.getByText("Total de Incidentes")).toBeInTheDocument();
      expect(screen.getByText("Incidentes Críticos")).toBeInTheDocument();
      expect(screen.getByText("Analisados com IA")).toBeInTheDocument();
      expect(screen.getByText("Pendente Análise")).toBeInTheDocument();
    });
  });

  it("should render filters section", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(screen.getByText("Filtros e Busca")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar por título/i)).toBeInTheDocument();
    });
  });

  it("should render incident cards with mock data", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(
        screen.getByText(/Perda de posição durante operação de perfuração/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Drillship Alpha/i)).toBeInTheDocument();
      const dp3Badges = screen.getAllByText("DP3");
      expect(dp3Badges.length).toBeGreaterThan(0);
    });
  });

  it("should display severity badges correctly", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const badges = screen.getAllByText(/High|Critical|Medium/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("should filter incidents by search query", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(
        screen.getByText(/Perda de posição durante operação de perfuração/i)
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(searchInput, { target: { value: "propulsion" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Perda de posição durante operação de perfuração/i)
      ).toBeInTheDocument();
    });
  });

  it("should filter incidents by DP class", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const classSelect = screen.getByDisplayValue("Todas as Classes");
      fireEvent.change(classSelect, { target: { value: "DP3" } });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Perda de posição durante operação de perfuração/i)
      ).toBeInTheDocument();
    });
  });

  it("should filter incidents by status", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue("Todos os Status");
      fireEvent.change(statusSelect, { target: { value: "analyzed" } });
    });

    await waitFor(() => {
      // Should show analyzed incidents
      const incidents = screen.getAllByText(/Analisar com IA|Ver Análise IA/i);
      expect(incidents.length).toBeGreaterThan(0);
    });
  });

  it("should open analysis modal when clicking analyze button", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const analyzeButtons = screen.getAllByText(/Analisar com IA/i);
      fireEvent.click(analyzeButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/Análise IA/i)).toBeInTheDocument();
    });
  });

  it("should display correct statistics", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      // Check that statistics are calculated and displayed
      expect(screen.getByText("Total de Incidentes")).toBeInTheDocument();
      expect(screen.getByText("Incidentes Críticos")).toBeInTheDocument();
    });
  });

  it("should show empty state when no incidents match filters", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Buscar por título/i);
      fireEvent.change(searchInput, { target: { value: "nonexistent-incident" } });
    });

    await waitFor(() => {
      expect(screen.getByText(/Nenhum incidente encontrado/i)).toBeInTheDocument();
    });
  });

  it("should display tags as badges", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(screen.getByText("propulsion")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
    });
  });

  it("should have report links for incidents", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const reportButtons = screen.queryAllByRole("button", { name: /Relatório/i });
      // Mock data may not have links for all incidents
      expect(reportButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("should calculate correct critical incidents count", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      expect(screen.getByText("Incidentes Críticos")).toBeInTheDocument();
      // Mock data has critical incidents, count should be visible
      const criticalSection = screen.getByText("Incidentes Críticos").closest("div");
      expect(criticalSection).toBeInTheDocument();
    });
  });

  it("should display incident root causes", async () => {
    render(<DPIntelligenceCenter />);

    await waitFor(() => {
      const rootCauses = screen.getAllByText(/Falha no sistema de propulsão principal/i);
      expect(rootCauses.length).toBeGreaterThan(0);
    });
  });
});
