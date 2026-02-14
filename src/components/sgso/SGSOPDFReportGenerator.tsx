/**
 * SGSOPDFReportGenerator
 * ✅ P0 CORRIGIDO: Dados reais via Supabase (R01 MITIGADO)
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Building,
  FileCheck,
  Loader2,
  Printer,
  Eye,
  WifiOff
} from "lucide-react";

interface AuditData {
  code: string;
  type: string;
  date: string;
  auditor: string;
  vessel?: string;
  scope: string;
  complianceScore: number;
  practices: PracticeResult[];
  findings: Finding[];
  actionPlans: ActionPlan[];
}

interface PracticeResult {
  number: string;
  name: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number;
  evidences: number;
  observations: string;
}

interface Finding {
  code: string;
  practice: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  title: string;
  description: string;
  status: string;
  responsible: string;
  deadline: string;
}

interface ActionPlan {
  code: string;
  finding: string;
  type: string;
  title: string;
  responsible: string;
  deadline: string;
  status: string;
  progress: number;
}

// ✅ P0: Hook to fetch real audit data from database
const useAuditData = () => {
  return useQuery({
    queryKey: ["sgso-audit-report"],
    queryFn: async (): Promise<AuditData | null> => {
      // Fetch latest audit from peotram_audits
      const { data: auditRecord, error } = await supabase
        .from("peotram_audits")
        .select("*")
        .order("audit_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error("Failed to fetch audit data", error);
        return null;
      }

      if (!auditRecord) return null;

      // Fetch related findings from non_conformities
      const { data: findingsData } = await supabase
        .from("non_conformities")
        .select("*")
        .limit(20);

      // Fetch related action plans from corrective_actions
      const { data: actionsData } = await supabase
        .from("corrective_actions")
        .select("*")
        .limit(20);

      // Parse practices from audit metadata if available
      const auditMetadata = auditRecord.metadata as Record<string, unknown> | null;
      const practicesRaw = auditMetadata?.practices || auditMetadata?.findings || [];
      
      const practices: PracticeResult[] = Array.isArray(practicesRaw)
        ? (practicesRaw as unknown[]).map((f: unknown, i: number) => {
            const finding = f as Record<string, unknown>;
            return {
              number: `PG${i + 1}`,
              name: String(finding.area || finding.name || `Prática ${i + 1}`),
              status: (finding.status as PracticeResult['status']) || 'compliant',
              score: Number(finding.score || 80),
              evidences: Number(finding.evidences || 0),
              observations: String(finding.observations || finding.notes || ''),
            };
          })
        : [];

      const findings: Finding[] = (findingsData || []).map((nc, i) => ({
        code: nc.nc_number || `NC-${String(i + 1).padStart(3, '0')}`,
        practice: nc.category || 'PG1',
        severity: (nc.severity as Finding['severity']) || 'minor',
        title: nc.title || '',
        description: nc.description || '',
        status: nc.status || 'open',
        responsible: nc.assigned_to || '',
        deadline: nc.due_date || new Date().toISOString(),
      }));

      const actionPlans: ActionPlan[] = (actionsData || []).map((ca, i) => ({
        code: `PA-${String(i + 1).padStart(3, '0')}`,
        finding: ca.ncr_id || '',
        type: ca.action_type || 'Corretiva',
        title: ca.description || '',
        responsible: ca.responsible || '',
        deadline: ca.due_date || new Date().toISOString(),
        status: ca.status || 'pending',
        progress: ca.effectiveness_verified ? 100 : 0,
      }));

      return {
        code: `AUD-${auditRecord.id.slice(0, 8)}`,
        type: auditRecord.audit_type || 'Auditoria Interna SGSO',
        date: auditRecord.audit_date || new Date().toISOString(),
        auditor: auditRecord.auditor_name || 'Auditor',
        vessel: undefined,
        scope: '17 Práticas de Gestão ANP - Resolução 46/2016',
        complianceScore: Number(auditRecord.compliance_score || auditRecord.final_score || 0),
        practices,
        findings,
        actionPlans,
      };
    },
  });
};

export const SGSOPDFReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: auditData, isLoading, error } = useAuditData();
  
  const [reportOptions, setReportOptions] = useState({
    includeExecutiveSummary: true,
    includePracticesDetail: true,
    includeFindings: true,
    includeActionPlans: true,
    includeCharts: true,
    includeSignatures: true,
    format: 'detailed'
  });

  // ✅ P0: Guard - require real audit data
  const generatePDF = async () => {
    if (!auditData) {
      toast({
        title: "Sem dados de auditoria",
        description: "Nenhuma auditoria encontrada no sistema",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const doc = new JsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Helper functions
      const addHeader = () => {
        doc.setFillColor(220, 38, 38);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('RELATÓRIO DE AUDITORIA SGSO', pageWidth / 2, 15, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      };

      const addFooter = (pageNum: number) => {
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, pageHeight - 10);
        doc.text('Nauti One - Sistema SGSO', pageWidth - 15, pageHeight - 10, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      };

      const checkPageBreak = (height: number) => {
        if (yPos + height > pageHeight - 30) {
          doc.addPage();
          addHeader();
          yPos = 35;
          return true;
        }
        return false;
      };

      // Page 1 - Cover
      addHeader();
      yPos = 45;

      // Audit Info Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, 'F');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, 'S');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DA AUDITORIA', 20, yPos + 12);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Código: ${auditData.code}`, 20, yPos + 25);
      doc.text(`Tipo: ${auditData.type}`, 20, yPos + 35);
      doc.text(`Data: ${new Date(auditData.date).toLocaleDateString('pt-BR')}`, 20, yPos + 45);
      
      doc.text(`Auditor: ${auditData.auditor}`, 110, yPos + 25);
      doc.text(`Embarcação: ${auditData.vessel || 'N/A'}`, 110, yPos + 35);
      doc.text(`Escopo: ${auditData.scope}`, 20, yPos + 55);

      yPos += 75;

      // Compliance Score
      doc.setFillColor(auditData.complianceScore >= 80 ? 34 : auditData.complianceScore >= 60 ? 234 : 220, 
                       auditData.complianceScore >= 80 ? 197 : auditData.complianceScore >= 60 ? 179 : 38,
                       auditData.complianceScore >= 80 ? 94 : auditData.complianceScore >= 60 ? 8 : 38);
      doc.circle(pageWidth / 2, yPos + 25, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${auditData.complianceScore}%`, pageWidth / 2, yPos + 28, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('SCORE DE CONFORMIDADE', pageWidth / 2, yPos + 55, { align: 'center' });

      yPos += 70;

      // Summary Stats
      const compliant = auditData.practices.filter(p => p.status === 'compliant').length;
      const partial = auditData.practices.filter(p => p.status === 'partial').length;
      const nonCompliant = auditData.practices.filter(p => p.status === 'non_compliant').length;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO DAS 17 PRÁTICAS DE GESTÃO', 20, yPos);
      yPos += 10;

      doc.setFillColor(34, 197, 94);
      doc.rect(20, yPos, 50, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`${compliant}`, 45, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.text('CONFORMES', 45, yPos + 8, { align: 'center' });

      doc.setFillColor(234, 179, 8);
      doc.rect(80, yPos, 50, 20, 'F');
      doc.text(`${partial}`, 105, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.text('PARCIAIS', 105, yPos + 8, { align: 'center' });

      doc.setFillColor(220, 38, 38);
      doc.rect(140, yPos, 50, 20, 'F');
      doc.text(`${nonCompliant}`, 165, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.text('NÃO CONFORMES', 165, yPos + 8, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      addFooter(1);

      // Page 2 - Practices Detail
      if (reportOptions.includePracticesDetail) {
        doc.addPage();
        addHeader();
        yPos = 35;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO DAS PRÁTICAS DE GESTÃO', 20, yPos);
        yPos += 10;

        const practicesTableData = auditData.practices.map(p => [
          p.number,
          p.name,
          p.status === 'compliant' ? 'Conforme' : p.status === 'partial' ? 'Parcial' : 'Não Conforme',
          `${p.score}%`,
          p.evidences.toString(),
          p.observations
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['PG', 'Prática', 'Status', 'Score', 'Evid.', 'Observações']],
          body: practicesTableData,
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 40 },
            2: { cellWidth: 22 },
            3: { cellWidth: 15 },
            4: { cellWidth: 12 },
            5: { cellWidth: 'auto' }
          },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === 'body') {
              const status = data.cell.raw as string;
              if (status === 'Conforme') {
                data.cell.styles.textColor = [34, 197, 94];
              } else if (status === 'Parcial') {
                data.cell.styles.textColor = [234, 179, 8];
              } else {
                data.cell.styles.textColor = [220, 38, 38];
              }
            }
          }
        });

        addFooter(2);
      }

      // Page 3 - Findings
      if (reportOptions.includeFindings && auditData.findings.length > 0) {
        doc.addPage();
        addHeader();
        yPos = 35;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('NÃO CONFORMIDADES E OBSERVAÇÕES', 20, yPos);
        yPos += 10;

        const findingsTableData = auditData.findings.map(f => [
          f.code,
          f.practice,
          f.severity === 'critical' ? 'CRÍTICA' : f.severity === 'major' ? 'MAIOR' : f.severity === 'minor' ? 'MENOR' : 'OBS',
          f.title,
          f.responsible,
          new Date(f.deadline).toLocaleDateString('pt-BR')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Código', 'PG', 'Sev.', 'Título', 'Responsável', 'Prazo']],
          body: findingsTableData,
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === 'body') {
              const severity = data.cell.raw as string;
              if (severity === 'CRÍTICA') {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
              } else if (severity === 'MAIOR') {
                data.cell.styles.textColor = [234, 179, 8];
              }
            }
          }
        });

        // Detailed findings
        yPos = (doc as unknown as Record<string, Record<string, number>>).lastAutoTable.finalY + 15;
        
        auditData.findings.forEach((finding, index) => {
          checkPageBreak(50);
          
          doc.setFillColor(finding.severity === 'critical' ? 254 : 248, 
                          finding.severity === 'critical' ? 242 : 250, 
                          finding.severity === 'critical' ? 242 : 252);
          doc.roundedRect(15, yPos, pageWidth - 30, 40, 2, 2, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${finding.code} - ${finding.title}`, 20, yPos + 10);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const descLines = doc.splitTextToSize(finding.description, pageWidth - 45);
          doc.text(descLines, 20, yPos + 20);
          
          yPos += 50;
        });

        addFooter(3);
      }

      // Page 4 - Action Plans
      if (reportOptions.includeActionPlans && auditData.actionPlans.length > 0) {
        doc.addPage();
        addHeader();
        yPos = 35;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PLANO DE AÇÃO (PDCA)', 20, yPos);
        yPos += 10;

        const actionTableData = auditData.actionPlans.map(a => [
          a.code,
          a.finding,
          a.type,
          a.title,
          a.responsible,
          new Date(a.deadline).toLocaleDateString('pt-BR'),
          `${a.progress}%`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Código', 'NC', 'Tipo', 'Ação', 'Responsável', 'Prazo', 'Prog.']],
          body: actionTableData,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
          bodyStyles: { fontSize: 8 }
        });

        addFooter(4);
      }

      // Signatures Page
      if (reportOptions.includeSignatures) {
        doc.addPage();
        addHeader();
        yPos = 35;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TERMO DE ENCERRAMENTO', 20, yPos);
        yPos += 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Este relatório foi elaborado em conformidade com os requisitos da Resolução ANP nº 46/2016', 20, yPos);
        doc.text('e representa a situação encontrada durante a auditoria realizada.', 20, yPos + 7);
        yPos += 30;

        // Signature boxes
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos + 30, 85, yPos + 30);
        doc.text('Auditor Líder', 52.5, yPos + 40, { align: 'center' });
        doc.text(auditData.auditor, 52.5, yPos + 48, { align: 'center' });

        doc.line(110, yPos + 30, 175, yPos + 30);
        doc.text('Representante da Direção', 142.5, yPos + 40, { align: 'center' });
        doc.text('_________________', 142.5, yPos + 48, { align: 'center' });

        yPos += 70;

        doc.line(20, yPos + 30, 85, yPos + 30);
        doc.text('Gerente QSMS', 52.5, yPos + 40, { align: 'center' });
        doc.text('_________________', 52.5, yPos + 48, { align: 'center' });

        doc.line(110, yPos + 30, 175, yPos + 30);
        doc.text('Data de Aprovação', 142.5, yPos + 40, { align: 'center' });
        doc.text('___/___/______', 142.5, yPos + 48, { align: 'center' });

        addFooter(5);
      }

      // Save PDF
      doc.save(`Relatorio_SGSO_${auditData.code}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "✅ Relatório Gerado",
        description: "PDF exportado com sucesso para download"
      });

    } catch (error) {
      logger.error("PDF Generation Error:", error);
      toast({
        title: "Erro na Geração",
        description: "Falha ao gerar relatório PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ P0: Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // ✅ P0: Empty state when no audit data
  if (!auditData) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-destructive/5 to-muted border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-2xl">Gerador de Relatório PDF - Auditoria SGSO</CardTitle>
                <CardDescription>
                  Relatório formatado conforme ANP Resolução 46/2016
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhuma Auditoria Encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Não há auditorias cadastradas no sistema. Realize uma auditoria SGSO para gerar relatórios.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Dados Reais</AlertTitle>
              <AlertDescription>
                Este gerador utiliza apenas dados reais do banco de dados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-destructive/5 to-muted border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive rounded-xl">
              <FileText className="h-8 w-8 text-destructive-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Gerador de Relatório PDF - Auditoria SGSO</CardTitle>
              <CardDescription>
                Relatório formatado conforme ANP Resolução 46/2016 com trilhas, achados e planos de ação
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Dados da Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Código</Label>
                <p className="font-semibold">{auditData.code}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <p className="font-semibold">{new Date(auditData.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Auditor</Label>
                <p className="font-semibold">{auditData.auditor}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Score</Label>
                <Badge className={auditData.complianceScore >= 80 ? "bg-green-600" : auditData.complianceScore >= 60 ? "bg-yellow-600" : "bg-red-600"}>
                  {auditData.complianceScore}%
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{auditData.practices.filter(p => p.status === 'compliant').length}</p>
                <p className="text-xs text-green-600">Práticas Conformes</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{auditData.practices.filter(p => p.status === 'partial').length}</p>
                <p className="text-xs text-yellow-600">Parcialmente Conformes</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{auditData.practices.filter(p => p.status === 'non_compliant').length}</p>
                <p className="text-xs text-red-600">Não Conformes</p>
              </div>
            </div>

            {/* Findings Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Achados ({auditData.findings.length})</h4>
              <div className="space-y-2">
                {auditData.findings.map(finding => (
                  <div key={finding.code} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant={finding.severity === 'critical' ? 'destructive' : finding.severity === 'major' ? 'default' : 'outline'}>
                        {finding.severity === 'critical' ? 'CRÍTICA' : finding.severity === 'major' ? 'MAIOR' : 'MENOR'}
                      </Badge>
                      <span className="text-sm">{finding.code}</span>
                      <span className="text-sm text-muted-foreground">- {finding.title}</span>
                    </div>
                    <Badge variant="outline">{finding.practice}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Opções do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { key: 'includeExecutiveSummary', label: 'Resumo Executivo' },
                { key: 'includePracticesDetail', label: 'Detalhamento das 17 PGs' },
                { key: 'includeFindings', label: 'Não Conformidades' },
                { key: 'includeActionPlans', label: 'Planos de Ação (PDCA)' },
                { key: 'includeSignatures', label: 'Termo de Encerramento' }
              ].map(option => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={reportOptions[option.key as keyof typeof reportOptions] as boolean}
                    onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, [option.key]: checked }))}
                  />
                  <Label htmlFor={option.key} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Formato</Label>
              <Select value={reportOptions.format} onValueChange={(v) => setReportOptions(prev => ({ ...prev, format: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detalhado (Completo)</SelectItem>
                  <SelectItem value="summary">Resumido (Executivo)</SelectItem>
                  <SelectItem value="technical">Técnico (ANP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SGSOPDFReportGenerator;