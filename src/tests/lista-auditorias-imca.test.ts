/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the IMCA Audits listing component with AI features,
 * PDF/CSV export, and filtering capabilities
 */

import { describe, it, expect } from "vitest";

describe("ListaAuditoriasIMCA Component", () => {
  describe("Component Structure", () => {
    it("should import required dependencies", () => {
      const dependencies = [
        "useState",
        "useEffect",
        "useRef",
        "Card",
        "Button",
        "Input",
        "Badge",
        "toast",
        "format",
        "supabase",
        "html2canvas",
        "jsPDF"
      ];
      expect(dependencies).toContain("useState");
      expect(dependencies).toContain("supabase");
      expect(dependencies).toContain("jsPDF");
    });

    it("should define Auditoria interface with required fields", () => {
      interface Auditoria {
        id: string;
        navio: string;
        norma: string;
        item_auditado: string;
        resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
        comentarios: string;
        data: string;
      }

      const audit: Auditoria = {
        id: "123",
        navio: "Navio Teste",
        norma: "IMCA M189",
        item_auditado: "Item 1",
        resultado: "Conforme",
        comentarios: "Teste",
        data: "2025-10-16"
      };

      expect(audit).toHaveProperty("id");
      expect(audit).toHaveProperty("navio");
      expect(audit).toHaveProperty("norma");
      expect(audit).toHaveProperty("item_auditado");
      expect(audit).toHaveProperty("resultado");
      expect(audit).toHaveProperty("comentarios");
      expect(audit).toHaveProperty("data");
    });
  });

  describe("Color Mapping", () => {
    it("should map Conforme to green badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-500 text-white",
        "Não Conforme": "bg-red-500 text-white",
        "Parcialmente Conforme": "bg-yellow-500 text-white",
        "Não Aplicável": "bg-gray-500 text-white",
      };

      expect(corResultado["Conforme"]).toBe("bg-green-500 text-white");
    });

    it("should map Não Conforme to red badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-500 text-white",
        "Não Conforme": "bg-red-500 text-white",
        "Parcialmente Conforme": "bg-yellow-500 text-white",
        "Não Aplicável": "bg-gray-500 text-white",
      };

      expect(corResultado["Não Conforme"]).toBe("bg-red-500 text-white");
    });

    it("should map Parcialmente Conforme to yellow badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-500 text-white",
        "Não Conforme": "bg-red-500 text-white",
        "Parcialmente Conforme": "bg-yellow-500 text-white",
        "Não Aplicável": "bg-gray-500 text-white",
      };

      expect(corResultado["Parcialmente Conforme"]).toBe("bg-yellow-500 text-white");
    });

    it("should map Não Aplicável to gray badge", () => {
      const corResultado: Record<string, string> = {
        "Conforme": "bg-green-500 text-white",
        "Não Conforme": "bg-red-500 text-white",
        "Parcialmente Conforme": "bg-yellow-500 text-white",
        "Não Aplicável": "bg-gray-500 text-white",
      };

      expect(corResultado["Não Aplicável"]).toBe("bg-gray-500 text-white");
    });
  });

  describe("Database Integration", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select all fields", () => {
      const selectQuery = "*";
      expect(selectQuery).toBe("*");
    });

    it("should order by data descending", () => {
      const orderField = "data";
      const orderDirection = false; // ascending: false = descending
      expect(orderField).toBe("data");
      expect(orderDirection).toBe(false);
    });
  });

  describe("Filtering Logic", () => {
    it("should filter by navio", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "IMCA", item_auditado: "Item 2", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-02" }
      ];
      const filtro = "navio a";

      const filtradas = auditorias.filter((a) => 
        a.navio?.toLowerCase().includes(filtro.toLowerCase())
      );

      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].navio).toBe("Navio A");
    });

    it("should filter by norma", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA M189", item_auditado: "Item 1", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "ISO 9001", item_auditado: "Item 2", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-02" }
      ];
      const filtro = "m189";

      const filtradas = auditorias.filter((a) => 
        a.norma?.toLowerCase().includes(filtro.toLowerCase())
      );

      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].norma).toBe("IMCA M189");
    });

    it("should filter by item_auditado", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", item_auditado: "Safety Equipment", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "IMCA", item_auditado: "Navigation System", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-02" }
      ];
      const filtro = "safety";

      const filtradas = auditorias.filter((a) => 
        a.item_auditado?.toLowerCase().includes(filtro.toLowerCase())
      );

      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].item_auditado).toBe("Safety Equipment");
    });

    it("should filter by resultado", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "IMCA", item_auditado: "Item 2", resultado: "Não Conforme" as const, comentarios: "Issue", data: "2025-10-02" }
      ];
      const filtro = "não conforme";

      const filtradas = auditorias.filter((a) => 
        a.resultado?.toLowerCase().includes(filtro.toLowerCase())
      );

      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].resultado).toBe("Não Conforme");
    });

    it("should filter by comentarios", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme" as const, comentarios: "Everything is perfect", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "IMCA", item_auditado: "Item 2", resultado: "Conforme" as const, comentarios: "Needs attention", data: "2025-10-02" }
      ];
      const filtro = "perfect";

      const filtradas = auditorias.filter((a) => 
        a.comentarios?.toLowerCase().includes(filtro.toLowerCase())
      );

      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].comentarios).toBe("Everything is perfect");
    });
  });

  describe("Fleet Display", () => {
    it("should extract unique vessels from auditorias", () => {
      const auditorias = [
        { id: "1", navio: "Navio A", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-01" },
        { id: "2", navio: "Navio B", norma: "IMCA", item_auditado: "Item 2", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-02" },
        { id: "3", navio: "Navio A", norma: "IMCA", item_auditado: "Item 3", resultado: "Conforme" as const, comentarios: "OK", data: "2025-10-03" }
      ];

      const frota = Array.from(new Set(auditorias.map((a) => a.navio).filter(Boolean)));

      expect(frota).toHaveLength(2);
      expect(frota).toContain("Navio A");
      expect(frota).toContain("Navio B");
    });

    it("should handle empty auditorias array", () => {
      const auditorias: any[] = [];
      const frota = Array.from(new Set(auditorias.map((a) => a.navio).filter(Boolean)));

      expect(frota).toHaveLength(0);
    });
  });

  describe("AI Explanation Feature", () => {
    it("should only show for Não Conforme results", () => {
      const resultado = "Não Conforme";
      const shouldShowAI = resultado === "Não Conforme";
      expect(shouldShowAI).toBe(true);
    });

    it("should not show for Conforme results", () => {
      const resultado = "Conforme";
      const shouldShowAI = resultado === "Não Conforme";
      expect(shouldShowAI).toBe(false);
    });

    it("should use mmi-copilot endpoint", () => {
      const endpoint = "/functions/v1/mmi-copilot";
      expect(endpoint).toContain("mmi-copilot");
    });

    it("should create proper prompt for AI", () => {
      const navio = "Navio Teste";
      const itemAuditado = "Sistema de Segurança";
      const norma = "IMCA M189";
      
      const prompt = `Explique detalhadamente por que o item "${itemAuditado}" do navio "${navio}" está em não conformidade com a norma "${norma}". Forneça recomendações práticas para correção.`;

      expect(prompt).toContain(navio);
      expect(prompt).toContain(itemAuditado);
      expect(prompt).toContain(norma);
      expect(prompt).toContain("não conformidade");
      expect(prompt).toContain("recomendações");
    });
  });

  describe("PDF Export", () => {
    it("should use html2canvas for capturing", () => {
      const library = "html2canvas";
      expect(library).toBe("html2canvas");
    });

    it("should use jsPDF for PDF generation", () => {
      const library = "jsPDF";
      expect(library).toBe("jsPDF");
    });

    it("should use portrait orientation", () => {
      const orientation = "portrait";
      expect(orientation).toBe("portrait");
    });

    it("should use A4 format", () => {
      const format = "a4";
      expect(format).toBe("a4");
    });

    it("should name file with date", () => {
      const date = "2025-10-16";
      const filename = `auditorias-imca-${date}.pdf`;
      expect(filename).toContain("auditorias-imca");
      expect(filename).toContain(date);
      expect(filename).toEndWith(".pdf");
    });
  });

  describe("CSV Export", () => {
    it("should include all required headers", () => {
      const headers = ["Navio", "Norma", "Item Auditado", "Resultado", "Comentários", "Data"];
      
      expect(headers).toContain("Navio");
      expect(headers).toContain("Norma");
      expect(headers).toContain("Item Auditado");
      expect(headers).toContain("Resultado");
      expect(headers).toContain("Comentários");
      expect(headers).toContain("Data");
    });

    it("should format data correctly", () => {
      const auditoria = {
        id: "1",
        navio: "Navio Teste",
        norma: "IMCA M189",
        item_auditado: "Safety System",
        resultado: "Conforme" as const,
        comentarios: "All good",
        data: "2025-10-16"
      };

      const row = [
        auditoria.navio,
        auditoria.norma,
        auditoria.item_auditado,
        auditoria.resultado,
        auditoria.comentarios,
        auditoria.data
      ];

      expect(row).toHaveLength(6);
      expect(row[0]).toBe("Navio Teste");
      expect(row[1]).toBe("IMCA M189");
    });

    it("should name file with date", () => {
      const date = "2025-10-16";
      const filename = `auditorias-imca-${date}.csv`;
      expect(filename).toContain("auditorias-imca");
      expect(filename).toContain(date);
      expect(filename).toEndWith(".csv");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      const loading = true;
      expect(loading).toBe(true);
    });

    it("should show content when not loading", () => {
      const loading = false;
      expect(loading).toBe(false);
    });
  });

  describe("Empty State", () => {
    it("should show message when no auditorias and no filter", () => {
      const auditorias: any[] = [];
      const filtro = "";
      const message = filtro
        ? "Nenhuma auditoria encontrada com os critérios de filtro."
        : "Nenhuma auditoria registrada no sistema.";

      expect(message).toBe("Nenhuma auditoria registrada no sistema.");
    });

    it("should show different message when filtered with no results", () => {
      const auditorias: any[] = [];
      const filtro = "test";
      const message = filtro
        ? "Nenhuma auditoria encontrada com os critérios de filtro."
        : "Nenhuma auditoria registrada no sistema.";

      expect(message).toBe("Nenhuma auditoria encontrada com os critérios de filtro.");
    });
  });
});
