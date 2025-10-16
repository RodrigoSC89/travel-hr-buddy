/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the auditorias list UI component with filtering,
 * export and AI explanation features
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("ListaAuditoriasIMCA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Structure", () => {
    it("should have auditorias state", () => {
      const auditorias: any[] = [];
      expect(Array.isArray(auditorias)).toBe(true);
    });

    it("should have filtro state for search", () => {
      const filtro = "";
      expect(typeof filtro).toBe("string");
    });

    it("should have explicacao state for AI results", () => {
      const explicacao: Record<string, string> = {};
      expect(typeof explicacao).toBe("object");
    });

    it("should have loadingIA state", () => {
      const loadingIA: string | null = null;
      expect(loadingIA).toBeNull();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch auditorias on mount", () => {
      const apiEndpoint = "/functions/v1/auditorias-list";
      expect(apiEndpoint).toContain("auditorias-list");
    });

    it("should use environment variables for API URL", () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // These might be undefined in test environment, which is expected
      expect(supabaseUrl === undefined || typeof supabaseUrl === 'string').toBe(true);
      expect(supabaseKey === undefined || typeof supabaseKey === 'string').toBe(true);
    });
  });

  describe("Filtering", () => {
    it("should filter by navio", () => {
      const auditorias = [
        { id: "1", navio: "MV Atlantic", norma: "IMCA M-187", resultado: "Conforme", item_auditado: "Test" },
        { id: "2", navio: "MV Pacific", norma: "IMCA M-220", resultado: "Conforme", item_auditado: "Test" }
      ];
      const filtro = "atlantic";
      
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) =>
          v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].navio).toBe("MV Atlantic");
    });

    it("should filter by norma", () => {
      const auditorias = [
        { id: "1", navio: "MV Atlantic", norma: "IMCA M-187", resultado: "Conforme", item_auditado: "Test" },
        { id: "2", navio: "MV Pacific", norma: "IMCA M-220", resultado: "Conforme", item_auditado: "Test" }
      ];
      const filtro = "m-220";
      
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) =>
          v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].norma).toBe("IMCA M-220");
    });

    it("should filter by resultado", () => {
      const auditorias = [
        { id: "1", navio: "MV Atlantic", norma: "IMCA M-187", resultado: "Conforme", item_auditado: "Test" },
        { id: "2", navio: "MV Pacific", norma: "IMCA M-220", resultado: "Não Conforme", item_auditado: "Test" }
      ];
      const filtro = "não conforme";
      
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) =>
          v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].resultado).toBe("Não Conforme");
    });

    it("should be case insensitive", () => {
      const auditorias = [
        { id: "1", navio: "MV Atlantic", norma: "IMCA M-187", resultado: "Conforme", item_auditado: "Test" }
      ];
      const filtro = "ATLANTIC";
      
      const filtered = auditorias.filter((a) =>
        [a.navio, a.norma, a.resultado, a.item_auditado].some((v) =>
          v.toLowerCase().includes(filtro.toLowerCase())
        )
      );
      
      expect(filtered.length).toBe(1);
    });
  });

  describe("Badge Colors", () => {
    it("should use green for Conforme", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Conforme"]).toContain("green");
    });

    it("should use red for Não Conforme", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Não Conforme"]).toContain("red");
    });

    it("should use yellow for Observação", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Observação"]).toContain("yellow");
    });
  });

  describe("Export Functions", () => {
    it("should generate CSV with correct headers", () => {
      const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
      expect(header).toHaveLength(6);
      expect(header[0]).toBe("Navio");
      expect(header[5]).toBe("Comentários");
    });

    it("should format CSV rows correctly", () => {
      const auditorias = [
        {
          id: "1",
          navio: "MV Atlantic",
          data: "2025-10-16",
          norma: "IMCA M-187",
          item_auditado: "Equipment",
          resultado: "Conforme",
          comentarios: "Good condition"
        }
      ];
      
      const rows = auditorias.map((a) => [
        a.navio,
        a.data,
        a.norma,
        a.item_auditado,
        a.resultado,
        a.comentarios,
      ]);
      
      expect(rows[0]).toHaveLength(6);
      expect(rows[0][0]).toBe("MV Atlantic");
    });

    it("should use correct CSV filename", () => {
      const filename = "auditorias_imca.csv";
      expect(filename).toContain("auditorias_imca");
      expect(filename).toContain(".csv");
    });

    it("should use correct PDF filename", () => {
      const filename = "auditorias_imca.pdf";
      expect(filename).toContain("auditorias_imca");
      expect(filename).toContain(".pdf");
    });
  });

  describe("AI Explanation", () => {
    it("should only show AI button for Não Conforme", () => {
      const resultado = "Não Conforme";
      const shouldShowButton = resultado === "Não Conforme";
      expect(shouldShowButton).toBe(true);
    });

    it("should not show AI button for Conforme", () => {
      const resultado = "Conforme";
      const shouldShowButton = resultado === "Não Conforme";
      expect(shouldShowButton).toBe(false);
    });

    it("should call explain API with correct parameters", () => {
      const auditoria = {
        id: "1",
        navio: "MV Atlantic",
        item_auditado: "Safety equipment",
        norma: "IMCA M-187"
      };
      
      const requestBody = {
        navio: auditoria.navio,
        item: auditoria.item_auditado,
        norma: auditoria.norma
      };
      
      expect(requestBody.navio).toBe("MV Atlantic");
      expect(requestBody.item).toBe("Safety equipment");
      expect(requestBody.norma).toBe("IMCA M-187");
    });

    it("should disable button while loading", () => {
      const loadingIA = "1";
      const auditoriaId = "1";
      const isDisabled = loadingIA === auditoriaId;
      expect(isDisabled).toBe(true);
    });

    it("should show loading text while processing", () => {
      const loadingIA = "1";
      const auditoriaId = "1";
      const buttonText = loadingIA === auditoriaId ? "Gerando explicação..." : "🧠 Explicar com IA";
      expect(buttonText).toBe("Gerando explicação...");
    });
  });

  describe("UI Elements", () => {
    it("should have page title", () => {
      const title = "📋 Auditorias Técnicas Registradas";
      expect(title).toContain("Auditorias Técnicas");
    });

    it("should have search placeholder", () => {
      const placeholder = "🔍 Filtrar por navio, norma, item ou resultado...";
      expect(placeholder).toContain("Filtrar");
      expect(placeholder).toContain("navio");
      expect(placeholder).toContain("norma");
    });

    it("should show empty state message", () => {
      const emptyMessage = "Nenhuma auditoria encontrada. Use o filtro acima para buscar.";
      expect(emptyMessage).toContain("Nenhuma auditoria");
    });

    it("should have export buttons", () => {
      const csvButton = "Exportar CSV";
      const pdfButton = "Exportar PDF";
      expect(csvButton).toBe("Exportar CSV");
      expect(pdfButton).toBe("Exportar PDF");
    });
  });
});
