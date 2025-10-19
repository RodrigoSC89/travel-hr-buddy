import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MMIOrdersAdminPage from "@/pages/admin/mmi/orders";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              job_id: "job-123",
              status: "open",
              executed_at: null,
              technician_comment: null,
              notes: "Test work order",
              created_at: "2024-01-20T10:00:00Z",
              updated_at: "2024-01-20T10:00:00Z",
            },
          ],
          error: null,
        })),
      })),
    })),
    supabaseUrl: "https://test.supabase.co",
    supabaseKey: "test-key",
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("MMI Orders Admin Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ordens de Serviço MMI")).toBeInTheDocument();
    });
  });

  it("should display work orders list", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/OS-123e4567/)).toBeInTheDocument();
    });
  });

  it("should show status badge", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Aberta")).toBeInTheDocument();
    });
  });

  it("should render execution date input", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Data de Execução/i)).toBeInTheDocument();
    });
  });

  it("should render technician comment textarea", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Adicione comentários técnicos/i)).toBeInTheDocument();
    });
  });

  it("should render save button", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Salvar Conclusão")).toBeInTheDocument();
    });
  });

  it("should allow updating technician comment", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Adicione comentários técnicos/i);
      fireEvent.change(textarea, { target: { value: "Test comment" } });
      expect(textarea).toHaveValue("Test comment");
    });
  });

  it("should display total count badge", async () => {
    render(
      <BrowserRouter>
        <MMIOrdersAdminPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });
});
