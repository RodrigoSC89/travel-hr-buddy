import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardAuditorias from "@/pages/admin/dashboard-auditorias";

// Mock fetch
global.fetch = vi.fn();

describe("Dashboard Auditorias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => [
        { nome_navio: "Vessel A", total: 10 },
        { nome_navio: "Vessel B", total: 5 },
      ],
    });
  });

  it("should render the dashboard title", () => {
    render(<DashboardAuditorias />);
    expect(screen.getByText(/Dashboard de Auditorias/i)).toBeDefined();
  });

  it("should render filter inputs", () => {
    render(<DashboardAuditorias />);
    expect(screen.getByText(/Início/i)).toBeDefined();
    expect(screen.getByText(/Fim/i)).toBeDefined();
    expect(screen.getByText(/Usuário \(ID\)/i)).toBeDefined();
  });

  it("should render filter button", () => {
    render(<DashboardAuditorias />);
    expect(screen.getByText(/Filtrar/i)).toBeDefined();
  });

  it("should fetch data on mount", async () => {
    render(<DashboardAuditorias />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auditoria/resumo?");
    });
  });

  it("should render the component without errors", () => {
    const { container } = render(<DashboardAuditorias />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
