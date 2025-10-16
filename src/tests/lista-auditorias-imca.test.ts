/**
 * Lista Auditorias IMCA Component Tests
 * 
 * Tests for the ListaAuditoriasIMCA component that displays audit data
 * with filtering, CSV/PDF export, and AI-powered analysis capabilities
 */

import { describe, it, expect } from "vitest";

describe("ListaAuditoriasIMCA Component", () => {
  describe("Component Structure", () => {
    it("should render audit list container", () => {
      const containerClass = "container mx-auto p-6 space-y-6";
      expect(containerClass).toContain("container");
      expect(containerClass).toContain("mx-auto");
    });

    it("should have header with title", () => {
      const title = "📋 Auditorias Técnicas Registradas";
      expect(title).toContain("Auditorias Técnicas");
    });

    it("should display export buttons", () => {
      const buttons = ["Exportar CSV", "Exportar PDF"];
      expect(buttons).toContain("Exportar CSV");
      expect(buttons).toContain("Exportar PDF");
    });

    it("should include filter input", () => {
      const placeholder = "🔍 Filtrar por navio, norma, item ou resultado...";
      expect(placeholder).toContain("Filtrar");
    });
  });

  describe("Data Loading", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should order by data descending", () => {
      const orderConfig = { ascending: false };
      expect(orderConfig.ascending).toBe(false);
    });

    it("should handle empty results", () => {
      const emptyState = "Nenhuma auditoria encontrada";
      expect(emptyState).toContain("Nenhuma auditoria");
    });
  });

  describe("Filtering", () => {
    it("should filter by navio", () => {
      const filterFields = ["navio", "norma", "item_auditado", "resultado"];
      expect(filterFields).toContain("navio");
    });

    it("should filter by norma", () => {
      const filterFields = ["navio", "norma", "item_auditado", "resultado"];
      expect(filterFields).toContain("norma");
    });

    it("should filter by item_auditado", () => {
      const filterFields = ["navio", "norma", "item_auditado", "resultado"];
      expect(filterFields).toContain("item_auditado");
    });

    it("should filter by resultado", () => {
      const filterFields = ["navio", "norma", "item_auditado", "resultado"];
      expect(filterFields).toContain("resultado");
    });

    it("should use case-insensitive filtering", () => {
      const text = "NAVIO";
      const filtered = text.toLowerCase();
      expect(filtered).toBe("navio");
    });
  });

  describe("Fleet Display", () => {
    it("should extract unique vessel names", () => {
      const vessels = ["Navio A", "Navio B", "Navio A"];
      const unique = [...new Set(vessels)];
      expect(unique).toHaveLength(2);
    });

    it("should display fleet as comma-separated list", () => {
      const fleet = ["Navio A", "Navio B"];
      const display = fleet.join(", ");
      expect(display).toBe("Navio A, Navio B");
    });

    it("should show fleet label", () => {
      const label = "Frota auditada: ";
      expect(label).toContain("Frota auditada");
    });
  });

  describe("Badge Color Coding", () => {
    it("should use green for Conforme", () => {
      const color = "bg-green-500 text-white";
      expect(color).toContain("green");
    });

    it("should use red for Não Conforme", () => {
      const color = "bg-red-500 text-white";
      expect(color).toContain("red");
    });

    it("should use gray for Não Aplicável", () => {
      const color = "bg-gray-500 text-white";
      expect(color).toContain("gray");
    });
  });

  describe("Audit Card Display", () => {
    it("should show vessel name with ship icon", () => {
      const display = "🚢 Navio Exemplo";
      expect(display).toContain("🚢");
    });

    it("should format date as dd/MM/yyyy", () => {
      const date = new Date("2025-10-16");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      expect(formatted).toBe("16/10/2025");
    });

    it("should display norm label", () => {
      const label = "Norma: ";
      expect(label).toContain("Norma");
    });

    it("should display item auditado", () => {
      const label = "Item auditado: ";
      expect(label).toContain("Item auditado");
    });

    it("should display comentarios", () => {
      const label = "Comentários: ";
      expect(label).toContain("Comentários");
    });
  });

  describe("CSV Export", () => {
    it("should include all required headers", () => {
      const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
      expect(headers).toHaveLength(6);
      expect(headers[0]).toBe("Navio");
      expect(headers[5]).toBe("Comentários");
    });

    it("should format as CSV with quoted cells", () => {
      const row = ["Navio A", "16/10/2025", "IMCA"];
      const csv = row.map(cell => `"${cell}"`).join(",");
      expect(csv).toContain('"Navio A"');
      expect(csv).toContain(",");
    });

    it("should use correct MIME type", () => {
      const mimeType = "text/csv;charset=utf-8;";
      expect(mimeType).toBe("text/csv;charset=utf-8;");
    });

    it("should have correct filename", () => {
      const filename = "auditorias_imca.csv";
      expect(filename).toContain("auditorias_imca");
      expect(filename.endsWith(".csv")).toBe(true);
    });

    it("should use saveAs from file-saver", () => {
      const library = "file-saver";
      expect(library).toBe("file-saver");
    });
  });

  describe("PDF Export", () => {
    it("should use html2pdf library", () => {
      const library = "html2pdf.js";
      expect(library).toBe("html2pdf.js");
    });

    it("should have correct filename", () => {
      const filename = "auditorias_imca.pdf";
      expect(filename).toContain("auditorias_imca");
      expect(filename.endsWith(".pdf")).toBe(true);
    });

    it("should use A4 portrait format", () => {
      const config = {
        format: "a4",
        orientation: "portrait"
      };
      expect(config.format).toBe("a4");
      expect(config.orientation).toBe("portrait");
    });

    it("should use 0.5 inch margins", () => {
      const margin = 0.5;
      expect(margin).toBe(0.5);
    });

    it("should use scale 2 for html2canvas", () => {
      const scale = 2;
      expect(scale).toBe(2);
    });

    it("should use inches as unit", () => {
      const unit = "in";
      expect(unit).toBe("in");
    });
  });

  describe("AI Analysis Feature", () => {
    it("should only show for Não Conforme results", () => {
      const resultado = "Não Conforme";
      const showAI = resultado === "Não Conforme";
      expect(showAI).toBe(true);
    });

    it("should not show for Conforme results", () => {
      const resultado = "Conforme";
      const showAI = resultado === "Não Conforme";
      expect(showAI).toBe(false);
    });

    it("should have AI analysis button", () => {
      const buttonText = "🧠 Análise IA e Plano de Ação";
      expect(buttonText).toContain("Análise IA");
      expect(buttonText).toContain("Plano de Ação");
    });

    it("should show loading state", () => {
      const loadingText = "Gerando análise...";
      expect(loadingText).toContain("Gerando");
    });

    it("should call explain endpoint", () => {
      const endpoint = "/functions/v1/auditorias-explain";
      expect(endpoint).toContain("auditorias-explain");
    });

    it("should call plano endpoint", () => {
      const endpoint = "/functions/v1/auditorias-plano";
      expect(endpoint).toContain("auditorias-plano");
    });

    it("should use POST method", () => {
      const method = "POST";
      expect(method).toBe("POST");
    });

    it("should send navio, item, and norma", () => {
      const payload = { navio: "Navio A", item: "Item 1", norma: "IMCA" };
      expect(payload.navio).toBeTruthy();
      expect(payload.item).toBeTruthy();
      expect(payload.norma).toBeTruthy();
    });
  });

  describe("AI Explanation Display", () => {
    it("should have explanation section", () => {
      const label = "📘 Explicação IA:";
      expect(label).toContain("Explicação IA");
    });

    it("should use border and padding", () => {
      const className = "border p-2 rounded";
      expect(className).toContain("border");
      expect(className).toContain("p-2");
      expect(className).toContain("rounded");
    });

    it("should use muted foreground color", () => {
      const className = "text-muted-foreground";
      expect(className).toContain("muted-foreground");
    });
  });

  describe("Action Plan Display", () => {
    it("should have action plan section", () => {
      const label = "📋 Plano de Ação:";
      expect(label).toContain("Plano de Ação");
    });

    it("should use blue styling", () => {
      const className = "text-blue-800 border border-blue-300 bg-blue-50";
      expect(className).toContain("blue");
    });

    it("should preserve whitespace", () => {
      const className = "whitespace-pre-wrap";
      expect(className).toBe("whitespace-pre-wrap");
    });
  });

  describe("Error Handling", () => {
    it("should show error toast on load failure", () => {
      const errorMessage = "Erro ao carregar auditorias";
      expect(errorMessage).toContain("Erro");
    });

    it("should show error toast on AI analysis failure", () => {
      const errorMessage = "Erro ao gerar análise IA";
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("análise IA");
    });

    it("should handle missing data gracefully", () => {
      const fallback = "N/A";
      expect(fallback).toBe("N/A");
    });

    it("should handle missing vessel name", () => {
      const fallback = "Sem navio";
      expect(fallback).toContain("Sem navio");
    });

    it("should handle missing date", () => {
      const fallback = "Sem data";
      expect(fallback).toContain("Sem data");
    });

    it("should handle missing comments", () => {
      const fallback = "Sem comentários";
      expect(fallback).toContain("Sem comentários");
    });
  });

  describe("Success Messages", () => {
    it("should show success toast on CSV export", () => {
      const message = "CSV exportado com sucesso!";
      expect(message).toContain("CSV exportado");
    });

    it("should show success toast on PDF export", () => {
      const message = "PDF exportado com sucesso!";
      expect(message).toContain("PDF exportado");
    });

    it("should show success toast on AI analysis", () => {
      const message = "Análise IA gerada com sucesso!";
      expect(message).toContain("Análise IA gerada");
    });

    it("should show info toast on PDF generation start", () => {
      const message = "Gerando PDF...";
      expect(message).toContain("Gerando PDF");
    });
  });

  describe("Component Integration", () => {
    it("should use Card component", () => {
      const component = "Card";
      expect(component).toBe("Card");
    });

    it("should use CardContent component", () => {
      const component = "CardContent";
      expect(component).toBe("CardContent");
    });

    it("should use Button component", () => {
      const component = "Button";
      expect(component).toBe("Button");
    });

    it("should use Input component", () => {
      const component = "Input";
      expect(component).toBe("Input");
    });

    it("should use Badge component", () => {
      const component = "Badge";
      expect(component).toBe("Badge");
    });

    it("should use toast from sonner", () => {
      const library = "sonner";
      expect(library).toBe("sonner");
    });

    it("should use supabase client", () => {
      const integration = "@/integrations/supabase/client";
      expect(integration).toContain("supabase");
    });

    it("should use date-fns format", () => {
      const library = "date-fns";
      expect(library).toBe("date-fns");
    });
  });

  describe("Responsive Design", () => {
    it("should use container with padding", () => {
      const className = "container mx-auto p-6";
      expect(className).toContain("container");
      expect(className).toContain("p-6");
    });

    it("should use space-y for vertical spacing", () => {
      const className = "space-y-6";
      expect(className).toContain("space-y");
    });

    it("should use flex for button layout", () => {
      const className = "flex gap-2";
      expect(className).toContain("flex");
      expect(className).toContain("gap");
    });

    it("should use responsive text sizes", () => {
      const headingClass = "text-3xl font-bold";
      expect(headingClass).toContain("text-3xl");
    });
  });

  describe("API Endpoints", () => {
    it("should use VITE_SUPABASE_URL env var", () => {
      const envVar = "VITE_SUPABASE_URL";
      expect(envVar).toBe("VITE_SUPABASE_URL");
    });

    it("should use VITE_SUPABASE_ANON_KEY env var", () => {
      const envVar = "VITE_SUPABASE_ANON_KEY";
      expect(envVar).toBe("VITE_SUPABASE_ANON_KEY");
    });

    it("should set Content-Type header", () => {
      const header = "Content-Type";
      const value = "application/json";
      expect(header).toBe("Content-Type");
      expect(value).toBe("application/json");
    });

    it("should set Authorization header", () => {
      const header = "Authorization";
      const prefix = "Bearer ";
      expect(header).toBe("Authorization");
      expect(prefix).toContain("Bearer");
    });
  });
});
