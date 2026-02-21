/**
 * PEO-DP Anexo O-1 — Exercícios Simulados de Emergência de DP
 * 11 scenarios from Tabela 1 with 90-min timer and evaluation forms
 * PRODUCTION: Integrated with Supabase peodp_emergency_drills
 */
import React, { useState, useEffect } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, Play, Pause, CheckCircle,
  Clock, Download, FileText, Timer
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

const SCENARIOS = [
  { id: "S01", scenario: "Drive Off / Drive Off", description: "Simulação de evento de Drive-Off: sistema DP ordena propulsão em direção errada", timeMinutes: 90 },
  { id: "S02", scenario: "Incêndio/Inundação/Colisão", description: "Cenário combinado de emergência durante operação DP", timeMinutes: 90 },
  { id: "S03", scenario: "Manobra de Escape de Emergência", description: "Escape usando joystick DP, joystick independente e manetes manuais", timeMinutes: 90 },
  { id: "S04", scenario: "Pior Caso de Falha (WCF)", description: "Simulação do pior caso de falha identificado no FMEA/FMECA", timeMinutes: 90 },
  { id: "S05", scenario: "Perda de todos os PRS ou Gyros", description: "Perda progressiva de todos os sistemas de referência de posição", timeMinutes: 90 },
  { id: "S06", scenario: "Recuperação do Blackout", description: "Blackout total e procedimento de recuperação com modo DP", timeMinutes: 90 },
  { id: "S07", scenario: "Falha no Sistema de Controle DP", description: "Perda do computador DP primário ou falha no software", timeMinutes: 90 },
  { id: "S08", scenario: "Falha no Sistema de Energia", description: "Perda de gerador principal ou falha no PMS", timeMinutes: 90 },
  { id: "S09", scenario: "Falha no Sistema de Propulsão", description: "Perda de thruster crítico ou falha hidráulica", timeMinutes: 90 },
  { id: "S10", scenario: "Falha no Sistema de Combustível", description: "Perda de suprimento de combustível ou contaminação", timeMinutes: 90 },
  { id: "S11", scenario: "Outros (UPS, Comunicações, SIMOPS)", description: "Cenários adicionais: perda de UPS, falha de comunicações ou emergência SIMOPS", timeMinutes: 90 },
];

