import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the audit page for restore report logs with filters and export functionality.
 */
describe("RestoreReportLogsPage Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock response
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    
    (supabase.from as any).mockReturnValue(mockQuery);
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🧠 Auditoria de Relatórios Enviados")).toBeInTheDocument();
    });
  });

  it("should render back button", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Voltar")).toBeInTheDocument();
    });
  });

  it("should render filter inputs", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for status filter
      expect(screen.getByPlaceholderText("Status (success/error)")).toBeInTheDocument();
      
      // Check for date filters
      const dateInputs = screen.getAllByDisplayValue("");
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  it("should render action buttons", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🔍 Buscar")).toBeInTheDocument();
      expect(screen.getByText("📤 CSV")).toBeInTheDocument();
      expect(screen.getByText("📄 PDF")).toBeInTheDocument();
    });
  });

  it("should fetch logs on mount", async () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("restore_report_logs");
    });
  });
});
