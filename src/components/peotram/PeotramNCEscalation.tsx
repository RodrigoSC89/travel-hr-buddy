import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, FileText, Shield, Target, TrendingUp, Users } from "lucide-react";

interface NCItem {
  id: string;
  element: string;
  elementId: number;
  description: string;
  classification: "A" | "B" | "C" | "D";
  status: "open" | "action_plan" | "implementing" | "verification" | "closed";
  responsible: string;
  openDate: string;
  dueDate: string;
  daysOpen: number;
  rootCause?: string;
  actionPlan?: string;
  escalated: boolean;
  escalationLevel: number;
}

const CLASSIFICATIONS = {
  A: { label: "NC Maior — Sistema", color: "bg-destructive/10 text-destructive border-destructive/30", sla: 30, desc: "Falha sistêmica que compromete a eficácia do programa" },
  B: { label: "NC Menor — Processo", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", sla: 60, desc: "Desvio pontual que não compromete o sistema" },
  C: { label: "Observação", color: "bg-warning/10 text-warning border-warning/30", sla: 90, desc: "Oportunidade de melhoria identificada" },
  D: { label: "Recomendação", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", sla: 120, desc: "Sugestão de melhoria ou boa prática" },
};

const STATUS_FLOW = [
  { key: "open", label: "Aberta", icon: AlertTriangle },
  { key: "action_plan", label: "Plano de Ação", icon: FileText },
  { key: "implementing", label: "Implementando", icon: Target },
  { key: "verification", label: "Verificação", icon: Shield },
  { key: "closed", label: "Encerrada", icon: CheckCircle },
];

const INITIAL_NCS: NCItem[] = [
  {
    id: "NC-2026-001", element: "Elem. 1 — Liderança e Compromisso", elementId: 1,
    description: "Análise crítica pela alta direção não realizada no prazo estabelecido (semestral)",
    classification: "A", status: "action_plan", responsible: "Gerente SMS",
    openDate: "2026-01-10", dueDate: "2026-02-10", daysOpen: 36,
    rootCause: "Agenda do Diretor conflitante, sem delegação formal",
    actionPlan: "1) Designar representante formal. 2) Agendar reunião de análise crítica mensal. 3) Implementar ata padronizada.",
    escalated: true, escalationLevel: 2,
  },
  {
    id: "NC-2026-002", element: "Elem. 5 — Gestão de Riscos", elementId: 5,
    description: "Matriz de riscos não atualizada após modificação operacional na planta",
    classification: "B", status: "implementing", responsible: "Coord. de Riscos",
    openDate: "2026-01-25", dueDate: "2026-03-25", daysOpen: 21,
    rootCause: "Procedimento de MOC não acionado na modificação",
    actionPlan: "1) Revisar matriz de riscos. 2) Integrar gatilho de MOC no sistema.",
    escalated: false, escalationLevel: 0,
  },
  {
    id: "NC-2026-003", element: "Elem. 8 — Treinamento", elementId: 8,
    description: "3 operadores sem reciclagem obrigatória de operações de emergência",
    classification: "B", status: "open", responsible: "Coord. Treinamento",
    openDate: "2026-02-05", dueDate: "2026-04-05", daysOpen: 10,
    escalated: false, escalationLevel: 0,
  },
  {
    id: "NC-2026-004", element: "Elem. 12 — Auditorias Internas", elementId: 12,
    description: "Programa de auditoria interna sem cobertura de 2 elementos no ciclo anterior",
    classification: "C", status: "verification", responsible: "Coord. Qualidade",
    openDate: "2025-12-15", dueDate: "2026-03-15", daysOpen: 62,
    rootCause: "Indisponibilidade de auditores qualificados para elementos específicos",
    actionPlan: "1) Qualificar 2 auditores adicionais. 2) Replanejar ciclo incluindo todos os 13 elementos.",
    escalated: false, escalationLevel: 0,
  },
];

export const PeotramNCEscalation: React.FC = () => {
  const [ncs, setNcs] = useState<NCItem[]>(INITIAL_NCS);

  const openCount = ncs.filter(nc => nc.status !== "closed").length;
  const overdueCount = ncs.filter(nc => {
    const due = new Date(nc.dueDate);
    return nc.status !== "closed" && due < new Date();
  }).length;
  const escalatedCount = ncs.filter(nc => nc.escalated).length;
  const closedRate = Math.round((ncs.filter(nc => nc.status === "closed").length / ncs.length) * 100);

  const advanceStatus = (id: string) => {
    setNcs(prev => prev.map(nc => {
      if (nc.id !== id) return nc;
      const flow: Record<string, NCItem["status"]> = {
        open: "action_plan", action_plan: "implementing", implementing: "verification", verification: "closed",
      };
      return { ...nc, status: flow[nc.status] || nc.status };
    }));
  };

  const escalate = (id: string) => {
    setNcs(prev => prev.map(nc =>
      nc.id === id ? { ...nc, escalated: true, escalationLevel: nc.escalationLevel + 1 } : nc
    ));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">NCs Abertas</p></div>
          <p className="text-2xl font-bold text-warning">{openCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Vencidas</p></div>
          <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-orange-400" /><p className="text-xs text-muted-foreground">Escalonadas</p></div>
          <p className="text-2xl font-bold text-orange-400">{escalatedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Taxa Encerr.</p></div>
          <p className="text-2xl font-bold text-success">{closedRate}%</p>
        </CardContent></Card>
      </div>

      {/* Status Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Fluxo de Tratamento de NCs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STATUS_FLOW.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[110px]">
                  <step.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{step.label}</p>
                </div>
                {i < STATUS_FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classification Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(CLASSIFICATIONS).map(([key, cfg]) => (
          <div key={key} className="p-3 rounded-xl border bg-card/50">
            <Badge variant="outline" className={cfg.color}>{key}</Badge>
            <p className="text-xs font-medium mt-1">{cfg.label}</p>
            <p className="text-xs text-muted-foreground">{cfg.desc}</p>
            <p className="text-xs text-muted-foreground mt-1">SLA: {cfg.sla} dias</p>
          </div>
        ))}
      </div>

      {/* NC List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Não Conformidades</CardTitle>
          <CardDescription>Rastreamento com escalonamento automático por SLA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ncs.map(nc => {
            const classCfg = CLASSIFICATIONS[nc.classification];
            const currentStep = STATUS_FLOW.findIndex(s => s.key === nc.status);
            const progress = ((currentStep + 1) / STATUS_FLOW.length) * 100;
            const isOverdue = new Date(nc.dueDate) < new Date() && nc.status !== "closed";
            const slaUsed = Math.round((nc.daysOpen / classCfg.sla) * 100);

            return (
              <div key={nc.id} className={`p-4 rounded-xl border space-y-3 ${isOverdue ? "border-destructive/30 bg-destructive/5" : "bg-card/50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{nc.id}</span>
                      <Badge variant="outline" className={classCfg.color}>{nc.classification} — {classCfg.label.split(" — ")[0]}</Badge>
                      {nc.escalated && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">⬆ Escalonada L{nc.escalationLevel}</Badge>}
                      {isOverdue && <Badge variant="destructive">VENCIDA</Badge>}
                    </div>
                    <p className="font-medium">{nc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{nc.element}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{nc.responsible}</span>
                      <span>{nc.daysOpen}d aberta</span>
                    </div>
                    {nc.rootCause && <p className="text-xs"><span className="font-medium">Causa Raiz:</span> {nc.rootCause}</p>}
                    {nc.actionPlan && <p className="text-xs"><span className="font-medium">Plano:</span> {nc.actionPlan}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {nc.status !== "closed" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => advanceStatus(nc.id)} className="gap-1 text-xs">
                          <ArrowRight className="h-3 w-3" />Avançar
                        </Button>
                        {!nc.escalated && (
                          <Button size="sm" variant="destructive" onClick={() => escalate(nc.id)} className="gap-1 text-xs">
                            <TrendingUp className="h-3 w-3" />Escalar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Progresso</span><span>{currentStep + 1}/{STATUS_FLOW.length}</span></div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>SLA ({classCfg.sla}d)</span><span className={slaUsed > 80 ? "text-destructive" : ""}>{nc.daysOpen}/{classCfg.sla}d</span></div>
                    <Progress value={Math.min(slaUsed, 100)} className="h-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
