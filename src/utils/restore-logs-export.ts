import { format } from "date-fns";
import jsPDF from "jspdf";

interface RestoreLog {
  id: string;
  document_id: string;
  version_id: string;
  restored_by: string;
  restored_at: string;
  email: string | null;
}

export function exportRestoreLogsToCSV(logs: RestoreLog[]): void {
  const headers = ["Documento", "Versão Restaurada", "Restaurado por", "Data"];
  const rows = logs.map((log) => [
    log.document_id,
    log.version_id,
    log.email || "-",
    format(new Date(log.restored_at), "dd/MM/yyyy HH:mm"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `restore-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRestoreLogsToPDF(logs: RestoreLog[]): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Auditoria de Restauracoes", margin, y);
  y += 10;

  // Metadata
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, y);
  y += 5;
  doc.text(`Total de registros: ${logs.length}`, margin, y);
  y += 10;

  // Table headers
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Documento", margin, y);
  doc.text("Versao", margin + 50, y);
  doc.text("Email", margin + 80, y);
  doc.text("Data", margin + 130, y);
  y += 7;

  // Table rows
  doc.setFont("helvetica", "normal");
  logs.forEach((log) => {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }

    const docId = log.document_id.substring(0, 8) + "...";
    const versionId = log.version_id.substring(0, 8) + "...";
    const email = log.email ? log.email.substring(0, 20) : "-";
    const date = format(new Date(log.restored_at), "dd/MM/yyyy HH:mm");

    doc.text(docId, margin, y);
    doc.text(versionId, margin + 50, y);
    doc.text(email, margin + 80, y);
    doc.text(date, margin + 130, y);
    y += 7;
  });

  doc.save(`restore-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
