import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Download, Loader2, CheckCircle, XCircle, 
  AlertTriangle, Ship, Calendar, User, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InspectionData {
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  inspectorName: string;
  inspectionDate: string;
  operator?: string;
  location?: string;
}

interface ChapterResult {
  id: string;
  name: string;
  total: number;
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  observations: Array<{
    questionId: string;
    question: string;
    observation: string;
  }>;
}

interface PreOVIDReportGeneratorProps {
  inspectionData: InspectionData;
  chapterResults: ChapterResult[];
  totalQuestions: number;
  answers: Record<string, { answer: 'yes' | 'no' | 'na' | null; observation: string }>;
}

export const PreOVIDReportGenerator: React.FC<PreOVIDReportGeneratorProps> = ({
  inspectionData,
  chapterResults,
  totalQuestions,
  answers,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateTotals = () => {
    let compliant = 0;
    let nonCompliant = 0;
    let notApplicable = 0;

    chapterResults.forEach(chapter => {
      compliant += chapter.compliant;
      nonCompliant += chapter.nonCompliant;
      notApplicable += chapter.notApplicable;
    });

    const answered = compliant + nonCompliant + notApplicable;
    const pending = totalQuestions - answered;
    const score = answered > 0 ? Math.round(((compliant + notApplicable) / answered) * 100) : 0;

    return { compliant, nonCompliant, notApplicable, pending, answered, score };
  };

  const totals = calculateTotals();

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;

      // Header
      pdf.setFillColor(0, 51, 102);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OVID INSPECTION REPORT', pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('OCIMF OVIQ4 (7300) - Pre-OVID Inspection', pageWidth / 2, 28, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

      // Vessel Information
      let y = 50;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VESSEL INFORMATION', margin, y);

      y += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const vesselInfo = [
        ['Vessel Name', inspectionData.vesselName],
        ['IMO Number', inspectionData.imoNumber],
        ['Vessel Type', inspectionData.vesselType],
        ['Operator', inspectionData.operator || '-'],
        ['Inspector', inspectionData.inspectorName],
        ['Inspection Date', inspectionData.inspectionDate],
        ['Location', inspectionData.location || '-'],
      ];

      autoTable(pdf, {
        startY: y,
        head: [],
        body: vesselInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin },
      });

      // Summary
      y = (pdf as any).lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSPECTION SUMMARY', margin, y);

      y += 10;
      const summaryData = [
        ['Total Questions', totalQuestions.toString()],
        ['Compliant', totals.compliant.toString()],
        ['Non-Compliant', totals.nonCompliant.toString()],
        ['Not Applicable', totals.notApplicable.toString()],
        ['Pending', totals.pending.toString()],
        ['Compliance Score', `${totals.score}%`],
      ];

      autoTable(pdf, {
        startY: y,
        head: [],
        body: summaryData,
        theme: 'striped',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 30 },
        },
        margin: { left: margin },
      });

      // Chapter Results
      pdf.addPage();
      y = 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESULTS BY CHAPTER', margin, y);

      y += 10;
      const chapterData = chapterResults.map(ch => [
        ch.id,
        ch.name,
        ch.total.toString(),
        ch.compliant.toString(),
        ch.nonCompliant.toString(),
        ch.notApplicable.toString(),
      ]);

      autoTable(pdf, {
        startY: y,
        head: [['#', 'Chapter', 'Total', 'OK', 'NC', 'N/A']],
        body: chapterData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 51, 102] },
        margin: { left: margin, right: margin },
      });

      // Non-Conformities
      const nonConformities = chapterResults.flatMap(ch => 
        ch.observations.map(obs => ({
          chapter: ch.name,
          ...obs,
        }))
      );

      if (nonConformities.length > 0) {
        pdf.addPage();
        y = 20;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NON-CONFORMITIES', margin, y);

        y += 10;
        const ncData = nonConformities.map((nc, i) => [
          (i + 1).toString(),
          nc.questionId,
          nc.question.substring(0, 50) + (nc.question.length > 50 ? '...' : ''),
          nc.observation.substring(0, 80) + (nc.observation.length > 80 ? '...' : ''),
        ]);

        autoTable(pdf, {
          startY: y,
          head: [['#', 'Item', 'Question', 'Observation']],
          body: ncData,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [153, 0, 0] },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 15 },
            2: { cellWidth: 60 },
            3: { cellWidth: 80 },
          },
          margin: { left: margin, right: margin },
        });
      }

      // Signatures
      pdf.addPage();
      y = 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SIGNATURES', margin, y);

      y += 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const signatureY = y;
      pdf.line(margin, signatureY + 30, margin + 70, signatureY + 30);
      pdf.text('Inspector', margin, signatureY + 38);
      pdf.text(inspectionData.inspectorName, margin, signatureY + 45);

      pdf.line(pageWidth - margin - 70, signatureY + 30, pageWidth - margin, signatureY + 30);
      pdf.text('Master', pageWidth - margin - 70, signatureY + 38);

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
          `Page ${i} of ${pageCount} | OVID Pre-Inspection Report | Generated by Nautilus One`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      const filename = `OVID_Report_${inspectionData.vesselName.replace(/\s+/g, '_')}_${inspectionData.inspectionDate}.pdf`;
      pdf.save(filename);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Relatório de Inspeção Pre-OVID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vessel Info Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Embarcação</p>
              <p className="text-sm font-medium">{inspectionData.vesselName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Inspetor</p>
              <p className="text-sm font-medium">{inspectionData.inspectorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium">{inspectionData.inspectionDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className={`text-sm font-bold ${
                totals.score >= 85 ? 'text-green-500' : 
                totals.score >= 70 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {totals.score}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{totalQuestions}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-500">{totals.compliant}</p>
            <p className="text-xs text-muted-foreground">Conforme</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 text-center">
            <p className="text-2xl font-bold text-red-500">{totals.nonCompliant}</p>
            <p className="text-xs text-muted-foreground">Não Conforme</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-500/10 text-center">
            <p className="text-2xl font-bold text-gray-500">{totals.notApplicable}</p>
            <p className="text-xs text-muted-foreground">N/A</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
            <p className="text-2xl font-bold text-yellow-500">{totals.pending}</p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Inspeção</span>
            <span>{totals.answered} de {totalQuestions} ({Math.round((totals.answered / totalQuestions) * 100)}%)</span>
          </div>
          <Progress value={(totals.answered / totalQuestions) * 100} className="h-2" />
        </div>

        <Separator />

        {/* Chapter Results */}
        <div>
          <h4 className="font-medium mb-3">Resultado por Capítulo</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {chapterResults.map(chapter => {
                const chapterTotal = chapter.compliant + chapter.nonCompliant + chapter.notApplicable;
                const chapterScore = chapterTotal > 0 
                  ? Math.round(((chapter.compliant + chapter.notApplicable) / chapterTotal) * 100)
                  : 0;
                
                return (
                  <div key={chapter.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{chapter.id}</Badge>
                      <span className="text-sm">{chapter.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {chapter.compliant}
                      </Badge>
                      {chapter.nonCompliant > 0 && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          {chapter.nonCompliant}
                        </Badge>
                      )}
                      <span className={`text-xs font-bold ${
                        chapterScore >= 85 ? 'text-green-500' : 
                        chapterScore >= 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {chapterScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePDF} 
          disabled={isGenerating || totals.answered === 0}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando Relatório...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
