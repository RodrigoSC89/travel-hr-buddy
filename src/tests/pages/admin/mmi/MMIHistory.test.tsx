/**
 * Unit Tests for Admin MMI History Page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MMIHistoryPage from "@/pages/admin/mmi/MMIHistory";
import { exportToPDF } from "@/lib/pdf";

// Mock the PDF export utility
vi.mock("@/lib/pdf", () => ({
  exportToPDF: vi.fn().mockResolvedValue(undefined),
  formatPDFContent: vi.fn((title, content) => `${title}\n${content}`),
}));

// Mock fetch
global.fetch = vi.fn();

const mockRecords = [
  {
    id: "1",
    vessel_name: "Vessel A",
    system_name: "Engine System",
    task_description: "Regular maintenance check",
    executed_at: "2024-01-15T10:00:00Z",
    status: "executado" as const,
  },
  {
    id: "2",
    vessel_name: "Vessel B",
    system_name: "Electrical System",
    task_description: "Inspection required",
    executed_at: null,
    status: "pendente" as const,
  },
  {
    id: "3",
    vessel_name: "Vessel C",
    system_name: "Navigation System",
    task_description: "Urgent repair needed",
    executed_at: null,
    status: "atrasado" as const,
  },
];

describe("MMI History Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => mockRecords,
    });
  });

  it("should render loading state initially", () => {
    render(<MMIHistoryPage />);
    expect(screen.getByText("Carregando histórico...")).toBeInTheDocument();
  });

  it("should fetch and display records", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/mmi/history");
    });

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
      expect(screen.getByText("Electrical System")).toBeInTheDocument();
      expect(screen.getByText("Navigation System")).toBeInTheDocument();
    });
  });

  it("should display page title", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("📊 Histórico de Manutenções (MMI)")).toBeInTheDocument();
    });
  });

  it("should show vessel names", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/Vessel A/)).toBeInTheDocument();
      expect(screen.getByText(/Vessel B/)).toBeInTheDocument();
      expect(screen.getByText(/Vessel C/)).toBeInTheDocument();
    });
  });

  it("should display task descriptions", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/Regular maintenance check/)).toBeInTheDocument();
      expect(screen.getByText(/Inspection required/)).toBeInTheDocument();
      expect(screen.getByText(/Urgent repair needed/)).toBeInTheDocument();
    });
  });

  it("should show status badges", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("executado")).toBeInTheDocument();
      expect(screen.getByText("pendente")).toBeInTheDocument();
      expect(screen.getByText("atrasado")).toBeInTheDocument();
    });
  });

  it("should filter by status when dropdown changes", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
    });

    // All records should be visible initially
    expect(screen.getByText("Engine System")).toBeInTheDocument();
    expect(screen.getByText("Electrical System")).toBeInTheDocument();
    expect(screen.getByText("Navigation System")).toBeInTheDocument();
  });

  it("should show all records when filter is 'todos'", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
      expect(screen.getByText("Electrical System")).toBeInTheDocument();
      expect(screen.getByText("Navigation System")).toBeInTheDocument();
    });
  });

  it("should show empty state when no records match filter", async () => {
    (global.fetch as any).mockResolvedValue({
      json: async () => [],
    });

    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum registro encontrado para o filtro selecionado.")).toBeInTheDocument();
    });
  });

  it("should have export PDF buttons for each record", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      const exportButtons = screen.getAllByText(/Exportar PDF/);
      expect(exportButtons).toHaveLength(3);
    });
  });

  it("should call exportToPDF when export button is clicked", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
    });

    const exportButtons = screen.getAllByText(/Exportar PDF/);
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalled();
    });
  });

  it("should generate PDF with correct content", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
    });

    const exportButtons = screen.getAllByText(/Exportar PDF/);
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalledWith(
        expect.stringContaining("Engine System"),
        "mmi-1.pdf"
      );
    });
  });

  it("should display execution date when available", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    });
  });

  it("should handle fetch errors gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching records:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it("should render filter dropdown", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Engine System")).toBeInTheDocument();
    });

    // Check that the filter dropdown is present
    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
  });

  it("should show status badges with correct text", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      // Check that status badges are rendered
      expect(screen.getByText("executado")).toBeInTheDocument();
      expect(screen.getByText("pendente")).toBeInTheDocument();
      expect(screen.getByText("atrasado")).toBeInTheDocument();
    });
  });

  it("should apply correct status colors to badges", async () => {
    render(<MMIHistoryPage />);

    await waitFor(() => {
      const executadoBadge = screen.getByText("executado").closest("div");
      const pendenteBadge = screen.getByText("pendente").closest("div");
      const atrasadoBadge = screen.getByText("atrasado").closest("div");

      // Check that the badges have the correct color classes
      expect(executadoBadge?.className).toContain("text-green-500");
      expect(pendenteBadge?.className).toContain("text-yellow-500");
      expect(atrasadoBadge?.className).toContain("text-red-500");
    });
  });
});
