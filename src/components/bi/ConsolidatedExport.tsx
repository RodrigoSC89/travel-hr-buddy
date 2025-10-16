import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportData {
  audits: any[];
  vessels: any[];
  nonConformities: any[];
}

interface ConsolidatedExportProps {
  data: ExportData;
  filters: {
    startDate: string;
    endDate: string;
    vesselId: string;
  };
}

export default function ConsolidatedExport({ data, filters }: ConsolidatedExportProps) {
  const exportCSV = () => {
    try {
      // Create CSV content
      const csvRows = [];
      
      // Header
      csvRows.push([
        "Tipo",
        "Embarcação",
        "Data",
        "Status",
        "Descrição",
        "Conformidade"
      ].join(","));

      // Audit data
      data.audits.forEach(audit => {
        csvRows.push([
          "Auditoria",
          audit.vessel_name || "N/A",
          audit.audit_date || "N/A",
          audit.status || "Concluída",
          `"${audit.description || 'Auditoria de rotina'}"`,
          audit.is_compliant ? "Conforme" : "Não Conforme"
        ].join(","));
      });

      // Non-conformity data
      data.nonConformities.forEach(nc => {
        csvRows.push([
          "Não Conformidade",
          nc.vessel || "N/A",
          nc.date || "N/A",
          nc.status || "Aberta",
          `"${nc.description || ''}"`,
          "Não Conforme"
        ].join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `bi-consolidado-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("📊 Relatório Consolidado BI", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Date and filters
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("pt-BR");
      pdf.text(`Gerado em: ${currentDate}`, 14, yPosition);
      yPosition += 5;

      if (filters.startDate && filters.endDate) {
        pdf.text(
          `Período: ${new Date(filters.startDate).toLocaleDateString("pt-BR")} a ${new Date(filters.endDate).toLocaleDateString("pt-BR")}`,
          14,
          yPosition
        );
        yPosition += 5;
      }

      if (filters.vesselId) {
        pdf.text(`Embarcação: ${filters.vesselId}`, 14, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;

      // Summary section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumo Executivo", 14, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total de Auditorias: ${data.audits.length}`, 14, yPosition);
      yPosition += 5;
      pdf.text(`Total de Não Conformidades: ${data.nonConformities.length}`, 14, yPosition);
      yPosition += 5;
      
      const compliantAudits = data.audits.filter(a => a.is_compliant).length;
      const complianceRate = data.audits.length > 0 
        ? ((compliantAudits / data.audits.length) * 100).toFixed(1) 
        : "0";
      pdf.text(`Taxa de Conformidade: ${complianceRate}%`, 14, yPosition);
      yPosition += 10;

      // Audits table
      if (data.audits.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Auditorias", 14, yPosition);
        yPosition += 5;

        autoTable(pdf, {
          startY: yPosition,
          head: [["Embarcação", "Data", "Status", "Conformidade"]],
          body: data.audits.slice(0, 15).map(audit => [
            audit.vessel_name || "N/A",
            audit.audit_date ? new Date(audit.audit_date).toLocaleDateString("pt-BR") : "N/A",
            audit.status || "Concluída",
            audit.is_compliant ? "✓ Conforme" : "✗ Não Conforme",
          ]),
          theme: "striped",
          headStyles: { fillColor: [14, 165, 233] },
          margin: { top: 10 },
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
      }

      // Non-conformities table
      if (data.nonConformities.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Não Conformidades", 14, yPosition);
        yPosition += 5;

        autoTable(pdf, {
          startY: yPosition,
          head: [["Número", "Embarcação", "Severidade", "Status"]],
          body: data.nonConformities.slice(0, 15).map(nc => [
            nc.number || "N/A",
            nc.vessel || "N/A",
            nc.severity || "N/A",
            nc.status || "Aberta",
          ]),
          theme: "striped",
          headStyles: { fillColor: [239, 68, 68] },
          margin: { top: 10 },
        });
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      pdf.save(`bi-relatorio-consolidado-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          📄 Exportação Consolidada
        </CardTitle>
        <CardDescription>
          Exporte relatórios completos em CSV ou PDF para análise gerencial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={exportCSV}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <p className="font-semibold">Exportar CSV</p>
              <p className="text-xs text-muted-foreground">Para análise em planilhas</p>
            </div>
          </Button>

          <Button
            onClick={exportPDF}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <FileText className="w-8 h-8 text-red-600" />
            <div className="text-center">
              <p className="font-semibold">Exportar PDF</p>
              <p className="text-xs text-muted-foreground">Relatório executivo completo</p>
            </div>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>📊 Dados incluídos:</strong> {data.audits.length} auditorias, {data.nonConformities.length} não conformidades
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
