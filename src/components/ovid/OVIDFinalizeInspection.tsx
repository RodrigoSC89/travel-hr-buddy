import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, XCircle, AlertTriangle, Lock, FileText, 
  Download, Loader2, Shield, Ship, Calendar, User
} from 'lucide-react';
import { toast } from 'sonner';
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { OVIDInspection, OVIDAnswer } from '@/hooks/useOVIDInspection';
import { OVIQ4_CHAPTERS } from '@/data/oviq4-complete-data';
import { logger } from '@/lib/logger';

interface OVIDFinalizeInspectionProps {
  inspection: OVIDInspection | null;
  answers: Record<string, OVIDAnswer>;
  onFinalize: () => Promise<boolean>;
  isFinalized?: boolean;
}

export const OVIDFinalizeInspection: React.FC<OVIDFinalizeInspectionProps> = ({
  inspection,
  answers,
  onFinalize,
  isFinalized = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  if (!inspection) return null;

  const totalAnswered = inspection.compliant_count + inspection.non_compliant_count + inspection.not_applicable_count;
  const progressPercent = (totalAnswered / inspection.total_questions) * 100;
  const isComplete = totalAnswered === inspection.total_questions;

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const pdf = new JsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFillColor(0, 82, 147);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('OVID INSPECTION REPORT', pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('OVIQ4 - OCIMF Offshore Vessel Inspection Database', pageWidth / 2, 28, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 36, { align: 'center' });

      // Vessel Information
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text('VESSEL INFORMATION', 14, 55);
      
      pdf.setFontSize(10);
      const vesselInfo = [
        ['Vessel Name:', inspection.vessel_name],
        ['IMO Number:', inspection.imo_number],
        ['Vessel Type:', inspection.vessel_type],
        ['Operator:', inspection.operator || '-'],
        ['Location:', inspection.location || '-'],
      ];
      
      let yPos = 62;
      vesselInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 14, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 50, yPos);
        yPos += 7;
      });

      // Inspection Details
      pdf.setFontSize(14);
      pdf.text('INSPECTION DETAILS', 110, 55);
      
      const inspectionInfo = [
        ['Inspector:', inspection.inspector_name],
        ['Date:', new Date(inspection.inspection_date).toLocaleDateString('pt-BR')],
        ['Status:', inspection.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'],
      ];
      
      yPos = 62;
      inspectionInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 110, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 145, yPos);
        yPos += 7;
      });

      // Compliance Score
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(14, 98, pageWidth - 28, 30, 3, 3, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMPLIANCE SCORE', 20, 112);
      
      const scoreColor = inspection.compliance_score >= 85 ? [34, 197, 94] : 
                         inspection.compliance_score >= 70 ? [234, 179, 8] : [239, 68, 68];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.setFontSize(28);
      pdf.text(`${inspection.compliance_score}%`, pageWidth - 40, 118);
      
      pdf.setTextColor(0, 0, 0);

      // Summary Statistics
      pdf.setFontSize(14);
      pdf.text('SUMMARY STATISTICS', 14, 145);
      
      autoTable(pdf, {
        startY: 150,
        head: [['Category', 'Count', 'Percentage']],
        body: [
          ['Compliant', inspection.compliant_count.toString(), `${Math.round((inspection.compliant_count / totalAnswered) * 100)}%`],
          ['Non-Compliant', inspection.non_compliant_count.toString(), `${Math.round((inspection.non_compliant_count / totalAnswered) * 100)}%`],
          ['Not Applicable', inspection.not_applicable_count.toString(), `${Math.round((inspection.not_applicable_count / totalAnswered) * 100)}%`],
          ['Total Answered', totalAnswered.toString(), '100%'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 82, 147] },
      });

      // Non-Conformities Details
      const nonConformities = Object.entries(answers)
        .filter(([, ans]) => ans.answer === 'no')
        .map(([qId, ans]) => {
          const chapter = OVIQ4_CHAPTERS.find(c => qId.startsWith(`${c.id}.`));
          const question = chapter?.questions.find(q => q.id === qId);
          return {
            id: qId,
            chapter: chapter?.name || '-',
            question: question?.question?.substring(0, 80) + '...' || '-',
            observation: ans.observation || 'Sem observação',
          };
        });

      if (nonConformities.length > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('NON-CONFORMITIES DETAIL', 14, 20);
        
        autoTable(pdf, {
          startY: 25,
          head: [['ID', 'Chapter', 'Question', 'Observation']],
          body: nonConformities.map(nc => [nc.id, nc.chapter, nc.question, nc.observation]),
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68] },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 35 },
            2: { cellWidth: 60 },
            3: { cellWidth: 65 },
          },
          styles: { fontSize: 8 },
        });
      }

      // Chapter Summary
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('CHAPTER SUMMARY', 14, 20);
      
      const chapterData = OVIQ4_CHAPTERS.map(ch => {
        const chapterAnswers = Object.entries(answers).filter(([key]) => key.startsWith(`${ch.id}.`));
        const compliant = chapterAnswers.filter(([, a]) => a.answer === 'yes').length;
        const nonCompliant = chapterAnswers.filter(([, a]) => a.answer === 'no').length;
        const na = chapterAnswers.filter(([, a]) => a.answer === 'na').length;
        const answered = compliant + nonCompliant + na;
        const score = answered > 0 ? Math.round(((compliant + na) / answered) * 100) : 0;
        
        return [
          `Cap ${ch.id}`,
          ch.name.substring(0, 25),
          ch.questions.length.toString(),
          compliant.toString(),
          nonCompliant.toString(),
          `${score}%`,
        ];
      });

      autoTable(pdf, {
        startY: 25,
        head: [['Chapter', 'Name', 'Questions', 'Compliant', 'Non-Compliant', 'Score']],
        body: chapterData,
        theme: 'striped',
        headStyles: { fillColor: [0, 82, 147] },
        styles: { fontSize: 8 },
      });

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount} | OVID Inspection Report | ${inspection.vessel_name} | ${new Date(inspection.inspection_date).toLocaleDateString('pt-BR')}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      pdf.save(`OVID_Report_${inspection.vessel_name.replace(/\s/g, '_')}_${inspection.inspection_date}.pdf`);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      logger.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    const success = await onFinalize();
    setIsFinalizing(false);
    if (success) {
      setIsOpen(false);
      await generatePDFReport();
    }
  };

  return (
    <Card className={isFinalized ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isFinalized ? (
            <>
              <Lock className="w-5 h-5 text-green-500" />
              Inspeção Finalizada
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Finalizar Inspeção
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isFinalized 
            ? 'Esta inspeção foi finalizada e não pode mais ser editada.'
            : 'Finalize a inspeção para bloquear edições e gerar o relatório final.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Ship className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Embarcação</p>
            <p className="font-medium text-sm truncate">{inspection.vessel_name}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <User className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Inspetor</p>
            <p className="font-medium text-sm truncate">{inspection.inspector_name}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-medium text-sm">{new Date(inspection.inspection_date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className={`text-2xl font-bold ${
              inspection.compliance_score >= 85 ? 'text-green-500' : 
              inspection.compliance_score >= 70 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {inspection.compliance_score}%
            </div>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{totalAnswered} de {inspection.total_questions} questões</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
            {inspection.compliant_count} Conforme
          </Badge>
          <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
            <XCircle className="w-3 h-3 mr-1 text-red-500" />
            {inspection.non_compliant_count} Não Conforme
          </Badge>
          <Badge variant="outline">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {inspection.not_applicable_count} N/A
          </Badge>
        </div>

        {/* Warning if not complete */}
        {!isComplete && !isFinalized && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A inspeção ainda não está completa. {inspection.total_questions - totalAnswered} questões pendentes.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {isFinalized ? (
            <Button onClick={generatePDFReport} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Baixar Relatório PDF
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button disabled={!isComplete}>
                  <Lock className="w-4 h-4 mr-2" />
                  Finalizar Inspeção
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Finalização</DialogTitle>
                  <DialogDescription>
                    Após finalizar, a inspeção será bloqueada para edições e o relatório PDF será gerado automaticamente.
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-medium">{inspection.vessel_name}</p>
                  <p className="text-sm text-muted-foreground">IMO: {inspection.imo_number}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-500">{inspection.compliant_count} Conforme</span>
                    <span className="text-red-500">{inspection.non_compliant_count} Não Conforme</span>
                    <span className="font-bold">Score: {inspection.compliance_score}%</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleFinalize} disabled={isFinalizing}>
                    {isFinalizing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Confirmar Finalização
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {!isFinalized && (
            <Button variant="outline" onClick={generatePDFReport} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Preview PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};