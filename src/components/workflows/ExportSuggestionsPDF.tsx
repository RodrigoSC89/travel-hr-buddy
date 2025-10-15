import { format } from "date-fns";
import jsPDF from "jspdf";
import { Suggestion } from "./index";

/**
 * Export workflow AI suggestions to PDF format
 * @param suggestions - Array of AI suggestions to export
 */
export function exportSuggestionsToPDF(suggestions: Suggestion[]): void {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 2 * margin;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Acoes IA - Workflow", margin, y);
  y += 10;

  // Metadata
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
  y += 5;
  doc.text(`Total de sugestoes: ${suggestions.length}`, margin, y);
  y += 10;

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, x: number, startY: number, fontSize: number, maxWidth: number): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = startY;
    
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, x, currentY);
      currentY += fontSize * 0.5;
    });
    
    return currentY;
  };

  // Process each suggestion
  suggestions.forEach((suggestion, index) => {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    // Suggestion header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Sugestao ${index + 1}`, margin, y);
    y += 8;

    // Etapa
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Etapa:", margin, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(suggestion.etapa, margin + 25, y, 10, maxWidth - 25);
    y += 3;

    // Tipo
    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", margin, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(suggestion.tipo_sugestao, margin + 25, y, 10, maxWidth - 25);
    y += 3;

    // Conteudo
    doc.setFont("helvetica", "bold");
    doc.text("Conteudo:", margin, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(suggestion.conteudo, margin + 25, y, 10, maxWidth - 25);
    y += 3;

    // Criticidade
    doc.setFont("helvetica", "bold");
    doc.text("Criticidade:", margin, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(suggestion.criticidade, margin + 35, y, 10, maxWidth - 35);
    y += 3;

    // Responsavel
    doc.setFont("helvetica", "bold");
    doc.text("Responsavel:", margin, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(suggestion.responsavel_sugerido, margin + 38, y, 10, maxWidth - 38);
    y += 5;

    // Separator line
    if (index < suggestions.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }
  });

  // Generate filename with timestamp
  const filename = `workflow-sugestoes-ia-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
  doc.save(filename);
}
