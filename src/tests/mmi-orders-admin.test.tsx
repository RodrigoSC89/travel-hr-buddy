import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MMIOrdersAdminPage from "@/pages/admin/mmi/orders";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockOrders = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    os_number: "OS-20240001",
    status: "open",
    work_description: "Manutenção preventiva do motor principal",
    notes: "Trocar óleo e filtro",
    created_at: "2024-01-15T10:00:00Z",
    executed_at: null,
    technician_comment: null
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    os_number: "OS-20240002",
    status: "completed",
    work_description: "Reparo do sistema hidráulico",
    executed_at: "2024-01-20T14:30:00Z",
    technician_comment: "Substituído vedações e testado sob pressão",
    created_at: "2024-01-18T09:00:00Z"
  }
];

describe("MMIOrdersAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title and description", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ordens de Serviço MMI")).toBeInTheDocument();
      expect(screen.getByText("Gerenciamento de ordens de serviço de manutenção")).toBeInTheDocument();
    });
  });

  it("should load and display work orders", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("OS-20240001")).toBeInTheDocument();
      expect(screen.getByText("OS-20240002")).toBeInTheDocument();
      expect(screen.getByText("Manutenção preventiva do motor principal")).toBeInTheDocument();
    });
  });

  it("should display technician comment for completed orders", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const textarea = screen.getAllByPlaceholderText(/Adicione comentários técnicos/i)[1];
      expect(textarea).toHaveValue("Substituído vedações e testado sob pressão");
    });
  });

  it("should allow editing execution date and technician comment", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const dateInput = screen.getAllByLabelText(/Data de Execução/i)[0];
      const commentTextarea = screen.getAllByLabelText(/Comentário Técnico/i)[0];

      fireEvent.change(dateInput, { target: { value: "2024-01-16" } });
      fireEvent.change(commentTextarea, { target: { value: "Serviço executado conforme planejado" } });

      expect(dateInput).toHaveValue("2024-01-16");
      expect(commentTextarea).toHaveValue("Serviço executado conforme planejado");
    });
  });

  it("should call update API when save button is clicked", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    const mockInvoke = vi.fn().mockResolvedValue({ 
      data: { success: true }, 
      error: null 
    });
    
    (supabase.from as any) = mockFrom;
    (supabase.functions.invoke as any) = mockInvoke;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const saveButtons = screen.getAllByText(/Salvar Conclusão/i);
      fireEvent.click(saveButtons[0]);
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('mmi-os-update', expect.any(Object));
    });
  });

  it("should disable fields for completed orders", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const inputs = screen.getAllByLabelText(/Data de Execução/i);
      const completedOrderDateInput = inputs[1]; // Second order is completed
      expect(completedOrderDateInput).toBeDisabled();
    });
  });

  it("should show status badge with correct styling", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Aberta")).toBeInTheDocument();
      expect(screen.getByText("Concluída")).toBeInTheDocument();
    });
  });

  it("should display empty state when no orders exist", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    });
    
    (supabase.from as any) = mockFrom;

    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma ordem de serviço encontrada")).toBeInTheDocument();
    });
  });
});
