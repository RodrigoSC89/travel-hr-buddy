import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ComplianceByVesselChart } from "@/components/bi/ComplianceByVesselChart";

// Mock fetch
global.fetch = vi.fn();

describe("ComplianceByVesselChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<ComplianceByVesselChart />);
    
    expect(screen.getByText("Carregando dados...")).toBeDefined();
  });

  it("should render chart with data after successful fetch", async () => {
    const mockData = [
      {
        vessel: "Ocean Star",
        total: 15,
        concluido: 8,
        andamento: 5,
        pendente: 2,
      },
      {
        vessel: "Sea Pioneer",
        total: 12,
        concluido: 10,
        andamento: 1,
        pendente: 1,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<ComplianceByVesselChart />);

    await waitFor(() => {
      expect(screen.getByText(/Conformidade de Planos de Ação por Navio/i)).toBeDefined();
    });
  });

  it("should render error state and sample data on fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    render(<ComplianceByVesselChart />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados de conformidade por navio/i)).toBeDefined();
      expect(screen.getByText(/exibindo dados de exemplo/i)).toBeDefined();
    });
  });

  it("should display description text", async () => {
    const mockData = [
      {
        vessel: "Ocean Star",
        total: 15,
        concluido: 8,
        andamento: 5,
        pendente: 2,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<ComplianceByVesselChart />);

    await waitFor(() => {
      expect(screen.getByText(/Status dos planos de ação de incidentes DP por embarcação/i)).toBeDefined();
    });
  });
});
