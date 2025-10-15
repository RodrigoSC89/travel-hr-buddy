import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface ExportBIReportProps {
  elementId?: string;
}

export function ExportBIReport({ elementId = "bi-dashboard-content" }: ExportBIReportProps) {
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById(elementId);
      
      if (!element) {
        toast.error("Elemento não encontrado para exportar");
        return;
      }

      toast.info("Gerando PDF...");

      const pdfOptions = {
        margin: 10,
        filename: `BI_Report_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(pdfOptions).from(element).save();
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  return (
    <Button onClick={handleExportPDF} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
