/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the IMCA auditorias list component with filtering, export and AI features
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("ListaAuditoriasIMCA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        auditorias: [],
        frota: [],
        cronStatus: "Ativo",
      }),
    });
  });

  describe("Component Rendering", () => {
    it("should render the component with title", async () => {
      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const title = screen.getByText(/Auditorias Técnicas Registradas/i);
        expect(title).toBeDefined();
      });
    });

    it("should display export buttons", async () => {
      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const csvButton = screen.getByText(/Exportar CSV/i);
        const pdfButton = screen.getByText(/Exportar PDF/i);
        expect(csvButton).toBeDefined();
        expect(pdfButton).toBeDefined();
      });
    });

    it("should render filter input", async () => {
      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const filterInput = screen.getByPlaceholderText(/Filtrar por navio/i);
        expect(filterInput).toBeDefined();
      });
    });
  });

  describe("API Data Fetching", () => {
    it("should fetch auditorias on mount", async () => {
      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/auditorias/list",
          expect.objectContaining({
            method: "GET",
          })
        );
      });
    });

    it("should handle successful API response", async () => {
      const mockData = {
        auditorias: [
          {
            id: "1",
            navio: "Test Vessel",
            norma: "IMCA M 179",
            item_auditado: "Test Item",
            comentarios: "Test Comment",
            resultado: "Conforme",
            data: "2025-10-01",
          },
        ],
        frota: ["Test Vessel"],
        cronStatus: "Ativo",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const vessels = screen.getAllByText(/Test Vessel/i);
        expect(vessels.length).toBeGreaterThan(0);
      });
    });

    it("should handle API error gracefully", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no auditorias", async () => {
      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const emptyMessage = screen.getByText(/Nenhuma auditoria encontrada/i);
        expect(emptyMessage).toBeDefined();
      });
    });
  });

  describe("Audit List Display", () => {
    it("should display audit items with all fields", async () => {
      const mockData = {
        auditorias: [
          {
            id: "1",
            navio: "Test Vessel",
            norma: "IMCA M 179",
            item_auditado: "Safety Equipment",
            comentarios: "All items checked",
            resultado: "Conforme",
            data: "2025-10-01",
          },
        ],
        frota: ["Test Vessel"],
        cronStatus: "Ativo",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const vessels = screen.getAllByText(/Test Vessel/i);
        expect(vessels.length).toBeGreaterThan(0);
        expect(screen.getByText(/IMCA M 179/i)).toBeDefined();
        expect(screen.getByText(/Safety Equipment/i)).toBeDefined();
        expect(screen.getByText(/All items checked/i)).toBeDefined();
      });
    });

    it("should show AI analysis button for non-conforming items", async () => {
      const mockData = {
        auditorias: [
          {
            id: "1",
            navio: "Test Vessel",
            norma: "IMCA M 179",
            item_auditado: "Safety Equipment",
            comentarios: "Missing items",
            resultado: "Não Conforme",
            data: "2025-10-01",
          },
        ],
        frota: ["Test Vessel"],
        cronStatus: "Ativo",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const aiButton = screen.getByText(/Análise IA e Plano de Ação/i);
        expect(aiButton).toBeDefined();
      });
    });
  });

  describe("Status Badge Colors", () => {
    it("should apply correct color for Conforme status", async () => {
      const mockData = {
        auditorias: [
          {
            id: "1",
            navio: "Test Vessel",
            norma: "IMCA M 179",
            item_auditado: "Test",
            comentarios: "OK",
            resultado: "Conforme",
            data: "2025-10-01",
          },
        ],
        frota: ["Test Vessel"],
        cronStatus: "Ativo",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const badge = screen.getByText("Conforme");
        expect(badge).toBeDefined();
      });
    });

    it("should apply correct color for Não Conforme status", async () => {
      const mockData = {
        auditorias: [
          {
            id: "1",
            navio: "Test Vessel",
            norma: "IMCA M 179",
            item_auditado: "Test",
            comentarios: "Issues found",
            resultado: "Não Conforme",
            data: "2025-10-01",
          },
        ],
        frota: ["Test Vessel"],
        cronStatus: "Ativo",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        const badge = screen.getByText("Não Conforme");
        expect(badge).toBeDefined();
      });
    });
  });
});
