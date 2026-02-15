import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, Scale, Shield, Users, ArrowRight, Plus } from "lucide-react";

interface Grievance {
  id: string;
  title: string;
  complainant: string;
  category: string;
  status: "filed" | "level_1" | "level_2" | "level_3" | "flag_state" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  filedDate: string;
  lastUpdate: string;
  description: string;
  resolution?: string;
  daysOpen: number;
}

const ESCALATION_LEVELS = [
  { level: 1, title: "Supervisor Direto", sla: 7, description: "Resolução informal pelo supervisor imediato" },
  { level: 2, title: "Capitão / Master", sla: 14, description: "Intervenção do Comandante da embarcação" },
  { level: 3, title: "Companhia / DPA", sla: 30, description: "Encaminhamento ao DPA ou gestão em terra" },
  { level: 4, title: "Estado de Bandeira", sla: 90, description: "Reclamação formal ao Estado de Bandeira (Reg. 5.1.5)" },
];

const CATEGORIES = [
  "Condições de Trabalho", "Salários/Pagamentos", "Alimentação/Alojamento",
  "Assédio/Discriminação", "Segurança/Saúde", "Horas de Descanso",
  "Repatriação", "Contrato SEA", "Outros"
];

const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: "GRV-001", title: "Atraso no pagamento de horas extras",
    complainant: "Marinheiro A. Silva", category: "Salários/Pagamentos",
    status: "level_2", priority: "high", filedDate: "2026-02-01",
    lastUpdate: "2026-02-10", description: "Horas extras de janeiro não creditadas conforme SEA.",
    daysOpen: 14,
  },
  {
    id: "GRV-002", title: "Ventilação inadequada no alojamento",
    complainant: "Moço de Convés J. Santos", category: "Alimentação/Alojamento",
    status: "level_1", priority: "medium", filedDate: "2026-02-08",
    lastUpdate: "2026-02-12", description: "Sistema de ventilação no alojamento da popa inoperante há 5 dias.",
    daysOpen: 7,
  },
  {
    id: "GRV-003", title: "Violação de horas de descanso",
    complainant: "3º Oficial R. Ferreira", category: "Horas de Descanso",
    status: "resolved", priority: "critical", filedDate: "2026-01-15",
    lastUpdate: "2026-02-05", description: "Menos de 6h contínuas de descanso em 3 dias consecutivos.",
    resolution: "Escala ajustada e tripulante adicional embarcado.", daysOpen: 21,
  },
];

