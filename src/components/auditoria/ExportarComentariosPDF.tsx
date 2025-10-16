import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { FileDown } from "lucide-react";

interface Comentario {
  id: string;
  comentario: string;
  user_id: string;
  created_at: string;
}

interface ExportarComentariosPDFProps {
  comentarios: Comentario[];
}

export function ExportarComentariosPDF({ comentarios }: ExportarComentariosPDFProps) {
  const exportarPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 2 * margin;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Comentários da Auditoria", margin, y);
    y += 12;

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
    y += 6;
    doc.text(`Total de comentários: ${comentarios.length}`, margin, y);
    y += 12;

    // Comments
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Comentários:", margin, y);
    y += 8;

    comentarios.forEach((comentario) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      // Comment header
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const dataFormatada = format(new Date(comentario.created_at), "dd/MM/yyyy HH:mm");
      doc.text(`${dataFormatada} - ${comentario.user_id}`, margin, y);
      y += 5;

      // Comment text
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      // Split long text into multiple lines
      const lines = doc.splitTextToSize(comentario.comentario, maxLineWidth);
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      });

      // Add separator line
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    });

    // Save the PDF
    doc.save(`comentarios-auditoria-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <Button
      onClick={exportarPDF}
      variant="outline"
      size="sm"
      disabled={comentarios.length === 0}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
