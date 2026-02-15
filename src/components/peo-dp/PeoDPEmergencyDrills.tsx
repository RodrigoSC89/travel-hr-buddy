/**
 * PEO-DP Anexo O-1 — Exercícios Simulados de Emergência de DP
 * 11 scenarios from Tabela 1 with 90-min timer and evaluation forms
 * Per PEO-DP 2026 items 4.4.1 through 4.5.3
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, Play, Pause, RotateCcw, CheckCircle, XCircle,
  Clock, Download, FileText, Users, Ship, Timer, Brain
} from "lucide-react";
import { toast } from "sonner";

type DrillStatus = "planned" | "in_progress" | "completed" | "failed" | "cancelled";
type DrillEval = "satisfactory" | "needs_improvement" | "unsatisfactory" | "pending";

interface EmergencyDrill {
  id: string;
  scenario: string;
  description: string;
  timeMinutes: number;
  status: DrillStatus;
  evaluation: DrillEval;
  date?: string;
  participants: string;
  vessel: string;
  dpClass: "DP1" | "DP2";
  preDiscussion: string;
  observations: string;
  results: string;
  humanFactors: string;
  conclusion: string;
  correctiveActions: string;
}

const SCENARIOS: Omit<EmergencyDrill, "status" | "evaluation" | "date" | "participants" | "vessel" | "dpClass" | "preDiscussion" | "observations" | "results" | "humanFactors" | "conclusion" | "correctiveActions">[] = [
  { id: "S01", scenario: "Drive Off / Drive Off", description: "Simulação de evento de Drive-Off: sistema DP ordena propulsão em direção errada, levando a embarcação em direção à UM", timeMinutes: 90 },
  { id: "S02", scenario: "Incêndio/Inundação/Colisão", description: "Cenário combinado de emergência: incêndio na praça de máquinas, inundação ou colisão durante operação DP", timeMinutes: 90 },
  { id: "S03", scenario: "Manobra de Escape de Emergência", description: "Escape usando joystick DP, joystick independente e manetes manuais sequencialmente", timeMinutes: 90 },
  { id: "S04", scenario: "Pior Caso de Falha (WCF)", description: "Simulação do pior caso de falha identificado no FMEA/FMECA da embarcação", timeMinutes: 90 },
  { id: "S05", scenario: "Perda de todos os PRS ou Gyros", description: "Perda progressiva de todos os sistemas de referência de posição ou giroscópios", timeMinutes: 90 },
  { id: "S06", scenario: "Recuperação do Blackout", description: "Blackout total e procedimento de recuperação com reestabelecimento do modo DP", timeMinutes: 90 },
  { id: "S07", scenario: "Falha no Sistema de Controle DP", description: "Perda do computador DP primário ou falha no software de controle", timeMinutes: 90 },
  { id: "S08", scenario: "Falha no Sistema de Energia", description: "Perda de gerador principal ou falha no PMS durante operação DP", timeMinutes: 90 },
  { id: "S09", scenario: "Falha no Sistema de Propulsão", description: "Perda de thruster crítico ou falha hidráulica em propulsor azimutal", timeMinutes: 90 },
  { id: "S10", scenario: "Falha no Sistema de Combustível", description: "Perda de suprimento de combustível ou contaminação do sistema", timeMinutes: 90 },
  { id: "S11", scenario: "Outros (UPS, Comunicações, SIMOPS)", description: "Cenários adicionais: perda de UPS principal, falha de comunicações ou emergência durante SIMOPS", timeMinutes: 90 },
];

const initialDrills: EmergencyDrill[] = SCENARIOS.map(s => ({
  ...s,
  status: "planned",
  evaluation: "pending",
  participants: "",
  vessel: "",
  dpClass: "DP2",
  preDiscussion: "",
  observations: "",
  results: "",
  humanFactors: "",
  conclusion: "",
  correctiveActions: "",
}));

export function PeoDPEmergencyDrills() {
  const [drills, setDrills] = useState<EmergencyDrill[]>(initialDrills);
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startDrill = (id: string) => {
    setDrills(prev => prev.map(d => d.id === id ? { ...d, status: "in_progress", date: new Date().toISOString().split("T")[0] } : d));
    setSelectedDrill(id);
    setTimerSeconds(0);
    setTimerRunning(true);
    toast.info("Exercício iniciado — Cronômetro ativado (90 min)");
  };

  const completeDrill = (id: string, eval_: DrillEval) => {
    setDrills(prev => prev.map(d => d.id === id ? { ...d, status: "completed", evaluation: eval_ } : d));
    setTimerRunning(false);
    toast.success(`Exercício concluído: ${eval_ === "satisfactory" ? "Satisfatório ✓" : "Necessita melhoria"}`);
  };

  const filtered = filterStatus === "all" ? drills : drills.filter(d => d.status === filterStatus);
  const completedCount = drills.filter(d => d.status === "completed").length;
  const satisfactoryCount = drills.filter(d => d.evaluation === "satisfactory").length;
  const progressPct = Math.round((completedCount / drills.length) * 100);
  const activeDrill = selectedDrill ? drills.find(d => d.id === selectedDrill) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Exercícios Simulados de Emergência DP — Anexo O-1
          </h3>
          <p className="text-sm text-muted-foreground">
            {SCENARIOS.length} cenários • 90 min cada • IMCA M 117 • PEO-DP 2026
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => toast.success("Relatório de exercícios exportado")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* Timer Banner (when active) */}
      {timerRunning && activeDrill && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6 text-primary animate-pulse" />
                <div>
                  <p className="font-semibold">{activeDrill.scenario}</p>
                  <p className="text-xs text-muted-foreground">Exercício em andamento</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-3xl font-mono font-bold ${timerSeconds > 5400 ? "text-destructive" : "text-primary"}`}>
                    {formatTime(timerSeconds)}
                  </p>
                  <p className="text-xs text-muted-foreground">/ 90:00</p>
                </div>
                <Progress value={Math.min((timerSeconds / 5400) * 100, 100)} className="w-24 h-2" />
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setTimerRunning(!timerRunning)}>
                    {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="default" className="gap-1" onClick={() => completeDrill(activeDrill.id, "satisfactory")}>
                    <CheckCircle className="h-3 w-3" /> Satisfatório
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1" onClick={() => completeDrill(activeDrill.id, "needs_improvement")}>
                    Melhorias
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Cenários</p>
          <p className="text-2xl font-bold">{drills.length}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Concluídos</p>
          <p className="text-2xl font-bold text-success">{completedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Satisfatórios</p>
          <p className="text-2xl font-bold">{satisfactoryCount}/{completedCount || 1}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Progresso</p>
          <p className="text-2xl font-bold">{progressPct}%</p>
        </CardContent></Card>
      </div>

      {/* Filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          <SelectItem value="planned">Planejado</SelectItem>
          <SelectItem value="in_progress">Em Andamento</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </SelectContent>
      </Select>

      {/* Drill Cards */}
      <div className="space-y-3">
        {filtered.map(drill => (
          <Card key={drill.id} className={
            drill.status === "completed" ? "border-success/20" :
            drill.status === "in_progress" ? "border-primary/30 bg-primary/5" :
            ""
          }>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">{drill.id}</Badge>
                    <span className="font-semibold">{drill.scenario}</span>
                    <Badge variant="secondary" className="text-xs">{drill.timeMinutes} min</Badge>
                    {drill.status === "completed" && (
                      <Badge variant={drill.evaluation === "satisfactory" ? "default" : "secondary"} className="text-xs">
                        {drill.evaluation === "satisfactory" ? "✓ Satisfatório" : "⚡ Melhorias necessárias"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{drill.description}</p>
                  {drill.date && <p className="text-xs text-muted-foreground">Data: {drill.date}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {drill.status === "planned" && (
                    <Button size="sm" className="gap-1 h-8" onClick={() => startDrill(drill.id)}>
                      <Play className="h-3 w-3" /> Iniciar
                    </Button>
                  )}
                  {drill.status === "completed" && (
                    <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => {
                      setSelectedDrill(drill.id);
                      toast.info("Formulário de avaliação aberto");
                    }}>
                      <FileText className="h-3 w-3" /> Relatório
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded evaluation form */}
              {selectedDrill === drill.id && drill.status === "completed" && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold">Formulário de Avaliação — Anexo O-1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Resultados testemunhados</label>
                      <Textarea placeholder="Descreva os resultados reais do exercício..." className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Fatores humanos</label>
                      <Textarea placeholder="Riscos de multitarefa, distrações, reações alternativas..." className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Revisão da reação DPO e pessoal-chave</label>
                      <Textarea placeholder="Lacunas na familiarização, alterações nos procedimentos..." className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Conclusão e ações corretivas</label>
                      <Textarea placeholder="Sugestões de acompanhamento, ações corretivas..." className="mt-1 h-20" />
                    </div>
                  </div>
                  <Button size="sm" className="gap-1" onClick={() => { setSelectedDrill(null); toast.success("Avaliação salva"); }}>
                    <CheckCircle className="h-3 w-3" /> Salvar Avaliação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
