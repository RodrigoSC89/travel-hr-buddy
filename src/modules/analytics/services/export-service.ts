/**
 * PATCH 101.0 - Export Service for PDF and CSV
 */

import { ChartData } from "../types";
import jsPDF from "jspdf";
import "jspdf-autotable";

class ExportService {
  async exportToPDF(
    title: string,
    charts: { name: string; data: ChartData }[],
    metrics: any[]
  ): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text(title, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 15;

    if (metrics && metrics.length > 0) {
      doc.setFontSize(14);
      doc.text("Key Performance Indicators", 20, yPosition);
      yPosition += 10;

      const tableData = metrics.map(m => [
        m.name,
        `${m.value} ${m.unit}`,
        `${m.change > 0 ? "+" : ""}${m.change}%`,
        m.trend
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [["Metric", "Value", "Change", "Trend"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`analytics-report-${Date.now()}.pdf`);
  }

  async exportToCSV(
    title: string,
    data: any[],
    headers: string[]
  ): Promise<void> {
    let csvContent = `${title}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += headers.join(",") + "\n";

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] !== undefined ? row[header] : "";
        return typeof value === "string" && value.includes(",")
          ? `"${value.replace(/"/g, "\"\"")}"`
          : value;
      });
      csvContent += values.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-export-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const exportService = new ExportService();
