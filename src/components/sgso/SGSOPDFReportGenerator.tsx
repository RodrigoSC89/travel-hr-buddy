import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
import { logger } from '@/lib/logger';
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
  Eye
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

const SAMPLE_AUDIT: AuditData = {
  code: "AUD-SGSO-2024-001",
  type: "Auditoria Interna SGSO",
  date: "2024-12-30",
  auditor: "Eng. João Silva",
  vessel: "MV Nautilus One",
  scope: "17 Práticas de Gestão ANP - Resolução 46/2016",
  complianceScore: 84,
  practices: [
    { number: "PG1", name: "Liderança e Comprometimento", status: 'compliant', score: 95, evidences: 8, observations: "Política bem definida" },
    { number: "PG2", name: "Política de SGSO", status: 'compliant', score: 90, evidences: 5, observations: "Documentação atualizada" },
    { number: "PG3", name: "Organização e Recursos", status: 'partial', score: 75, evidences: 6, observations: "Necessita revisão de organograma" },
    { number: "PG4", name: "Competência e Treinamento", status: 'compliant', score: 88, evidences: 12, observations: "Matriz de treinamento completa" },
    { number: "PG5", name: "Comunicação", status: 'compliant', score: 85, evidences: 4, observations: "Canais bem estabelecidos" },
    { number: "PG6", name: "Documentação", status: 'partial', score: 70, evidences: 15, observations: "Alguns procedimentos desatualizados" },
    { number: "PG7", name: "Gestão de Riscos", status: 'non_compliant', score: 55, evidences: 8, observations: "Matriz de riscos incompleta" },
    { number: "PG8", name: "Projeto e Construção", status: 'compliant', score: 92, evidences: 6, observations: "Conforme especificações" },
    { number: "PG9", name: "Operação e Manutenção", status: 'compliant', score: 88, evidences: 20, observations: "Plano de manutenção atualizado" },
    { number: "PG10", name: "Gestão de Mudanças", status: 'partial', score: 72, evidences: 5, observations: "MOC pendentes de fechamento" },
    { number: "PG11", name: "Gestão de Contratadas", status: 'compliant', score: 85, evidences: 7, observations: "Avaliações em dia" },
    { number: "PG12", name: "Investigação de Incidentes", status: 'compliant', score: 90, evidences: 10, observations: "Metodologia conforme" },
    { number: "PG13", name: "Integridade Mecânica", status: 'non_compliant', score: 60, evidences: 18, observations: "Inspeções atrasadas" },
    { number: "PG14", name: "Preparação para Emergências", status: 'compliant', score: 95, evidences: 8, observations: "Simulados em dia" },
    { number: "PG15", name: "Auditorias e Análise Crítica", status: 'compliant', score: 88, evidences: 6, observations: "Processo bem estruturado" },
    { number: "PG16", name: "Segurança de Processo", status: 'partial', score: 75, evidences: 12, observations: "HAZOP pendente" },
    { number: "PG17", name: "Indicadores de Desempenho", status: 'compliant', score: 85, evidences: 5, observations: "KPIs acompanhados" }
  ],
  findings: [
    { code: "NC-001", practice: "PG7", severity: 'major', title: "Matriz de riscos desatualizada", description: "A matriz de riscos não contempla todos os cenários operacionais identificados na última análise de riscos.", status: "open", responsible: "Gerente QSMS", deadline: "2025-01-30" },
    { code: "NC-002", practice: "PG13", severity: 'critical', title: "Inspeções de integridade atrasadas", description: "3 equipamentos críticos com inspeção programada vencida há mais de 30 dias.", status: "in_progress", responsible: "Eng. Manutenção", deadline: "2025-01-15" },
    { code: "OBS-001", practice: "PG6", severity: 'minor', title: "Procedimentos desatualizados", description: "5 procedimentos operacionais com revisão pendente.", status: "open", responsible: "Coord. Documentação", deadline: "2025-02-15" }
  ],
  actionPlans: [
    { code: "PA-001", finding: "NC-001", type: "Corretiva", title: "Atualizar matriz de riscos completa", responsible: "Gerente QSMS", deadline: "2025-01-30", status: "in_progress", progress: 35 },
    { code: "PA-002", finding: "NC-002", type: "Corretiva", title: "Executar inspeções pendentes", responsible: "Eng. Manutenção", deadline: "2025-01-15", status: "in_progress", progress: 60 },
    { code: "PA-003", finding: "NC-002", type: "Preventiva", title: "Implementar sistema de alertas automáticos", responsible: "TI/Manutenção", deadline: "2025-02-28", status: "pending", progress: 0 },
    { code: "PA-004", finding: "OBS-001", type: "Corretiva", title: "Revisar procedimentos identificados", responsible: "Coord. Documentação", deadline: "2025-02-15", status: "pending", progress: 10 }
  ]
};

export const SGSOPDFReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [auditData] = useState<AuditData>(SAMPLE_AUDIT);
  
  const [reportOptions, setReportOptions] = useState({
    includeExecutiveSummary: true,
    includePracticesDetail: true,
    includeFindings: true,
    includeActionPlans: true,
    includeCharts: true,
    includeSignatures: true,
    format: 'detailed'
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
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
        doc.text('Nautilus One - Sistema SGSO', pageWidth - 15, pageHeight - 10, { align: 'right' });
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
        yPos = (doc as any).lastAutoTable.finalY + 15;
        
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
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
              <Shield className="h-5 w-5 text-red-600" />
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