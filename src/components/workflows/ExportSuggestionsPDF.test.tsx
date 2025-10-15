import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportSuggestionsToPDF, WorkflowSuggestion } from "./ExportSuggestionsPDF";
import jsPDF from "jspdf";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockPDF = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
    },
  };

  return {
    default: vi.fn(() => mockPDF),
  };
});

describe("ExportSuggestionsPDF", () => {
  const mockSuggestions: WorkflowSuggestion[] = [
    {
      etapa: "Aprovação de Despesas",
      tipo_sugestao: "Otimização de Processo",
      conteudo: "Implementar aprovação automática",
      criticidade: "Média",
      responsavel_sugerido: "Gerente Financeiro",
    },
    {
      etapa: "Onboarding",
      tipo_sugestao: "Melhoria",
      conteudo: "Criar checklist digital",
      criticidade: "Alta",
      responsavel_sugerido: "RH",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw error when suggestions array is empty", () => {
    expect(() => exportSuggestionsToPDF([])).toThrow("Nenhuma sugestão para exportar");
  });

  it("should throw error when suggestions is null", () => {
    expect(() => exportSuggestionsToPDF(null as any)).toThrow(
      "Nenhuma sugestão para exportar"
    );
  });

  it("should create PDF with correct title and date", () => {
    exportSuggestionsToPDF(mockSuggestions);

    const mockPDFInstance = (jsPDF as any)();
    
    // Verify title formatting
    expect(mockPDFInstance.setFontSize).toHaveBeenCalledWith(16);
    expect(mockPDFInstance.setFont).toHaveBeenCalledWith("helvetica", "bold");
    expect(mockPDFInstance.text).toHaveBeenCalledWith(
      "📄 Plano de Ações IA - Workflow",
      20,
      20
    );
  });

  it("should process all suggestions", () => {
    exportSuggestionsToPDF(mockSuggestions);

    const mockPDFInstance = (jsPDF as any)();
    
    // Should call splitTextToSize for each field of each suggestion
    // Each suggestion has 5 fields: etapa, tipo_sugestao, conteudo, criticidade, responsavel_sugerido
    expect(mockPDFInstance.splitTextToSize).toHaveBeenCalledTimes(
      mockSuggestions.length * 5
    );
  });

  it("should save PDF with correct filename pattern", () => {
    exportSuggestionsToPDF(mockSuggestions);

    const mockPDFInstance = (jsPDF as any)();
    
    expect(mockPDFInstance.save).toHaveBeenCalledTimes(1);
    const savedFilename = mockPDFInstance.save.mock.calls[0][0];
    expect(savedFilename).toMatch(/^Plano-Acoes-Workflow-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it("should handle error gracefully and throw with appropriate message", () => {
    // Mock jsPDF to throw an error
    const mockPDFInstance = (jsPDF as any)();
    mockPDFInstance.text.mockImplementation(() => {
      throw new Error("PDF generation failed");
    });

    expect(() => exportSuggestionsToPDF(mockSuggestions)).toThrow(
      "Erro ao gerar PDF. Por favor, tente novamente."
    );
  });

  it("should include all required fields in the PDF", () => {
    exportSuggestionsToPDF(mockSuggestions);

    const mockPDFInstance = (jsPDF as any)();
    const textCalls = mockPDFInstance.text.mock.calls;

    // Check that all field labels are present
    const labels = textCalls.map((call: any) => call[0]);
    expect(labels).toContain("🧩 Etapa:");
    expect(labels).toContain("📌 Tipo:");
    expect(labels).toContain("💬 Conteúdo:");
    expect(labels).toContain("🔥 Criticidade:");
    expect(labels).toContain("👤 Responsável:");
  });

  it("should add separator lines between suggestions", () => {
    exportSuggestionsToPDF(mockSuggestions);

    const mockPDFInstance = (jsPDF as any)();
    
    // Should call line() for horizontal separator and between suggestions
    expect(mockPDFInstance.line).toHaveBeenCalled();
    expect(mockPDFInstance.setLineWidth).toHaveBeenCalled();
  });
});
