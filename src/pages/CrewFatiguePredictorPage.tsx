/**
 * Crew Fatigue Predictor - AI-driven fatigue risk management
 * STCW Work/Rest Hours compliance with predictive analytics
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, AlertTriangle, Users, Clock, Moon, Activity, TrendingUp, Shield, Eye, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  fatigueScore: number;
  workHours24h: number;
  restHours24h: number;
  workHours7d: number;
  consecutiveDays: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  stcwCompliant: boolean;
  predictedFatigue48h: number;
  factors: { sleep: number; workload: number; circadian: number; environment: number; stress: number };
}

const CREW_DATA: CrewMember[] = [
  { id: "1", name: "Cap. André Silva", rank: "Master", vessel: "MV Atlantic Star", fatigueScore: 28, workHours24h: 8, restHours24h: 16, workHours7d: 52, consecutiveDays: 45, riskLevel: "low", stcwCompliant: true, predictedFatigue48h: 32, factors: { sleep: 85, workload: 65, circadian: 90, environment: 80, stress: 70 } },
  { id: "2", name: "1º Of. Carlos Mendes", rank: "Chief Officer", vessel: "MV Atlantic Star", fatigueScore: 55, workHours24h: 12, restHours24h: 12, workHours7d: 68, consecutiveDays: 60, riskLevel: "medium", stcwCompliant: true, predictedFatigue48h: 62, factors: { sleep: 60, workload: 75, circadian: 70, environment: 65, stress: 80 } },
  { id: "3", name: "Eng. Ricardo Costa", rank: "Chief Engineer", vessel: "MV Pacific Voyager", fatigueScore: 72, workHours24h: 14, restHours24h: 10, workHours7d: 78, consecutiveDays: 85, riskLevel: "high", stcwCompliant: false, predictedFatigue48h: 81, factors: { sleep: 40, workload: 85, circadian: 55, environment: 50, stress: 90 } },
  { id: "4", name: "2º Of. Maria Santos", rank: "2nd Officer", vessel: "MV Pacific Voyager", fatigueScore: 85, workHours24h: 16, restHours24h: 8, workHours7d: 84, consecutiveDays: 90, riskLevel: "critical", stcwCompliant: false, predictedFatigue48h: 93, factors: { sleep: 25, workload: 95, circadian: 40, environment: 45, stress: 95 } },
  { id: "5", name: "3º Of. Paulo Ferreira", rank: "3rd Officer", vessel: "MV Atlantic Star", fatigueScore: 42, workHours24h: 10, restHours24h: 14, workHours7d: 58, consecutiveDays: 30, riskLevel: "medium", stcwCompliant: true, predictedFatigue48h: 48, factors: { sleep: 72, workload: 70, circadian: 80, environment: 75, stress: 60 } },
  { id: "6", name: "Eng. João Lima", rank: "2nd Engineer", vessel: "MV Indian Explorer", fatigueScore: 65, workHours24h: 13, restHours24h: 11, workHours7d: 72, consecutiveDays: 70, riskLevel: "high", stcwCompliant: false, predictedFatigue48h: 74, factors: { sleep: 50, workload: 80, circadian: 60, environment: 55, stress: 85 } },
];

const trendData = [
  { day: "Seg", avgFatigue: 42, incidents: 0, compliance: 95 },
  { day: "Ter", avgFatigue: 45, incidents: 0, compliance: 93 },
  { day: "Qua", avgFatigue: 50, incidents: 1, compliance: 90 },
  { day: "Qui", avgFatigue: 55, incidents: 1, compliance: 87 },
  { day: "Sex", avgFatigue: 62, incidents: 2, compliance: 82 },
  { day: "Sáb", avgFatigue: 58, incidents: 1, compliance: 85 },
  { day: "Dom", avgFatigue: 48, incidents: 0, compliance: 92 },
];

const riskColor = (level: string) => {
  switch (level) {
    case "low": return "text-emerald-400 bg-emerald-500/10";
    case "medium": return "text-amber-400 bg-amber-500/10";
    case "high": return "text-orange-400 bg-orange-500/10";
    case "critical": return "text-red-400 bg-red-500/10";
    default: return "";
  }
};

export default function CrewFatiguePredictorPage() {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);

  const stats = useMemo(() => ({
    total: CREW_DATA.length,
    critical: CREW_DATA.filter(c => c.riskLevel === "critical").length,
    high: CREW_DATA.filter(c => c.riskLevel === "high").length,
    nonCompliant: CREW_DATA.filter(c => !c.stcwCompliant).length,
    avgFatigue: Math.round(CREW_DATA.reduce((s, c) => s + c.fatigueScore, 0) / CREW_DATA.length),
  }), []);

  const radarData = selectedCrew ? [
    { factor: "Sono", value: selectedCrew.factors.sleep },
    { factor: "Carga", value: 100 - selectedCrew.factors.workload },
    { factor: "Circadiano", value: selectedCrew.factors.circadian },
    { factor: "Ambiente", value: selectedCrew.factors.environment },
    { factor: "Estresse", value: 100 - selectedCrew.factors.stress },
  ] : [];

  return (
    <div className="space-y-4 py-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Crew Fatigue Predictor
          <Badge variant="secondary">AI + STCW</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predição de fadiga com IA • Conformidade STCW Work/Rest • Análise em tempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Monitorados</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-400 mb-1" />
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-xs text-muted-foreground">Risco Crítico</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <Eye className="h-5 w-5 mx-auto text-orange-400 mb-1" />
            <p className="text-2xl font-bold text-orange-400">{stats.high}</p>
            <p className="text-xs text-muted-foreground">Risco Alto</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Shield className="h-5 w-5 mx-auto text-amber-400 mb-1" />
            <p className="text-2xl font-bold text-amber-400">{stats.nonCompliant}</p>
            <p className="text-xs text-muted-foreground">Não STCW</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{stats.avgFatigue}%</p>
            <p className="text-xs text-muted-foreground">Fadiga Média</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitor">
        <TabsList>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="analysis">Análise Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid gap-3">
            {CREW_DATA.sort((a, b) => b.fatigueScore - a.fatigueScore).map((crew) => (
              <Card
                key={crew.id}
                className={cn(
                  "border-border/50 cursor-pointer transition-all hover:border-primary/50",
                  selectedCrew?.id === crew.id && "border-primary"
                )}
                onClick={() => setSelectedCrew(crew)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{crew.name}</h3>
                        <Badge className={cn("text-[10px]", riskColor(crew.riskLevel))}>{crew.riskLevel.toUpperCase()}</Badge>
                        {!crew.stcwCompliant && (
                          <Badge variant="destructive" className="text-[10px]">STCW ⚠️</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{crew.rank} • {crew.vessel}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Trab/24h</p>
                        <p className="font-mono font-bold">{crew.workHours24h}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Desc/24h</p>
                        <p className="font-mono font-bold">{crew.restHours24h}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Trab/7d</p>
                        <p className="font-mono font-bold">{crew.workHours7d}h</p>
                      </div>
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Fadiga</span>
                          <span className="font-bold">{crew.fatigueScore}%</span>
                        </div>
                        <Progress
                          value={crew.fatigueScore}
                          className={cn(
                            "h-2",
                            crew.fatigueScore >= 80 ? "[&>div]:bg-red-500" :
                            crew.fatigueScore >= 60 ? "[&>div]:bg-orange-500" :
                            crew.fatigueScore >= 40 ? "[&>div]:bg-amber-500" :
                            "[&>div]:bg-emerald-500"
                          )}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Pred. 48h</p>
                        <p className={cn("font-mono font-bold", crew.predictedFatigue48h >= 80 ? "text-red-400" : crew.predictedFatigue48h >= 60 ? "text-orange-400" : "")}>
                          {crew.predictedFatigue48h}%
                          <TrendingUp className="h-3 w-3 inline ml-0.5" />
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Tendência Semanal de Fadiga</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgFatigue" name="Fadiga Média %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  <Line type="monotone" dataKey="compliance" name="Compliance STCW %" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {selectedCrew ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">Perfil de Fadiga: {selectedCrew.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Recomendações IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCrew.fatigueScore >= 70 && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm font-medium text-red-400">⚠️ Ação Imediata</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reduzir carga de trabalho para máximo 8h/dia. Garantir período de descanso mínimo de 10h ininterruptas.
                      </p>
                    </div>
                  )}
                  {!selectedCrew.stcwCompliant && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-sm font-medium text-amber-400">📋 Violação STCW</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Horas de trabalho excedem o limite de 14h em 24h ou 72h em 7 dias. Ajustar escala imediatamente.
                      </p>
                    </div>
                  )}
                  {selectedCrew.consecutiveDays > 60 && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm font-medium text-blue-400">🔄 Rotação Sugerida</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCrew.consecutiveDays} dias consecutivos a bordo. Programar desembarque em até 15 dias.
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium">📊 Predição 48h</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fadiga estimada: <strong>{selectedCrew.predictedFatigue48h}%</strong>. 
                      {selectedCrew.predictedFatigue48h > selectedCrew.fatigueScore 
                        ? " Tendência de piora detectada." 
                        : " Tendência estável."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Moon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Selecione um tripulante no monitor para ver a análise detalhada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
