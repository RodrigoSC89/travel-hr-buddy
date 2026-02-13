/**
 * Universal Export Button Component
 * Dropdown with CSV, Excel, PDF, JSON options
 */

import React from 'react';
import { Download, FileSpreadsheet, FileText, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useUniversalExport, ExportColumn, ExportFormat } from '@/hooks/useUniversalExport';

export interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
  subtitle?: string;
  formats?: ExportFormat[];
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
  subtitle,
  formats = ['csv', 'excel', 'pdf', 'json'],
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: ExportButtonProps<T>) {
  const { exportData, isExporting, exportProgress } = useUniversalExport<T>();

  const handleExport = async (format: ExportFormat) => {
    await exportData(data, format, {
      filename,
      columns,
      title: title || filename,
      subtitle,
    });
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    csv: <FileText className="h-4 w-4 mr-2" />,
    excel: <FileSpreadsheet className="h-4 w-4 mr-2" />,
    pdf: <FileText className="h-4 w-4 mr-2 text-destructive" />,
    json: <FileJson className="h-4 w-4 mr-2" />,
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'CSV (.csv)',
    excel: 'Excel (.xlsx)',
    pdf: 'PDF (.pdf)',
    json: 'JSON (.json)',
  };

  if (isExporting) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {exportProgress > 0 ? `${exportProgress}%` : 'Exportando...'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={disabled || data.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="cursor-pointer"
          >
            {formatIcons[format]}
            {formatLabels[format]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {data.length} registro(s)
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
