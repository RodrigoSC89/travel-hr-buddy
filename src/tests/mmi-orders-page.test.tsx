import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OrdersPage from "@/pages/admin/mmi/orders";

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

// Mock fetch globally
global.fetch = vi.fn();

describe("MMI Orders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrders = [
    {
      id: "order-1",
      vessel_name: "Ship Alpha",
      system_name: "Engine System",
      status: "pendente",
      priority: "alta",
      description: "Regular maintenance required",
      created_at: "2025-10-19T10:00:00Z",
    },
    {
      id: "order-2",
      vessel_name: "Ship Beta",
      system_name: "Navigation System",
      status: "em_andamento",
      priority: "crítica",
      description: "Critical system update needed",
      created_at: "2025-10-19T09:00:00Z",
    },
    {
      id: "order-3",
      vessel_name: "Ship Gamma",
      system_name: "Hydraulic System",
      status: "concluido",
      priority: "normal",
      description: "Inspection completed",
      created_at: "2025-10-19T08:00:00Z",
    },
  ];

  it("should render the page title", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🛠️ Ordens de Serviço (MMI)")).toBeInTheDocument();
    });
  });

  it("should display loading state", () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should display orders after loading", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ship Alpha/)).toBeInTheDocument();
      expect(screen.getByText(/Ship Beta/)).toBeInTheDocument();
      expect(screen.getByText(/Ship Gamma/)).toBeInTheDocument();
    });
  });

  it("should display empty state when no orders", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma ordem de serviço encontrada")).toBeInTheDocument();
    });
  });

  it("should display order details correctly", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Sistema: Engine System")).toBeInTheDocument();
      expect(screen.getByText("Regular maintenance required")).toBeInTheDocument();
      expect(screen.getByText("Prioridade: alta")).toBeInTheDocument();
    });
  });

  it("should have status update buttons", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const startButtons = screen.getAllByText("Iniciar");
      const completeButtons = screen.getAllByText("Concluir");
      
      expect(startButtons.length).toBeGreaterThan(0);
      expect(completeButtons.length).toBeGreaterThan(0);
    });
  });

  it("should disable start button for orders already in progress", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const startButtons = screen.getAllByText("Iniciar");
      // The button for order-2 (em_andamento) should be disabled
      expect(startButtons[1]).toBeDisabled();
    });
  });

  it("should disable complete button for completed orders", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const completeButtons = screen.getAllByText("Concluir");
      // The button for order-3 (concluido) should be disabled
      expect(completeButtons[2]).toBeDisabled();
    });
  });

  it("should update order status when start button clicked", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ship Alpha/)).toBeInTheDocument();
    });

    const startButtons = screen.getAllByText("Iniciar");
    fireEvent.click(startButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/os/update",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id: "order-1", status: "em_andamento" }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Status atualizado com sucesso");
    });
  });

  it("should update order status when complete button clicked", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ship Alpha/)).toBeInTheDocument();
    });

    const completeButtons = screen.getAllByText("Concluir");
    fireEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/os/update",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id: "order-1", status: "concluido" }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Status atualizado com sucesso");
    });
  });

  it("should have PDF export buttons", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const exportButtons = screen.getAllByText("Exportar PDF");
      expect(exportButtons.length).toBe(mockOrders.length);
    });
  });

  it("should export PDF when button clicked", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    } as Response);

    const html2pdf = (await import("html2pdf.js")).default;
    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ship Alpha/)).toBeInTheDocument();
    });

    const exportButtons = screen.getAllByText("Exportar PDF");
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(html2pdf).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("PDF exportado com sucesso");
    });
  });

  it("should handle API errors gracefully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "API error" }),
    } as Response);

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar ordens de serviço");
    });
  });

  it("should handle update errors gracefully", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Update failed" }),
      } as Response);

    const { toast } = await import("sonner");

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ship Alpha/)).toBeInTheDocument();
    });

    const startButtons = screen.getAllByText("Iniciar");
    fireEvent.click(startButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar status");
    });
  });
});
