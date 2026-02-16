/**
 * MLC Work/Rest Hours Calculator - MLC Reg. 2.3 & STCW A-VIII/1
 * Connected to mlc_work_rest_records table
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Clock, Users, Download, Shield } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MLC_RULES = [
  { rule: "Max 14 hours work in any 24h period", limit: 14, unit: "daily" },
  { rule: "Max 72 hours work in any 7-day period", limit: 72, unit: "weekly" },
  { rule: "Min 10 hours rest in any 24h period", limit: 10, unit: "daily_rest" },
  { rule: "Min 77 hours rest in any 7-day period", limit: 77, unit: "weekly_rest" },
  { rule: "Rest divided into max 2 periods", limit: 2, unit: "periods" },
  { rule: "One rest period min 6 consecutive hours", limit: 6, unit: "consecutive" },
];

export function MLCWorkRestCalculator() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["mlc-work-rest", selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      let startDate: string;
      if (selectedPeriod === "current") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
      } else if (selectedPeriod === "previous") {
        const d = new Date(now);
        d.setDate(d.getDate() - 14);
        startDate = d.toISOString().split("T")[0];
      } else {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split("T")[0];
      }

      const { data, error } = await (supabase.from as Function)("mlc_work_rest_records")
        .select("*, crew_members(full_name, rank)")
        .gte("record_date", startDate)
        .order("record_date", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic table response
      return data as any[];
    },
  });

  // Aggregate by crew member
  const crewMap = new Map<string, { name: string; rank: string; totalWork: number; totalRest: number; violations: string[]; records: number }>();
  
  for (const r of records) {
    const key = r.crew_member_id;
    const existing = crewMap.get(key) || { name: r.crew_members?.full_name || "Unknown", rank: r.crew_members?.rank || "", totalWork: 0, totalRest: 0, violations: [] as string[], records: 0 };
    existing.totalWork += r.total_work_hours || 0;
    existing.totalRest += r.total_rest_hours || 0;
    existing.records += 1;
    if (r.violations && Array.isArray(r.violations)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- violations array has mixed types
      const mapped = (r.violations as any[]).map((v: any) => typeof v === "string" ? v : v.description || "Violation");
      for (const m of mapped) existing.violations.push(m);
    }
    if (!r.is_compliant) existing.violations.push(`Non-compliant on ${r.record_date}`);
    crewMap.set(key, existing);
  }

  const crewList = Array.from(crewMap.entries()).map(([id, data]) => ({
    id,
    ...data,
    avgDailyWork: data.records > 0 ? Math.round(data.totalWork / data.records * 10) / 10 : 0,
    avgDailyRest: data.records > 0 ? Math.round(data.totalRest / data.records * 10) / 10 : 0,
    status: data.violations.length > 0 ? "violation" as const : data.records > 0 && (data.totalWork / data.records) > 12 ? "warning" as const : "compliant" as const,
  }));

  const compliantCount = crewList.filter(c => c.status === "compliant").length;
  const warningCount = crewList.filter(c => c.status === "warning").length;
  const violationCount = crewList.filter(c => c.status === "violation").length;
  const compliancePct = crewList.length > 0 ? Math.round((compliantCount / crewList.length) * 100) : 100;

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
          <Button size="sm" variant="outline" onClick={() => quickExport(records as Record<string, unknown>[], "MLC Work Rest")} className="gap-1">
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{crewList.length}</p><p className="text-xs text-muted-foreground">Tripulantes</p></CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center"><CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" /><p className="text-2xl font-bold text-success">{compliancePct}%</p><p className="text-xs text-muted-foreground">Conformidade</p></CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center"><Clock className="h-5 w-5 mx-auto mb-1 text-warning" /><p className="text-2xl font-bold text-warning">{warningCount}</p><p className="text-xs text-muted-foreground">Alertas</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" /><p className="text-2xl font-bold text-destructive">{violationCount}</p><p className="text-xs text-muted-foreground">Violações</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Regras MLC 2006 / STCW</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {MLC_RULES.map((r, i) => (
              <div key={`mlc-rule-${r.rule.slice(0, 15)}-${i}`} className="p-2 rounded bg-muted/50 text-xs flex items-start gap-2">
                <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" /><span>{r.rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando registros...</p>
          ) : crewList.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum registro de trabalho/descanso encontrado para o período selecionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-xs">
                    <th className="pb-2">Tripulante</th>
                    <th className="pb-2">Função</th>
                    <th className="pb-2 text-center">Registros</th>
                    <th className="pb-2 text-center">Méd. Trab/dia</th>
                    <th className="pb-2 text-center">Méd. Desc/dia</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {crewList.map(c => (
                    <tr key={c.id} className={`border-b last:border-0 ${c.status === "violation" ? "bg-destructive/5" : c.status === "warning" ? "bg-warning/5" : ""}`}>
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3">{c.rank}</td>
                      <td className="py-3 text-center">{c.records}</td>
                      <td className={`py-3 text-center font-bold ${c.avgDailyWork > 14 ? "text-destructive" : c.avgDailyWork > 12 ? "text-warning" : ""}`}>{c.avgDailyWork}h</td>
                      <td className={`py-3 text-center font-bold ${c.avgDailyRest < 10 ? "text-destructive" : c.avgDailyRest < 11 ? "text-warning" : ""}`}>{c.avgDailyRest}h</td>
                      <td className="py-3">
                        <Badge variant={c.status === "compliant" ? "outline" : c.status === "warning" ? "secondary" : "destructive"} className="text-xs">
                          {c.status === "compliant" ? "✓ OK" : c.status === "warning" ? "⚠ Alerta" : "✗ Violação"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
