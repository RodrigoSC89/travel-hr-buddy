import { format } from "date-fns";
import jsPDF from "jspdf";

export interface WorkflowSuggestion {
  id?: string;
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: "baixa" | "media" | "alta" | "critica";
  responsavel_sugerido: string;
  created_at?: string;
}

/**
 * Exports workflow AI suggestions to PDF format
 * Following the existing PDF export pattern from restore-logs-export.ts
 * Uses jsPDF library for PDF generation
 */
export function exportSuggestionsToPDF(suggestions: WorkflowSuggestion[]): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;
  const pageHeight = 280; // Maximum y position before adding new page

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Acoes IA - Workflow", margin, y);
  y += 10;

  // Metadata
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
  y += 5;
  doc.text(`Total de sugestoes: ${suggestions.length}`, margin, y);
  y += 10;

  // Process each suggestion
  suggestions.forEach((suggestion, index) => {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    // Suggestion header with number
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Sugestao ${index + 1}`, margin, y);
    y += 7;

    // Etapa
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Etapa:", margin, y);
    doc.setFont("helvetica", "normal");
    const etapaText = doc.splitTextToSize(suggestion.etapa, 160);
    doc.text(etapaText, margin + 25, y);
    y += 5 * Math.ceil(etapaText.length);

    // Tipo
    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.tipo_sugestao, margin + 25, y);
    y += 5;

    // Conteudo (can be long, needs wrapping)
    doc.setFont("helvetica", "bold");
    doc.text("Conteudo:", margin, y);
    doc.setFont("helvetica", "normal");
    const conteudoText = doc.splitTextToSize(suggestion.conteudo, 160);
    doc.text(conteudoText, margin + 25, y);
    y += 5 * Math.ceil(conteudoText.length);

    // Criticidade
    doc.setFont("helvetica", "bold");
    doc.text("Criticidade:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.criticidade, margin + 25, y);
    y += 5;

    // Responsavel Sugerido
    doc.setFont("helvetica", "bold");
    doc.text("Responsavel:", margin, y);
    doc.setFont("helvetica", "normal");
    const responsavelText = doc.splitTextToSize(suggestion.responsavel_sugerido, 160);
    doc.text(responsavelText, margin + 25, y);
    y += 5 * Math.ceil(responsavelText.length);

    // Add separator line between suggestions
    y += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 190, y);
    y += 5;
  });

  // Save the PDF with formatted date
  const fileName = `Plano-Acoes-Workflow-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
