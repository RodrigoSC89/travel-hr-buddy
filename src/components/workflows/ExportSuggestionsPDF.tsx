import { format } from "date-fns";
import jsPDF from "jspdf";

export interface Suggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}

export function exportSuggestionsToPDF(suggestions: Suggestion[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Acoes IA - Workflow", margin, y);
  y += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
  y += 5;
  doc.text(`Total de sugestoes: ${suggestions.length}`, margin, y);
  y += 15;

  // Process each suggestion
  suggestions.forEach((suggestion, index) => {
    // Check if we need a new page
    if (y > pageHeight - 60) {
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
    const etapaLines = doc.splitTextToSize(suggestion.etapa, maxWidth - 30);
    doc.text(etapaLines, margin + 30, y);
    y += etapaLines.length * 5 + 3;

    // Tipo
    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", margin, y);
    doc.setFont("helvetica", "normal");
    const tipoLines = doc.splitTextToSize(suggestion.tipo_sugestao, maxWidth - 30);
    doc.text(tipoLines, margin + 30, y);
    y += tipoLines.length * 5 + 3;

    // Conteudo
    doc.setFont("helvetica", "bold");
    doc.text("Conteudo:", margin, y);
    doc.setFont("helvetica", "normal");
    const conteudoLines = doc.splitTextToSize(suggestion.conteudo, maxWidth - 30);
    doc.text(conteudoLines, margin + 30, y);
    y += conteudoLines.length * 5 + 3;

    // Criticidade
    doc.setFont("helvetica", "bold");
    doc.text("Criticidade:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.criticidade, margin + 30, y);
    y += 8;

    // Responsavel
    doc.setFont("helvetica", "bold");
    doc.text("Responsavel:", margin, y);
    doc.setFont("helvetica", "normal");
    const responsavelLines = doc.splitTextToSize(suggestion.responsavel_sugerido, maxWidth - 30);
    doc.text(responsavelLines, margin + 30, y);
    y += responsavelLines.length * 5 + 10;

    // Add separator line if not the last suggestion
    if (index < suggestions.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    }
  });

  // Save the PDF
  const date = format(new Date(), "yyyy-MM-dd");
  doc.save(`Plano-Acoes-Workflow-${date}.pdf`);
}
