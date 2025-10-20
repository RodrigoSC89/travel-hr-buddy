import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MMIOSPage from "@/pages/admin/mmi/os";
import { format } from "date-fns";

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("MMI OS Page - Etapa 5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  it("should render page title", () => {
    render(<MMIOSPage />);
    expect(screen.getByText(/Ordens de Serviço MMI - Etapa 5/i)).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<MMIOSPage />);
    expect(screen.getByText(/Carregando ordens de serviço/i)).toBeInTheDocument();
  });

  it("should fetch work orders from database", async () => {
    const mockOrders = [
      {
        id: "test-1",
        status: "pendente",
        descricao: "Manutenção preventiva do motor",
        created_at: "2024-01-15T10:00:00Z",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockOrders,
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      expect(screen.getByText("Manutenção preventiva do motor")).toBeInTheDocument();
    });
  });

  it("should display multiple work orders with different statuses", async () => {
    const mockOrders = [
      {
        id: "test-1",
        status: "pendente",
        descricao: "Test 1",
        created_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "test-2",
        status: "executado",
        descricao: "Test 2",
        created_at: "2024-01-16T10:00:00Z",
      },
      {
        id: "test-3",
        status: "atrasado",
        descricao: "Test 3",
        created_at: "2024-01-17T10:00:00Z",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockOrders,
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      expect(screen.getByText("Test 1")).toBeInTheDocument();
      expect(screen.getByText("Test 2")).toBeInTheDocument();
      expect(screen.getByText("Test 3")).toBeInTheDocument();
    });
  });

  it("should display action buttons", async () => {
    const mockOrders = [
      {
        id: "test-1",
        status: "pendente",
        descricao: "Test",
        created_at: "2024-01-15T10:00:00Z",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockOrders,
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      // Should have 3 buttons per row (Pendente, Executado, Atrasado)
      const pendenteButtons = screen.getAllByRole("button", { name: /Pendente/i });
      const executadoButtons = screen.getAllByRole("button", { name: /Executado/i });
      const atrasadoButtons = screen.getAllByRole("button", { name: /Atrasado/i });
      
      expect(pendenteButtons.length).toBeGreaterThan(0);
      expect(executadoButtons.length).toBeGreaterThan(0);
      expect(atrasadoButtons.length).toBeGreaterThan(0);
    });
  });

  it("should format dates correctly", async () => {
    const testDate = "2024-01-15T10:00:00Z";
    const expectedDate = format(new Date(testDate), "dd/MM/yyyy");

    const mockOrders = [
      {
        id: "test-1",
        status: "pendente",
        descricao: "Test",
        created_at: testDate,
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockOrders,
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it("should show empty state when no work orders exist", async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma ordem de serviço encontrada/i)).toBeInTheDocument();
    });
  });

  it("should have correct table headers when data exists", async () => {
    const mockOrders = [
      {
        id: "test-1",
        status: "pendente",
        descricao: "Test",
        created_at: "2024-01-15T10:00:00Z",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockOrders,
      error: null,
    });

    render(<MMIOSPage />);

    await waitFor(() => {
      expect(screen.getByText("Descrição")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Data")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });
  });
});
