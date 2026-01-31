import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
  FileCheck,
  Download,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  Users,
  Target,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logger } from '@/lib/logger';

interface SGSOPractice {
  id: number;
  name: string;
  status: "conforme" | "parcial" | "não_conforme";
  percentage: number;
  description: string;
}

const SGSOReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Sample data for the 17 ANP practices
  const practices: SGSOPractice[] = [
    { id: 1, name: "Política de Gestão de Segurança Operacional", status: "conforme", percentage: 100, description: "Definição e comunicação da política de segurança" },
    { id: 2, name: "Objetivos e Metas", status: "conforme", percentage: 95, description: "Estabelecimento de objetivos mensuráveis" },
    { id: 3, name: "Avaliação e Gerenciamento de Riscos", status: "parcial", percentage: 75, description: "Identificação e análise de riscos operacionais" },
    { id: 4, name: "Requisitos Legais e Outros Requisitos", status: "conforme", percentage: 100, description: "Atendimento a requisitos regulatórios" },
    { id: 5, name: "Recursos, Funções, Responsabilidades", status: "conforme", percentage: 90, description: "Definição de competências e responsabilidades" },
    { id: 6, name: "Competência, Conscientização e Treinamento", status: "parcial", percentage: 80, description: "Programa de capacitação de pessoal" },
    { id: 7, name: "Comunicação e Consulta", status: "conforme", percentage: 85, description: "Canais de comunicação efetivos" },
    { id: 8, name: "Documentação e Controle de Documentos", status: "conforme", percentage: 92, description: "Sistema de gestão documental" },
    { id: 9, name: "Controle Operacional", status: "parcial", percentage: 78, description: "Procedimentos operacionais padrão" },
    { id: 10, name: "Gestão de Mudanças", status: "conforme", percentage: 88, description: "Controle de alterações em processos" },
    { id: 11, name: "Manutenção e Integridade de Ativos", status: "conforme", percentage: 94, description: "Programa de manutenção preventiva" },
    { id: 12, name: "Preparação e Resposta a Emergências", status: "conforme", percentage: 96, description: "Planos de contingência e simulados" },
    { id: 13, name: "Gestão de Contratadas", status: "parcial", percentage: 72, description: "Qualificação e controle de terceiros" },
    { id: 14, name: "Investigação de Incidentes", status: "conforme", percentage: 90, description: "Análise de causas raiz" },
    { id: 15, name: "Monitoramento e Medição de Desempenho", status: "conforme", percentage: 87, description: "Indicadores de segurança operacional" },
    { id: 16, name: "Auditoria Interna", status: "conforme", percentage: 93, description: "Programa de auditorias sistemáticas" },
    { id: 17, name: "Análise Crítica pela Direção", status: "conforme", percentage: 89, description: "Revisão gerencial periódica" }
  ];

  const overallScore = Math.round(practices.reduce((acc, p) => acc + p.percentage, 0) / practices.length);
  const conformeCount = practices.filter(p => p.status === "conforme").length;
  const parcialCount = practices.filter(p => p.status === "parcial").length;
  const ncCount = practices.filter(p => p.status === "não_conforme").length;

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Header
      pdf.setFillColor(30, 64, 175); // Blue header
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATÓRIO SGSO', pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Gestão de Segurança Operacional - ANP', pageWidth / 2, 28, { align: 'center' });
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });
      
      yPos = 55;

      // Summary section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO EXECUTIVO', margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Score box
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(overallScore >= 80 ? 34 : overallScore >= 60 ? 234 : 220, overallScore >= 80 ? 197 : overallScore >= 60 ? 179 : 38, overallScore >= 80 ? 94 : overallScore >= 60 ? 8 : 38);
      pdf.text(`${overallScore}%`, margin + 15, yPos + 22);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Score Geral de Conformidade', margin + 40, yPos + 15);
      
      pdf.text(`Conformes: ${conformeCount}/17`, margin + 100, yPos + 12);
      pdf.text(`Parciais: ${parcialCount}/17`, margin + 100, yPos + 20);
      pdf.text(`Não Conformes: ${ncCount}/17`, margin + 100, yPos + 28);
      
      yPos += 45;

      // Practices table header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('17 PRÁTICAS DE GESTÃO ANP', margin, yPos);
      yPos += 8;

      // Table header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('Nº', margin + 3, yPos + 5.5);
      pdf.text('Prática', margin + 15, yPos + 5.5);
      pdf.text('Status', pageWidth - margin - 40, yPos + 5.5);
      pdf.text('%', pageWidth - margin - 15, yPos + 5.5);
      yPos += 10;

      // Practices rows
      pdf.setTextColor(0, 0, 0);
      practices.forEach((practice, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPos - 3, pageWidth - 2 * margin, 7, 'F');
        }

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(practice.id.toString(), margin + 3, yPos + 2);
        pdf.text(practice.name.substring(0, 50), margin + 15, yPos + 2);
        
        // Status color
        const statusColors: Record<string, [number, number, number]> = {
          'conforme': [34, 197, 94],
          'parcial': [234, 179, 8],
          'não_conforme': [220, 38, 38]
        };
        const [r, g, b] = statusColors[practice.status];
        pdf.setTextColor(r, g, b);
        pdf.text(practice.status.toUpperCase(), pageWidth - margin - 40, yPos + 2);
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${practice.percentage}%`, pageWidth - margin - 12, yPos + 2);
        
        yPos += 7;
      });

      // Footer
      yPos += 15;
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Este relatório foi gerado automaticamente pelo Sistema Nautilus One', pageWidth / 2, yPos + 8, { align: 'center' });
      pdf.text(`Resolução ANP nº 43/2007 - Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos + 14, { align: 'center' });

      // Save PDF
      pdf.save(`SGSO_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      logger.error('PDF generation error:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'parcial':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'não_conforme':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conforme':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'parcial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'não_conforme':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/sgso')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Relatório SGSO
              </h1>
              <p className="text-muted-foreground">Sistema de Gestão de Segurança Operacional - ANP</p>
            </div>
          </div>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar PDF
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                  <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                </div>
                <Target className="w-8 h-8 text-primary opacity-50" />
              </div>
              <Progress value={overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conformes</p>
                  <p className="text-3xl font-bold text-green-600">{conformeCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parciais</p>
                  <p className="text-3xl font-bold text-yellow-600">{parcialCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Não Conformes</p>
                  <p className="text-3xl font-bold text-red-600">{ncCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Informações do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data do Relatório</p>
                  <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Regulamentação</p>
                  <p className="font-medium">ANP Resolução 43/2007</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                  <p className="font-medium">Gestor de Segurança</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 17 Practices */}
        <Card ref={reportRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              17 Práticas de Gestão ANP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {practices.map((practice) => (
                  <div
                    key={practice.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {practice.id}
                      </div>
                      <div>
                        <p className="font-medium">{practice.name}</p>
                        <p className="text-xs text-muted-foreground">{practice.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20">
                        <Progress value={practice.percentage} className="h-2" />
                        <p className="text-xs text-center mt-1">{practice.percentage}%</p>
                      </div>
                      <Badge className={`${getStatusColor(practice.status)} flex items-center gap-1`}>
                        {getStatusIcon(practice.status)}
                        {practice.status === 'conforme' ? 'Conforme' : practice.status === 'parcial' ? 'Parcial' : 'NC'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SGSOReportPage;
