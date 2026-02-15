/**
 * Universal Export Utilities
 * 
 * Provides CSV and PDF export capabilities for all modules.
 * Replaces ghost toast-only "Exportar" buttons with real file downloads.
 */

import { toast } from "sonner";
import { logger } from "@/lib/logger";

/**
 * Export data as CSV file with automatic download
 */
export function exportToCSV(
  rawData: unknown[],
  filename: string,
  options?: {
    columns?: { key: string; label: string }[];
    separator?: string;
  }
): void {
  try {
    const data = rawData.map(item => (typeof item === 'object' && item !== null ? item : { value: item }) as Record<string, unknown>);
    if (!data || data.length === 0) {
      toast.warning("Nenhum dado disponível para exportar.");
      return;
    }

    const separator = options?.separator ?? ",";
    const columns = options?.columns ?? Object.keys(data[0]).map(key => ({ key, label: key }));

    // Header row
    const header = columns.map(c => `"${c.label}"`).join(separator);

    // Data rows
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(separator)
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n"); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);

    toast.success(`${filename} exportado com sucesso!`);
  } catch (error) {
    logger.error("CSV export failed:", error instanceof Error ? { message: error.message } : undefined);
    toast.error("Erro ao exportar CSV.");
  }
}

/**
 * Export data as a simple PDF table using html2pdf.js
 */
export async function exportTableToPDF(
  rawData: unknown[],
  title: string,
  filename: string,
  options?: {
    columns?: { key: string; label: string }[];
    orientation?: "portrait" | "landscape";
  }
): Promise<void> {
  try {
    const data = rawData.map(item => (typeof item === 'object' && item !== null ? item : { value: item }) as Record<string, unknown>);
    if (!data || data.length === 0) {
      toast.warning("Nenhum dado disponível para exportar.");
      return;
    }

    toast.info("Gerando PDF...");

    const columns = options?.columns ?? Object.keys(data[0]).map(key => ({ key, label: key }));

    const headerRow = columns.map(c => `<th style="border:1px solid #cbd5e1;padding:6px 10px;background:#1e40af;color:white;font-size:11px;text-align:left;">${c.label}</th>`).join("");
    const bodyRows = data.map(row =>
      `<tr>${columns.map(col => {
        const val = row[col.key];
        const display = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
        return `<td style="border:1px solid #e2e8f0;padding:5px 10px;font-size:10px;">${display}</td>`;
      }).join("")}</tr>`
    ).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h1 style="color:#1e40af;font-size:18px;margin:0;">${title}</h1>
          <span style="color:#64748b;font-size:11px;">Gerado em: ${new Date().toLocaleString("pt-BR")}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
        <div style="margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:9px;text-align:center;">
          Nautilus One Maritime Platform • ${data.length} registros • ${new Date().toLocaleString("pt-BR")}
        </div>
      </div>
    `;

    const { exportToPDF } = await import("@/lib/pdf");
    await exportToPDF(html, filename.endsWith(".pdf") ? filename : `${filename}.pdf`, {
      jsPDF: { orientation: options?.orientation ?? "portrait" },
    });
  } catch (error) {
    logger.error("PDF export failed:", error instanceof Error ? { message: error.message } : undefined);
    toast.error("Erro ao gerar PDF.");
  }
}

/**
 * Quick export: auto-detects format and exports
 */
export function quickExport(
  data: unknown[],
  moduleTitle: string,
  format: "csv" | "pdf" = "csv"
): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedTitle = moduleTitle.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `nautilus_${sanitizedTitle}_${timestamp}`;

  if (format === "csv") {
    exportToCSV(data, filename);
  } else {
    exportTableToPDF(data, moduleTitle, filename).catch(() => {});
  }
}

/**
 * Helper: trigger download of a Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
