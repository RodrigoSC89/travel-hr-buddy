import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface OVIDReportsProps {
  vesselName: string;
  imoNumber: string;
  inspectorName: string;
  inspectionDate: string;
  status: { compliant: number; nonCompliant: number; notApplicable: number; pending: number };
  answers: Record<string, { answer: 'yes' | 'no' | 'na' | null; observation: string; evidence: string[] }>;
}

export const OVIDReports: React.FC<OVIDReportsProps> = ({
  vesselName,
  imoNumber,
  inspectorName,
  inspectionDate,
  status,
  answers,
}) => {
  const handleExport = (format: string) => {
    try {
      const reportData = {
        vessel: vesselName,
        imo: imoNumber,
        inspector: inspectorName,
        date: inspectionDate,
        complianceScore: answeredCount > 0 ? Math.round(((status.compliant + status.notApplicable) / answeredCount) * 100) : 0,
        status,
        answers,
        exportedAt: new Date().toISOString(),
      };

      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        filename = `ovid-report-${imoNumber}_${inspectionDate}.json`;
      } else {
        // CSV for xlsx/pdf fallback
        const rows = Object.entries(answers).map(([q, a]) => `"${q}","${a.answer || ''}","${a.observation || ''}"`);
        const csv = `Question,Answer,Observation\n${rows.join('\n')}`;
        blob = new Blob([csv], { type: 'text/csv' });
        filename = `ovid-report-${imoNumber}_${inspectionDate}.csv`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Relatório OVID exportado em ${format.toUpperCase()}`);
    } catch {
      toast.error('Erro ao exportar relatório');
    }
  };

  const answeredCount = status.compliant + status.nonCompliant + status.notApplicable;
  const totalCount = answeredCount + status.pending;
  const complianceScore = answeredCount > 0 ? Math.round(((status.compliant + status.notApplicable) / answeredCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório OVID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Embarcação</p>
              <p className="font-medium">{vesselName || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">IMO</p>
              <p className="font-medium">{imoNumber || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Inspetor</p>
              <p className="font-medium">{inspectorName || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="font-medium">{inspectionDate || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-3xl font-bold text-primary">{complianceScore}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <p className="text-3xl font-bold text-green-500">{status.compliant}</p>
              <p className="text-xs text-muted-foreground">Conforme</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10">
              <p className="text-3xl font-bold text-red-500">{status.nonCompliant}</p>
              <p className="text-xs text-muted-foreground">Não Conforme</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">{status.notApplicable}</p>
              <p className="text-xs text-muted-foreground">N/A</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10">
              <p className="text-3xl font-bold text-yellow-500">{status.pending}</p>
              <p className="text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <FileJson className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
