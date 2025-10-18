import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ComplianceByVesselTable } from "@/components/bi/ComplianceByVesselTable";

// Mock fetch
global.fetch = vi.fn();

describe("ComplianceByVesselTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<ComplianceByVesselTable />);
    
    expect(screen.getByText("Carregando dados...")).toBeDefined();
  });

  it("should render table with data after successful fetch", async () => {
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

    render(<ComplianceByVesselTable />);

    await waitFor(() => {
      expect(screen.getByText(/Detalhamento por Embarcação/i)).toBeDefined();
      expect(screen.getByText("Ocean Star")).toBeDefined();
      expect(screen.getByText("Sea Pioneer")).toBeDefined();
    });
  });

  it("should render table headers", async () => {
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

    render(<ComplianceByVesselTable />);

    await waitFor(() => {
      expect(screen.getByText("Navio")).toBeDefined();
      expect(screen.getByText("Total")).toBeDefined();
      expect(screen.getByText("Concluído")).toBeDefined();
      expect(screen.getByText("Em Andamento")).toBeDefined();
      expect(screen.getByText("Pendente")).toBeDefined();
    });
  });

  it("should render error state and sample data on fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    render(<ComplianceByVesselTable />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados de conformidade por navio/i)).toBeDefined();
      expect(screen.getByText(/exibindo dados de exemplo/i)).toBeDefined();
    });
  });

  it("should display legend information", async () => {
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

    render(<ComplianceByVesselTable />);

    await waitFor(() => {
      expect(screen.getByText(/Ideal para auditorias e planejamento gerencial/i)).toBeDefined();
      expect(screen.getByText(/Verde = Planos concluídos/i)).toBeDefined();
      expect(screen.getByText(/Amarelo = Planos em andamento/i)).toBeDefined();
      expect(screen.getByText(/Vermelho = Planos pendentes/i)).toBeDefined();
    });
  });
});
