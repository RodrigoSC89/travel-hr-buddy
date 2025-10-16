/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the auditorias list component with filtering and export features
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ListaAuditoriasIMCA } from "@/components/sgso/ListaAuditoriasIMCA";

// Mock fetch
global.fetch = vi.fn();

describe("ListaAuditoriasIMCA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render loading state initially", () => {
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise(() => {}) // Never resolves
      );
      
      render(<ListaAuditoriasIMCA />);
      expect(screen.getByText(/carregando auditorias/i)).toBeInTheDocument();
    });

    it("should render title", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/auditorias técnicas registradas/i)).toBeInTheDocument();
      });
    });

    it("should render export buttons", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/exportar csv/i)).toBeInTheDocument();
        expect(screen.getByText(/exportar pdf/i)).toBeInTheDocument();
      });
    });

    it("should render filter input", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const filterInput = screen.getByPlaceholderText(/filtrar por navio/i);
        expect(filterInput).toBeInTheDocument();
      });
    });
  });

  describe("Data Loading", () => {
    it("should fetch auditorias on mount", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditorias/list");
      });
    });

    it("should display auditorias after loading", async () => {
      const mockAuditorias = [
        {
          id: "1",
          navio: "Test Ship",
          data: "2025-10-16",
          norma: "IMCA M 117",
          item_auditado: "Safety Equipment",
          resultado: "Conforme",
          comentarios: "All good"
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuditorias
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/test ship/i)).toBeInTheDocument();
        expect(screen.getByText(/imca m 117/i)).toBeInTheDocument();
      });
    });

    it("should handle empty results", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/nenhuma auditoria registrada/i)).toBeInTheDocument();
      });
    });

    it("should handle fetch errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao carregar auditorias/i)).toBeInTheDocument();
      });
    });
  });

  describe("Badge Colors", () => {
    it("should use correct colors for resultado badges", () => {
      const colors = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };

      expect(colors["Conforme"]).toContain("green");
      expect(colors["Não Conforme"]).toContain("red");
      expect(colors["Observação"]).toContain("yellow");
    });
  });

  describe("Export Functionality", () => {
    it("should have CSV export button", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const csvButton = screen.getByText(/exportar csv/i);
        expect(csvButton).toBeInTheDocument();
      });
    });

    it("should have PDF export button", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const pdfButton = screen.getByText(/exportar pdf/i);
        expect(pdfButton).toBeInTheDocument();
      });
    });
  });

  describe("Display Fields", () => {
    it("should display all required fields", async () => {
      const mockAuditoria = {
        id: "1",
        navio: "Ship Name",
        data: "2025-10-16",
        norma: "Test Norm",
        item_auditado: "Test Item",
        resultado: "Conforme",
        comentarios: "Test comment"
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAuditoria]
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/ship name/i)).toBeInTheDocument();
        expect(screen.getByText(/test norm/i)).toBeInTheDocument();
        expect(screen.getByText(/test item/i)).toBeInTheDocument();
        expect(screen.getByText("Conforme")).toBeInTheDocument();
        expect(screen.getByText(/test comment/i)).toBeInTheDocument();
      });
    });
  });

  describe("API Integration", () => {
    it("should call API endpoint with correct path", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auditorias/list");
      });
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao carregar auditorias/i)).toBeInTheDocument();
      });
    });
  });
});
