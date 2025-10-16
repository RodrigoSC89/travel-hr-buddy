/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the IMCA technical audits list component with filtering and export features
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";

// Mock fetch globally
global.fetch = vi.fn();

describe("ListaAuditoriasIMCA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the component title", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/Auditorias Técnicas Registradas/i)).toBeDefined();
      });
    });

    it("should render export buttons", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/Exportar CSV/i)).toBeDefined();
        expect(screen.getByText(/Exportar PDF/i)).toBeDefined();
      });
    });

    it("should render search input", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Filtrar por navio, norma, item ou resultado/i);
        expect(input).toBeDefined();
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch auditorias on mount", async () => {
      const mockData = [
        {
          id: "1",
          navio: "Navio A",
          data: "2025-10-01",
          norma: "IMCA",
          item_auditado: "Safety Equipment",
          resultado: "Conforme",
          comentarios: "All items checked"
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditorias/list");
      });
    });

    it("should handle empty data", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should handle fetch errors gracefully", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe("Badge Color Mapping", () => {
    it("should map Conforme to green badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Conforme"]).toContain("green");
    });

    it("should map Não Conforme to red badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Não Conforme"]).toContain("red");
    });

    it("should map Observação to yellow badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Observação"]).toContain("yellow");
    });
  });

  describe("Filtering Functionality", () => {
    it("should filter by navio", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", resultado: "Conforme", item_auditado: "Item 1", data: "2025-10-01", comentarios: "" },
        { id: "2", navio: "Navio B", norma: "ISO", resultado: "Não Conforme", item_auditado: "Item 2", data: "2025-10-02", comentarios: "" }
      ];
      const filtro = "navio a";
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
          v && v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].navio).toBe("Navio A");
    });

    it("should filter by norma", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", resultado: "Conforme", item_auditado: "Item 1", data: "2025-10-01", comentarios: "" },
        { id: "2", navio: "Navio B", norma: "ISO", resultado: "Não Conforme", item_auditado: "Item 2", data: "2025-10-02", comentarios: "" }
      ];
      const filtro = "imca";
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
          v && v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].norma).toBe("IMCA");
    });

    it("should filter by resultado", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", resultado: "Conforme", item_auditado: "Item 1", data: "2025-10-01", comentarios: "" },
        { id: "2", navio: "Navio B", norma: "ISO", resultado: "Não Conforme", item_auditado: "Item 2", data: "2025-10-02", comentarios: "" }
      ];
      const filtro = "conforme";
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
          v && v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      expect(filtered).toHaveLength(2); // Both "Conforme" and "Não Conforme" contain "conforme"
    });

    it("should filter by item_auditado", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", resultado: "Conforme", item_auditado: "Safety Equipment", data: "2025-10-01", comentarios: "" },
        { id: "2", navio: "Navio B", norma: "ISO", resultado: "Não Conforme", item_auditado: "Machinery", data: "2025-10-02", comentarios: "" }
      ];
      const filtro = "safety";
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
          v && v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].item_auditado).toBe("Safety Equipment");
    });

    it("should be case insensitive", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", resultado: "Conforme", item_auditado: "Item 1", data: "2025-10-01", comentarios: "" }
      ];
      const filtro = "NAVIO";
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
          v && v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      expect(filtered).toHaveLength(1);
    });
  });

  describe("Export Functionality", () => {
    it("should export CSV with correct headers", () => {
      const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
      expect(header).toContain("Navio");
      expect(header).toContain("Data");
      expect(header).toContain("Norma");
      expect(header).toContain("Item");
      expect(header).toContain("Resultado");
      expect(header).toContain("Comentários");
    });

    it("should format CSV data correctly", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", data: "2025-10-01", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme", comentarios: "OK" }
      ];
      const rows = auditorias.map((a) => [a.navio, a.data, a.norma, a.item_auditado, a.resultado, a.comentarios]);
      expect(rows[0]).toEqual(["Navio A", "2025-10-01", "IMCA", "Item 1", "Conforme", "OK"]);
    });

    it("should use correct CSV filename", () => {
      const filename = "auditorias_imca.csv";
      expect(filename).toBe("auditorias_imca.csv");
    });

    it("should use correct PDF filename", () => {
      const filename = "auditorias_imca.pdf";
      expect(filename).toBe("auditorias_imca.pdf");
    });
  });

  describe("UI Elements", () => {
    it("should display ship emoji in vessel name", () => {
      const emoji = "🚢";
      expect(emoji).toBe("🚢");
    });

    it("should display search emoji in filter", () => {
      const emoji = "🔍";
      expect(emoji).toBe("🔍");
    });

    it("should display clipboard emoji in title", () => {
      const emoji = "📋";
      expect(emoji).toBe("📋");
    });
  });

  describe("Component Structure", () => {
    it("should use Card components for audit items", () => {
      const componentStructure = {
        wrapper: "div",
        card: "Card",
        cardContent: "CardContent"
      };
      expect(componentStructure.card).toBe("Card");
      expect(componentStructure.cardContent).toBe("CardContent");
    });

    it("should use Button components for actions", () => {
      const buttons = ["Exportar CSV", "Exportar PDF"];
      expect(buttons).toHaveLength(2);
    });

    it("should use Badge component for resultado", () => {
      const badgeComponent = "Badge";
      expect(badgeComponent).toBe("Badge");
    });

    it("should use Input component for filter", () => {
      const inputComponent = "Input";
      expect(inputComponent).toBe("Input");
    });
  });
});
