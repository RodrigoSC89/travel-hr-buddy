import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, FileText, GitBranch, Shield, Target, Users } from "lucide-react";

interface MOCRequest {
  id: string;
  title: string;
  description: string;
  element: string;
  changeType: "permanent" | "temporary" | "emergency";
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "draft" | "risk_assessment" | "approval" | "implementation" | "verification" | "closed";
  requestedBy: string;
  requestDate: string;
  targetDate: string;
  daysOpen: number;
  impactAreas: string[];
  approvals: Array<{ role: string; status: "pending" | "approved" | "rejected"; date?: string }>;
}

const FLOW_STEPS = [
  { key: "draft", label: "Solicitação", icon: FileText },
  { key: "risk_assessment", label: "Análise de Risco", icon: AlertTriangle },
  { key: "approval", label: "Aprovação", icon: CheckCircle },
  { key: "implementation", label: "Implementação", icon: Target },
  { key: "verification", label: "Verificação", icon: Shield },
  { key: "closed", label: "Encerrada", icon: CheckCircle },
];

const INITIAL_MOCS: MOCRequest[] = [
  {
    id: "MOC-2026-001", title: "Alteração do procedimento de purga de linhas de GLP",
    description: "Inclusão de etapa de verificação cruzada com detector portátil antes da purga",
    element: "Elem. 6 — Procedimentos Operacionais", changeType: "permanent", riskLevel: "high",
    status: "approval", requestedBy: "Eng. de Processo C. Ribeiro",
    requestDate: "2026-01-28", targetDate: "2026-03-01", daysOpen: 18,
    impactAreas: ["Segurança de Processo", "Treinamento", "Manutenção"],
    approvals: [
      { role: "Supervisor Operação", status: "approved", date: "2026-02-01" },
      { role: "Coord. SMS", status: "approved", date: "2026-02-05" },
      { role: "Gerente Plataforma", status: "pending" },
    ],
  },
  {
    id: "MOC-2026-002", title: "Substituição temporária de sensor de pressão PT-4502",
    description: "Uso de sensor analógico durante manutenção do digital (30 dias)",
    element: "Elem. 10 — Integridade de Ativos", changeType: "temporary", riskLevel: "medium",
    status: "implementation", requestedBy: "Téc. Instrumentação J. Moura",
    requestDate: "2026-02-03", targetDate: "2026-03-05", daysOpen: 12,
    impactAreas: ["Instrumentação", "Alarmes", "FMEA"],
    approvals: [
      { role: "Supervisor Manutenção", status: "approved", date: "2026-02-04" },
      { role: "Coord. SMS", status: "approved", date: "2026-02-06" },
      { role: "Gerente Plataforma", status: "approved", date: "2026-02-07" },
    ],
  },
  {
    id: "MOC-2026-003", title: "Bypass emergencial de válvula de alívio PSV-1201",
    description: "Bypass temporário para permitir manutenção corretiva de emergência",
    element: "Elem. 5 — Gestão de Riscos", changeType: "emergency", riskLevel: "critical",
    status: "verification", requestedBy: "Plataformista Sênior A. Costa",
    requestDate: "2026-02-10", targetDate: "2026-02-17", daysOpen: 5,
    impactAreas: ["Segurança de Processo", "Integridade de Ativos", "Operação"],
    approvals: [
      { role: "Supervisor Operação", status: "approved", date: "2026-02-10" },
      { role: "Coord. SMS", status: "approved", date: "2026-02-10" },
      { role: "Gerente Plataforma", status: "approved", date: "2026-02-10" },
    ],
  },
  {
    id: "MOC-2026-004", title: "Atualização de matriz de treinamento para NR-34",
    description: "Inclusão de novos requisitos de trabalho a quente conforme NR-34 revisada",
    element: "Elem. 8 — Treinamento", changeType: "permanent", riskLevel: "low",
    status: "risk_assessment", requestedBy: "Coord. Treinamento L. Pereira",
    requestDate: "2026-02-12", targetDate: "2026-04-01", daysOpen: 3,
    impactAreas: ["Treinamento", "Competência", "Documentação"],
    approvals: [
      { role: "Supervisor Treinamento", status: "pending" },
      { role: "Coord. SMS", status: "pending" },
    ],
  },
];

