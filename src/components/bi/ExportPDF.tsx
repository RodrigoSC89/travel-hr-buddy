import { format } from "date-fns";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportBIReportProps {
  trend: any[];
  forecast: string;
}

/**
 * Component with button to export BI report to PDF
 */
export function ExportBIReport({ trend, forecast }: ExportBIReportProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatorio BI - Efetividade da IA", margin, y);
    y += 12;

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
    y += 8;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Executivo", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Calculate totals
    const total = trend.reduce((sum, item) => sum + (item.total || 0), 0);
    const effective = trend.reduce((sum, item) => sum + (item.ia_efetiva || 0), 0);
    const rate = total > 0 ? Math.round((effective / total) * 100) : 0;

    doc.text(`Total de Jobs: ${total}`, margin, y);
    y += 6;
    doc.text(`IA foi eficaz: ${effective}`, margin, y);
    y += 6;
    doc.text(`Taxa de Efetividade: ${rate}%`, margin, y);
    y += 12;

    // Trend Data Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Dados por Sistema", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    trend.forEach((item) => {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(`${item.sistema}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Total: ${item.total} | IA Eficaz: ${item.ia_efetiva}`, margin + 35, y);
      y += 6;
    });

    y += 8;

    // Forecast Section
    if (y > 220) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Previsao e Analise", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const forecastLines = doc.splitTextToSize(forecast || "Nenhuma previsao disponivel.", maxWidth);
    
    forecastLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Pagina ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Generate filename with timestamp
    const filename = `bi-relatorio-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="flex justify-end">
      <Button onClick={handleExport} className="gap-2">
        <Download className="h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
}
