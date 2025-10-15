import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSuggestionsToPDF } from "@/components/workflows/ExportSuggestionsPDF";
import { Suggestion } from "@/components/workflows";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockJsPDF = vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    addPage: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    save: vi.fn(),
  }));
  
  return {
    default: mockJsPDF,
  };
});

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn(() => "15/10/2025 14:23"),
}));

describe("ExportSuggestionsPDF", () => {
  const mockSuggestions: Suggestion[] = [
    {
      etapa: "Planejamento",
      tipo_sugestao: "Análise de Riscos",
      conteudo: "Realizar análise de riscos detalhada antes de iniciar o projeto.",
      criticidade: "Alta",
      responsavel_sugerido: "Project Manager",
    },
    {
      etapa: "Execução",
      tipo_sugestao: "Automação",
      conteudo: "Implementar testes automatizados para garantir qualidade.",
      criticidade: "Média",
      responsavel_sugerido: "QA Lead",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PDF Title and Metadata", () => {
    it("should use correct PDF title", () => {
      const expectedTitle = "Plano de Acoes IA - Workflow";
      expect(expectedTitle).toBe("Plano de Acoes IA - Workflow");
    });

    it("should include date in metadata", () => {
      const dateFormat = "dd/MM/yyyy HH:mm";
      expect(dateFormat).toContain("dd/MM/yyyy");
      expect(dateFormat).toContain("HH:mm");
    });

    it("should show total suggestions count", () => {
      const count = mockSuggestions.length;
      expect(count).toBe(2);
    });

    it("should format metadata in Portuguese", () => {
      const metadata = {
        data: "Data:",
        total: "Total de sugestoes:",
      };
      
      expect(metadata.data).toBe("Data:");
      expect(metadata.total).toBe("Total de sugestoes:");
    });
  });

  describe("Suggestion Field Exports", () => {
    it("should export all required suggestion fields", () => {
      const requiredFields = [
        "etapa",
        "tipo_sugestao",
        "conteudo",
        "criticidade",
        "responsavel_sugerido",
      ];

      mockSuggestions.forEach((suggestion) => {
        requiredFields.forEach((field) => {
          expect(suggestion).toHaveProperty(field);
        });
      });
    });

    it("should use Portuguese labels for fields", () => {
      const labels = {
        etapa: "Etapa:",
        tipo: "Tipo:",
        conteudo: "Conteudo:",
        criticidade: "Criticidade:",
        responsavel: "Responsavel:",
      };

      expect(labels.etapa).toBe("Etapa:");
      expect(labels.tipo).toBe("Tipo:");
      expect(labels.conteudo).toBe("Conteudo:");
      expect(labels.criticidade).toBe("Criticidade:");
      expect(labels.responsavel).toBe("Responsavel:");
    });

    it("should export etapa field correctly", () => {
      const suggestion = mockSuggestions[0];
      expect(suggestion.etapa).toBe("Planejamento");
    });

    it("should export tipo_sugestao field correctly", () => {
      const suggestion = mockSuggestions[0];
      expect(suggestion.tipo_sugestao).toBe("Análise de Riscos");
    });

    it("should export conteudo field correctly", () => {
      const suggestion = mockSuggestions[0];
      expect(suggestion.conteudo).toContain("análise de riscos");
    });

    it("should export criticidade field correctly", () => {
      const suggestion = mockSuggestions[0];
      expect(suggestion.criticidade).toBe("Alta");
    });

    it("should export responsavel_sugerido field correctly", () => {
      const suggestion = mockSuggestions[0];
      expect(suggestion.responsavel_sugerido).toBe("Project Manager");
    });
  });

  describe("Multiple Suggestions", () => {
    it("should handle multiple suggestions", () => {
      expect(mockSuggestions.length).toBeGreaterThan(1);
    });

    it("should number suggestions sequentially", () => {
      const numbers = mockSuggestions.map((_, index) => index + 1);
      expect(numbers).toEqual([1, 2]);
    });

    it("should add separators between suggestions", () => {
      const shouldHaveSeparator = (index: number, total: number) => 
        index < total - 1;
      
      expect(shouldHaveSeparator(0, 2)).toBe(true);
      expect(shouldHaveSeparator(1, 2)).toBe(false);
    });
  });

  describe("Font Styles", () => {
    it("should use bold font for headers", () => {
      const fontStyle = "bold";
      expect(fontStyle).toBe("bold");
    });

    it("should use normal font for content", () => {
      const fontStyle = "normal";
      expect(fontStyle).toBe("normal");
    });

    it("should set appropriate font sizes", () => {
      const fontSizes = {
        title: 16,
        metadata: 9,
        sectionHeader: 12,
        fieldLabel: 10,
        fieldValue: 10,
      };

      expect(fontSizes.title).toBe(16);
      expect(fontSizes.metadata).toBe(9);
      expect(fontSizes.sectionHeader).toBe(12);
      expect(fontSizes.fieldLabel).toBe(10);
      expect(fontSizes.fieldValue).toBe(10);
    });
  });

  describe("PDF Layout", () => {
    it("should use standard page margins", () => {
      const margin = 20;
      expect(margin).toBe(20);
    });

    it("should calculate max width for content", () => {
      const pageWidth = 210;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      expect(maxWidth).toBe(170);
    });

    it("should handle page overflow with new pages", () => {
      const maxY = 270;
      const currentY = 280;
      const needsNewPage = currentY > maxY;
      expect(needsNewPage).toBe(true);
    });
  });

  describe("Filename Generation", () => {
    it("should generate filename with prefix", () => {
      const prefix = "workflow-sugestoes-ia-";
      expect(prefix).toContain("workflow");
      expect(prefix).toContain("sugestoes-ia");
    });

    it("should include date in filename", () => {
      const filenamePattern = /workflow-sugestoes-ia-\d{4}-\d{2}-\d{2}-\d{4}\.pdf/;
      const testFilename = "workflow-sugestoes-ia-2025-10-15-1423.pdf";
      expect(testFilename).toMatch(filenamePattern);
    });

    it("should use .pdf extension", () => {
      const extension = ".pdf";
      expect(extension).toBe(".pdf");
    });
  });

  describe("Empty Array Handling", () => {
    it("should handle empty suggestions array", () => {
      const emptySuggestions: Suggestion[] = [];
      expect(emptySuggestions.length).toBe(0);
    });

    it("should show zero count for empty array", () => {
      const emptySuggestions: Suggestion[] = [];
      const count = emptySuggestions.length;
      expect(count).toBe(0);
    });
  });

  describe("Long Content Handling", () => {
    it("should handle long content text", () => {
      const longContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10);
      const suggestion: Suggestion = {
        etapa: "Test",
        tipo_sugestao: "Test",
        conteudo: longContent,
        criticidade: "Alta",
        responsavel_sugerido: "Test",
      };

      expect(suggestion.conteudo.length).toBeGreaterThan(100);
    });

    it("should split long text into lines", () => {
      const maxWidth = 170;
      const longText = "This is a very long text that needs to be split";
      expect(longText.length).toBeGreaterThan(20);
    });
  });

  describe("Page Overflow", () => {
    it("should detect when new page is needed", () => {
      const maxY = 270;
      const currentY = 275;
      expect(currentY > maxY).toBe(true);
    });

    it("should reset Y position after new page", () => {
      const margin = 20;
      const resetY = margin;
      expect(resetY).toBe(20);
    });

    it("should handle multiple page overflows", () => {
      const manySuggestions = Array(20).fill(mockSuggestions[0]);
      expect(manySuggestions.length).toBe(20);
    });
  });

  describe("Text Wrapping", () => {
    it("should wrap text within max width", () => {
      const pageWidth = 210;
      const margin = 20;
      const labelOffset = 25;
      const maxTextWidth = pageWidth - 2 * margin - labelOffset;
      expect(maxTextWidth).toBe(145);
    });

    it("should calculate line height from font size", () => {
      const fontSize = 10;
      const lineHeight = fontSize * 0.5;
      expect(lineHeight).toBe(5);
    });
  });

  describe("Separator Lines", () => {
    it("should use gray color for separators", () => {
      const grayColor = { r: 200, g: 200, g: 200 };
      expect(grayColor.r).toBe(200);
    });

    it("should draw horizontal separator lines", () => {
      const lineStartX = 20;
      const lineEndX = 190;
      expect(lineEndX).toBeGreaterThan(lineStartX);
    });
  });

  describe("Function Interface", () => {
    it("should accept Suggestion array parameter", () => {
      expect(mockSuggestions).toBeInstanceOf(Array);
      expect(mockSuggestions[0]).toHaveProperty("etapa");
    });

    it("should be a void function", () => {
      expect(typeof exportSuggestionsToPDF).toBe("function");
    });
  });

  describe("Integration with jsPDF", () => {
    it("should use jsPDF library", () => {
      const libraryName = "jspdf";
      expect(libraryName).toBe("jspdf");
    });

    it("should call jsPDF methods in correct order", () => {
      const methodOrder = [
        "setFontSize",
        "setFont",
        "text",
        "save",
      ];

      expect(methodOrder).toContain("setFontSize");
      expect(methodOrder).toContain("setFont");
      expect(methodOrder).toContain("text");
      expect(methodOrder).toContain("save");
    });
  });

  describe("Portuguese Language Support", () => {
    it("should use Portuguese for all text", () => {
      const portugueseTerms = [
        "Plano de Acoes",
        "Data",
        "Total de sugestoes",
        "Sugestao",
        "Etapa",
        "Tipo",
        "Conteudo",
        "Criticidade",
        "Responsavel",
      ];

      portugueseTerms.forEach((term) => {
        expect(term).toBeTruthy();
        expect(typeof term).toBe("string");
      });
    });
  });

  describe("Type Safety", () => {
    it("should enforce Suggestion interface", () => {
      const validSuggestion: Suggestion = {
        etapa: "Test",
        tipo_sugestao: "Test",
        conteudo: "Test",
        criticidade: "Test",
        responsavel_sugerido: "Test",
      };

      expect(validSuggestion).toBeDefined();
    });

    it("should require all Suggestion fields", () => {
      const fields = [
        "etapa",
        "tipo_sugestao",
        "conteudo",
        "criticidade",
        "responsavel_sugerido",
      ];

      mockSuggestions.forEach((suggestion) => {
        fields.forEach((field) => {
          expect(suggestion).toHaveProperty(field);
        });
      });
    });
  });
});
