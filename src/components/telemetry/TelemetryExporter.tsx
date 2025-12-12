/**
import { useState, useCallback } from "react";;
 * Telemetry Exporter Component
 * PDF and data export functionality
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2, FileJson } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TelemetryExporterProps {
  weatherData: unknown[];
  satelliteData: unknown[];
  syncStatus: unknown[];
  autonomyActions: unknown[];
}

export const TelemetryExporter = memo(function({
  weatherData,
  satelliteData,
  syncStatus,
  autonomyActions,
}: TelemetryExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text("Relatório de Telemetria", pageWidth / 2, 20, { align: "center" });
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, 28, { align: "center" });

      let yPos = 40;

      // Sync Status Section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Status de Sincronização", 14, yPos);
      yPos += 5;

      if (syncStatus.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Fonte", "Status", "Registros", "Último Sync"]],
          body: syncStatus.map(s => [
            s.source,
            s.status,
            s.records_synced?.toString() || "0",
            s.last_sync ? new Date(s.last_sync).toLocaleString("pt-BR") : "N/A"
          ]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
        });
        yPos = (doc as unknown).lastAutoTable.finalY + 15;
      }

      // Weather Data Section
      doc.setFontSize(14);
      doc.text("Dados Meteorológicos", 14, yPos);
      yPos += 5;

      if (weatherData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Local", "Temp (°C)", "Vento (kt)", "Visibilidade", "Risco"]],
          body: weatherData.slice(0, 10).map(w => [
            w.location_name || "N/A",
            w.temperature?.toString() || "N/A",
            w.wind_speed?.toString() || "N/A",
            `${w.visibility || "N/A"} m`,
            w.risk_level || "N/A"
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 197, 94] },
        });
        yPos = (doc as unknown).lastAutoTable.finalY + 15;
      }

      // Check for new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Satellite Data Section
      doc.setFontSize(14);
      doc.text("Dados de Satélite", 14, yPos);
      yPos += 5;

      if (satelliteData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Fonte", "Tipo", "Latitude", "Longitude"]],
          body: satelliteData.slice(0, 10).map(s => [
            s.source || "N/A",
            s.data_type || "N/A",
            s.latitude?.toFixed(4) || "N/A",
            s.longitude?.toFixed(4) || "N/A"
          ]),
          theme: "striped",
          headStyles: { fillColor: [168, 85, 247] },
        });
        yPos = (doc as unknown).lastAutoTable.finalY + 15;
      }

      // Check for new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // AI Actions Section
      doc.setFontSize(14);
      doc.text("Ações de IA", 14, yPos);
      yPos += 5;

      if (autonomyActions.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Tipo", "Status", "Confiança", "Risco"]],
          body: autonomyActions.slice(0, 10).map(a => [
            a.action_type || "N/A",
            a.status || "N/A",
            a.confidence_score ? `${(a.confidence_score * 100).toFixed(0)}%` : "N/A",
            a.risk_score ? `${(a.risk_score * 100).toFixed(0)}%` : "N/A"
          ]),
          theme: "striped",
          headStyles: { fillColor: [239, 68, 68] },
        });
      }

      // Footer
      const pageCount = (doc as unknown).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount} - Nautilus Platform`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      const fileName = `telemetry-report-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      const rows: string[] = [];
      
      // Weather data
      rows.push("=== DADOS METEOROLÓGICOS ===");
      rows.push("Local,Temperatura,Vento,Visibilidade,Risco,Latitude,Longitude");
      weatherData.forEach(w => {
        rows.push(`"${w.location_name || "N/A"}",${w.temperature},${w.wind_speed},${w.visibility},"${w.risk_level}",${w.latitude},${w.longitude}`);
  };
      
      rows.push("");
      rows.push("=== DADOS DE SATÉLITE ===");
      rows.push("Fonte,Tipo,Latitude,Longitude,Timestamp");
      satelliteData.forEach(s => {
        rows.push(`"${s.source}","${s.data_type}",${s.latitude},${s.longitude},"${s.timestamp}"`);
  };

      rows.push("");
      rows.push("=== STATUS DE SINCRONIZAÇÃO ===");
      rows.push("Fonte,Status,Registros,Último Sync");
      syncStatus.forEach(s => {
        rows.push(`"${s.source}","${s.status}",${s.records_synced},"${s.last_sync}"`);
  };

      const csvContent = rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `telemetry-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportToJSON = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        weatherData,
        satelliteData,
        syncStatus,
        autonomyActions,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `telemetry-export-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      
      toast.success("JSON exportado com sucesso!");
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error("Erro ao exportar JSON");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
