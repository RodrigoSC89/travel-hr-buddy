/**
 * SGSO Audit PDF Export
 * Generates PDF reports for audit results
 */

import { AuditResult, AuditType } from "./types";
import { calculateSummary } from "./audit-utils";

/**
 * Lazy load PDF libraries
 */
async function loadPDFLibs() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}

/**
 * Export audit results to PDF
 */
export async function exportAuditToPDF(
  results: AuditResult[],
  auditType: AuditType,
  vesselName?: string
): Promise<void> {
  const { jsPDF, autoTable } = await loadPDFLibs();
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text("Relatório de Auditoria SGSO", 14, 20);

  doc.setFontSize(11);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);
  doc.text(`Tipo: ${getAuditTypeLabel(auditType)}`, 14, 36);
  if (vesselName) {
    doc.text(`Embarcação: ${vesselName}`, 14, 42);
  }

  // Results table
  const tableData = results.map((r) => [
    r.area,
    r.criterion,
    getStatusLabelForPDF(r.status),
    r.comments || "-",
  ]);

  autoTable(doc, {
    head: [["Área", "Critério", "Status", "Comentários"]],
    body: tableData,
    startY: vesselName ? 50 : 45,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 60 },
    },
  });

  // Summary
  const summary = calculateSummary(results);
  const finalY = ((doc as any).lastAutoTable?.finalY || 100) + 10;

  doc.setFontSize(12);
  doc.text("Resumo:", 14, finalY);
  doc.setFontSize(10);
  doc.text(`✓ Conformes: ${summary.compliant}`, 14, finalY + 8);
  doc.text(`✗ Não Conformes: ${summary.nonCompliant}`, 14, finalY + 14);
  doc.text(`◐ Parcialmente Conformes: ${summary.partial}`, 14, finalY + 20);
  doc.text(`○ Não Aplicáveis: ${summary.notApplicable}`, 14, finalY + 26);

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Gerado automaticamente pelo Sistema SGSO - Nauti One",
    14,
    doc.internal.pageSize.height - 10
  );

  // Save
  const filename = `auditoria-sgso-${auditType}-${Date.now()}.pdf`;
  doc.save(filename);

  return;
}

/**
 * Get audit type label
 */
function getAuditTypeLabel(type: AuditType): string {
  const labels = {
    internal: "Auditoria Interna",
    external: "Auditoria Externa",
    certification: "Certificação",
  };
  return labels[type] || type;
}

/**
 * Get status label for PDF
 */
function getStatusLabelForPDF(status: string): string {
  const labels = {
    compliant: "Conforme",
    non_compliant: "Não Conforme",
    partial: "Parcial",
    not_applicable: "N/A",
  };
  return labels[status as keyof typeof labels] || status;
}
