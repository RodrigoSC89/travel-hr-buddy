import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSuggestionsToPDF, type Suggestion } from "@/components/workflows/ExportSuggestionsPDF";
import jsPDF from "jspdf";
import { format } from "date-fns";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
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
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

describe("ExportSuggestionsPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export PDF with proper title and metadata", () => {
    const suggestions: Suggestion[] = [
      {
        etapa: "Planejamento",
        tipo_sugestao: "Análise de Riscos",
        conteudo: "Realizar análise de riscos detalhada",
        criticidade: "Alta",
        responsavel_sugerido: "Project Manager"
      }
    ];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    
    // Check title
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Plano de Acoes IA - Workflow",
      20,
      20
    );

    // Check metadata includes date
    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining("Data:"),
      20,
      30
    );

    // Check total count
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Total de sugestoes: 1",
      20,
      35
    );
  });

  it("should export all suggestion fields", () => {
    const suggestions: Suggestion[] = [
      {
        etapa: "Desenvolvimento",
        tipo_sugestao: "Code Review",
        conteudo: "Implementar revisão de código em pares",
        criticidade: "Média",
        responsavel_sugerido: "Tech Lead"
      }
    ];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

    // Check that all fields are present
    expect(mockDoc.text).toHaveBeenCalledWith("Etapa:", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Tipo:", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Conteudo:", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Criticidade:", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Responsavel:", 20, expect.any(Number));
  });

  it("should handle multiple suggestions", () => {
    const suggestions: Suggestion[] = [
      {
        etapa: "Planejamento",
        tipo_sugestao: "Análise",
        conteudo: "Conteúdo 1",
        criticidade: "Alta",
        responsavel_sugerido: "Manager 1"
      },
      {
        etapa: "Desenvolvimento",
        tipo_sugestao: "Code Review",
        conteudo: "Conteúdo 2",
        criticidade: "Média",
        responsavel_sugerido: "Manager 2"
      },
      {
        etapa: "Testes",
        tipo_sugestao: "Automação",
        conteudo: "Conteúdo 3",
        criticidade: "Alta",
        responsavel_sugerido: "Manager 3"
      }
    ];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

    // Check that suggestion headers are created for each
    expect(mockDoc.text).toHaveBeenCalledWith("Sugestao 1", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Sugestao 2", 20, expect.any(Number));
    expect(mockDoc.text).toHaveBeenCalledWith("Sugestao 3", 20, expect.any(Number));

    // Check separator lines (should be 2 for 3 suggestions)
    expect(mockDoc.line).toHaveBeenCalledTimes(2);
  });

  it("should use proper font styles", () => {
    const suggestions: Suggestion[] = [
      {
        etapa: "Test",
        tipo_sugestao: "Test Type",
        conteudo: "Test Content",
        criticidade: "Test Criticality",
        responsavel_sugerido: "Test Responsible"
      }
    ];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

    // Check font sizes are set
    expect(mockDoc.setFontSize).toHaveBeenCalledWith(16); // Title
    expect(mockDoc.setFontSize).toHaveBeenCalledWith(10); // Metadata
    expect(mockDoc.setFontSize).toHaveBeenCalledWith(12); // Suggestion header

    // Check font styles are set
    expect(mockDoc.setFont).toHaveBeenCalledWith("helvetica", "bold");
    expect(mockDoc.setFont).toHaveBeenCalledWith("helvetica", "normal");
  });

  it("should save PDF with proper filename", () => {
    const suggestions: Suggestion[] = [
      {
        etapa: "Test",
        tipo_sugestao: "Test",
        conteudo: "Test",
        criticidade: "Test",
        responsavel_sugerido: "Test"
      }
    ];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const expectedDate = format(new Date(), "yyyy-MM-dd");

    expect(mockDoc.save).toHaveBeenCalledWith(`Plano-Acoes-Workflow-${expectedDate}.pdf`);
  });

  it("should handle empty suggestions array", () => {
    const suggestions: Suggestion[] = [];

    exportSuggestionsToPDF(suggestions);

    const mockDoc = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

    // Should still create PDF with title and metadata
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Plano de Acoes IA - Workflow",
      20,
      20
    );
    expect(mockDoc.text).toHaveBeenCalledWith(
      "Total de sugestoes: 0",
      20,
      35
    );
    expect(mockDoc.save).toHaveBeenCalled();
  });

  it("should handle long content with splitTextToSize", () => {
    const longContent = "A".repeat(200);
    const suggestions: Suggestion[] = [
      {
        etapa: "Test",
        tipo_sugestao: "Test",
        conteudo: longContent,
        criticidade: "Test",
        responsavel_sugerido: "Test"
      }
    ];

    const mockDoc = {
      internal: {
        pageSize: {
          getWidth: vi.fn(() => 210),
          getHeight: vi.fn(() => 297),
        },
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      splitTextToSize: vi.fn(() => ["Line 1", "Line 2", "Line 3"]),
      addPage: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      save: vi.fn(),
    };

    (jsPDF as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockDoc);

    exportSuggestionsToPDF(suggestions);

    // Check that splitTextToSize was called for long content
    expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(
      longContent,
      expect.any(Number)
    );
  });

  it("should add new page when content exceeds page height", () => {
    // Create many suggestions to trigger page break
    const suggestions: Suggestion[] = Array(20).fill(null).map((_, i) => ({
      etapa: `Etapa ${i}`,
      tipo_sugestao: `Tipo ${i}`,
      conteudo: `Conteúdo muito longo ${i} `.repeat(10),
      criticidade: "Alta",
      responsavel_sugerido: `Responsável ${i}`
    }));

    const mockDoc = {
      internal: {
        pageSize: {
          getWidth: vi.fn(() => 210),
          getHeight: vi.fn(() => 297),
        },
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      splitTextToSize: vi.fn((text: string) => [text, text, text]), // Simulate long text
      addPage: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      save: vi.fn(),
    };

    (jsPDF as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockDoc);

    exportSuggestionsToPDF(suggestions);

    // Should add pages for overflow content
    expect(mockDoc.addPage).toHaveBeenCalled();
  });
});