const changeTypeConfig: Record<string, { label: string; color: string }> = {
  permanent: { label: "Permanente", color: "bg-primary/10 text-primary border-primary/30" },
  temporary: { label: "Temporária", color: "bg-warning/10 text-warning border-warning/30" },
  emergency: { label: "Emergencial", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const PeotramMOCTracker: React.FC = () => {
  const [mocs, setMocs] = useState<MOCRequest[]>(INITIAL_MOCS);

  const activeCount = mocs.filter(m => m.status !== "closed").length;
  const emergencyCount = mocs.filter(m => m.changeType === "emergency" && m.status !== "closed").length;
  const pendingApproval = mocs.filter(m => m.status === "approval").length;
  const avgDays = Math.round(mocs.reduce((a, m) => a + m.daysOpen, 0) / mocs.length);

  const advanceStatus = (id: string) => {
    setMocs(prev => prev.map(m => {
      if (m.id !== id) return m;
      const flow: Record<string, MOCRequest["status"]> = {
        draft: "risk_assessment", risk_assessment: "approval", approval: "implementation",
        implementation: "verification", verification: "closed",
      };
      return { ...m, status: flow[m.status] || m.status };
    }));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><GitBranch className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">MOCs Ativas</p></div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Emergenciais</p></div>
          <p className="text-2xl font-bold text-destructive">{emergencyCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Aguard. Aprovação</p></div>
          <p className="text-2xl font-bold text-warning">{pendingApproval}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Média Dias</p></div>
          <p className="text-2xl font-bold">{avgDays}d</p>
        </CardContent></Card>
      </div>

      {/* Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" />Fluxo MOC — Management of Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FLOW_STEPS.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[100px]">
                  <step.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{step.label}</p>
                </div>
                {i < FLOW_STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MOC List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Mudanças</CardTitle>
          <CardDescription>Gestão de Mudanças conforme Elemento 9 — PEOTRAM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mocs.map(moc => {
            const ctCfg = changeTypeConfig[moc.changeType];
            const currentStep = FLOW_STEPS.findIndex(s => s.key === moc.status);
            const progress = ((currentStep + 1) / FLOW_STEPS.length) * 100;

            return (
              <div key={moc.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{moc.id}</span>
                      <Badge variant="outline" className={ctCfg.color}>{ctCfg.label}</Badge>
                      <Badge variant="outline" className={riskColors[moc.riskLevel]}>Risco: {moc.riskLevel}</Badge>
                      <Badge variant="outline">{FLOW_STEPS[currentStep]?.label}</Badge>
                    </div>
                    <p className="font-medium">{moc.title}</p>
                    <p className="text-xs text-muted-foreground">{moc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{moc.element}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{moc.requestedBy}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{moc.daysOpen}d</span>
                    </div>
                  </div>
                  {moc.status !== "closed" && (
                    <Button size="sm" variant="outline" onClick={() => advanceStatus(moc.id)} className="gap-1 text-xs shrink-0">
                      <ArrowRight className="h-3 w-3" />Avançar
                    </Button>
                  )}
                </div>

                {/* Impact Areas */}
                <div className="flex flex-wrap gap-1">
                  {moc.impactAreas.map(area => (
                    <Badge key={area} variant="secondary" className="text-[10px]">{area}</Badge>
                  ))}
                </div>

                {/* Approval Chain */}
                <div className="flex flex-wrap gap-2">
                  {moc.approvals.map((ap, i) => (
                    <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
                      ap.status === "approved" ? "bg-success/5 border-success/20 text-success" :
                      ap.status === "rejected" ? "bg-destructive/5 border-destructive/20 text-destructive" :
                      "bg-muted/50 border-border text-muted-foreground"
                    }`}>
                      {ap.status === "approved" ? <CheckCircle className="h-3 w-3" /> :
                       ap.status === "rejected" ? <AlertTriangle className="h-3 w-3" /> :
                       <Clock className="h-3 w-3" />}
                      <span>{ap.role}</span>
                      {ap.date && <span className="text-[10px] opacity-60">{ap.date}</span>}
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{currentStep + 1}/{FLOW_STEPS.length}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
