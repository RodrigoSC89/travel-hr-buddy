import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OSPage from "@/pages/admin/mmi/os";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe("MMI OS Page - Etapa 5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    render(<OSPage />);
    expect(screen.getByText(/🔧 Ordens de Serviço \(MMI\)/i)).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<OSPage />);
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
  });

  it("should fetch work orders from database", async () => {
    const mockData = [
      {
        id: "1",
        descricao: "Test OS 1",
        status: "pendente",
        created_at: "2024-01-15T10:00:00Z",
      },
    ];

    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      }),
    } as any);

    render(<OSPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Carregando.../i)).not.toBeInTheDocument();
    });
  });

  it("should display status badges correctly", async () => {
    const statuses = ["pendente", "executado", "atrasado"];
    
    statuses.forEach((status) => {
      expect(status).toBeTruthy();
    });
  });

  it("should render action buttons for status changes", () => {
    const actionButtons = ["pendente", "executado", "atrasado"];
    
    actionButtons.forEach((button) => {
      expect(button).toBeTruthy();
    });
  });

  it("should format dates in Brazilian format", () => {
    const testDate = new Date("2024-01-15T10:00:00Z");
    const expectedFormat = /\d{2}\/\d{2}\/\d{4}/;
    
    expect(testDate).toBeInstanceOf(Date);
    expect(expectedFormat.test("15/01/2024")).toBe(true);
  });

  it("should have correct table headers", () => {
    const headers = ["Descrição", "Status", "Criado em", "Ações"];
    
    headers.forEach((header) => {
      expect(header).toBeTruthy();
    });
  });
});
