import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Download, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSystemActions } from '@/hooks/use-system-actions';

// Componente para ações rápidas
export const QuickActions: React.FC = () => {
  const { handleExportData, handlePrintReport, handleNavigateToReports } = useSystemActions();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExportData('pdf')}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintReport}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleNavigateToReports}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Relatórios
      </Button>
    </div>
  );
};