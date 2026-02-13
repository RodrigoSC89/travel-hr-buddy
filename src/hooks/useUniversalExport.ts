/**
 * Universal Export Hook
 * Provides CSV, PDF, Excel and JSON export capabilities for any data table
 * UX COMPLETENESS - P2 ITEM
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export interface ExportOptions {
  filename: string;
  columns: ExportColumn[];
  title?: string;
  subtitle?: string;
}

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export function useUniversalExport<T extends Record<string, unknown>>() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const formatValue = (value: unknown, format?: (v: unknown) => string): string => {
    if (format) return format(value);
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString('pt-BR');
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'number') return value.toLocaleString('pt-BR');
    return String(value);
  };

  const exportToCSV = useCallback(async (data: T[], options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const headers = options.columns.map(col => col.label).join(',');
      const total = data.length;
      
      const rows = data.map((item, index) => {
        setExportProgress(Math.round(((index + 1) / total) * 100));
        return options.columns
          .map(col => {
            const value = formatValue(item[col.key], col.format);
            // Escape commas and quotes in CSV
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      });

      const csv = [headers, ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${options.filename}.csv`);

      toast.success('Exportação concluída!', {
        description: `${data.length} registros exportados para CSV`,
      });
    } catch (error) {
      logger.error('CSV export error:', error);
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const exportToJSON = useCallback(async (data: T[], options: ExportOptions) => {
    setIsExporting(true);

    try {
      const exportData = data.map(item => {
        const row: Record<string, unknown> = {};
        options.columns.forEach(col => {
          row[col.key] = item[col.key];
        });
        return row;
      });

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, `${options.filename}.json`);

      toast.success('Exportação concluída!', {
        description: `${data.length} registros exportados para JSON`,
      });
    } catch (error) {
      logger.error('JSON export error:', error);
      toast.error('Erro ao exportar JSON');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToExcel = useCallback(async (data: T[], options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Dynamic import for xlsx
      const XLSX = await import('xlsx');
      
      const total = data.length;
      const worksheetData = data.map((item, index) => {
        setExportProgress(Math.round(((index + 1) / total) * 100));
        const row: Record<string, unknown> = {};
        options.columns.forEach(col => {
          row[col.label] = formatValue(item[col.key], col.format);
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, options.title || 'Dados');

      // Auto-size columns
      const colWidths = options.columns.map(col => ({
        wch: Math.max(col.label.length, 15)
      }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `${options.filename}.xlsx`);

      toast.success('Exportação concluída!', {
        description: `${data.length} registros exportados para Excel`,
      });
    } catch (error) {
      logger.error('Excel export error:', error);
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const exportToPDF = useCallback(async (data: T[], options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Dynamic imports for jsPDF and autoTable
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const total = data.length;

      // Title
      doc.setFontSize(16);
      doc.text(options.title || options.filename, 14, 20);

      if (options.subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(options.subtitle, 14, 28);
      }

      // Table data
      const tableData = data.map((item, index) => {
        setExportProgress(Math.round(((index + 1) / total) * 100));
        return options.columns.map(col => formatValue(item[col.key], col.format));
      });

      // Add table
      (doc as unknown as Record<string, Function>).autoTable({
        head: [options.columns.map(col => col.label)],
        body: tableData,
        startY: options.subtitle ? 35 : 28,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(`${options.filename}.pdf`);

      toast.success('Exportação concluída!', {
        description: `${data.length} registros exportados para PDF`,
      });
    } catch (error) {
      logger.error('PDF export error:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const exportData = useCallback(async (
    data: T[],
    format: ExportFormat,
    options: ExportOptions
  ) => {
    if (data.length === 0) {
      toast.warning('Nenhum dado para exportar');
      return;
    }

    switch (format) {
      case 'csv':
        await exportToCSV(data, options);
        break;
      case 'json':
        await exportToJSON(data, options);
        break;
      case 'excel':
        await exportToExcel(data, options);
        break;
      case 'pdf':
        await exportToPDF(data, options);
        break;
    }
  }, [exportToCSV, exportToJSON, exportToExcel, exportToPDF]);

  return {
    exportData,
    exportToCSV,
    exportToJSON,
    exportToExcel,
    exportToPDF,
    isExporting,
    exportProgress,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default useUniversalExport;