export function PeoDPEmergencyDrills() {
  const queryClient = useQueryClient();
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evalForm, setEvalForm] = useState({ results: "", humanFactors: "", conclusion: "", correctiveActions: "" });

  const { data: drills = [], isLoading } = useQuery({
    queryKey: ["peodp-emergency-drills"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("peodp_emergency_drills")
        .select("*")
        .order("scenario_id", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (drill: Record<string, unknown>) => {
      const { error } = await fromUntyped("peodp_emergency_drills").upsert(drill, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peodp-emergency-drills"] }),
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const rows = SCENARIOS.map(s => ({
        scenario_id: s.id,
        scenario: s.scenario,
        description: s.description,
        time_minutes: s.timeMinutes,
        status: "planned",
        evaluation: "pending",
        dp_class: "DP2",
      }));
      const { error } = await fromUntyped("peodp_emergency_drills").upsert(rows, { onConflict: "scenario_id", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-emergency-drills"] });
      toast.success("11 cenários de exercício inicializados");
    },
  });

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

  const startDrill = (drill: any) => {
    upsertMutation.mutate({ id: drill.id, status: "in_progress", drill_date: new Date().toISOString().split("T")[0] });
    setActiveDrillId(drill.id);
    setTimerSeconds(0);
    setTimerRunning(true);
    toast.info("Exercício iniciado — Cronômetro ativado (90 min)");
  };

  const completeDrill = (id: string, evaluation: string) => {
    upsertMutation.mutate({
      id,
      status: "completed",
      evaluation,
      timer_seconds: timerSeconds,
      results: evalForm.results,
      human_factors: evalForm.humanFactors,
      conclusion: evalForm.conclusion,
      corrective_actions: evalForm.correctiveActions,
    });
    setTimerRunning(false);
    setActiveDrillId(null);
    toast.success(`Exercício concluído: ${evaluation === "satisfactory" ? "Satisfatório ✓" : "Necessita melhoria"}`);
  };

  const saveEvaluation = (id: string) => {
    upsertMutation.mutate({
      id,
      results: evalForm.results,
      human_factors: evalForm.humanFactors,
      conclusion: evalForm.conclusion,
      corrective_actions: evalForm.correctiveActions,
    });
    setExpandedId(null);
    toast.success("Avaliação salva no banco de dados");
  };

  // Use SCENARIOS as fallback if DB is empty
  const displayDrills = drills.length > 0 ? drills : [];
  const filtered = filterStatus === "all" ? displayDrills : displayDrills.filter((d: any) => d.status === filterStatus);
  const completedCount = displayDrills.filter((d: any) => d.status === "completed").length;
  const satisfactoryCount = displayDrills.filter((d: any) => d.evaluation === "satisfactory").length;
  const progressPct = displayDrills.length > 0 ? Math.round((completedCount / displayDrills.length) * 100) : 0;
  const activeDrill = activeDrillId ? displayDrills.find((d: any) => d.id === activeDrillId) : null;

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando exercícios...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Exercícios Simulados de Emergência DP — Anexo O-1
          </h3>
          <p className="text-sm text-muted-foreground">11 cenários • 90 min cada • IMCA M 117 • PEO-DP 2026</p>
        </div>
        <div className="flex gap-2">
          {displayDrills.length === 0 && (
            <Button size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              Inicializar Cenários
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(displayDrills, "PEO-DP Emergency Drills")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* Timer Banner */}
      {timerRunning && activeDrill && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6 text-primary animate-pulse" />
                <div>
                  <p className="font-semibold">{activeDrill.scenario}</p>
                  <p className="text-xs text-muted-foreground">Exercício em andamento</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-3xl font-mono font-bold ${timerSeconds > 5400 ? "text-destructive" : "text-primary"}`}>
                  {formatTime(timerSeconds)}
                </p>
                <Progress value={Math.min((timerSeconds / 5400) * 100, 100)} className="w-24 h-2" />
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setTimerRunning(!timerRunning)}>
                    {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" className="gap-1" onClick={() => completeDrill(activeDrill.id, "satisfactory")}>
                    <CheckCircle className="h-3 w-3" /> Satisfatório
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => completeDrill(activeDrill.id, "needs_improvement")}>
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
          <p className="text-2xl font-bold">{displayDrills.length}</p>
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

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          <SelectItem value="planned">Planejado</SelectItem>
          <SelectItem value="in_progress">Em Andamento</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {filtered.map((drill: any) => (
          <Card key={drill.id} className={
            drill.status === "completed" ? "border-success/20" :
            drill.status === "in_progress" ? "border-primary/30 bg-primary/5" : ""
          }>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">{drill.scenario_id}</Badge>
                    <span className="font-semibold">{drill.scenario}</span>
                    <Badge variant="secondary" className="text-xs">{drill.time_minutes} min</Badge>
                    {drill.status === "completed" && (
                      <Badge variant={drill.evaluation === "satisfactory" ? "default" : "secondary"} className="text-xs">
                        {drill.evaluation === "satisfactory" ? "✓ Satisfatório" : "⚡ Melhorias necessárias"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{drill.description}</p>
                  {drill.drill_date && <p className="text-xs text-muted-foreground">Data: {drill.drill_date}</p>}
                  {drill.timer_seconds > 0 && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Duração: {formatTime(drill.timer_seconds)}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {drill.status === "planned" && (
                    <Button size="sm" className="gap-1 h-8" onClick={() => startDrill(drill)}>
                      <Play className="h-3 w-3" /> Iniciar
                    </Button>
                  )}
                  {drill.status === "completed" && (
                    <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => {
                      setExpandedId(expandedId === drill.id ? null : drill.id);
                      setEvalForm({ results: drill.results || "", humanFactors: drill.human_factors || "", conclusion: drill.conclusion || "", correctiveActions: drill.corrective_actions || "" });
                    }}>
                      <FileText className="h-3 w-3" /> Relatório
                    </Button>
                  )}
                </div>
              </div>

              {expandedId === drill.id && drill.status === "completed" && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold">Formulário de Avaliação — Anexo O-1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Resultados testemunhados</label>
                      <Textarea value={evalForm.results} onChange={e => setEvalForm(p => ({ ...p, results: e.target.value }))} className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Fatores humanos</label>
                      <Textarea value={evalForm.humanFactors} onChange={e => setEvalForm(p => ({ ...p, humanFactors: e.target.value }))} className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Conclusão</label>
                      <Textarea value={evalForm.conclusion} onChange={e => setEvalForm(p => ({ ...p, conclusion: e.target.value }))} className="mt-1 h-20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Ações corretivas</label>
                      <Textarea value={evalForm.correctiveActions} onChange={e => setEvalForm(p => ({ ...p, correctiveActions: e.target.value }))} className="mt-1 h-20" />
                    </div>
                  </div>
                  <Button size="sm" className="gap-1" onClick={() => saveEvaluation(drill.id)}>
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
