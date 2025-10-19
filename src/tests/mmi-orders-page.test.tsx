import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OrdersPage from "@/pages/admin/mmi/orders";

// Mock fetch
global.fetch = vi.fn();

describe("MMI Orders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrders = [
    {
      id: "1",
      vessel_name: "Navio Alpha",
      system_name: "Sistema Hidráulico",
      status: "pendente",
      priority: "alta",
      description: "Verificação de vazamento no sistema hidráulico principal.",
      created_at: "2025-10-19T10:00:00Z",
    },
    {
      id: "2",
      vessel_name: "Navio Beta",
      system_name: "Motor Diesel",
      status: "em andamento",
      priority: "crítica",
      description: "Manutenção preventiva do motor principal.",
      created_at: "2025-10-19T09:00:00Z",
    },
  ];

  it("should render the orders page title", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🛠️ Ordens de Serviço (MMI)")).toBeInTheDocument();
    });
  });

  it("should fetch and display orders", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Navio Alpha")).toBeInTheDocument();
      expect(screen.getByText("Navio Beta")).toBeInTheDocument();
      expect(screen.getByText("Sistema Hidráulico")).toBeInTheDocument();
      expect(screen.getByText("Motor Diesel")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/os/all");
  });

  it("should display empty state when no orders", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma ordem de serviço encontrada.")).toBeInTheDocument();
    });
  });

  it("should update order status when clicking button", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Navio Alpha")).toBeInTheDocument();
    });

    const concludeButton = screen.getAllByText("✅ Concluir")[0];
    fireEvent.click(concludeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/os/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "1", status: "concluída" }),
      });
    });
  });

  it("should disable buttons based on current status", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Navio Beta")).toBeInTheDocument();
    });

    const buttons = screen.getAllByText("🚧 Em Andamento");
    expect(buttons[1]).toBeDisabled();
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🛠️ Ordens de Serviço (MMI)")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should export order to PDF", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Navio Alpha")).toBeInTheDocument();
    });

    // Mock URL.createObjectURL and link.click after render
    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = mockClick;
      }
      return element;
    });

    global.URL.createObjectURL = mockCreateObjectURL;

    const exportButton = screen.getAllByText("📄 Exportar PDF")[0];
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    
    vi.restoreAllMocks();
  });
});
