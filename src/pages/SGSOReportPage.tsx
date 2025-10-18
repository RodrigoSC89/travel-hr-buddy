import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText, Download, Calendar, Ship, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Sample data for demonstration
const SAMPLE_INCIDENTS = [
  {
    date: "15/10/2025",
    description: "Falha no sistema de posicionamento dinâmico durante operação em águas profundas",
    sgso_category: "Navegação e Operação",
    sgso_risk_level: "Crítico",
    sgso_root_cause: "Falha no sistema de controle redundante devido a manutenção inadequada",
    action_plan: "Implementação de protocolo de manutenção preventiva mensal com checklist específico para sistemas DP. Treinamento obrigatório da equipe técnica sobre procedimentos de emergência."
  },
  {
    date: "10/10/2025",
    description: "Derramamento de óleo durante transferência de combustível entre embarcações",
    sgso_category: "Meio Ambiente",
    sgso_risk_level: "Alto",
    sgso_root_cause: "Procedimento de conexão de mangueiras não seguido adequadamente pela equipe",
    action_plan: "Revisão e reforço dos procedimentos operacionais. Realização de simulado de resposta a emergências ambientais. Implementação de sistema de dupla verificação antes de transferências."
  },
  {
    date: "05/10/2025",
    description: "Incidente com equipamento de segurança individual durante operação de içamento",
    sgso_category: "Segurança do Trabalho",
    sgso_risk_level: "Médio",
    sgso_root_cause: "Equipamento de proteção com prazo de validade vencido não identificado durante inspeção",
    action_plan: "Implementação de sistema de rastreamento digital de EPIs com alertas automáticos de vencimento. Auditoria completa do inventário de equipamentos de segurança."
  },
  {
    date: "01/10/2025",
    description: "Comunicação falha entre ponte e praça de máquinas durante manobra portuária",
    sgso_category: "Operacional",
    sgso_risk_level: "Baixo",
    sgso_root_cause: "Interferência no sistema de comunicação interna devido a equipamento auxiliar não homologado",
    action_plan: "Substituição de equipamentos não homologados. Teste completo do sistema de comunicações. Treinamento de procedimentos alternativos de comunicação."
  }
];

const VESSEL_NAME = "FPSO Nautilus One";

interface SGSOReportPageProps {
  vesselName?: string;
  incidents?: typeof SAMPLE_INCIDENTS;
}

export default function SGSOReportPage({ 
  vesselName = VESSEL_NAME, 
  incidents = SAMPLE_INCIDENTS 
}: SGSOReportPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    toast.info("Gerando PDF...", { description: "Por favor, aguarde enquanto o relatório é preparado." });

    try {
      const element = reportRef.current;
      const opt = {
        margin: 0.5,
        filename: `relatorio-sgso-${vesselName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF gerado com sucesso!", { 
        description: "O relatório foi baixado para seu dispositivo." 
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF", { 
        description: "Não foi possível gerar o relatório. Tente novamente." 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskColor = (level: string): string => {
    const levelLower = level.toLowerCase();
    if (levelLower === "crítico") return "text-red-900 bg-red-100";
    if (levelLower === "alto") return "text-orange-900 bg-orange-100";
    if (levelLower === "médio") return "text-yellow-900 bg-yellow-100";
    return "text-green-900 bg-green-100";
  };

  // Calculate statistics
  const stats = {
    total: incidents.length,
    critico: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "crítico").length,
    alto: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "alto").length,
    medio: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "médio").length,
    baixo: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "baixo").length,
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={FileText}
        title="Relatório SGSO - Gestão de Segurança Operacional"
        description={`Relatório completo de incidentes e análise de riscos - ${vesselName}`}
        gradient="red"
        badges={[
          { icon: Ship, label: vesselName },
          { icon: Calendar, label: new Date().toLocaleDateString("pt-BR") },
          { icon: AlertCircle, label: `${stats.total} Incidentes` }
        ]}
      />

      <div className="mb-6">
        <Button 
          onClick={handleExportPDF} 
          disabled={isExporting}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Gerando PDF..." : "🧾 Exportar PDF"}
        </Button>
      </div>

      {/* PDF Content */}
      <div ref={reportRef} className="bg-white p-8 rounded-lg shadow-lg">
        {/* Report Header */}
        <div className="mb-8 border-b-2 border-gray-300 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📄 Relatório SGSO
              </h1>
              <p className="text-lg text-gray-700">
                Sistema de Gestão de Segurança Operacional
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Conformidade ANP Resolução 43/2007
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Embarcação:</p>
              <p className="text-lg font-semibold text-gray-900">{vesselName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Geração:</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("pt-BR", { 
                  day: "2-digit", 
                  month: "long", 
                  year: "numeric" 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📊 Resumo Estatístico
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">Crítico</p>
              <p className="text-2xl font-bold text-red-900">{stats.critico}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Alto</p>
              <p className="text-2xl font-bold text-orange-900">{stats.alto}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium">Médio</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.medio}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Baixo</p>
              <p className="text-2xl font-bold text-green-900">{stats.baixo}</p>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📋 Incidentes Classificados
          </h2>
          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-5 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      <strong>Data:</strong> {incident.date}
                    </p>
                    <p className="text-base text-gray-900 leading-relaxed">
                      {incident.description}
                    </p>
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(incident.sgso_risk_level)}`}>
                    {incident.sgso_risk_level}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">
                      Categoria SGSO
                    </p>
                    <p className="text-sm text-gray-900">{incident.sgso_category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">
                      Nível de Risco
                    </p>
                    <p className="text-sm text-gray-900">{incident.sgso_risk_level}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">
                    🧠 Causa Raiz
                  </p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {incident.sgso_root_cause}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">
                    📋 Plano de Ação
                  </p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {incident.action_plan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📈 Tendência de Riscos
          </h2>
          <div className="bg-white rounded-lg">
            <SGSOTrendChart />
          </div>
        </div>

        {/* Footer / Signature */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Responsável pela Emissão:</p>
              <div className="border-t-2 border-gray-400 pt-2 mt-8">
                <p className="text-sm text-gray-800">Nome / Assinatura</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Aprovado por:</p>
              <div className="border-t-2 border-gray-400 pt-2 mt-8">
                <p className="text-sm text-gray-800">Nome / Assinatura</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Gerado automaticamente por Nautilus One - Sistema de Gestão Marítima
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Documento confidencial - Propriedade da empresa
            </p>
          </div>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
