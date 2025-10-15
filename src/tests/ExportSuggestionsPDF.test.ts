import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportSuggestionsToPDF, WorkflowSuggestion } from "@/components/workflows/ExportSuggestionsPDF";
import jsPDF from "jspdf";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockDoc = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    save: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

describe("ExportSuggestionsPDF", () => {
  let mockDoc: {
    setFontSize: ReturnType<typeof vi.fn>;
    setFont: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
    addPage: ReturnType<typeof vi.fn>;
    setDrawColor: ReturnType<typeof vi.fn>;
    line: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    splitTextToSize: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create a new mock document before each test
    mockDoc = {
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      save: vi.fn(),
      splitTextToSize: vi.fn((text: string) => [text]),
    };
    
    // Reset the jsPDF mock to return our mockDoc
    vi.mocked(jsPDF).mockReturnValue(mockDoc as unknown as jsPDF);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("exportSuggestionsToPDF", () => {
    it("should create a PDF document with proper title", () => {
      const suggestions: WorkflowSuggestion[] = [
        {
          etapa: "Etapa 1",
          tipo_sugestao: "Melhoria",
          conteudo: "Sugestão de melhoria",
          criticidade: "media",
          responsavel_sugerido: "João Silva",
        },
      ];

      exportSuggestionsToPDF(suggestions);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
      expect(mockDoc.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockDoc.text).toHaveBeenCalledWith(
        "Plano de Acoes IA - Workflow",
        20,
        20
      );
    });

    it("should include metadata with date and total suggestions", () => {
      const suggestions: WorkflowSuggestion[] = [
        {
          etapa: "Etapa 1",
          tipo_sugestao: "Melhoria",
          conteudo: "Sugestão 1",
          criticidade: "alta",
          responsavel_sugerido: "Maria",
        },
        {
          etapa: "Etapa 2",
          tipo_sugestao: "Ajuste",
          conteudo: "Sugestão 2",
          criticidade: "baixa",
          responsavel_sugerido: "Pedro",
        },
      ];

      exportSuggestionsToPDF(suggestions);

      // Check that metadata is rendered
      expect(mockDoc.setFontSize).toHaveBeenCalledWith(9);
      // The text call with "Total de sugestoes: 2" should be made
      const textCalls = mockDoc.text.mock.calls;
      const hasMetadata = textCalls.some((call) =>
        String(call[0]).includes("Total de sugestoes: 2")
      );
      expect(hasMetadata).toBe(true);
    });

    it("should render all suggestion fields correctly", () => {
      const suggestion: WorkflowSuggestion = {
        etapa: "Análise Inicial",
        tipo_sugestao: "Otimização",
        conteudo: "Implementar cache de dados para melhorar performance",
        criticidade: "alta",
        responsavel_sugerido: "Equipe de Desenvolvimento",
      };

      exportSuggestionsToPDF([suggestion]);

      const textCalls = mockDoc.text.mock.calls;
      const renderedTexts = textCalls.map((call) => String(call[0]));

      // Verify that all fields are present in the rendered text
      expect(renderedTexts).toContain("Etapa:");
      expect(renderedTexts).toContain("Tipo:");
      expect(renderedTexts).toContain("Conteudo:");
      expect(renderedTexts).toContain("Criticidade:");
      expect(renderedTexts).toContain("Responsavel:");
    });

    it("should handle empty suggestions array", () => {
      const suggestions: WorkflowSuggestion[] = [];

      exportSuggestionsToPDF(suggestions);

      // Should still create PDF with title and metadata
      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalled();
      
      const textCalls = mockDoc.text.mock.calls;
      const hasMetadata = textCalls.some((call) =>
        String(call[0]).includes("Total de sugestoes: 0")
      );
      expect(hasMetadata).toBe(true);
    });

    it("should handle multiple suggestions without errors", () => {
      const suggestions: WorkflowSuggestion[] = Array.from({ length: 5 }, (_, i) => ({
        etapa: `Etapa ${i + 1}`,
        tipo_sugestao: "Melhoria",
        conteudo: `Conteúdo da sugestão ${i + 1}`,
        criticidade: "media" as const,
        responsavel_sugerido: `Responsável ${i + 1}`,
      }));

      exportSuggestionsToPDF(suggestions);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalled();
      
      // Check that separator lines are drawn between suggestions
      expect(mockDoc.line).toHaveBeenCalled();
    });

    it("should use proper Portuguese labels", () => {
      const suggestion: WorkflowSuggestion = {
        etapa: "Teste",
        tipo_sugestao: "Teste",
        conteudo: "Teste",
        criticidade: "baixa",
        responsavel_sugerido: "Teste",
      };

      exportSuggestionsToPDF([suggestion]);

      const textCalls = mockDoc.text.mock.calls;
      const renderedTexts = textCalls.map((call) => String(call[0]));

      // Verify Portuguese labels
      expect(renderedTexts).toContain("Plano de Acoes IA - Workflow");
      expect(renderedTexts).toContain("Etapa:");
      expect(renderedTexts).toContain("Tipo:");
      expect(renderedTexts).toContain("Conteudo:");
      expect(renderedTexts).toContain("Criticidade:");
      expect(renderedTexts).toContain("Responsavel:");
    });

    it("should save PDF with formatted filename", () => {
      const suggestions: WorkflowSuggestion[] = [
        {
          etapa: "Etapa",
          tipo_sugestao: "Tipo",
          conteudo: "Conteúdo",
          criticidade: "media",
          responsavel_sugerido: "Responsável",
        },
      ];

      exportSuggestionsToPDF(suggestions);

      expect(mockDoc.save).toHaveBeenCalled();
      const saveCall = mockDoc.save.mock.calls[0];
      const filename = String(saveCall[0]);
      
      // Verify filename format: Plano-Acoes-Workflow-YYYY-MM-DD.pdf
      expect(filename).toMatch(/^Plano-Acoes-Workflow-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it("should handle all criticidade levels", () => {
      const criticidades: Array<"baixa" | "media" | "alta" | "critica"> = [
        "baixa",
        "media",
        "alta",
        "critica",
      ];

      criticidades.forEach((criticidade) => {
        const suggestion: WorkflowSuggestion = {
          etapa: "Etapa",
          tipo_sugestao: "Tipo",
          conteudo: "Conteúdo",
          criticidade,
          responsavel_sugerido: "Responsável",
        };

        exportSuggestionsToPDF([suggestion]);
        
        const textCalls = mockDoc.text.mock.calls;
        const renderedTexts = textCalls.map((call) => String(call[0]));
        
        expect(renderedTexts).toContain(criticidade);
        
        vi.clearAllMocks();
      });
    });
  });
});
