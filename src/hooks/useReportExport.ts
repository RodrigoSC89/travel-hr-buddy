/**
 * useReportExport - Unified hook for multi-format report generation
 * Supports PDF (branded), Excel, CSV exports from any data source
 */
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown) => string;
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const { columns, data, filename } = options;
      const header = columns.map(c => `"${c.header}"`).join(",");
      const rows = data.map(row =>
        columns.map(col => {
          const val = row[col.key];
          const formatted = col.format ? col.format(val) : String(val ?? "");
          return `"${formatted.replace(/"/g, '""')}"`;
        }).join(",")
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${filename}.csv`);
      toast.success("CSV exportado com sucesso");
    } catch (err) {
      logger.error("[Export] CSV error:", err);
      toast.error("Erro ao exportar CSV");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToExcel = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      const { columns, data, filename, title } = options;
      const wsData = [
        columns.map(c => c.header),
        ...data.map(row =>
          columns.map(col => {
            const val = row[col.key];
            return col.format ? col.format(val) : val ?? "";
          })
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = columns.map(c => ({ wch: c.width || 18 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title?.slice(0, 31) || "Report");
      XLSX.writeFile(wb, `${filename}.xlsx`);
      toast.success("Excel exportado com sucesso");
    } catch (err) {
      logger.error("[Export] Excel error:", err);
      toast.error("Erro ao exportar Excel");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToPDF = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const { PremiumPDFGenerator } = await import("@/lib/reports/premium-pdf-generator");
      const gen = await PremiumPDFGenerator.create();
      const blob = await gen.generate({
        title: options.title,
        subtitle: options.subtitle || "Generated Report",
        date: new Date(),
        module: options.title,
        sections: [{
          title: "Dados",
          type: "table",
          content: {
            headers: options.columns.map(c => c.header),
            rows: options.data.map(row =>
              options.columns.map(col => {
                const val = row[col.key];
                return col.format ? col.format(val) : String(val ?? "-");
              })
            ),
          },
        }],
      });
      downloadBlob(blob, `${options.filename}.pdf`);
      toast.success("PDF exportado com sucesso");
    } catch (err) {
      logger.error("[Export] PDF error:", err);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, exportToCSV, exportToExcel, exportToPDF };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
