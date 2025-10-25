/**
 * PATCH 94.0 - Logs Center PDF Export
 * Export logs with header, grouped data, and QR code verification
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import type { LogEntry } from "../../modules/logs-center/types";

interface ExportOptions {
  title?: string;
  includeQR?: boolean;
}

/**
 * Format timestamp for PDF display
 */
function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/**
 * Get level badge color
 */
function getLevelColor(level: string): [number, number, number] {
  switch (level) {
  case "error":
    return [239, 68, 68]; // red-500
  case "warn":
    return [251, 191, 36]; // amber-400
  case "info":
  default:
    return [59, 130, 246]; // blue-500
  }
}

/**
 * Generate verification QR code
 */
async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 150,
      margin: 1,
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return "";
  }
}

/**
 * Export logs to PDF with header, table, and QR code
 */
export async function exportLogsAsPDF(
  logs: LogEntry[],
  options: ExportOptions = {}
): Promise<void> {
  const { title = "Relatório de Logs Técnicos", includeQR = true } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Add header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, margin + 5);

  // Add metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const exportDate = new Date().toLocaleString("pt-BR");
  doc.text(`Data de exportação: ${exportDate}`, margin, margin + 12);
  doc.text(`Total de registros: ${logs.length}`, margin, margin + 17);

  // Group logs by level
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.level]) acc[log.level] = [];
    acc[log.level].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  // Add statistics
  const stats = Object.entries(groupedLogs).map(([level, entries]) => 
    `${level.toUpperCase()}: ${entries.length}`
  ).join(" | ");
  doc.text(`Estatísticas: ${stats}`, margin, margin + 22);

  // Add separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, margin + 25, pageWidth - margin, margin + 25);

  // Prepare table data
  const tableData = logs.map((log) => [
    formatTimestamp(log.timestamp),
    log.level.toUpperCase(),
    log.origin,
    log.message,
  ]);

  // Add table with grouped styling
  autoTable(doc, {
    startY: margin + 28,
    head: [["Data/Hora", "Nível", "Origem", "Mensagem"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 50 },
      3: { cellWidth: "auto" },
    },
    didDrawCell: (data) => {
      // Color-code level column
      if (data.column.index === 1 && data.section === "body") {
        const level = logs[data.row.index]?.level;
        if (level) {
          const color = getLevelColor(level);
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "F"
          );
          doc.setTextColor(255, 255, 255);
          doc.text(
            level.toUpperCase(),
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2,
            { align: "center", baseline: "middle" }
          );
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // Add QR code for verification if requested
  if (includeQR) {
    const verificationData = JSON.stringify({
      exportDate,
      totalLogs: logs.length,
      hash: btoa(`${exportDate}-${logs.length}`),
    });

    const qrCodeDataUrl = await generateQRCode(verificationData);
    
    if (qrCodeDataUrl) {
      const qrSize = 30;
      const qrX = pageWidth - margin - qrSize;
      const qrY = pageHeight - margin - qrSize;

      doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("QR Code de Verificação", qrX, qrY - 2, {
        align: "center",
        maxWidth: qrSize,
      });
    }
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} | Nautilus One - Logs Center`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `logs-export-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
