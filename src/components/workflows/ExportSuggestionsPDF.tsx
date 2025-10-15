import { format } from "date-fns";
import jsPDF from "jspdf";

interface Suggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}

export function exportSuggestionsToPDF(suggestions: Suggestion[]): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

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

  // Suggestions
  suggestions.forEach((suggestion, index) => {
    // Check if we need a new page
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    // Suggestion header with emoji
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Sugestao ${index + 1}`, margin, y);
    y += 7;

    // Etapa
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Etapa:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.etapa, margin + 25, y);
    y += 7;

    // Tipo
    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.tipo_sugestao, margin + 25, y);
    y += 7;

    // Conteudo (may wrap to multiple lines)
    doc.setFont("helvetica", "bold");
    doc.text("Conteudo:", margin, y);
    doc.setFont("helvetica", "normal");
    
    // Split long text into multiple lines
    const maxWidth = 170;
    const contentLines = doc.splitTextToSize(suggestion.conteudo, maxWidth - 25);
    
    // Check if content would overflow page
    if (y + (contentLines.length * 7) > 280) {
      doc.addPage();
      y = margin;
      doc.setFont("helvetica", "bold");
      doc.text("Conteudo:", margin, y);
      doc.setFont("helvetica", "normal");
    }
    
    contentLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex === 0) {
        doc.text(line, margin + 25, y);
      } else {
        y += 5;
        doc.text(line, margin + 25, y);
      }
    });
    y += 7;

    // Criticidade
    doc.setFont("helvetica", "bold");
    doc.text("Criticidade:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.criticidade, margin + 35, y);
    y += 7;

    // Responsavel
    doc.setFont("helvetica", "bold");
    doc.text("Responsavel:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(suggestion.responsavel_sugerido, margin + 35, y);
    y += 10;

    // Separator line
    if (index < suggestions.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, 190, y);
      y += 10;
    }
  });

  doc.save(`Plano-Acoes-Workflow-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
