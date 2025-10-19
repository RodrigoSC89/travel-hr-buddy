import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MMIHistoryPage from "@/pages/admin/MMIHistory";

// Mock the exportToPDF function
vi.mock("@/lib/pdf", () => ({
  exportToPDF: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe("MMIHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRecords = [
    {
      id: "1",
      vessel_name: "MV Test Ship",
      system_name: "Engine System",
      task_description: "Regular maintenance check",
      executed_at: "2025-10-15T10:00:00Z",
      status: "executado" as const,
    },
    {
      id: "2",
      vessel_name: "MV Test Ship 2",
      system_name: "Navigation System",
      task_description: "Equipment calibration",
      executed_at: null,
      status: "pendente" as const,
    },
  ];

  it("should render the page title", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Histórico de Manutenções \(MMI\)/i)).toBeDefined();
  });

  it("should render filter dropdown", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Filtro por status:/i)).toBeDefined();
  });

  it("should fetch and display MMI records", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => mockRecords,
    });

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("MV Test Ship")).toBeDefined();
      expect(screen.getByText("Engine System")).toBeDefined();
    });
  });

  it("should display message when no records found", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum registro encontrado/i)).toBeDefined();
    });
  });

  it("should render export PDF buttons for each record", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => mockRecords,
    });

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByText(/📄 Exportar PDF/i);
      expect(buttons.length).toBe(2);
    });
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <MMIHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
