import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MMIHistoryAdminPage from "@/pages/admin/mmi/history";
import type { MMIHistory } from "@/types/mmi";

// Mock the service layer
vi.mock("@/services/mmi/historyService", () => ({
  fetchMMIHistory: vi.fn(),
  getMMIHistoryStats: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock html2pdf
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn(() => ({
      from: vi.fn(() => ({
        save: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

describe("MMI History Admin Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHistories: MMIHistory[] = [
    {
      id: "1",
      vessel_id: "vessel-1",
      system_name: "Engine System",
      task_description: "Regular maintenance check",
      status: "executado",
      executed_at: "2025-10-19T10:00:00Z",
      created_at: "2025-10-19T09:00:00Z",
      vessel: {
        id: "vessel-1",
        name: "Ship Alpha",
      },
    },
    {
      id: "2",
      vessel_id: "vessel-2",
      system_name: "Navigation System",
      task_description: "Software update",
      status: "pendente",
      created_at: "2025-10-19T08:00:00Z",
      vessel: {
        id: "vessel-2",
        name: "Ship Beta",
      },
    },
  ];

  const mockStats = {
    total: 10,
    executado: 5,
    pendente: 3,
    atrasado: 2,
  };

  it("should render the admin page title", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Histórico MMI - Admin")).toBeInTheDocument();
    });
  });

  it("should render statistics cards", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Executados")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Pendentes")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Atrasados")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("should display history records", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
      expect(screen.getByText("Navigation System")).toBeInTheDocument();
      expect(screen.getByText("Ship Alpha")).toBeInTheDocument();
      expect(screen.getByText("Ship Beta")).toBeInTheDocument();
    });
  });

  it("should show loading state", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockImplementation(() => new Promise(() => {}));
    vi.mocked(getMMIHistoryStats).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should display empty state when no records", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue([]);
    vi.mocked(getMMIHistoryStats).mockResolvedValue({
      total: 0,
      executado: 0,
      pendente: 0,
      atrasado: 0,
    });

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
    });
  });

  it("should have an export PDF button", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Exportar Relatório PDF")).toBeInTheDocument();
    });
  });

  it("should display status badges with correct styling", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const executadoBadge = screen.getByText("executado");
      const pendenteBadge = screen.getByText("pendente");
      
      expect(executadoBadge).toBeInTheDocument();
      expect(pendenteBadge).toBeInTheDocument();
    });
  });

  it("should have a status filter dropdown", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    vi.mocked(fetchMMIHistory).mockResolvedValue(mockHistories);
    vi.mocked(getMMIHistoryStats).mockResolvedValue(mockStats);

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });
  });

  it("should handle service errors gracefully", async () => {
    const { fetchMMIHistory, getMMIHistoryStats } = await import("@/services/mmi/historyService");
    const { toast } = await import("sonner");
    
    vi.mocked(fetchMMIHistory).mockRejectedValue(new Error("Service error"));
    vi.mocked(getMMIHistoryStats).mockRejectedValue(new Error("Service error"));

    render(
      <BrowserRouter>
        <MMIHistoryAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar dados");
    });
  });
});
