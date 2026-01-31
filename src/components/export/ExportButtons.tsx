/**
 * Export Buttons Component
 * Unified export to PDF and Excel with progress feedback
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useXLSXExport } from '@/hooks/use-xlsx-export';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  filename: string;
  title: string;
  headers?: string[];
  metadata?: Record<string, string>;
  variant?: 'default' | 'dropdown';
  disabled?: boolean;
}

export function ExportButtons({
  data,
  filename,
  title,
  headers,
  metadata,
  variant = 'default',
  disabled = false,
}: ExportButtonsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { exportToXLSX, isLoading: isExcelLoading } = useXLSXExport();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast({
        title: t('errors.generic'),
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    setIsPdfLoading(true);
    try {
      // Lazy load jsPDF
      const jsPDF = (await import('jspdf')).default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text(title, pageWidth / 2, 20, { align: 'center' });

      // Metadata
      if (metadata) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        let y = 30;
        Object.entries(metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, y);
          y += 6;
        });
      }

      // Table
      const tableHeaders = headers || Object.keys(data[0]);
      const tableRows = data.map((row) =>
        tableHeaders.map((h) => String(row[h] ?? ''))
      );

      (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: metadata ? 45 : 30,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `${t('common.page', 'Page')} ${i} / ${pageCount} - ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`${filename}.pdf`);

      toast({
        title: t('common.success'),
        description: `PDF ${filename}.pdf generated successfully`,
      });
    } catch (error) {
      logger.error('PDF export error:', error);
      toast({
        title: t('errors.generic'),
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast({
        title: t('errors.generic'),
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    await exportToXLSX(data, {
      filename: `${filename}.xlsx`,
      sheetName: title.substring(0, 31), // Excel sheet name limit
    });
  };

  const isLoading = isPdfLoading || isExcelLoading;

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {t('common.export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover z-50">
          <DropdownMenuItem onClick={handleExportPDF} disabled={isPdfLoading}>
            <FileDown className="h-4 w-4 mr-2" />
            {t('common.export')} PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel} disabled={isExcelLoading}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t('common.export')} Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={disabled || isPdfLoading}
      >
        {isPdfLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={disabled || isExcelLoading}
      >
        {isExcelLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Excel
      </Button>
    </div>
  );
}

export default ExportButtons;
