/**
 * Test suite for MMI Orders Page
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MMIOrdersPage from "@/pages/admin/mmi/orders";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("html2pdf.js", () => {
  const mockSave = vi.fn();
  const mockFrom = vi.fn(() => ({ save: mockSave }));
  const mockSet = vi.fn(() => ({ from: mockFrom }));
  const mockHtml2pdf = vi.fn(() => ({ set: mockSet }));
  
  return {
    default: mockHtml2pdf,
  };
});

const mockOrders = [
  {
    id: "order-1",
    forecast_id: "forecast-1",
    vessel_name: "Navio Teste 1",
    system_name: "Sistema Hidráulico",
    description: "Manutenção preventiva do sistema hidráulico",
    status: "pendente",
    priority: "alta",
    created_by: "user-1",
    created_at: "2025-10-15T10:00:00Z",
    updated_at: "2025-10-15T10:00:00Z",
  },
  {
    id: "order-2",
    forecast_id: "forecast-2",
    vessel_name: "Navio Teste 2",
    system_name: "Sistema Elétrico",
    description: "Verificação de cabos elétricos",
    status: "em_andamento",
    priority: "crítica",
    created_by: "user-2",
    created_at: "2025-10-16T14:30:00Z",
    updated_at: "2025-10-16T14:30:00Z",
  },
  {
    id: "order-3",
    forecast_id: "forecast-3",
    vessel_name: "Navio Teste 3",
    system_name: "Sistema de Navegação",
    description: "Atualização de software de navegação",
    status: "concluido",
    priority: "normal",
    created_by: "user-3",
    created_at: "2025-10-17T09:15:00Z",
    updated_at: "2025-10-17T18:45:00Z",
  },
];

describe("MMIOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render loading state initially", () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    // Check for loading indicator by class or text
    const loadingElements = screen.queryAllByText(/carregando|loading/i);
    const loaderIcons = document.querySelectorAll('[class*="animate-spin"]');
    expect(loadingElements.length > 0 || loaderIcons.length > 0).toBe(true);
  });

  it("should render orders list after loading", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: mockOrders }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Navio Teste 1")).toBeInTheDocument();
      expect(screen.getByText("Navio Teste 2")).toBeInTheDocument();
      expect(screen.getByText("Navio Teste 3")).toBeInTheDocument();
    });
  });

  it("should display correct priority badges", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: mockOrders }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Alta")).toBeInTheDocument();
      expect(screen.getByText("Crítica")).toBeInTheDocument();
      expect(screen.getByText("Média")).toBeInTheDocument();
    });
  });

  it("should display correct status badges", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: mockOrders }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Pendente")).toBeInTheDocument();
      expect(screen.getByText("Em Andamento")).toBeInTheDocument();
      expect(screen.getByText("Concluída")).toBeInTheDocument();
    });
  });

  it("should show 'Iniciar' button for pending orders", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        orders: [mockOrders[0]] // Only pending order
      }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Iniciar")).toBeInTheDocument();
    });
  });

  it("should show 'Concluir' button for in-progress orders", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        orders: [mockOrders[1]] // Only in-progress order
      }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Concluir")).toBeInTheDocument();
    });
  });

  it("should not show action buttons for completed orders", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        orders: [mockOrders[2]] // Only completed order
      }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Iniciar")).not.toBeInTheDocument();
      expect(screen.queryByText("Concluir")).not.toBeInTheDocument();
    });
  });

  it("should update order status when clicking 'Iniciar'", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, orders: [mockOrders[0]] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          order: { ...mockOrders[0], status: "em_andamento" }
        }),
      });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Iniciar")).toBeInTheDocument();
    });

    const startButton = screen.getByText("Iniciar");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/os/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "order-1",
          status: "em_andamento",
        }),
      });
    });
  });

  it("should update order status when clicking 'Concluir'", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, orders: [mockOrders[1]] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          order: { ...mockOrders[1], status: "concluido" }
        }),
      });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Concluir")).toBeInTheDocument();
    });

    const completeButton = screen.getByText("Concluir");
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/os/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "order-2",
          status: "concluido",
        }),
      });
    });
  });

  it("should handle error when loading orders fails", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar ordens de serviço");
    });
  });

  it("should handle error when updating order fails", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, orders: [mockOrders[0]] }),
      })
      .mockRejectedValueOnce(new Error("Update failed"));

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Iniciar")).toBeInTheDocument();
    });

    const startButton = screen.getByText("Iniciar");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar ordem de serviço");
    });
  });

  it("should display empty state when no orders exist", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: [] }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma ordem de serviço encontrada")).toBeInTheDocument();
    });
  });

  it("should render PDF export button for all orders", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: mockOrders }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const pdfButtons = screen.getAllByText("PDF");
      expect(pdfButtons).toHaveLength(mockOrders.length);
    });
  });

  it("should display order descriptions", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, orders: mockOrders }),
    });

    render(
      <BrowserRouter>
        <MMIOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Manutenção preventiva do sistema hidráulico")).toBeInTheDocument();
      expect(screen.getByText("Verificação de cabos elétricos")).toBeInTheDocument();
      expect(screen.getByText("Atualização de software de navegação")).toBeInTheDocument();
    });
  });
});
