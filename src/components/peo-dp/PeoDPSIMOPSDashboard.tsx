import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Anchor, CheckCircle, Clock, Layers, Shield, Target, Users, Activity, Zap } from "lucide-react";

interface SimOp {
  id: string;
  name: string;
  type: "crane_ops" | "diving" | "rov" | "pipe_lay" | "supply" | "helicopter";
  status: "planned" | "in_progress" | "suspended" | "completed";
  riskLevel: "low" | "medium" | "high" | "critical";
  startTime: string;
  endTime: string;
  supervisor: string;
  dpRequirements: string;
  restrictions: string[];
  conflictsWith: string[];
  weather_limit: string;
}

const INITIAL_SIMOPS: SimOp[] = [
  {
    id: "SIM-001", name: "Crane Lift — Módulo P-77", type: "crane_ops",
    status: "in_progress", riskLevel: "high",
    startTime: "06:00", endTime: "18:00", supervisor: "Eng. Marcos Lima",
    dpRequirements: "DP Class 3 — Heading hold ± 5°, Pos. ± 3m",
    restrictions: ["Sem operação de Supply simultâneo", "Velocidade do vento < 25 kts"],
    conflictsWith: ["SIM-003"], weather_limit: "Wind < 25kts, Hs < 2.5m"
  },
  {
    id: "SIM-002", name: "Mergulho Saturação — Inspeção Riser", type: "diving",
    status: "in_progress", riskLevel: "critical",
    startTime: "00:00", endTime: "23:59", supervisor: "Sup. Mergulho R. Oliveira",
    dpRequirements: "DP Class 3 — Red Zone 500m, Pos. ± 1m absoluto",
    restrictions: ["Zona de exclusão 500m ativa", "Sem manobras de thruster manual", "Sem operação de ROV no mesmo quadrante"],
    conflictsWith: ["SIM-003", "SIM-004"], weather_limit: "Wind < 20kts, Hs < 2.0m, Current < 1.5kts"
  },
  {
    id: "SIM-003", name: "Supply Vessel — Carga Geral", type: "supply",
    status: "planned", riskLevel: "medium",
    startTime: "14:00", endTime: "20:00", supervisor: "1º Oficial M. Santos",
    dpRequirements: "DP Class 2 — Standoff 80m",
    restrictions: ["Manter 80m standoff", "Coordenar com Crane Ops"],
    conflictsWith: ["SIM-001", "SIM-002"], weather_limit: "Wind < 30kts, Hs < 3.0m"
  },
  {
    id: "SIM-004", name: "ROV Survey — Flowline Km 2.5-4.0", type: "rov",
    status: "planned", riskLevel: "medium",
    startTime: "08:00", endTime: "16:00", supervisor: "Sup. ROV A. Ferreira",
    dpRequirements: "DP Class 2 — Track follow ± 5m",
    restrictions: ["Não operar no quadrante do mergulho"],
    conflictsWith: ["SIM-002"], weather_limit: "Wind < 30kts, Hs < 3.5m"
  },
  {
    id: "SIM-005", name: "Pouso de Helicóptero — Troca de Turma", type: "helicopter",
    status: "planned", riskLevel: "high",
    startTime: "10:00", endTime: "11:00", supervisor: "HLO J. Almeida",
    dpRequirements: "Heading estável ± 10° durante operação",
    restrictions: ["Suspender crane ops durante pouso", "Deck clear obrigatório"],
    conflictsWith: ["SIM-001"], weather_limit: "Wind < 40kts, Vis > 1nm"
  },
];

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  crane_ops: { label: "Guincho/Crane", icon: Layers, color: "text-warning" },
  diving: { label: "Mergulho", icon: Anchor, color: "text-blue-400" },
  rov: { label: "ROV", icon: Target, color: "text-purple-400" },
  pipe_lay: { label: "Pipe Lay", icon: Activity, color: "text-primary" },
  supply: { label: "Supply", icon: Anchor, color: "text-primary" },
  helicopter: { label: "Helicóptero", icon: Zap, color: "text-orange-400" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejada", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "Em Curso", color: "bg-success/10 text-success border-success/30" },
  suspended: { label: "Suspensa", color: "bg-destructive/10 text-destructive border-destructive/30" },
  completed: { label: "Concluída", color: "bg-primary/10 text-primary border-primary/30" },
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const PeoDPSIMOPSDashboard: React.FC = () => {
  const [simops, setSimops] = useState<SimOp[]>(INITIAL_SIMOPS);

  const activeCount = simops.filter(s => s.status === "in_progress").length;
  const plannedCount = simops.filter(s => s.status === "planned").length;
  const criticalCount = simops.filter(s => s.riskLevel === "critical" && s.status !== "completed").length;

  // Detect conflicts
  const conflicts: Array<{ op1: string; op2: string; reason: string }> = [];
  simops.forEach(op => {
    if (op.status === "completed") return;
    op.conflictsWith.forEach(conflictId => {
      const conflictOp = simops.find(s => s.id === conflictId && s.status !== "completed");
      if (conflictOp && !conflicts.find(c => (c.op1 === conflictId && c.op2 === op.id))) {
        conflicts.push({ op1: op.id, op2: conflictId, reason: `${op.name} ↔ ${conflictOp.name}` });
      }
    });
  });

  const suspendOp = (id: string) => {
    setSimops(prev => prev.map(s => s.id === id ? { ...s, status: "suspended" as const } : s));
  };

  const resumeOp = (id: string) => {
    setSimops(prev => prev.map(s => s.id === id ? { ...s, status: "in_progress" as const } : s));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">SIMOPS Ativas</p>
            <p className="text-3xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">{plannedCount} planejadas</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Críticas</p></div>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Conflitos</p></div>
          <p className="text-2xl font-bold text-warning">{conflicts.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Total Ops</p></div>
          <p className="text-2xl font-bold">{simops.length}</p>
        </CardContent></Card>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-warning"><AlertTriangle className="h-5 w-5" />Conflitos Detectados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.op1} ↔ {c.op2}</p>
                  <p className="text-xs text-muted-foreground">{c.reason}</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Ação Requerida</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline Visual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Timeline de Operações (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Hour markers */}
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {[0, 4, 8, 12, 16, 20, 24].map(h => <span key={h}>{String(h).padStart(2, "0")}:00</span>)}
            </div>
            {simops.filter(s => s.status !== "completed").map(op => {
              const startH = parseInt(op.startTime.split(":")[0]);
              const endH = parseInt(op.endTime.split(":")[0]) || 24;
              const leftPct = (startH / 24) * 100;
              const widthPct = ((endH - startH) / 24) * 100;
              const tcfg = typeConfig[op.type];

              return (
                <div key={op.id} className="relative h-8 rounded-lg bg-muted/30 border">
                  <div
                    className={`absolute h-full rounded-lg flex items-center px-2 text-xs font-medium ${riskColors[op.riskLevel]} border`}
                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}
                  >
                    <span className="truncate">{op.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Operações Simultâneas</CardTitle>
          <CardDescription>Coordenação SIMOPS conforme procedimentos DP e IMCA M 220</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {simops.map(op => {
            const tcfg = typeConfig[op.type];
            const stCfg = statusConfig[op.status];

            return (
              <div key={op.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{op.id}</span>
                      <Badge variant="outline" className={stCfg.color}>{stCfg.label}</Badge>
                      <Badge variant="outline" className={riskColors[op.riskLevel]}>Risco: {op.riskLevel}</Badge>
                      <Badge variant="outline"><tcfg.icon className="h-3 w-3 mr-1" />{tcfg.label}</Badge>
                    </div>
                    <p className="font-medium">{op.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{op.startTime}–{op.endTime}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{op.supervisor}</span>
                    </div>
                    <p className="text-xs"><span className="font-medium">DP:</span> {op.dpRequirements}</p>
                    <p className="text-xs"><span className="font-medium">Weather:</span> {op.weather_limit}</p>
                  </div>
                  <div className="flex gap-1">
                    {op.status === "in_progress" && (
                      <Button size="sm" variant="destructive" onClick={() => suspendOp(op.id)} className="text-xs">Suspender</Button>
                    )}
                    {op.status === "suspended" && (
                      <Button size="sm" variant="outline" onClick={() => resumeOp(op.id)} className="text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />Retomar
                      </Button>
                    )}
                  </div>
                </div>
                {op.restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {op.restrictions.map((r, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">⚠ {r}</Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
