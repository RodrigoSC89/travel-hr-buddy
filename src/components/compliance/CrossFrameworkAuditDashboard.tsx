/**
 * Cross-Framework Audit Readiness Dashboard
 * Unified view across ALL compliance frameworks: PEO-DP, PEOTRAM, MLC, ISM, ISPS, SGSO, TMSA
 * No competitor in the world has this level of cross-framework visibility
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, AlertTriangle, CheckCircle, Clock, Download, Ship,
  Calendar, Target, Brain, Sparkles, TrendingUp, BarChart3,
  FileText, Users, Anchor, Zap, Eye, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";

interface FrameworkStatus {
  id: string;
  name: string;
  shortName: string;
  score: number;
  totalItems: number;
  conformeItems: number;
  ncCount: number;
  criticalNCs: number;
  lastAudit: string;
  nextAudit: string;
  daysToAudit: number;
  trend: "up" | "down" | "stable";
  route: string;
  color: string;
  priority: "critical" | "high" | "medium" | "low";
  gaps: { area: string; severity: "critical" | "major" | "minor"; description: string }[];
}

const FRAMEWORKS: FrameworkStatus[] = [
  {
    id: "peo-dp", name: "PEO-DP (Petrobras 2026)", shortName: "PEO-DP",
    score: 87, totalItems: 185, conformeItems: 161, ncCount: 3, criticalNCs: 1,
    lastAudit: "2025-11-15", nextAudit: "2026-05-15", daysToAudit: 89, trend: "up",
    route: "/compliance/peo-dp", color: "hsl(210, 70%, 55%)", priority: "critical",
    gaps: [
      { area: "FMECA", severity: "critical", description: "Análise FMECA sem cobertura dos 14 campos mandatórios" },
      { area: "ASOG", severity: "major", description: "Procedimentos ASOG desatualizados para DP2" },
      { area: "Calibração", severity: "minor", description: "3 registros de calibração de propulsores pendentes" },
    ]
  },
  {
    id: "peotram", name: "PEOTRAM (ANP/Petrobras)", shortName: "PEOTRAM",
    score: 91, totalItems: 130, conformeItems: 118, ncCount: 2, criticalNCs: 0,
    lastAudit: "2025-10-20", nextAudit: "2026-04-20", daysToAudit: 64, trend: "up",
    route: "/compliance/peotram", color: "hsl(35, 80%, 55%)", priority: "high",
    gaps: [
      { area: "Elem. 4 (Operações)", severity: "major", description: "Procedimentos operacionais precisam revisão" },
      { area: "Elem. 11 (Emergências)", severity: "major", description: "Simulado de emergência vencido há 45 dias" },
    ]
  },
  {
    id: "mlc", name: "MLC 2006 (Maritime Labour)", shortName: "MLC 2006",
    score: 94, totalItems: 98, conformeItems: 92, ncCount: 1, criticalNCs: 0,
    lastAudit: "2025-12-01", nextAudit: "2026-06-01", daysToAudit: 106, trend: "stable",
    route: "/compliance/mlc-inspection", color: "hsl(160, 60%, 45%)", priority: "medium",
    gaps: [
      { area: "Work/Rest Records", severity: "major", description: "2 tripulantes com registros incompletos" },
    ]
  },
  {
    id: "ism", name: "ISM Code (SMS)", shortName: "ISM",
    score: 89, totalItems: 156, conformeItems: 139, ncCount: 4, criticalNCs: 1,
    lastAudit: "2025-09-10", nextAudit: "2026-03-10", daysToAudit: 23, trend: "down",
    route: "/compliance/ism-code", color: "hsl(0, 70%, 55%)", priority: "critical",
    gaps: [
      { area: "Doc Control", severity: "critical", description: "DOC vence em 23 dias — renovação urgente" },
      { area: "Drills", severity: "major", description: "Drill de abandono do navio atrasado 15 dias" },
      { area: "NCR #ISM-042", severity: "major", description: "NC de auditoria externa pendente de fechamento" },
      { area: "MoC", severity: "minor", description: "2 gestões de mudança sem análise de risco" },
    ]
  },
  {
    id: "isps", name: "ISPS Code (Security)", shortName: "ISPS",
    score: 96, totalItems: 72, conformeItems: 69, ncCount: 0, criticalNCs: 0,
    lastAudit: "2025-08-05", nextAudit: "2026-08-05", daysToAudit: 171, trend: "stable",
    route: "/compliance/isps-security", color: "hsl(280, 60%, 55%)", priority: "low",
    gaps: [
      { area: "SSP Review", severity: "minor", description: "Revisão anual do SSP deve ser agendada" },
    ]
  },
  {
    id: "sgso", name: "SGSO (ANP Offshore)", shortName: "SGSO",
    score: 85, totalItems: 145, conformeItems: 123, ncCount: 5, criticalNCs: 2,
    lastAudit: "2025-07-20", nextAudit: "2026-01-20", daysToAudit: -26, trend: "down",
    route: "/compliance/sgso", color: "hsl(45, 80%, 55%)", priority: "critical",
    gaps: [
      { area: "ASG Elem. 6", severity: "critical", description: "Análise de riscos operacionais desatualizada" },
      { area: "ASG Elem. 12", severity: "critical", description: "Análise de incidentes sem investigação completa" },
      { area: "Indicadores", severity: "major", description: "KPIs de segurança não atualizados desde Nov/2025" },
    ]
  },
  {
    id: "tmsa", name: "TMSA (OCIMF)", shortName: "TMSA",
    score: 82, totalItems: 180, conformeItems: 148, ncCount: 6, criticalNCs: 1,
    lastAudit: "2025-06-15", nextAudit: "2026-06-15", daysToAudit: 120, trend: "up",
    route: "/compliance/tmsa", color: "hsl(190, 60%, 45%)", priority: "high",
    gaps: [
      { area: "KPI 3 (Navigation)", severity: "critical", description: "Passage planning gap identificado" },
      { area: "KPI 7 (MoC)", severity: "major", description: "Sistema MoC sem evidências suficientes" },
    ]
  },
];

const PRIORITY_CONFIG = {
  critical: { label: "Urgente", color: "bg-destructive text-destructive-foreground" },
  high: { label: "Alta", color: "bg-warning text-warning-foreground" },
  medium: { label: "Média", color: "bg-primary text-primary-foreground" },
  low: { label: "Baixa", color: "bg-muted text-muted-foreground" },
};

export function CrossFrameworkAuditDashboard() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [vesselFilter, setVesselFilter] = useState("all");
  const navigate = useNavigate();

  const overallScore = Math.round(FRAMEWORKS.reduce((a, f) => a + f.score, 0) / FRAMEWORKS.length);
  const totalNCs = FRAMEWORKS.reduce((a, f) => a + f.ncCount, 0);
  const criticalNCs = FRAMEWORKS.reduce((a, f) => a + f.criticalNCs, 0);
  const totalGaps = FRAMEWORKS.reduce((a, f) => a + f.gaps.length, 0);
  const overdueAudits = FRAMEWORKS.filter(f => f.daysToAudit < 0).length;
  const urgentAudits = FRAMEWORKS.filter(f => f.daysToAudit >= 0 && f.daysToAudit <= 30).length;

  const radarData = FRAMEWORKS.map(f => ({ framework: f.shortName, score: f.score, fullMark: 100 }));
  const barData = FRAMEWORKS.map(f => ({ name: f.shortName, score: f.score, ncs: f.ncCount, gaps: f.gaps.length }));

  const sortedByUrgency = [...FRAMEWORKS].sort((a, b) => a.daysToAudit - b.daysToAudit);

  const allGaps = FRAMEWORKS.flatMap(f => f.gaps.map(g => ({ ...g, framework: f.shortName, route: f.route })));
  const criticalGaps = allGaps.filter(g => g.severity === "critical");
  const majorGaps = allGaps.filter(g => g.severity === "major");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Audit Readiness — Visão Unificada
          </h2>
          <p className="text-muted-foreground">
            {FRAMEWORKS.length} frameworks • {totalGaps} gaps • {totalNCs} NCs abertas • Score Global: {overallScore}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Relatório cross-framework exportado")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.info("AI Gap Analysis iniciada")}>
            <Brain className="h-3 w-3" /> AI Gap Analysis
          </Button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{overallScore}%</p>
          <p className="text-[10px] text-muted-foreground">Score Global</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{FRAMEWORKS.length}</p>
          <p className="text-[10px] text-muted-foreground">Frameworks</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{criticalNCs}</p>
          <p className="text-[10px] text-muted-foreground">NCs Críticas</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold text-warning">{totalNCs}</p>
          <p className="text-[10px] text-muted-foreground">NCs Total</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold">{totalGaps}</p>
          <p className="text-[10px] text-muted-foreground">Gaps</p>
        </CardContent></Card>
        <Card className={overdueAudits > 0 ? "border-destructive/30" : ""}><CardContent className="pt-4 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className={`text-2xl font-bold ${overdueAudits > 0 ? "text-destructive" : ""}`}>{overdueAudits}</p>
          <p className="text-[10px] text-muted-foreground">Auditorias Vencidas</p>
        </CardContent></Card>
        <Card className={urgentAudits > 0 ? "border-warning/30" : ""}><CardContent className="pt-4 text-center">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className={`text-2xl font-bold ${urgentAudits > 0 ? "text-warning" : ""}`}>{urgentAudits}</p>
          <p className="text-[10px] text-muted-foreground">Próximos 30d</p>
        </CardContent></Card>
      </div>

      {/* Critical Alerts */}
      {(overdueAudits > 0 || criticalGaps.length > 0) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-2">
            {overdueAudits > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <strong className="text-destructive">{overdueAudits} auditoria(s) vencida(s)!</strong>
                <span className="text-muted-foreground">— Ação imediata necessária</span>
              </div>
            )}
            {criticalGaps.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <Badge variant="destructive" className="text-[10px]">{g.framework}</Badge>
                <span>{g.area}: {g.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Auditorias</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Conformidade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Radar de Conformidade</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="framework" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Score vs NCs por Framework</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" name="Score %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ncs" fill="hsl(var(--destructive))" name="NCs" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Framework Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {FRAMEWORKS.map(f => (
              <Card key={f.id} className={`cursor-pointer hover:shadow-md transition-shadow ${
                f.daysToAudit < 0 ? "border-destructive/30" :
                f.daysToAudit <= 30 ? "border-warning/30" : ""
              }`} onClick={() => navigate(f.route)}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{f.shortName}</h4>
                    <Badge className={`text-[10px] ${PRIORITY_CONFIG[f.priority].color}`}>
                      {PRIORITY_CONFIG[f.priority].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={f.score} className="flex-1 h-2" />
                    <span className={`text-sm font-bold ${f.score >= 90 ? "text-success" : f.score >= 75 ? "text-warning" : "text-destructive"}`}>{f.score}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="text-xs">
                      <p className="font-bold">{f.conformeItems}/{f.totalItems}</p>
                      <p className="text-muted-foreground">Itens</p>
                    </div>
                    <div className="text-xs">
                      <p className={`font-bold ${f.ncCount > 0 ? "text-destructive" : "text-success"}`}>{f.ncCount}</p>
                      <p className="text-muted-foreground">NCs</p>
                    </div>
                    <div className="text-xs">
                      <p className={`font-bold ${f.daysToAudit < 0 ? "text-destructive" : f.daysToAudit <= 30 ? "text-warning" : ""}`}>
                        {f.daysToAudit < 0 ? `${Math.abs(f.daysToAudit)}d atrás` : `${f.daysToAudit}d`}
                      </p>
                      <p className="text-muted-foreground">Auditoria</p>
                    </div>
                  </div>
                  {f.gaps.length > 0 && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {f.gaps.length} gap(s) — {f.gaps.filter(g => g.severity === "critical").length} crítico(s)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cronograma de Auditorias</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sortedByUrgency.map(f => (
                <div key={f.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  f.daysToAudit < 0 ? "bg-destructive/5 border-destructive/20" :
                  f.daysToAudit <= 30 ? "bg-warning/5 border-warning/20" : ""
                }`}>
                  <div className="w-12 text-center">
                    {f.daysToAudit < 0
                      ? <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                      : f.daysToAudit <= 30
                        ? <Clock className="h-5 w-5 text-warning mx-auto" />
                        : <CheckCircle className="h-5 w-5 text-success mx-auto" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{f.name}</span>
                      <Badge className={`text-[10px] ${PRIORITY_CONFIG[f.priority].color}`}>{PRIORITY_CONFIG[f.priority].label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Última: {f.lastAudit} • Próxima: {f.nextAudit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${f.daysToAudit < 0 ? "text-destructive" : f.daysToAudit <= 30 ? "text-warning" : "text-success"}`}>
                      {f.daysToAudit < 0 ? `${Math.abs(f.daysToAudit)}d vencida` : `${f.daysToAudit}d`}
                    </p>
                    <p className="text-xs text-muted-foreground">Score: {f.score}%</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => navigate(f.route)}>
                    <Eye className="h-3 w-3" /> Abrir
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-3">
          {["critical", "major", "minor"].map(severity => {
            const gaps = allGaps.filter(g => g.severity === severity);
            if (gaps.length === 0) return null;
            return (
              <Card key={severity} className={severity === "critical" ? "border-destructive/30" : severity === "major" ? "border-warning/30" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {severity === "critical" ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-warning" />}
                    {severity === "critical" ? "Gaps Críticos" : severity === "major" ? "Gaps Maiores" : "Gaps Menores"}
                    <Badge variant="outline" className="text-xs">{gaps.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {gaps.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded border text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{g.framework}</Badge>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{g.area}</span>
                        <span className="text-muted-foreground"> — {g.description}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(g.route)}>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Matriz de Conformidade por Framework</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Framework</th>
                      <th className="text-center p-2">Score</th>
                      <th className="text-center p-2">Conformes</th>
                      <th className="text-center p-2">NCs</th>
                      <th className="text-center p-2">Gaps</th>
                      <th className="text-center p-2">Dias p/ Auditoria</th>
                      <th className="text-center p-2">Prioridade</th>
                      <th className="text-center p-2">Tendência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FRAMEWORKS.map(f => (
                      <tr key={f.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => navigate(f.route)}>
                        <td className="p-2 font-medium">{f.name}</td>
                        <td className="p-2 text-center">
                          <Badge variant={f.score >= 90 ? "default" : f.score >= 75 ? "secondary" : "destructive"} className="text-xs">
                            {f.score}%
                          </Badge>
                        </td>
                        <td className="p-2 text-center text-xs">{f.conformeItems}/{f.totalItems}</td>
                        <td className="p-2 text-center">
                          <span className={f.ncCount > 0 ? "text-destructive font-bold" : "text-success"}>{f.ncCount}</span>
                        </td>
                        <td className="p-2 text-center">{f.gaps.length}</td>
                        <td className="p-2 text-center">
                          <span className={f.daysToAudit < 0 ? "text-destructive font-bold" : f.daysToAudit <= 30 ? "text-warning font-bold" : ""}>
                            {f.daysToAudit < 0 ? `${Math.abs(f.daysToAudit)}d vencida` : `${f.daysToAudit}d`}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={`text-[10px] ${PRIORITY_CONFIG[f.priority].color}`}>{PRIORITY_CONFIG[f.priority].label}</Badge>
                        </td>
                        <td className="p-2 text-center">
                          {f.trend === "up" ? <TrendingUp className="h-4 w-4 text-success mx-auto" /> :
                           f.trend === "down" ? <TrendingUp className="h-4 w-4 text-destructive rotate-180 mx-auto" /> :
                           <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
