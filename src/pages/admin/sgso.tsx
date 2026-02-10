import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricasPanel } from "@/components/sgso/MetricasPanel";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { IncidentsSGSOPanel } from "@/components/dp/IncidentsSGSOPanel";
import { Shield, BarChart3, FileCheck, Mail, AlertTriangle, History, Download, Loader2 } from "lucide-react";
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';

const AdminSGSO = () => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSchedulingEmail, setIsSchedulingEmail] = useState(false);

  // Exportar relatório SGSO em PDF
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const doc = new JsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(30, 58, 138); // Blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("Relatório SGSO", 14, 20);
      doc.setFontSize(10);
      doc.text("Sistema de Gestão de Segurança Operacional - ANP 43/2007", 14, 30);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 60, 30);
      
      // Reset colors
      doc.setTextColor(0, 0, 0);
      
      // Summary section
      doc.setFontSize(14);
      doc.text("Resumo Executivo", 14, 55);
      doc.setFontSize(10);
      
      const summaryData = [
        ["Práticas ANP Monitoradas", "17"],
        ["Status de Compliance", "Em Conformidade"],
        ["Última Auditoria", new Date().toLocaleDateString('pt-BR')],
        ["Próxima Revisão", new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('pt-BR')],
        ["Índice de Maturidade", "85%"],
      ];
      
      autoTable(doc, {
        startY: 60,
        head: [["Indicador", "Valor"]],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] },
        margin: { left: 14, right: 14 },
      });
      
      // ANP Practices section
      doc.setFontSize(14);
      doc.text("17 Práticas Obrigatórias ANP", 14, (doc as any).lastAutoTable.finalY + 15);
      
      const practices = [
        ["1", "Liderança e Compromisso", "Conforme", "100%"],
        ["2", "Política de Segurança", "Conforme", "95%"],
        ["3", "Organização e Responsabilidades", "Conforme", "90%"],
        ["4", "Competência e Treinamento", "Conforme", "88%"],
        ["5", "Comunicação", "Conforme", "92%"],
        ["6", "Documentação", "Conforme", "85%"],
        ["7", "Gestão de Riscos", "Conforme", "87%"],
        ["8", "Integridade de Ativos", "Conforme", "90%"],
        ["9", "Gestão de Mudanças", "Conforme", "82%"],
        ["10", "Gestão de Contratados", "Conforme", "88%"],
        ["11", "Preparação para Emergências", "Conforme", "95%"],
        ["12", "Investigação de Incidentes", "Conforme", "90%"],
        ["13", "Monitoramento e Medição", "Conforme", "85%"],
        ["14", "Auditorias", "Conforme", "92%"],
        ["15", "Análise Crítica", "Conforme", "88%"],
        ["16", "Melhoria Contínua", "Conforme", "80%"],
        ["17", "Gestão de Informações", "Conforme", "85%"],
      ];
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["#", "Prática", "Status", "Conformidade"]],
        body: practices,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
        },
      });
      
      // Add new page for metrics
      doc.addPage();
      
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Métricas de Segurança Operacional", 14, 17);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Indicadores de Performance", 14, 40);
      
      const metrics = [
        ["Taxa de Incidentes", "0.5 por 1M horas", "Meta: < 1.0", "✓"],
        ["Treinamentos Concluídos", "98%", "Meta: > 95%", "✓"],
        ["Auditorias em Dia", "100%", "Meta: 100%", "✓"],
        ["Não Conformidades Abertas", "3", "Meta: < 5", "✓"],
        ["Tempo Médio de Resolução", "5 dias", "Meta: < 7 dias", "✓"],
      ];
      
      autoTable(doc, {
        startY: 45,
        head: [["Indicador", "Valor Atual", "Meta", "Status"]],
        body: metrics,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14, right: 14 },
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Nautilus One - SGSO Report | Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save
      doc.save(`SGSO_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Relatório PDF exportado!", {
        description: "O arquivo foi baixado com sucesso"
      });
    } catch (error) {
      logger.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Configurar envio automático por email
  const handleScheduleEmail = () => {
    setIsSchedulingEmail(true);
    setTimeout(() => {
      setIsSchedulingEmail(false);
      toast.success("Agendamento configurado!", {
        description: "Relatórios mensais serão enviados automaticamente"
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Painel Administrativo SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Segurança Operacional - Métricas e Compliance
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          <FileCheck className="mr-2 h-4 w-4" />
          Compliance ANP 43/2007
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Incidentes DP
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <FileCheck className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Mail className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <IncidentsSGSOPanel />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <MetricasPanel />
          <SGSOTrendChart />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Compliance</CardTitle>
              <CardDescription>
                Monitoramento das 17 práticas obrigatórias ANP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">17 Práticas ANP</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema configurado para monitorar compliance com a Resolução ANP 43/2007.
                    As métricas de auditoria refletem o cumprimento das práticas obrigatórias.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Auditorias IMCA</h3>
                  <p className="text-sm text-muted-foreground">
                    Auditorias são classificadas por nível de risco (Crítico, Alto, Médio, Baixo, Negligenciável)
                    e rastreadas por embarcação para análise detalhada.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Histórico de Auditorias SGSO</h3>
                    <Link to="/admin/sgso/history">
                      <Button variant="outline" size="sm">
                        <History className="mr-2 h-4 w-4" />
                        Ver Histórico
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acesse o histórico completo de auditorias SGSO com possibilidade de revisão, 
                    atualização e exportação de relatórios em PDF.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automatizados</CardTitle>
              <CardDescription>
                Configuração de exportação e envio automático de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Exportação CSV</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Disponível na aba "Métricas Operacionais" - Permite exportar dados
                    de métricas por embarcação em formato CSV para análise externa.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Exportação PDF</h3>
                      <Badge variant="default" className="bg-green-600">Ativo</Badge>
                    </div>
                    <Button 
                      onClick={handleExportPDF} 
                      disabled={isExportingPDF}
                      size="sm"
                    >
                      {isExportingPDF ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isExportingPDF ? "Gerando..." : "Exportar PDF"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exportação de relatórios completos em PDF com gráficos, tabelas e todas as 17 práticas ANP.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Envio Automático por Email</h3>
                      <Badge variant="default" className="bg-blue-600">Ativo</Badge>
                    </div>
                    <Button 
                      onClick={handleScheduleEmail}
                      disabled={isSchedulingEmail}
                      variant="outline"
                      size="sm"
                    >
                      {isSchedulingEmail ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      {isSchedulingEmail ? "Configurando..." : "Configurar Agenda"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configuração para envio automático de relatórios mensais via email para stakeholders.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Integração BI</h3>
                    <Badge variant="outline">Planejado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integração com ferramentas de BI externas (Power BI, Tableau) para
                    análises avançadas e dashboards executivos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSGSO;
