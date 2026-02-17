import { useRef, useState } from "react";
import { logger } from "@/lib/logger";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText, Download, Calendar, Ship, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSGSOIncidentsData } from "@/hooks/useSGSOIncidentsData";

const VESSEL_NAME = "FPSO Nauti One";

export default function SGSOReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { data: incidents = [], isLoading, refetch } = useSGSOIncidentsData();

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    toast.info("Gerando PDF...", { description: "Por favor, aguarde enquanto o relatório é preparado." });
    try {
      const element = reportRef.current;
      const opt = {
        margin: 0.5,
        filename: `relatorio-sgso-${VESSEL_NAME.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF gerado com sucesso!", { description: "O relatório foi baixado para seu dispositivo." });
    } catch (error) {
      logger.error("Erro ao gerar PDF", { error });
      toast.error("Erro ao gerar PDF", { description: "Não foi possível gerar o relatório. Tente novamente." });
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskColor = (level: string): string => {
    const levelLower = level.toLowerCase();
    if (levelLower === "crítico") return "text-destructive bg-destructive/10";
    if (levelLower === "alto") return "text-warning bg-warning/10";
    if (levelLower === "médio") return "text-warning bg-warning/10";
    return "text-success bg-success/10";
  };

  const stats = {
    total: incidents.length,
    critico: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "crítico").length,
    alto: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "alto").length,
    medio: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "médio").length,
    baixo: incidents.filter(i => i.sgso_risk_level.toLowerCase() === "baixo").length,
  };

  if (isLoading) {
    return (
      <ModulePageWrapper gradient="orange">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={FileText}
        title="Relatório SGSO - Gestão de Segurança Operacional"
        description={`Relatório completo de incidentes e análise de riscos - ${VESSEL_NAME}`}
        gradient="red"
        badges={[
          { icon: Ship, label: VESSEL_NAME },
          { icon: Calendar, label: new Date().toLocaleDateString("pt-BR") },
          { icon: AlertCircle, label: `${stats.total} Incidentes` }
        ]}
      />

      <div className="mb-6 flex gap-2">
        <Button onClick={handleExportPDF} disabled={isExporting} size="lg" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Gerando PDF..." : "🧾 Exportar PDF"}
        </Button>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div ref={reportRef} className="bg-card p-8 rounded-lg shadow-lg">
        {/* Report Header */}
       <div className="mb-8 border-b-2 border-border pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">📄 Relatório SGSO</h1>
              <p className="text-lg text-muted-foreground">Sistema de Gestão de Segurança Operacional</p>
              <p className="text-sm text-muted-foreground mt-1">Conformidade ANP Resolução 43/2007</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Embarcação:</p>
              <p className="text-lg font-semibold text-foreground">{VESSEL_NAME}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Geração:</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">📊 Resumo Estatístico</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-info/10 p-4 rounded-lg border border-info/30">
              <p className="text-sm text-info font-medium">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
              <p className="text-sm text-destructive font-medium">Crítico</p>
              <p className="text-2xl font-bold text-destructive">{stats.critico}</p>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/30">
              <p className="text-sm text-warning font-medium">Alto</p>
              <p className="text-2xl font-bold text-warning">{stats.alto}</p>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/30">
              <p className="text-sm text-warning font-medium">Médio</p>
              <p className="text-2xl font-bold text-warning">{stats.medio}</p>
            </div>
            <div className="bg-success/10 p-4 rounded-lg border border-success/30">
              <p className="text-sm text-success font-medium">Baixo</p>
              <p className="text-2xl font-bold text-success">{stats.baixo}</p>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">📋 Incidentes Classificados</h2>
          {incidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum incidente registrado</p>
              <p className="text-sm">Os incidentes aparecerão aqui quando forem registrados na tabela de não conformidades.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {incidents.map((incident) => (
                <div key={incident.date} className="border border-border rounded-lg p-5 bg-muted/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1"><strong>Data:</strong> {incident.date}</p>
                      <p className="text-base text-foreground leading-relaxed">{incident.description}</p>
                    </div>
                    <div className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(incident.sgso_risk_level)}`}>
                      {incident.sgso_risk_level}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Categoria SGSO</p>
                      <p className="text-sm text-foreground">{incident.sgso_category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Nível de Risco</p>
                      <p className="text-sm text-foreground">{incident.sgso_risk_level}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">🧠 Causa Raiz</p>
                    <p className="text-sm text-foreground leading-relaxed">{incident.sgso_root_cause}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">📋 Plano de Ação</p>
                    <p className="text-sm text-foreground leading-relaxed">{incident.action_plan}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">📈 Tendência de Riscos</h2>
          <div className="bg-card rounded-lg"><SGSOTrendChart /></div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Responsável pela Emissão:</p>
              <div className="border-t-2 border-border pt-2 mt-8"><p className="text-sm text-foreground">Nome / Assinatura</p></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Aprovado por:</p>
              <div className="border-t-2 border-border pt-2 mt-8"><p className="text-sm text-foreground">Nome / Assinatura</p></div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">Gerado automaticamente por Nauti One - Sistema de Gestão Marítima</p>
            <p className="text-xs text-muted-foreground mt-1">Documento confidencial - Propriedade da empresa</p>
          </div>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
