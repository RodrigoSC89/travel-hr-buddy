import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Download, Loader2, CheckCircle, XCircle, 
  AlertTriangle, Ship, Calendar, User, BarChart3, Image, FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';

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
    evidence?: string[];
  }>;
}

interface EvidencePhoto {
  questionId: string;
  fileName: string;
  caption?: string;
}

interface PreOVIDReportGeneratorProps {
  inspectionData: InspectionData;
  chapterResults: ChapterResult[];
  totalQuestions: number;
  answers: Record<string, { answer: 'yes' | 'no' | 'na' | null; observation: string; evidence?: string[] }>;
  evidencePhotos?: EvidencePhoto[];
  inspectionId?: string;
}

export const PreOVIDReportGenerator: React.FC<PreOVIDReportGeneratorProps> = ({
  inspectionData,
  chapterResults,
  totalQuestions,
  answers,
  evidencePhotos = [],
  inspectionId,
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
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const pdf = new JsPDF();
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
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
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

      // Evidence Photos Summary (if any)
      if (evidencePhotos.length > 0) {
        pdf.addPage();
        y = 20;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EVIDENCE PHOTOS', margin, y);

        y += 10;
        const photoData = evidencePhotos.map((photo, i) => [
          (i + 1).toString(),
          photo.questionId,
          photo.fileName,
          photo.caption || '-',
        ]);

        autoTable(pdf, {
          startY: y,
          head: [['#', 'Question', 'File', 'Caption']],
          body: photoData,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [0, 102, 51] },
          margin: { left: margin, right: margin },
        });
      }

      // Detailed Chapter Breakdown (all questions)
      pdf.addPage();
      y = 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETAILED RESPONSES', margin, y);
      
      y += 5;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text('Complete listing of all inspection responses', margin, y + 5);
      pdf.setTextColor(0);

      y += 15;
      
      // Group answers by chapter for detailed view
      const detailedData: string[][] = [];
      Object.entries(answers).forEach(([questionId, data]) => {
        if (data.answer) {
          const statusText = data.answer === 'yes' ? 'OK' : data.answer === 'no' ? 'NC' : 'N/A';
          detailedData.push([
            questionId,
            statusText,
            data.observation ? data.observation.substring(0, 60) + (data.observation.length > 60 ? '...' : '') : '-',
          ]);
        }
      });

      if (detailedData.length > 0) {
        autoTable(pdf, {
          startY: y,
          head: [['Question ID', 'Status', 'Observation']],
          body: detailedData,
          theme: 'striped',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [51, 51, 51] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 15 },
            2: { cellWidth: 120 },
          },
          margin: { left: margin, right: margin },
        });
      }

      // Signatures
      pdf.addPage();
      y = 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SIGNATURES & CERTIFICATION', margin, y);

      y += 15;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This report represents a pre-inspection assessment based on OVIQ4 (7300) questionnaire.', margin, y);
      pdf.text('Final OVID inspection must be conducted by an accredited OCIMF inspector.', margin, y + 6);

      y += 25;
      const signatureY = y;
      
      // Inspector signature box
      pdf.setDrawColor(200);
      pdf.rect(margin, signatureY, 80, 35);
      pdf.setFontSize(8);
      pdf.text('Inspector Signature:', margin + 2, signatureY + 5);
      pdf.line(margin + 5, signatureY + 25, margin + 75, signatureY + 25);
      pdf.text(`Name: ${inspectionData.inspectorName}`, margin + 2, signatureY + 32);

      // Master signature box
      pdf.rect(pageWidth - margin - 80, signatureY, 80, 35);
      pdf.text('Master Signature:', pageWidth - margin - 78, signatureY + 5);
      pdf.line(pageWidth - margin - 75, signatureY + 25, pageWidth - margin - 5, signatureY + 25);
      pdf.text('Name: ________________________', pageWidth - margin - 78, signatureY + 32);

      // Date & Location
      y = signatureY + 45;
      pdf.text(`Date: ${inspectionData.inspectionDate}`, margin, y);
      pdf.text(`Location: ${inspectionData.location || 'N/A'}`, pageWidth - margin - 80, y);

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
      logger.error('Failed to generate Pre-OVID PDF report', error);
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

        {/* PDF Content Preview */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Conteúdo do Relatório PDF
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Dados da Embarcação</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Sumário de Conformidade</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Resultados por Capítulo</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Não-Conformidades</span>
            </div>
            <div className="flex items-center gap-1">
              {evidencePhotos.length > 0 ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Fotos de Evidência ({evidencePhotos.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Respostas Detalhadas</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Seção de Assinaturas</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Certificação OCIMF</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || totals.answered === 0}
            className="flex-1"
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
                Gerar Relatório PDF Completo
              </>
            )}
          </Button>
        </div>
        
        {totals.answered === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Responda pelo menos uma questão para habilitar a geração do relatório
          </p>
        )}
      </CardContent>
    </Card>
  );
};
