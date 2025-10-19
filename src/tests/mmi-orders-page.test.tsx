import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "@/pages/admin/mmi/orders";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockOrders = [
  {
    id: "1",
    vessel_name: "PSV Maersk Challenger",
    system_name: "Sistema Hidráulico Principal",
    priority: "Crítica",
    status: "pendente",
    description: "Vazamento detectado na bomba hidráulica principal.",
    created_at: "2025-10-19T10:00:00Z",
    updated_at: "2025-10-19T10:00:00Z",
  },
  {
    id: "2",
    vessel_name: "PSV Ocean Star",
    system_name: "Motor Principal Starboard",
    priority: "Alta",
    status: "em andamento",
    description: "Manutenção preventiva programada do motor principal.",
    created_at: "2025-10-19T09:00:00Z",
    updated_at: "2025-10-19T09:00:00Z",
  },
  {
    id: "3",
    vessel_name: "PSV Atlantic Wind",
    system_name: "Gerador de Emergência",
    priority: "Baixa",
    status: "concluída",
    description: "Reparo do gerador de emergência completado.",
    created_at: "2025-10-18T08:00:00Z",
    updated_at: "2025-10-18T08:00:00Z",
    completed_at: "2025-10-19T08:00:00Z",
  },
];

describe("MMI Orders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("should render the page title", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ordens de Serviço \(MMI\)/i)).toBeDefined();
    });
  });

  it("should display loading state", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando ordens de serviço/i)).toBeDefined();
  });

  it("should display orders after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("PSV Maersk Challenger")).toBeDefined();
      expect(screen.getByText("PSV Ocean Star")).toBeDefined();
      expect(screen.getByText("PSV Atlantic Wind")).toBeDefined();
    });
  });

  it("should display priority badges with correct colors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Crítica")).toBeDefined();
      expect(screen.getByText("Alta")).toBeDefined();
      expect(screen.getByText("Baixa")).toBeDefined();
    });
  });

  it("should display status badges", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("pendente")).toBeDefined();
      expect(screen.getByText("em andamento")).toBeDefined();
      expect(screen.getByText("concluída")).toBeDefined();
    });
  });

  it("should update order status when button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("PSV Maersk Challenger")).toBeDefined();
    });

    const buttons = screen.getAllByText(/Em Andamento/i);
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/os/update",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "1", status: "em andamento" }),
        })
      );
    });
  });

  it("should disable 'Em Andamento' button when order is already in progress", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /Em Andamento/i });
      // The second order is already "em andamento", so its button should be disabled
      expect(buttons[1]).toBeDisabled();
    });
  });

  it("should disable 'Concluir' button when order is completed", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /Concluir/i });
      // The third order is "concluída", so its button should be disabled
      expect(buttons[2]).toBeDisabled();
    });
  });

  it("should display error message when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar ordens de serviço/i)).toBeDefined();
    });
  });

  it("should display empty state when no orders exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma ordem de serviço encontrada/i)).toBeDefined();
    });
  });

  it("should export order to PDF when export button is clicked", async () => {
    // Mock URL.createObjectURL and Blob
    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.createObjectURL = mockCreateObjectURL;
    
    // Mock document.createElement for 'a' element
    const originalCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();
    
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        const link = originalCreateElement("a");
        link.click = mockClick;
        return link;
      }
      return originalCreateElement(tagName);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockOrders[0]],
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("PSV Maersk Challenger")).toBeDefined();
    });

    const exportButton = screen.getByRole("button", { name: /Exportar PDF/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });
});
