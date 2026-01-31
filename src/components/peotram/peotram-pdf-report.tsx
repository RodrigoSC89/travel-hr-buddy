/**
 * PEOTRAM PDF Report Generator
 * Generates professional PDF reports with 13 elements conformity and digital signatures
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, FileText, Loader2, Star, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { logger } from '@/lib/logger';

interface ElementScore {
  number: number;
  name: string;
  sigla: string;
  isCritical: boolean;
  score: number;
  totalItems: number;
  conformantItems: number;
  nonConformantItems: number;
}

interface AuditData {
  id: string;
  vesselName: string;
  vesselImo?: string;
  auditorName: string;
  auditDate: string;
  overallScore: number;
  elements: ElementScore[];
  signatures?: {
    auditor?: { name: string; date: string; signature?: string };
    captain?: { name: string; date: string; signature?: string };
    owner?: { name: string; date: string; signature?: string };
    petrobras?: { name: string; date: string; signature?: string };
  };
}

interface PeotramPdfReportProps {
  auditData: AuditData;
  onGenerated?: (pdfBlob: Blob) => void;
}

export function PeotramPdfReport({ auditData, onGenerated }: PeotramPdfReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getScoreColor = (score: number): [number, number, number] => {
    if (score >= 90) return [34, 197, 94]; // green
    if (score >= 70) return [234, 179, 8]; // yellow
    if (score >= 50) return [249, 115, 22]; // orange
    return [239, 68, 68]; // red
  };

  const getScoreStatus = (score: number): string => {
    if (score >= 90) return "CONFORME";
    if (score >= 70) return "CONFORME COM OBSERVAÇÕES";
    if (score >= 50) return "NÃO-CONFORMIDADE MENOR";
    return "NÃO-CONFORME";
  };

  const generatePdf = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(0, 56, 101); // Petrobras blue
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE AUDITORIA PEOTRAM 2024', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('13 ELEMENTOS - PETROBRAS', pageWidth / 2, 25, { align: 'center' });

      yPos = 45;

      // Audit Info Box
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 56, 101);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, pageWidth - 30, 35, 'S');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DA AUDITORIA', 20, yPos + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Embarcação: ${auditData.vesselName}`, 20, yPos + 16);
      doc.text(`IMO: ${auditData.vesselImo || 'N/A'}`, 100, yPos + 16);
      doc.text(`Auditor: ${auditData.auditorName}`, 20, yPos + 24);
      doc.text(`Data: ${auditData.auditDate}`, 100, yPos + 24);
      doc.text(`ID Auditoria: ${auditData.id}`, 20, yPos + 32);

      yPos += 45;

      // Overall Score Box
      const [r, g, b] = getScoreColor(auditData.overallScore);
      doc.setFillColor(r, g, b);
      doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFORMIDADE GERAL', 25, yPos + 10);
      
      doc.setFontSize(24);
      doc.text(`${auditData.overallScore.toFixed(1)}%`, pageWidth - 50, yPos + 15);
      
      doc.setFontSize(10);
      doc.text(getScoreStatus(auditData.overallScore), 25, yPos + 18);

      yPos += 35;

      // Elements Table
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFORMIDADE POR ELEMENTO', 15, yPos);
      
      yPos += 5;

      const tableData = auditData.elements.map(el => [
        `${el.number}`,
        `${el.sigla}`,
        el.name + (el.isCritical ? ' ⭐' : ''),
        `${el.score.toFixed(1)}%`,
        `${el.conformantItems}/${el.totalItems}`,
        getScoreStatus(el.score)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Sigla', 'Elemento', 'Score', 'Itens', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 56, 101], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 15 },
          2: { cellWidth: 55 },
          3: { cellWidth: 18 },
          4: { cellWidth: 20 },
          5: { cellWidth: 40 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const score = parseFloat(data.cell.text[0]);
            if (score >= 90) data.cell.styles.textColor = [34, 197, 94];
            else if (score >= 70) data.cell.styles.textColor = [234, 179, 8];
            else if (score >= 50) data.cell.styles.textColor = [249, 115, 22];
            else data.cell.styles.textColor = [239, 68, 68];
          }
        }
      });

      // Signatures Page
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSINATURAS', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 20;

      const signatureRoles = [
        { key: 'auditor', label: 'Auditor PEOTRAM' },
        { key: 'captain', label: 'Comandante da Embarcação' },
        { key: 'owner', label: 'Representante do Armador' },
        { key: 'petrobras', label: 'Representante Petrobras' }
      ];

      signatureRoles.forEach((role, idx) => {
        const sig = auditData.signatures?.[role.key as keyof typeof auditData.signatures];
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(15, yPos, pageWidth - 30, 35, 'S');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(role.label, 20, yPos + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${sig?.name || '_______________________'}`, 20, yPos + 18);
        doc.text(`Data: ${sig?.date || '____/____/________'}`, 120, yPos + 18);
        
        doc.text('Assinatura:', 20, yPos + 28);
        doc.line(50, yPos + 28, 150, yPos + 28);
        
        yPos += 45;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} | Nautilus One - PEOTRAM AI`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save
      const pdfBlob = doc.output('blob');
      doc.save(`PEOTRAM-${auditData.vesselName}-${auditData.auditDate}.pdf`);
      
      onGenerated?.(pdfBlob);
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      logger.error('PDF generation error:', error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const criticalElements = auditData.elements.filter(e => e.isCritical);
  const nonConformantElements = auditData.elements.filter(e => e.score < 70);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Relatório PEOTRAM 2024
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-2xl font-bold text-primary">{auditData.overallScore.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Conformidade Geral</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <p className="text-2xl font-bold text-destructive">{criticalElements.length}</p>
            <p className="text-xs text-muted-foreground">Elementos Críticos</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <p className="text-2xl font-bold text-warning">{nonConformantElements.length}</p>
            <p className="text-xs text-muted-foreground">Não-Conformes</p>
          </div>
        </div>

        <Separator />

        {/* Elements Overview */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Resumo dos 13 Elementos:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {auditData.elements.slice(0, 6).map(el => (
              <div key={el.number} className="flex items-center justify-between p-1.5 bg-muted/30 rounded">
                <span className="flex items-center gap-1">
                  {el.isCritical && <Star className="w-3 h-3 text-destructive" />}
                  {el.number}. {el.sigla}
                </span>
                <Badge variant={el.score >= 70 ? "default" : "destructive"} className="text-xs h-5">
                  {el.score.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePdf} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Gerar Relatório PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default PeotramPdfReport;
