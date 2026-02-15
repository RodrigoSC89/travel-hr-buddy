/**
 * MLC Work/Rest Hours Calculator - MLC Reg. 2.3 & STCW A-VIII/1
 * Visual calculator for compliance with work/rest hour rules
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Clock, Users, Download, Shield } from "lucide-react";
import { toast } from "sonner";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  watchSchedule: string;
  dailyWork: number;
  dailyRest: number;
  weeklyWork: number;
  weeklyRest: number;
  violations: string[];
  status: "compliant" | "warning" | "violation";
}

const CREW_DATA: CrewMember[] = [
  { id: "1", name: "Carlos Silva", rank: "Master", watchSchedule: "0800-1200 / 2000-0000", dailyWork: 8, dailyRest: 16, weeklyWork: 56, weeklyRest: 112, violations: [], status: "compliant" },
  { id: "2", name: "João Santos", rank: "Chief Officer", watchSchedule: "0400-0800 / 1600-2000", dailyWork: 8, dailyRest: 16, weeklyWork: 56, weeklyRest: 112, violations: [], status: "compliant" },
  { id: "3", name: "Pedro Oliveira", rank: "2nd Officer", watchSchedule: "0000-0400 / 1200-1600", dailyWork: 8, dailyRest: 16, weeklyWork: 56, weeklyRest: 112, violations: [], status: "compliant" },
  { id: "4", name: "Miguel Costa", rank: "Chief Engineer", watchSchedule: "0800-1700 + on-call", dailyWork: 11, dailyRest: 13, weeklyWork: 71, weeklyRest: 97, violations: ["Approaching weekly limit (72h)"], status: "warning" },
  { id: "5", name: "André Ferreira", rank: "AB Seaman", watchSchedule: "0600-1800 (port ops)", dailyWork: 14, dailyRest: 10, weeklyWork: 78, weeklyRest: 90, violations: ["Daily work > 14h", "Weekly work > 72h"], status: "violation" },
  { id: "6", name: "Roberto Lima", rank: "Cook", watchSchedule: "0500-1100 / 1500-1900", dailyWork: 10, dailyRest: 14, weeklyWork: 70, weeklyRest: 98, violations: [], status: "compliant" },
  { id: "7", name: "Felipe Dias", rank: "Bosun", watchSchedule: "0700-1200 / 1300-1800 + OT", dailyWork: 12, dailyRest: 12, weeklyWork: 74, weeklyRest: 94, violations: ["Weekly work > 72h"], status: "violation" },
  { id: "8", name: "Lucas Martins", rank: "DPO", watchSchedule: "0000-0600 / 1200-1800", dailyWork: 12, dailyRest: 12, weeklyWork: 72, weeklyRest: 96, violations: ["At weekly limit (72h)"], status: "warning" },
];

const MLC_RULES = [
  { rule: "Max 14 hours work in any 24h period", limit: 14, unit: "daily" },
  { rule: "Max 72 hours work in any 7-day period", limit: 72, unit: "weekly" },
  { rule: "Min 10 hours rest in any 24h period", limit: 10, unit: "daily_rest" },
  { rule: "Min 77 hours rest in any 7-day period", limit: 77, unit: "weekly_rest" },
  { rule: "Rest divided into max 2 periods", limit: 2, unit: "periods" },
  { rule: "One rest period min 6 consecutive hours", limit: 6, unit: "consecutive" },
];

export function MLCWorkRestCalculator() {
  const [crew] = useState(CREW_DATA);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const compliantCount = crew.filter(c => c.status === "compliant").length;
  const warningCount = crew.filter(c => c.status === "warning").length;
  const violationCount = crew.filter(c => c.status === "violation").length;
  const compliancePct = Math.round((compliantCount / crew.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Work/Rest Hours — MLC Reg. 2.3 & STCW A-VIII/1</h3>
          <p className="text-sm text-muted-foreground">Controle de horas de trabalho e descanso da tripulação</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Semana Atual</SelectItem>
              <SelectItem value="previous">Semana Anterior</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => toast.success("Work/Rest report exportado")} className="gap-1">
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{crew.length}</p>
          <p className="text-xs text-muted-foreground">Tripulantes</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold text-success">{compliancePct}%</p>
          <p className="text-xs text-muted-foreground">Conformidade</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold text-warning">{warningCount}</p>
          <p className="text-xs text-muted-foreground">Alertas</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{violationCount}</p>
          <p className="text-xs text-muted-foreground">Violações</p>
        </CardContent></Card>
      </div>

      {/* MLC Rules Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Regras MLC 2006 / STCW</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {MLC_RULES.map((r, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 text-xs flex items-start gap-2">
                <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{r.rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crew Table */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs">
                  <th className="pb-2">Tripulante</th>
                  <th className="pb-2">Função</th>
                  <th className="pb-2">Escala</th>
                  <th className="pb-2 text-center">Trab/24h</th>
                  <th className="pb-2 text-center">Desc/24h</th>
                  <th className="pb-2 text-center">Trab/7d</th>
                  <th className="pb-2 text-center">Desc/7d</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {crew.map(c => (
                  <tr key={c.id} className={`border-b last:border-0 ${c.status === "violation" ? "bg-destructive/5" : c.status === "warning" ? "bg-warning/5" : ""}`}>
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{c.rank}</td>
                    <td className="py-3 text-xs font-mono">{c.watchSchedule}</td>
                    <td className={`py-3 text-center font-bold ${c.dailyWork > 14 ? "text-destructive" : c.dailyWork > 12 ? "text-warning" : ""}`}>{c.dailyWork}h</td>
                    <td className={`py-3 text-center font-bold ${c.dailyRest < 10 ? "text-destructive" : c.dailyRest < 11 ? "text-warning" : ""}`}>{c.dailyRest}h</td>
                    <td className={`py-3 text-center font-bold ${c.weeklyWork > 72 ? "text-destructive" : c.weeklyWork > 70 ? "text-warning" : ""}`}>{c.weeklyWork}h</td>
                    <td className="py-3 text-center">{c.weeklyRest}h</td>
                    <td className="py-3">
                      <div className="space-y-1">
                        <Badge variant={c.status === "compliant" ? "outline" : c.status === "warning" ? "secondary" : "destructive"} className="text-xs">
                          {c.status === "compliant" ? "✓ OK" : c.status === "warning" ? "⚠ Alerta" : "✗ Violação"}
                        </Badge>
                        {c.violations.map((v, i) => (
                          <p key={i} className="text-xs text-destructive">{v}</p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
