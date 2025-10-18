/**
 * SGSO Export Utilities
 * Functions for exporting SGSO action plans to CSV and PDF formats
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SGSOActionPlan {
  id: string;
  incident_id: string;
  corrective_action: string;
  preventive_action: string;
  recommendation: string;
  status: string;
  status_approval: string;
  approval_note?: string;
  created_at: string;
  updated_at?: string;
  dp_incidents?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    vessel?: string;
    location?: string;
    root_cause?: string;
    sgso_category?: string;
    sgso_root_cause?: string;
  };
}

/**
 * Generate CSV from SGSO action plans
 * @param plans - Array of action plans to export
 * @returns CSV string
 */
export function generateCSVFromPlans(plans: SGSOActionPlan[]): string {
  const headers = [
    "Data",
    "Incidente",
    "Embarcação",
    "Local",
    "Causa Raiz",
    "Correção",
    "Prevenção",
    "Recomendação",
    "Status Aprovação",
    "Nota de Aprovação"
  ];

  const rows = plans.map((p) => [
    new Date(p.created_at).toLocaleDateString("pt-BR"),
    p.dp_incidents?.title || p.incident_id,
    p.dp_incidents?.vessel || "-",
    p.dp_incidents?.location || "-",
    p.dp_incidents?.root_cause || "-",
    escapeCsvField(p.corrective_action),
    escapeCsvField(p.preventive_action),
    escapeCsvField(p.recommendation || "-"),
    p.status_approval,
    escapeCsvField(p.approval_note || "-")
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}

/**
 * Escape CSV field to handle commas and quotes
 */
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Generate PDF from SGSO action plans
 * @param plans - Array of action plans to export
 * @returns PDF as Uint8Array
 */
export async function generatePDFFromPlans(plans: SGSOActionPlan[]): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  // Add title
  doc.setFontSize(16);
  doc.text("Relatório de Planos de Ação SGSO", 14, 15);

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 22);

  // Prepare table data
  const tableData = plans.map((p) => [
    new Date(p.created_at).toLocaleDateString("pt-BR"),
    p.dp_incidents?.title || p.incident_id,
    p.dp_incidents?.vessel || "-",
    truncateText(p.corrective_action, 50),
    truncateText(p.preventive_action, 50),
    p.status_approval,
  ]);

  // Add table
  autoTable(doc, {
    head: [["Data", "Incidente", "Embarcação", "Correção", "Prevenção", "Status"]],
    body: tableData,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 28, left: 14, right: 14 },
  });

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Download file in browser
 */
export function downloadFile(data: string | Uint8Array, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
