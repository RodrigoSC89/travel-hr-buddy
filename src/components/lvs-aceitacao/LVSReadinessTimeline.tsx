/**
 * LVS Readiness Timeline - Visual progress toward 100% acceptance
 */
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, Target,
  TrendingUp, Calendar, Ship, Wrench, FileText, Shield
} from "lucide-react";
import { ALL_LVS_SECTIONS, ET_REFERENCES } from "./lvs-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, Legend
} from "recharts";

export function LVSReadinessTimeline() {
  const analytics = useMemo(() => {
    const byET = ET_REFERENCES.map(et => {
      const etSections = ALL_LVS_SECTIONS.filter(s => s.etRef === et.id);
      const items = etSections.flatMap(s => s.subsections.flatMap(ss => ss.items));
      const total = items.length;
      const approved = items.filter(i => i.status === "approved").length;
      const pending = items.filter(i => i.status === "pending").length;
      const rejected = items.filter(i => i.status === "rejected").length;
      const notVerified = items.filter(i => i.status === "not_verified").length;
      const na = items.filter(i => i.status === "not_applicable").length;
      const applicable = total - na;
      const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

      return { et: et.id, description: et.description, total, approved, pending, rejected, notVerified, na, applicable, score };
    });

    const allItems = ALL_LVS_SECTIONS.flatMap(s => s.subsections.flatMap(ss => ss.items));
    const total = allItems.length;
    const approved = allItems.filter(i => i.status === "approved").length;
    const applicable = allItems.filter(i => i.status !== "not_applicable").length;
    const overallScore = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

    // Milestones
    const milestones = [
      { label: "Documentação Básica", target: 30, icon: FileText },
      { label: "Sistemas & Equipamentos", target: 50, icon: Wrench },
      { label: "Testes Funcionais", target: 70, icon: Target },
      { label: "Compliance Final", target: 85, icon: Shield },
      { label: "Aceitação Petrobras", target: 100, icon: Ship },
    ];

    // Categories of gaps
    const gapCategories = [
      { name: "Documentação", count: allItems.filter(i => (i.status === "pending" || i.status === "not_verified") && i.methodology.toLowerCase().includes("documental")).length },
      { name: "Testes/Inspeção", count: allItems.filter(i => (i.status === "pending" || i.status === "not_verified") && (i.methodology.toLowerCase().includes("teste") || i.methodology.toLowerCase().includes("inspeção"))).length },
      { name: "Certificados", count: allItems.filter(i => (i.status === "pending" || i.status === "not_verified") && i.methodology.toLowerCase().includes("certificado")).length },
      { name: "Outros", count: allItems.filter(i => i.status === "pending" || i.status === "rejected").length },
    ];

    return { byET, overallScore, total, approved, applicable, milestones, gapCategories };
  }, []);

  const etChartData = analytics.byET.map(et => ({
    name: et.et.replace("ET-", ""),
    Aprovado: et.approved,
    Pendente: et.pending,
    Rejeitado: et.rejected,
    "Não Verificado": et.notVerified,
  }));

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Progresso para Aceitação</h3>
              <p className="text-sm text-muted-foreground">{analytics.approved}/{analytics.applicable} itens aprovados</p>
            </div>
            <div className={`text-4xl font-bold ${analytics.overallScore >= 80 ? 'text-success' : analytics.overallScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {analytics.overallScore}%
            </div>
          </div>
          <Progress value={analytics.overallScore} className="h-4 mb-6" />

          {/* Milestones */}
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            <div className="flex justify-between relative">
              {analytics.milestones.map((m, i) => {
                const reached = analytics.overallScore >= m.target;
                const Icon = m.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${reached ? "bg-success border-success text-success-foreground" : "bg-background border-muted-foreground"}`}>
                      {reached ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] text-center max-w-[80px] ${reached ? "text-success font-medium" : "text-muted-foreground"}`}>
                      {m.label}
                    </span>
                    <Badge variant={reached ? "default" : "outline"} className="text-[9px]">{m.target}%</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ET Breakdown */}
      <div className="grid md:grid-cols-3 gap-3">
        {analytics.byET.map(et => (
          <Card key={et.et}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">{et.et}</Badge>
                <span className={`text-xl font-bold ${et.score >= 80 ? 'text-success' : et.score >= 50 ? 'text-warning' : 'text-destructive'}`}>{et.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 truncate">{et.description}</p>
              <Progress value={et.score} className="h-2 mb-2" />
              <div className="grid grid-cols-4 gap-1 text-center">
                {[
                  { icon: CheckCircle2, value: et.approved, color: "text-success" },
                  { icon: Clock, value: et.pending, color: "text-warning" },
                  { icon: XCircle, value: et.rejected, color: "text-destructive" },
                  { icon: AlertTriangle, value: et.notVerified, color: "text-muted-foreground" },
                ].map((s, i) => (
                  <div key={i}>
                    <s.icon className={`h-3 w-3 mx-auto ${s.color}`} />
                    <span className="text-[10px] font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Distribuição por ET
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprovado" stackId="a" fill="hsl(var(--success))" />
              <Bar dataKey="Pendente" stackId="a" fill="hsl(var(--warning))" />
              <Bar dataKey="Rejeitado" stackId="a" fill="hsl(var(--destructive))" />
              <Bar dataKey="Não Verificado" stackId="a" fill="hsl(var(--muted))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