const statusConfig: Record<string, { label: string; color: string; level: number }> = {
  filed: { label: "Registrada", color: "bg-muted text-muted-foreground", level: 0 },
  level_1: { label: "Nível 1 — Supervisor", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", level: 1 },
  level_2: { label: "Nível 2 — Capitão", color: "bg-warning/10 text-warning border-warning/30", level: 2 },
  level_3: { label: "Nível 3 — DPA/Companhia", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", level: 3 },
  flag_state: { label: "Nível 4 — Estado de Bandeira", color: "bg-destructive/10 text-destructive border-destructive/30", level: 4 },
  resolved: { label: "Resolvida", color: "bg-success/10 text-success border-success/30", level: 5 },
  closed: { label: "Encerrada", color: "bg-muted text-muted-foreground", level: 5 },
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const MLCGrievanceProcedure: React.FC = () => {
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);
  const [showForm, setShowForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<string | null>(null);

  const activeCount = grievances.filter(g => !["resolved", "closed"].includes(g.status)).length;
  const resolvedCount = grievances.filter(g => g.status === "resolved").length;
  const avgResolution = grievances.filter(g => g.status === "resolved").reduce((a, g) => a + g.daysOpen, 0) / (resolvedCount || 1);
  const criticalCount = grievances.filter(g => g.priority === "critical" && g.status !== "resolved").length;

  const escalateGrievance = (id: string) => {
    setGrievances(prev => prev.map(g => {
      if (g.id !== id) return g;
      const nextStatus: Record<string, Grievance["status"]> = {
        filed: "level_1", level_1: "level_2", level_2: "level_3", level_3: "flag_state",
      };
      return { ...g, status: nextStatus[g.status] || g.status, lastUpdate: new Date().toISOString().split("T")[0] };
    }));
  };

  const resolveGrievance = (id: string) => {
    setGrievances(prev => prev.map(g =>
      g.id === id ? { ...g, status: "resolved" as const, lastUpdate: new Date().toISOString().split("T")[0], resolution: "Resolvida conforme procedimento interno." } : g
    ));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Ativas</p></div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Resolvidas</p></div>
          <p className="text-2xl font-bold text-success">{resolvedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Média Resolução</p></div>
          <p className="text-2xl font-bold">{avgResolution.toFixed(0)}d</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Críticas</p></div>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </CardContent></Card>
      </div>

      {/* Escalation Flowchart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />Fluxo de Escalonamento — MLC Reg. 5.1.5</CardTitle>
          <CardDescription>Procedimento obrigatório em 4 níveis com SLAs definidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ESCALATION_LEVELS.map((level, i) => (
              <React.Fragment key={level.level}>
                <div className="text-center p-3 rounded-xl border bg-card min-w-[140px]">
                  <Badge variant="outline" className="mb-2">Nível {level.level}</Badge>
                  <p className="text-sm font-medium">{level.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">SLA: {level.sla} dias</p>
                </div>
                {i < ESCALATION_LEVELS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grievance List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registro de Reclamações</CardTitle>
              <CardDescription>Rastreamento completo com escalonamento automático</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="h-3 w-3" />Nova</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {grievances.map(g => {
            const config = statusConfig[g.status];
            const slaLevel = ESCALATION_LEVELS.find(l => l.level === config.level);
            const slaProgress = slaLevel ? Math.min((g.daysOpen / slaLevel.sla) * 100, 100) : 0;
            const canEscalate = !["resolved", "closed", "flag_state"].includes(g.status);

            return (
              <div key={g.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                      <Badge variant="outline" className={config.color}>{config.label}</Badge>
                      <Badge variant="outline" className={priorityColors[g.priority]}>{g.priority}</Badge>
                    </div>
                    <p className="font-medium">{g.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{g.complainant}</span>
                      <span>{g.category}</span>
                      <span>{g.daysOpen}d aberta</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canEscalate && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => resolveGrievance(g.id)} className="gap-1 text-xs">
                          <CheckCircle className="h-3 w-3" />Resolver
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => escalateGrievance(g.id)} className="gap-1 text-xs">
                          <ArrowRight className="h-3 w-3" />Escalar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {slaLevel && g.status !== "resolved" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>SLA Nível {slaLevel.level}: {slaLevel.sla}d</span>
                      <span className={slaProgress >= 80 ? "text-destructive" : ""}>{g.daysOpen}/{slaLevel.sla}d</span>
                    </div>
                    <Progress value={slaProgress} className="h-1.5" />
                  </div>
                )}
                {g.resolution && (
                  <div className="p-2 rounded-lg bg-success/5 border border-success/20 text-xs">
                    <span className="font-medium text-success">Resolução:</span> {g.resolution}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-success" />Checklist de Conformidade — Reg. 5.1.5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              "Procedimento de reclamação publicado em idioma compreensível",
              "Cópia do SEA com procedimento de reclamação fornecida ao marítimo",
              "Oficial designado para receber reclamações a bordo (não Capitão)",
              "Garantia de não-retaliação ao reclamante",
              "Registro de reclamações mantido a bordo",
              "Marítimo informado sobre contato com Estado de Bandeira",
              "Procedimento de escalonamento em 4 níveis implementado",
              "Treinamento sobre procedimento de reclamação realizado",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-card/50">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
