import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { FileText, Download, Shield } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useToast } from "@/hooks/use-toast";

interface Incident {
  date: string;
  description: string;
  sgso_category: string;
  sgso_risk_level: string;
  sgso_root_cause: string;
  action_plan?: string;
}

interface SGSOReportData {
  vessel: string;
  incidents: Incident[];
  trend?: Array<{
    month: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>;
}

// Sample data for demonstration
const sampleData: SGSOReportData = {
  vessel: "MV Atlântico",
  incidents: [
    {
      date: "2024-10-05",
      description: "Quase colisão durante manobra de aproximação",
      sgso_category: "Navegação",
      sgso_risk_level: "Alto",
      sgso_root_cause: "Falha de comunicação entre ponte e praticagem",
      action_plan: "Implementar briefing pré-manobra obrigatório e checklist de comunicação"
    },
    {
      date: "2024-10-03",
      description: "Pequeno vazamento de óleo hidráulico",
      sgso_category: "Meio Ambiente",
      sgso_risk_level: "Médio",
      sgso_root_cause: "Mangueira hidráulica degradada",
      action_plan: "Substituir todas as mangueiras com mais de 5 anos de uso"
    },
    {
      date: "2024-10-01",
      description: "Lesão menor em membro da tripulação",
      sgso_category: "Segurança do Trabalho",
      sgso_risk_level: "Baixo",
      sgso_root_cause: "Não utilização de EPI adequado",
      action_plan: "Reforçar treinamento sobre uso obrigatório de EPIs"
    },
    {
      date: "2024-10-06",
      description: "Falha temporária sistema DP durante operação crítica",
      sgso_category: "Operacional",
      sgso_risk_level: "Crítico",
      sgso_root_cause: "Falha no sistema de redundância",
      action_plan: "Auditoria completa do sistema DP e atualização de software"
    }
  ],
  trend: [
    { month: "Jan", critical: 2, high: 5, medium: 8, low: 12 },
    { month: "Fev", critical: 1, high: 4, medium: 10, low: 15 },
    { month: "Mar", critical: 3, high: 6, medium: 7, low: 10 },
    { month: "Abr", critical: 1, high: 3, medium: 9, low: 14 },
    { month: "Mai", critical: 2, high: 5, medium: 11, low: 16 },
    { month: "Jun", critical: 1, high: 4, medium: 8, low: 13 },
  ]
};

const SGSOReportPage: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const data = sampleData;

  const exportPDF = () => {
    if (!reportRef.current) return;

    toast({
      title: "📄 Gerando PDF...",
      description: "Por favor aguarde, o relatório está sendo processado.",
    });

    const options = {
      margin: 0.5,
      filename: `relatorio-sgso-${data.vessel.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(reportRef.current)
      .save()
      .then(() => {
        toast({
          title: "✅ PDF Exportado com Sucesso",
          description: `Relatório SGSO - ${data.vessel} foi salvo.`,
        });
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast({
          title: "❌ Erro ao Exportar PDF",
          description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      "Crítico": "bg-red-600 text-white",
      "Alto": "bg-orange-600 text-white",
      "Médio": "bg-yellow-600 text-white",
      "Baixo": "bg-blue-600 text-white",
    };
    return colors[level] || "bg-gray-600 text-white";
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="Relatório SGSO"
        description="Geração de Relatório Completo de Segurança Operacional"
        gradient="red"
        badges={[
          { icon: FileText, label: "Relatório PDF" },
          { icon: Shield, label: "SGSO" },
        ]}
      />

      <div className="space-y-6">
        {/* Export Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Exportar Relatório SGSO</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerar documento PDF completo com incidentes, análises e tendências
                </p>
              </div>
              <Button 
                onClick={exportPDF} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                🧾 Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <div ref={reportRef} className="bg-white rounded-lg shadow-lg">
          <Card className="border-2">
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      📄 Relatório SGSO - {data.vessel}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Data de Geração: {new Date().toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-red-600 text-white px-3 py-1">
                    Sistema de Gestão de Segurança Operacional
                  </Badge>
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    ANP Resolução 43/2007
                  </Badge>
                </div>
              </div>

              {/* Incidents Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📋 Incidentes Classificados
                </h2>
                <div className="space-y-4">
                  {data.incidents.map((incident, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <strong className="text-gray-900">
                              {new Date(incident.date).toLocaleDateString('pt-BR')}
                            </strong>
                            <Badge className={getRiskLevelColor(incident.sgso_risk_level)}>
                              {incident.sgso_risk_level}
                            </Badge>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">{incident.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-700 font-semibold">Categoria:</span>{" "}
                          <span className="text-gray-900">{incident.sgso_category}</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-semibold">Risco:</span>{" "}
                          <span className="text-gray-900">{incident.sgso_risk_level}</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-semibold">Causa:</span>{" "}
                          <span className="text-gray-900">{incident.sgso_root_cause}</span>
                        </div>
                      </div>
                      {incident.action_plan && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-gray-700 font-semibold">Plano de Ação:</span>{" "}
                          <span className="text-gray-900">{incident.action_plan}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Chart Section */}
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📈 Tendência de Riscos
                </h2>
                <div className="bg-white p-4 rounded-lg border">
                  <SGSOTrendChart data={data.trend} />
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-sm text-gray-700">Crítico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                    <span className="text-sm text-gray-700">Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span className="text-sm text-gray-700">Médio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Baixo</span>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">📊 Resumo Estatístico</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-semibold">Críticos</p>
                    <p className="text-3xl font-bold text-red-900">
                      {data.incidents.filter(i => i.sgso_risk_level === "Crítico").length}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700 font-semibold">Altos</p>
                    <p className="text-3xl font-bold text-orange-900">
                      {data.incidents.filter(i => i.sgso_risk_level === "Alto").length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-semibold">Médios</p>
                    <p className="text-3xl font-bold text-yellow-900">
                      {data.incidents.filter(i => i.sgso_risk_level === "Médio").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold">Baixos</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {data.incidents.filter(i => i.sgso_risk_level === "Baixo").length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Gerado automaticamente por <strong>Nautilus One</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sistema de Gestão Integrada Marítima
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Assinatura: _______________________________
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Responsável pela Segurança Operacional
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModulePageWrapper>
  );
};

export default SGSOReportPage;
