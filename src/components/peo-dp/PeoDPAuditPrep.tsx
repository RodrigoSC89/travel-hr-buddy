/**
 * PEO-DP Audit Preparation - One-click audit readiness for PEO-DP Petrobras
 * 7 sections × 54+ requirements with gap analysis
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, XCircle, AlertTriangle, Clock, Brain, Zap, FileText } from "lucide-react";
import { toast } from "sonner";

interface Requirement {
  id: string;
  title: string;
  description: string;
  status: "ready" | "partial" | "missing" | "not_started";
  evidence: string[];
  priority: "critical" | "high" | "normal";
  aiTip?: string;
}

interface Section {
  id: string;
  number: string;
  name: string;
  requirements: Requirement[];
}

const PEO_DP_SECTIONS: Section[] = [
  {
    id: "s31", number: "3.1", name: "Gerenciamento do Sistema DP",
    requirements: [
      { id: "3.1.1", title: "Política DP documentada", description: "Política de operações DP aprovada pela alta direção", status: "ready", evidence: ["Política DP Rev.05", "Ata aprovação"], priority: "critical" },
      { id: "3.1.2", title: "Organograma DP", description: "Estrutura organizacional com funções e responsabilidades DP", status: "ready", evidence: ["Organograma", "Matriz RACI"], priority: "high" },
      { id: "3.1.3", title: "Manual de Operações DP", description: "Manual com procedimentos operacionais DP", status: "partial", evidence: ["Manual DP Rev.03"], priority: "critical", aiTip: "Incluir seção de ASOG/CAM atualizada conforme IMCA M 220 Rev.2" },
      { id: "3.1.4", title: "Indicadores de desempenho DP", description: "KPIs de IPCLV, eventos DP e tendências", status: "ready", evidence: ["Dashboard KPI", "Relatório mensal"], priority: "high" },
      { id: "3.1.5", title: "Análise crítica pela direção", description: "Reuniões periódicas de análise crítica do sistema DP", status: "partial", evidence: ["Ata Q3/2024"], priority: "normal", aiTip: "Faltam atas Q4/2024 e Q1/2025" },
    ]
  },
  {
    id: "s32", number: "3.2", name: "Recursos e Infraestrutura",
    requirements: [
      { id: "3.2.1", title: "Sistemas DP classe adequada", description: "Equipamento DP compatível com classe de operação", status: "ready", evidence: ["Certificado Class DP-2", "FMEA"], priority: "critical" },
      { id: "3.2.2", title: "Redundância de sistemas", description: "Verificação de redundância conforme WCFDI", status: "ready", evidence: ["FMEA", "Proving Trials"], priority: "critical" },
      { id: "3.2.3", title: "Capability Plot atualizado", description: "DP Capability Plot para operações planejadas", status: "partial", evidence: ["Cap Plot 2023"], priority: "critical", aiTip: "Capability Plot tem mais de 12 meses - atualizar com dados de campo recentes" },
      { id: "3.2.4", title: "Sobressalentes DP críticos", description: "Inventário de spare parts para sistemas DP", status: "missing", evidence: [], priority: "high", aiTip: "Criar inventário de spare parts para thrusters, sensores e sistemas de controle" },
    ]
  },
  {
    id: "s33", number: "3.3", name: "Competência e Treinamento",
    requirements: [
      { id: "3.3.1", title: "Certificação DPOs", description: "Todos DPOs com certificação IMCA/Nautical Institute válida", status: "ready", evidence: ["Certificados IMCA", "DP Log Books"], priority: "critical" },
      { id: "3.3.2", title: "Treinamento em simulador", description: "Treinamento periódico em simulador DP", status: "ready", evidence: ["Certificados simulador", "Registro horas"], priority: "high" },
      { id: "3.3.3", title: "Familiarização vessel-specific", description: "Treinamento específico do vessel para novos DPOs", status: "partial", evidence: ["Checklist familiarização"], priority: "high", aiTip: "2 DPOs sem registro de familiarização completa" },
      { id: "3.3.4", title: "Competência equipe manutenção DP", description: "Técnicos com treinamento em sistemas DP", status: "partial", evidence: ["Certificado 1 técnico"], priority: "normal", aiTip: "Segundo técnico precisa de treinamento Kongsberg/Rolls-Royce" },
    ]
  },
  {
    id: "s34", number: "3.4", name: "Operações DP",
    requirements: [
      { id: "3.4.1", title: "Procedimento pré-operação", description: "Checklist pré-DP e briefing operacional", status: "ready", evidence: ["SOP-DP-001", "Checklists"], priority: "critical" },
      { id: "3.4.2", title: "ASOG/CAM definidos", description: "Advisory Status e ações para cada condição", status: "ready", evidence: ["ASOG Matrix", "CAM Procedures"], priority: "critical" },
      { id: "3.4.3", title: "Footprint Analysis", description: "Análise de footprint para cada operação", status: "partial", evidence: ["Footprint template"], priority: "high", aiTip: "Realizar footprint analysis para todas as locações ativas" },
      { id: "3.4.4", title: "DP Logbook atualizado", description: "Registro contínuo de todas operações DP", status: "ready", evidence: ["DP Logbook digital"], priority: "critical" },
      { id: "3.4.5", title: "Limites operacionais definidos", description: "Envelope operacional para cada tipo de operação", status: "ready", evidence: ["Operational limits matrix"], priority: "critical" },
    ]
  },
  {
    id: "s35", number: "3.5", name: "Manutenção dos Sistemas DP",
    requirements: [
      { id: "3.5.1", title: "PMS para equipamentos DP", description: "Sistema de manutenção planejada para todos componentes DP", status: "ready", evidence: ["PMS DP", "Work orders"], priority: "critical" },
      { id: "3.5.2", title: "Inspeções periódicas", description: "Calendário de inspeções de sistemas DP", status: "partial", evidence: ["Calendário 2025"], priority: "high", aiTip: "Faltam inspeções de sensores de referência - agendar para próximo trimestre" },
      { id: "3.5.3", title: "Testes funcionais", description: "Testes periódicos de todos equipamentos DP", status: "ready", evidence: ["Registros testes", "DP trials report"], priority: "critical" },
    ]
  },
  {
    id: "s36", number: "3.6", name: "Preparação para Emergências DP",
    requirements: [
      { id: "3.6.1", title: "Plano de emergência DP", description: "Plano com cenários de drift-off, drive-off, blackout", status: "ready", evidence: ["Emergency Response Plan"], priority: "critical" },
      { id: "3.6.2", title: "Exercícios simulados", description: "Drills de emergência DP periódicos", status: "partial", evidence: ["Relatório drill Q3"], priority: "critical", aiTip: "Realizar drill noturno e drill de blackout antes da auditoria" },
      { id: "3.6.3", title: "EDS testado", description: "Emergency Disconnect Sequence funcional", status: "not_started", evidence: [], priority: "critical", aiTip: "URGENTE: EDS não testado nos últimos 6 meses" },
    ]
  },
  {
    id: "s37", number: "3.7", name: "Processo de Melhoria Contínua",
    requirements: [
      { id: "3.7.1", title: "Registro de eventos DP", description: "Banco de dados de incidentes e eventos DP", status: "ready", evidence: ["Database eventos", "Análises"], priority: "high" },
      { id: "3.7.2", title: "Investigação de incidentes", description: "Metodologia de investigação para eventos DP", status: "ready", evidence: ["Procedimento investigação", "IOGP 621"], priority: "high" },
      { id: "3.7.3", title: "Lições aprendidas", description: "Programa de divulgação de lições aprendidas", status: "partial", evidence: ["Safety Flash Q3"], priority: "normal", aiTip: "Publicar lições aprendidas dos eventos de drift-off de 2024" },
    ]
  },
];

const statusConfig = {
  ready: { icon: CheckCircle, color: "text-success", label: "Pronto", badge: "outline" as const },
  partial: { icon: AlertTriangle, color: "text-warning", label: "Parcial", badge: "secondary" as const },
  missing: { icon: XCircle, color: "text-destructive", label: "Faltante", badge: "destructive" as const },
  not_started: { icon: Clock, color: "text-muted-foreground", label: "Não Iniciado", badge: "secondary" as const },
};

export function PeoDPAuditPrep() {
  const [sections] = useState(PEO_DP_SECTIONS);

  const allReqs = sections.flatMap(s => s.requirements);
  const readyCount = allReqs.filter(r => r.status === "ready").length;
  const partialCount = allReqs.filter(r => r.status === "partial").length;
  const missingCount = allReqs.filter(r => r.status === "missing" || r.status === "not_started").length;
  const readinessPct = Math.round((readyCount / allReqs.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Preparação para Auditoria PEO-DP</h3>
          <p className="text-sm text-muted-foreground">7 Seções • {allReqs.length} Requisitos • Gap Analysis com IA</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => quickExport(allReqs, "PEO-DP Audit Gap Analysis")}>
          <FileText className="h-3 w-3" /> Gerar Relatório
        </Button>
      </div>

      {/* Overall Readiness */}
      <Card className={readinessPct >= 80 ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Prontidão para Auditoria</span>
            <span className="text-2xl font-bold">{readinessPct}%</span>
          </div>
          <Progress value={readinessPct} className="h-3 mb-3" />
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-success"><CheckCircle className="h-3 w-3" /> {readyCount} Prontos</span>
            <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3 w-3" /> {partialCount} Parciais</span>
            <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" /> {missingCount} Faltantes</span>
          </div>
        </CardContent>
      </Card>

      {/* Sections Accordion */}
      <Accordion type="multiple" defaultValue={sections.filter(s => s.requirements.some(r => r.status !== "ready")).map(s => s.id)}>
        {sections.map(section => {
          const sectionReady = section.requirements.filter(r => r.status === "ready").length;
          const sectionPct = Math.round((sectionReady / section.requirements.length) * 100);
          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left flex-1">
                  <Badge variant="outline">{section.number}</Badge>
                  <span className="font-medium">{section.name}</span>
                  <span className={`text-sm font-bold ml-auto mr-4 ${sectionPct >= 80 ? "text-success" : sectionPct >= 50 ? "text-warning" : "text-destructive"}`}>
                    {sectionPct}%
                  </span>
                  <Badge variant="secondary" className="text-xs">{section.requirements.length} req.</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  {section.requirements.map(req => {
                    const cfg = statusConfig[req.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={req.id} className={`p-3 rounded-lg border ${req.status === "missing" || req.status === "not_started" ? "border-destructive/20 bg-destructive/5" : req.status === "partial" ? "border-warning/20 bg-warning/5" : "border-border"}`}>
                        <div className="flex items-start gap-3">
                          <Icon className={`h-4 w-4 mt-0.5 ${cfg.color}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{req.id} — {req.title}</span>
                              <Badge variant={cfg.badge} className="text-xs">{cfg.label}</Badge>
                              {req.priority === "critical" && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{req.description}</p>
                            {req.evidence.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {req.evidence.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                              </div>
                            )}
                            {req.aiTip && (
                              <div className="flex items-start gap-1 mt-2 p-2 rounded bg-primary/5 border border-primary/20">
                                <Brain className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                <span className="text-xs text-primary">{req.aiTip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
