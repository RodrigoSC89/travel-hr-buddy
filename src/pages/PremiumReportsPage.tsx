/**
 * Premium Reports Page
 * UI to trigger premium branded PDF exports
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generatePremiumReport, type PremiumReportConfig } from "@/lib/reports/premium-pdf-generator";
import { toast } from "sonner";
import {
  FileText, Download, Ship, Users, Shield, Leaf,
  Wrench, BarChart3, Loader2
} from "lucide-react";

const REPORT_TEMPLATES: Array<{
  id: string;
  title: string;
  description: string;
  module: string;
  icon: React.ElementType;
  badge: string;
  config: Omit<PremiumReportConfig, "date" | "author">;
}> = [
  {
    id: "fleet-overview",
    title: "Fleet Overview",
    description: "Relatório executivo com KPIs de toda a frota",
    module: "Fleet Command",
    icon: Ship,
    badge: "Executivo",
    config: {
      title: "Fleet Overview Report",
      subtitle: "Relatório Executivo de Frota",
      module: "Fleet Command",
      confidential: true,
      sections: [
        { title: "Resumo Executivo", type: "text", content: "Relatório gerado automaticamente com dados em tempo real da frota marítima. Este documento contém informações confidenciais sobre operações e performance dos navios." },
        { title: "KPIs da Frota", type: "kpi-grid", content: [
          { label: "Navios Ativos", value: "12", status: "good" },
          { label: "Compliance", value: "97%", status: "good" },
          { label: "Manutenções Pendentes", value: "3", status: "warning" },
          { label: "Certificados OK", value: "156", status: "good" },
        ] as any },
        { title: "Status por Embarcação", type: "table", content: {
          headers: ["Embarcação", "Status", "Compliance", "Próx. Manutenção"],
          rows: [
            ["MV Atlantic Star", "Operacional", "98%", "15/03/2026"],
            ["MV Pacific Dawn", "Em Porto", "95%", "22/02/2026"],
            ["MV Caribbean Wave", "Em Trânsito", "99%", "10/04/2026"],
          ],
        }},
      ],
    },
  },
  {
    id: "crew-compliance",
    title: "Crew Compliance",
    description: "Certificados, treinamentos e conformidade de tripulação",
    module: "People & HR",
    icon: Users,
    badge: "STCW/MLC",
    config: {
      title: "Crew Compliance Report",
      subtitle: "Conformidade de Tripulação — STCW & MLC 2006",
      module: "People & HR",
      confidential: true,
      sections: [
        { title: "Sumário de Conformidade", type: "text", content: "Análise de conformidade da tripulação com os padrões STCW e MLC 2006. Inclui status de certificações, treinamentos pendentes e recomendações." },
        { title: "Métricas de Certificação", type: "kpi-grid", content: [
          { label: "Tripulantes", value: "87", status: "good" },
          { label: "Certificados Válidos", value: "94%", status: "good" },
          { label: "Vencendo em 90d", value: "12", status: "warning" },
          { label: "Vencidos", value: "2", status: "critical" },
        ] as any },
      ],
    },
  },
  {
    id: "audit-compliance",
    title: "Audit Compliance",
    description: "Score de conformidade com 12 normas marítimas",
    module: "Compliance Hub",
    icon: Shield,
    badge: "12 Audits",
    config: {
      title: "Maritime Audit Compliance Report",
      subtitle: "Score de Conformidade — 12 Normas Marítimas",
      module: "Compliance Hub",
      confidential: true,
      sections: [
        { title: "Resumo de Auditorias", type: "text", content: "Relatório consolidado de conformidade abrangendo PSC, SOLAS, MARPOL I-VI, MLC 2006, ISPS, ISM Code, Pre-OVID, Pre-SIRE 2.0, TMSA, SGSO ANP, PEO-DP e PEOTRAM." },
        { title: "Scores por Norma", type: "table", content: {
          headers: ["Norma", "Score", "Status", "Última Auditoria"],
          rows: [
            ["PSC Package", "95%", "✅ Conforme", "Jan 2026"],
            ["SOLAS/LSA/FFE", "92%", "✅ Conforme", "Dez 2025"],
            ["MARPOL I-VI", "88%", "⚠️ Observações", "Nov 2025"],
            ["MLC 2006", "96%", "✅ Conforme", "Jan 2026"],
            ["ISM Code", "91%", "✅ Conforme", "Out 2025"],
            ["Pre-SIRE 2.0", "89%", "⚠️ Observações", "Set 2025"],
          ],
        }},
      ],
    },
  },
  {
    id: "esg-sustainability",
    title: "ESG & Sustentabilidade",
    description: "Emissões, resíduos e compliance ambiental",
    module: "ESG & MARPOL",
    icon: Leaf,
    badge: "CII/EEXI",
    config: {
      title: "ESG & Sustainability Report",
      subtitle: "Carbon Intensity, Emissions & Waste Management",
      module: "ESG & MARPOL",
      confidential: false,
      sections: [
        { title: "Environmental KPIs", type: "kpi-grid", content: [
          { label: "CII Rating", value: "B", status: "good" },
          { label: "CO₂ (ton/mês)", value: "245", status: "warning" },
          { label: "Waste Recycled", value: "78%", status: "good" },
          { label: "MARPOL Score", value: "92%", status: "good" },
        ] as any },
        { title: "Ações Recomendadas", type: "list", content: [
          "Otimizar velocidade de cruzeiro para reduzir emissões em 12%",
          "Instalar sistema de tratamento de água de lastro",
          "Atualizar plano de gestão de resíduos (GMP)",
          "Realizar auditoria MARPOL Anexo VI completa",
        ]},
      ],
    },
  },
  {
    id: "maintenance-overview",
    title: "Maintenance Report",
    description: "Manutenções preventivas, preditivas e corretivas",
    module: "Maintenance Hub",
    icon: Wrench,
    badge: "PMS",
    config: {
      title: "Maintenance Status Report",
      subtitle: "Preventive, Predictive & Corrective Maintenance",
      module: "Maintenance Hub",
      confidential: false,
      sections: [
        { title: "Overview", type: "kpi-grid", content: [
          { label: "Tarefas Pendentes", value: "18", status: "warning" },
          { label: "Completadas (mês)", value: "42", status: "good" },
          { label: "Overdue", value: "3", status: "critical" },
          { label: "Uptime", value: "98.2%", status: "good" },
        ] as any },
      ],
    },
  },
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "Visão 360° para a diretoria com todos os KPIs",
    module: "Command Center",
    icon: BarChart3,
    badge: "CEO",
    config: {
      title: "Executive Summary Report",
      subtitle: "Visão 360° — Nauti One Maritime Platform",
      module: "Command Center",
      confidential: true,
      sections: [
        { title: "KPIs Estratégicos", type: "kpi-grid", content: [
          { label: "Fleet Compliance", value: "96%", status: "good" },
          { label: "Crew Readiness", value: "94%", status: "good" },
          { label: "OPEX (mês)", value: "$1.2M", status: "good" },
          { label: "Risk Score", value: "Low", status: "good" },
        ] as any },
        { title: "Alertas Críticos", type: "list", content: [
          "2 certificados STCW vencem nos próximos 30 dias",
          "Manutenção preventiva do motor principal agendada para 28/02",
          "Inspeção PSC esperada no porto de Rotterdam",
        ]},
      ],
    },
  },
];

export default function PremiumReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (template: typeof REPORT_TEMPLATES[0]) => {
    setGenerating(template.id);
    try {
      await generatePremiumReport({
        ...template.config,
        date: new Date(),
        author: "Nauti One System",
        companyName: "Maritime Operations",
      });
      toast.success(`Relatório "${template.title}" gerado com sucesso!`);
    } catch (err) {
      toast.error("Erro ao gerar relatório PDF");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Premium Reports</h1>
          <p className="text-sm text-muted-foreground">
            Relatórios PDF premium com branding Deep Ocean — clique para gerar e baixar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TEMPLATES.map((tpl) => (
          <Card key={tpl.id} className="hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <tpl.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary">{tpl.badge}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{tpl.title}</CardTitle>
              <CardDescription>{tpl.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{tpl.module}</span>
                <Button
                  size="sm"
                  onClick={() => handleGenerate(tpl)}
                  disabled={generating === tpl.id}
                  className="gap-2"
                >
                  {generating === tpl.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {generating === tpl.id ? "Gerando..." : "Gerar PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
