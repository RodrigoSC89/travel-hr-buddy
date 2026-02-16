/**
 * MLC Work/Rest Hours Interactive Entry — Reg. 2.3 & STCW A-VIII/1
 * Hour-by-hour grid entry for real compliance tracking
 * Auto-validates against MLC limits: max 14h/24h work, min 10h/24h rest, max 72h/7d
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, CheckCircle, Clock, Users, Download, Shield, Plus,
  Calendar, Sun, Moon, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

type HourStatus = "work" | "rest" | "overtime";

interface DayEntry {
  date: string;
  hours: HourStatus[]; // 24 hours
}

interface CrewEntry {
  id: string;
  name: string;
  rank: string;
  days: DayEntry[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function generateDefaultDays(): DayEntry[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6 + i);
    return {
      date: d.toISOString().split("T")[0],
      hours: Array.from({ length: 24 }, (_, h) =>
        (h >= 8 && h < 12) || (h >= 13 && h < 17) ? "work" : "rest"
      ) as HourStatus[],
    };
  });
}

const DEFAULT_CREW: CrewEntry[] = [
  { id: "1", name: "Carlos Silva", rank: "Master", days: generateDefaultDays() },
  { id: "2", name: "João Santos", rank: "Chief Officer", days: generateDefaultDays() },
  { id: "3", name: "Pedro Oliveira", rank: "2nd Officer", days: generateDefaultDays() },
  { id: "4", name: "Miguel Costa", rank: "Chief Engineer", days: generateDefaultDays() },
  { id: "5", name: "André Ferreira", rank: "AB Seaman", days: generateDefaultDays() },
];

interface Violation {
  type: string;
  message: string;
  severity: "critical" | "warning";
  day?: string;
}

function validateCrewMember(crew: CrewEntry): { violations: Violation[]; dailyWork: number[]; weeklyWork: number; weeklyRest: number } {
  const violations: Violation[] = [];
  const dailyWork: number[] = [];
  let weeklyWork = 0;
  let weeklyRest = 0;

  crew.days.forEach((day, dayIdx) => {
    const workHours = day.hours.filter(h => h === "work" || h === "overtime").length;
    const restHours = day.hours.filter(h => h === "rest").length;
    dailyWork.push(workHours);
    weeklyWork += workHours;
    weeklyRest += restHours;

    if (workHours > 14) {
      violations.push({ type: "daily_work", message: `${DAYS_LABELS[dayIdx]}: ${workHours}h trabalho > 14h máx`, severity: "critical", day: day.date });
    } else if (workHours > 12) {
      violations.push({ type: "daily_work_warn", message: `${DAYS_LABELS[dayIdx]}: ${workHours}h trabalho (próximo do limite)`, severity: "warning", day: day.date });
    }
    if (restHours < 10) {
      violations.push({ type: "daily_rest", message: `${DAYS_LABELS[dayIdx]}: ${restHours}h descanso < 10h mín`, severity: "critical", day: day.date });
    }

    // Check rest periods (max 2 periods, one ≥6h)
    let restPeriods: number[] = [];
    let currentRest = 0;
    day.hours.forEach(h => {
      if (h === "rest") { currentRest++; }
      else { if (currentRest > 0) restPeriods.push(currentRest); currentRest = 0; }
    });
    if (currentRest > 0) restPeriods.push(currentRest);
    if (restPeriods.length > 2) {
      violations.push({ type: "rest_periods", message: `${DAYS_LABELS[dayIdx]}: ${restPeriods.length} períodos de descanso (máx 2)`, severity: "critical", day: day.date });
    }
    if (restPeriods.length > 0 && Math.max(...restPeriods) < 6) {
      violations.push({ type: "rest_consecutive", message: `${DAYS_LABELS[dayIdx]}: Nenhum período ≥6h consecutivas`, severity: "critical", day: day.date });
    }
  });

  if (weeklyWork > 72) {
    violations.push({ type: "weekly_work", message: `${weeklyWork}h/semana > 72h máx`, severity: "critical" });
  } else if (weeklyWork > 68) {
    violations.push({ type: "weekly_work_warn", message: `${weeklyWork}h/semana (próximo do limite 72h)`, severity: "warning" });
  }
  if (weeklyRest < 77) {
    violations.push({ type: "weekly_rest", message: `${weeklyRest}h descanso/semana < 77h mín`, severity: "critical" });
  }

  return { violations, dailyWork, weeklyWork, weeklyRest };
}

export function MLCWorkRestEntry() {
  const [crewList, setCrewList] = useState<CrewEntry[]>(DEFAULT_CREW);
  const [selectedCrew, setSelectedCrew] = useState<string>("1");

  const currentCrew = crewList.find(c => c.id === selectedCrew)!;
  const validation = useMemo(() => validateCrewMember(currentCrew), [currentCrew]);

  const allValidations = useMemo(() => crewList.map(c => ({
    ...c,
    ...validateCrewMember(c),
  })), [crewList]);

  const totalViolations = allValidations.reduce((acc, v) => acc + v.violations.filter(vl => vl.severity === "critical").length, 0);
  const totalWarnings = allValidations.reduce((acc, v) => acc + v.violations.filter(vl => vl.severity === "warning").length, 0);
  const compliantCrew = allValidations.filter(v => v.violations.filter(vl => vl.severity === "critical").length === 0).length;

  const toggleHour = (dayIdx: number, hourIdx: number) => {
    setCrewList(prev => prev.map(c => {
      if (c.id !== selectedCrew) return c;
      const newDays = [...c.days];
      const newHours = [...newDays[dayIdx].hours];
      newHours[hourIdx] = newHours[hourIdx] === "work" ? "rest" : newHours[hourIdx] === "rest" ? "overtime" : "rest";
      newDays[dayIdx] = { ...newDays[dayIdx], hours: newHours };
      return { ...c, days: newDays };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Work/Rest Hours — Registro Interativo
          </h3>
          <p className="text-sm text-muted-foreground">MLC Reg. 2.3 & STCW A-VIII/1 • Clique nas horas para alternar Trabalho/Descanso/OT</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => {
          const csvData = crewList.map((c: CrewEntry) => {
            const totalWork = c.days.reduce((sum: number, d: DayEntry) => sum + d.hours.filter((h: HourStatus) => h === 'work' || h === 'overtime').length, 0);
            const totalRest = c.days.reduce((sum: number, d: DayEntry) => sum + d.hours.filter((h: HourStatus) => h === 'rest').length, 0);
            return `${c.name},${c.rank},${totalWork},${totalRest},${c.days.length}`;
          }).join('\n');
          const blob = new Blob([`Nome,Rank,Horas Trabalho,Horas Descanso,Dias\n${csvData}`], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `work-rest-records-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Work/Rest records exportados com sucesso");
        }}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{crewList.length}</p>
          <p className="text-xs text-muted-foreground">Tripulantes</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold text-success">{compliantCrew}</p>
          <p className="text-xs text-muted-foreground">Conformes</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{totalViolations}</p>
          <p className="text-xs text-muted-foreground">Violações</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold text-warning">{totalWarnings}</p>
          <p className="text-xs text-muted-foreground">Alertas</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{Math.round((compliantCrew / crewList.length) * 100)}%</p>
          <p className="text-xs text-muted-foreground">Conformidade</p>
        </CardContent></Card>
      </div>

      {/* Crew Selector */}
      <div className="flex gap-2 flex-wrap">
        {crewList.map(c => {
          const v = allValidations.find(av => av.id === c.id)!;
          const hasCritical = v.violations.some(vl => vl.severity === "critical");
          return (
            <Button key={c.id} size="sm" variant={selectedCrew === c.id ? "default" : "outline"}
              className={`gap-1 ${hasCritical && selectedCrew !== c.id ? "border-destructive/50 text-destructive" : ""}`}
              onClick={() => setSelectedCrew(c.id)}>
              {hasCritical && <AlertTriangle className="h-3 w-3" />}
              {c.name} ({c.rank})
            </Button>
          );
        })}
      </div>

      {/* Hour Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentCrew.name} — {currentCrew.rank}
            <span className="text-muted-foreground font-normal">• Semana: {validation.weeklyWork}h trab / {validation.weeklyRest}h desc</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Hour headers */}
              <div className="flex items-center gap-px mb-1">
                <div className="w-16 text-xs text-muted-foreground text-right pr-2">Hora</div>
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                    {h.toString().padStart(2, "0")}
                  </div>
                ))}
                <div className="w-16 text-center text-xs text-muted-foreground">Total</div>
              </div>

              {/* Day rows */}
              {currentCrew.days.map((day, dayIdx) => {
                const workH = day.hours.filter(h => h !== "rest").length;
                const isViolation = workH > 14 || day.hours.filter(h => h === "rest").length < 10;
                return (
                  <div key={day.date} className={`flex items-center gap-px mb-px ${isViolation ? "bg-destructive/5 rounded" : ""}`}>
                    <div className="w-16 text-xs font-medium text-right pr-2">
                      {DAYS_LABELS[dayIdx]}
                      <span className="text-muted-foreground ml-1">{day.date.slice(8)}</span>
                    </div>
                    {day.hours.map((status, hourIdx) => (
                      <button key={hourIdx} onClick={() => toggleHour(dayIdx, hourIdx)}
                        className={`flex-1 h-6 rounded-sm transition-colors ${
                          status === "work" ? "bg-primary/70 hover:bg-primary/90" :
                          status === "overtime" ? "bg-destructive/70 hover:bg-destructive/90" :
                          "bg-muted/40 hover:bg-muted/60"
                        }`}
                        title={`${DAYS_LABELS[dayIdx]} ${hourIdx}:00 — ${status === "work" ? "Trabalho" : status === "overtime" ? "Hora Extra" : "Descanso"}`}
                      />
                    ))}
                    <div className={`w-16 text-center text-xs font-bold ${workH > 14 ? "text-destructive" : workH > 12 ? "text-warning" : ""}`}>
                      {workH}h
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-4 h-3 rounded-sm bg-primary/70" /> Trabalho</div>
                <div className="flex items-center gap-1"><div className="w-4 h-3 rounded-sm bg-destructive/70" /> Hora Extra</div>
                <div className="flex items-center gap-1"><div className="w-4 h-3 rounded-sm bg-muted/40" /> Descanso</div>
                <span className="text-muted-foreground ml-auto">Clique para alternar</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations */}
      {validation.violations.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {validation.violations.length} Violação(ões) Detectada(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {validation.violations.map((v, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded text-sm ${
                v.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
              }`}>
                {v.severity === "critical" ? <AlertTriangle className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
                {v.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* MLC Rules Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Limites MLC 2006 / STCW</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              "Máx 14h trabalho em 24h",
              "Máx 72h trabalho em 7 dias",
              "Mín 10h descanso em 24h",
              "Mín 77h descanso em 7 dias",
              "Descanso dividido em máx 2 períodos",
              "Um período mín 6h consecutivas",
            ].map((r, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 text-xs flex items-start gap-2">
                <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
