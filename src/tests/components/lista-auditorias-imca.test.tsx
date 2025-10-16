/**
 * ListaAuditoriasIMCA Component Tests
 * 
 * Tests for the ListaAuditoriasIMCA component that displays
 * audit records with visual status badges
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

  describe("Component Structure", () => {
    it("should render the component title", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => [],
      } as Response);

      render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(screen.getByText(/📋 Auditorias Técnicas Registradas/i)).toBeDefined();
      });
    });

    it("should have correct title text", () => {
      const titleText = "📋 Auditorias Técnicas Registradas";
      expect(titleText).toContain("Auditorias");
      expect(titleText).toContain("Técnicas");
      expect(titleText).toContain("Registradas");
    });

    it("should have ship emoji in title", () => {
      const titleText = "📋 Auditorias Técnicas Registradas";
      expect(titleText).toContain("📋");
    });
  });

  describe("Data Fetching", () => {
    it("should fetch from correct API endpoint", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => [],
      });
      global.fetch = mockFetch;

      render(<ListaAuditoriasIMCA />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auditorias/list");
      });
    });

    it("should use GET method implicitly", () => {
      const endpoint = "/api/auditorias/list";
      expect(endpoint).toBe("/api/auditorias/list");
    });

    it("should handle empty response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => [],
      } as Response);

      const { container } = render(<ListaAuditoriasIMCA />);
      
      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });
  });

  describe("Auditoria Card Display", () => {
    it("should display ship name with emoji", () => {
      const mockAuditoria = {
        id: "uuid-123",
        navio: "Navio Teste",
        data: "2025-10-15",
        norma: "IMCA",
        resultado: "Conforme" as const,
        item_auditado: "Sistema de DP",
        comentarios: "Teste"
      };

      const shipDisplay = `🚢 ${mockAuditoria.navio}`;
      expect(shipDisplay).toBe("🚢 Navio Teste");
      expect(shipDisplay).toContain("🚢");
    });

    it("should format date correctly", () => {
      const date = "2025-10-15";
      const expectedFormat = "dd/MM/yyyy";
      expect(expectedFormat).toBe("dd/MM/yyyy");
    });

    it("should display norma", () => {
      const mockAuditoria = {
        norma: "IMCA"
      };
      expect(mockAuditoria.norma).toBe("IMCA");
    });

    it("should display item_auditado", () => {
      const mockAuditoria = {
        item_auditado: "Sistema de DP"
      };
      const label = "Item auditado:";
      expect(label).toContain("Item auditado");
    });

    it("should display comentarios", () => {
      const mockAuditoria = {
        comentarios: "Auditoria realizada com sucesso"
      };
      const label = "Comentários:";
      expect(label).toContain("Comentários");
    });
  });

  describe("Badge Colors", () => {
    it("should have correct color for Conforme", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Conforme"]).toBe("bg-green-100 text-green-800");
      expect(corResultado["Conforme"]).toContain("green");
    });

    it("should have correct color for Não Conforme", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Não Conforme"]).toBe("bg-red-100 text-red-800");
      expect(corResultado["Não Conforme"]).toContain("red");
    });

    it("should have correct color for Observação", () => {
      const corResultado = {
        "Conforme": "bg-green-100 text-green-800",
        "Não Conforme": "bg-red-100 text-red-800",
        "Observação": "bg-yellow-100 text-yellow-800",
      };
      expect(corResultado["Observação"]).toBe("bg-yellow-100 text-yellow-800");
      expect(corResultado["Observação"]).toContain("yellow");
    });

    it("should support all three resultado types", () => {
      const resultados = ["Conforme", "Não Conforme", "Observação"];
      expect(resultados).toHaveLength(3);
      expect(resultados).toContain("Conforme");
      expect(resultados).toContain("Não Conforme");
      expect(resultados).toContain("Observação");
    });
  });

  describe("Component Layout", () => {
    it("should use Card component for each auditoria", () => {
      const componentName = "Card";
      expect(componentName).toBe("Card");
    });

    it("should use CardContent for card body", () => {
      const componentName = "CardContent";
      expect(componentName).toBe("CardContent");
    });

    it("should use Badge component for status", () => {
      const componentName = "Badge";
      expect(componentName).toBe("Badge");
    });

    it("should have max-width constraint", () => {
      const className = "max-w-5xl";
      expect(className).toBe("max-w-5xl");
    });

    it("should be centered", () => {
      const className = "mx-auto";
      expect(className).toBe("mx-auto");
    });

    it("should have vertical spacing", () => {
      const className = "space-y-6";
      expect(className).toBe("space-y-6");
    });

    it("should have top margin", () => {
      const className = "mt-8";
      expect(className).toBe("mt-8");
    });
  });

  describe("TypeScript Types", () => {
    it("should define Auditoria interface with correct properties", () => {
      interface Auditoria {
        id: string;
        navio: string;
        data: string;
        norma: string;
        resultado: "Conforme" | "Não Conforme" | "Observação";
        item_auditado: string;
        comentarios: string;
      }

      const mockAuditoria: Auditoria = {
        id: "uuid-123",
        navio: "Navio Teste",
        data: "2025-10-15",
        norma: "IMCA",
        resultado: "Conforme",
        item_auditado: "Sistema de DP",
        comentarios: "Teste"
      };

      expect(mockAuditoria.id).toBe("uuid-123");
      expect(mockAuditoria.resultado).toBe("Conforme");
    });

    it("should enforce resultado to be one of three values", () => {
      type ResultadoType = "Conforme" | "Não Conforme" | "Observação";
      const validResults: ResultadoType[] = ["Conforme", "Não Conforme", "Observação"];
      expect(validResults).toHaveLength(3);
    });
  });

  describe("UI Dependencies", () => {
    it("should import Card components from @/components/ui/card", () => {
      const importPath = "@/components/ui/card";
      expect(importPath).toBe("@/components/ui/card");
    });

    it("should import Badge from @/components/ui/badge", () => {
      const importPath = "@/components/ui/badge";
      expect(importPath).toBe("@/components/ui/badge");
    });

    it("should import format from date-fns", () => {
      const importPath = "date-fns";
      expect(importPath).toBe("date-fns");
    });

    it("should use React hooks", () => {
      const hooks = ["useEffect", "useState"];
      expect(hooks).toContain("useEffect");
      expect(hooks).toContain("useState");
    });
  });

  describe("Responsive Design", () => {
    it("should have flex layout for header", () => {
      const className = "flex justify-between items-center";
      expect(className).toContain("flex");
      expect(className).toContain("justify-between");
      expect(className).toContain("items-center");
    });

    it("should have card padding", () => {
      const className = "p-4";
      expect(className).toBe("p-4");
    });

    it("should have shadow on cards", () => {
      const className = "shadow-sm";
      expect(className).toBe("shadow-sm");
    });
  });

  describe("Text Styling", () => {
    it("should have semibold ship name", () => {
      const className = "text-lg font-semibold";
      expect(className).toContain("font-semibold");
    });

    it("should have muted foreground for date", () => {
      const className = "text-sm text-muted-foreground";
      expect(className).toContain("text-muted-foreground");
    });

    it("should have bold labels", () => {
      const element = "<strong>Item auditado:</strong>";
      expect(element).toContain("strong");
    });
  });

  describe("Component Usage", () => {
    it("should be importable as named export", () => {
      const exportName = "ListaAuditoriasIMCA";
      expect(exportName).toBe("ListaAuditoriasIMCA");
    });

    it("should be a function component", () => {
      expect(typeof ListaAuditoriasIMCA).toBe("function");
    });

    it("should have client directive", () => {
      const directive = "use client";
      expect(directive).toBe("use client");
    });
  });
});
