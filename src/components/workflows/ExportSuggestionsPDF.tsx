import jsPDF from "jspdf";
import { format } from "date-fns";

/**
 * Interface representing a workflow AI suggestion
 */
export interface WorkflowSuggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}

/**
 * Export workflow AI suggestions to PDF
 * @param suggestions - Array of workflow suggestions to export
 * @returns void - Downloads the PDF file to the user's device
 */
export function exportSuggestionsToPDF(suggestions: WorkflowSuggestion[]): void {
  if (!suggestions || suggestions.length === 0) {
    throw new Error("Nenhuma sugestão para exportar");
  }

  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    // Title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    const title = "📄 Plano de Ações IA - Workflow";
    pdf.text(title, margin, y);
    y += 10;

    // Date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const date = format(new Date(), "dd/MM/yyyy");
    pdf.text(`Data: ${date}`, margin, y);
    y += 5;

    // Horizontal line
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Process each suggestion
    suggestions.forEach((suggestion, index) => {
      // Check if we need a new page
      if (y > pageHeight - 60) {
        pdf.addPage();
        y = margin;
      }

      // Suggestion number/header
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Sugestão ${index + 1}`, margin, y);
      y += 8;

      // Etapa
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("🧩 Etapa:", margin, y);
      pdf.setFont("helvetica", "normal");
      const etapaLines = pdf.splitTextToSize(suggestion.etapa, maxWidth - 30);
      pdf.text(etapaLines, margin + 30, y);
      y += 6 * Math.max(1, etapaLines.length);

      // Check page break
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = margin;
      }

      // Tipo
      pdf.setFont("helvetica", "bold");
      pdf.text("📌 Tipo:", margin, y);
      pdf.setFont("helvetica", "normal");
      const tipoLines = pdf.splitTextToSize(suggestion.tipo_sugestao, maxWidth - 30);
      pdf.text(tipoLines, margin + 30, y);
      y += 6 * Math.max(1, tipoLines.length);

      // Check page break
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = margin;
      }

      // Conteúdo
      pdf.setFont("helvetica", "bold");
      pdf.text("💬 Conteúdo:", margin, y);
      pdf.setFont("helvetica", "normal");
      const conteudoLines = pdf.splitTextToSize(suggestion.conteudo, maxWidth - 30);
      pdf.text(conteudoLines, margin + 30, y);
      y += 6 * Math.max(1, conteudoLines.length);

      // Check page break
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = margin;
      }

      // Criticidade
      pdf.setFont("helvetica", "bold");
      pdf.text("🔥 Criticidade:", margin, y);
      pdf.setFont("helvetica", "normal");
      const criticidadeLines = pdf.splitTextToSize(suggestion.criticidade, maxWidth - 30);
      pdf.text(criticidadeLines, margin + 30, y);
      y += 6 * Math.max(1, criticidadeLines.length);

      // Check page break
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = margin;
      }

      // Responsável
      pdf.setFont("helvetica", "bold");
      pdf.text("👤 Responsável:", margin, y);
      pdf.setFont("helvetica", "normal");
      const responsavelLines = pdf.splitTextToSize(
        suggestion.responsavel_sugerido,
        maxWidth - 30
      );
      pdf.text(responsavelLines, margin + 30, y);
      y += 6 * Math.max(1, responsavelLines.length);

      // Add separator line between suggestions
      y += 5;
      if (y < pageHeight - 20) {
        pdf.setLineWidth(0.2);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
    });

    // Save the PDF
    const fileName = `Plano-Acoes-Workflow-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Erro ao gerar PDF. Por favor, tente novamente.");
  }
}
