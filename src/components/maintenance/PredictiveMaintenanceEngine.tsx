/**
 * PredictiveMaintenanceEngine - AI-driven maintenance predictions
 * Running hours analysis, MTBF/MTTR metrics, auto intervention recommendations
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, AlertTriangle, TrendingUp, Clock, Activity, 
  Zap, ThermometerSun, BarChart3, CheckCircle2, ShieldAlert 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

interface Equipment {
  id: string;
  name: string;
  system: string;
  runningHours: number;
  maxHours: number;
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  failureProbability: number; // 0-100
  nextMaintenanceDue: string;
  status: "healthy" | "warning" | "critical";
  recommendation: string;
  riskFactors: string[];
  trend: number[]; // last 6 months health trend
}

function generateEquipment(): Equipment[] {
  return [
    {
      id: "1", name: "Main Engine #1", system: "Propulsion",
      runningHours: 14200, maxHours: 15000, mtbf: 4500, mttr: 72,
      failureProbability: 78, nextMaintenanceDue: "2026-03-15", status: "critical",
      recommendation: "Overhaul programado urgente — running hours em 94.7% do limite",
      riskFactors: ["Vibração acima do normal", "Consumo óleo lubrificante elevado", "Temperatura exhaust +12°C"],
      trend: [92, 88, 85, 80, 76, 72],
    },
    {
      id: "2", name: "Aux Generator #2", system: "Electrical",
      runningHours: 8400, maxHours: 12000, mtbf: 6000, mttr: 24,
      failureProbability: 35, nextMaintenanceDue: "2026-05-20", status: "warning",
      recommendation: "Inspeção de filtros e análise de óleo programada para próximo porto",
      riskFactors: ["Queda de eficiência 3%", "Último serviço há 2800h"],
      trend: [95, 93, 91, 88, 86, 84],
    },
    {
      id: "3", name: "Bow Thruster", system: "Maneuvering",
      runningHours: 2100, maxHours: 5000, mtbf: 8000, mttr: 48,
      failureProbability: 12, nextMaintenanceDue: "2026-08-01", status: "healthy",
      recommendation: "Operação normal — próxima manutenção preventiva conforme PMS",
      riskFactors: [],
      trend: [98, 97, 97, 96, 96, 95],
    },
    {
      id: "4", name: "Ballast Pump #1", system: "Hull",
      runningHours: 6800, maxHours: 8000, mtbf: 5500, mttr: 16,
      failureProbability: 55, nextMaintenanceDue: "2026-04-10", status: "warning",
      recommendation: "Substituição de selo mecânico recomendada — padrão de vazamento detectado",
      riskFactors: ["Vazamento micro selo", "Pressão diferencial -8%"],
      trend: [90, 87, 83, 80, 77, 74],
    },
    {
      id: "5", name: "HVAC Central", system: "Accommodation",
      runningHours: 11000, maxHours: 15000, mtbf: 7000, mttr: 8,
      failureProbability: 20, nextMaintenanceDue: "2026-07-01", status: "healthy",
      recommendation: "Limpeza de filtros e recarga de gás programada",
      riskFactors: ["Capacidade de refrigeração -5%"],
      trend: [96, 95, 94, 93, 92, 91],
    },
    {
      id: "6", name: "Steering Gear", system: "Navigation",
      runningHours: 9500, maxHours: 10000, mtbf: 9000, mttr: 36,
      failureProbability: 62, nextMaintenanceDue: "2026-03-28", status: "critical",
      recommendation: "Inspeção SOLAS obrigatória — running hours próximo do limite classe",
      riskFactors: ["Running hours 95% do limite", "Ruído hidráulico anormal", "Tempo de resposta +15%"],
      trend: [88, 84, 80, 76, 73, 70],
    },
  ];
}

export function PredictiveMaintenanceEngine() {
  const [tab, setTab] = useState("overview");
  const equipment = useMemo(generateEquipment, []);

  const stats = useMemo(() => ({
    critical: equipment.filter(e => e.status === "critical").length,
    warning: equipment.filter(e => e.status === "warning").length,
    healthy: equipment.filter(e => e.status === "healthy").length,
    avgMTBF: Math.round(equipment.reduce((a, e) => a + e.mtbf, 0) / equipment.length),
    avgMTTR: Math.round(equipment.reduce((a, e) => a + e.mttr, 0) / equipment.length),
    avgReliability: Math.round(equipment.reduce((a, e) => a + (100 - e.failureProbability), 0) / equipment.length),
  }), [equipment]);

  const mtbfData = equipment.map(e => ({
    name: e.name.replace(/^(Main |Aux |Bow )/, "").slice(0, 12),
    MTBF: e.mtbf,
    MTTR: e.mttr * 10, // scale for visibility
  }));

  const trendData = ["Set", "Out", "Nov", "Dez", "Jan", "Fev"].map((m, i) => ({
    month: m,
    ...Object.fromEntries(equipment.slice(0, 4).map(e => [e.name.split(" ")[0] + e.name.split(" ").pop(), e.trend[i]])),
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Motor Preditivo de Manutenção</CardTitle>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
              <span className="text-muted-foreground">Crítico:</span>
              <span className="font-bold text-destructive">{stats.critical}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-chart-4" />
              <span className="text-muted-foreground">Atenção:</span>
              <span className="font-bold text-chart-4">{stats.warning}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-muted-foreground">Saudável:</span>
              <span className="font-bold text-chart-2">{stats.healthy}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="overview" className="text-xs gap-1"><Activity className="h-3.5 w-3.5" /> Visão Geral</TabsTrigger>
            <TabsTrigger value="mtbf" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> MTBF / MTTR</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs gap-1"><TrendingUp className="h-3.5 w-3.5" /> Tendências</TabsTrigger>
          </TabsList>

          {/* Overview - Equipment cards */}
          <TabsContent value="overview" className="mt-0 space-y-2.5">
            {equipment
              .sort((a, b) => b.failureProbability - a.failureProbability)
              .map(eq => (
                <div key={eq.id} className={`p-3 rounded-lg border ${
                  eq.status === "critical" ? "border-destructive/30 bg-destructive/5" :
                  eq.status === "warning" ? "border-chart-4/20 bg-chart-4/5" : "border-border/20 bg-muted/10"
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{eq.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{eq.system}</span>
                    </div>
                    <Badge variant={eq.status === "critical" ? "destructive" : eq.status === "warning" ? "outline" : "secondary"} className="text-[10px]">
                      {eq.failureProbability}% risco
                    </Badge>
                  </div>

                  {/* Running hours bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>Running Hours: {eq.runningHours.toLocaleString()}h</span>
                      <span>Limite: {eq.maxHours.toLocaleString()}h</span>
                    </div>
                    <Progress 
                      value={(eq.runningHours / eq.maxHours) * 100} 
                      className="h-1.5" 
                    />
                  </div>

                  {/* Metrics row */}
                  <div className="flex gap-4 text-[10px] text-muted-foreground mb-1.5">
                    <span>MTBF: <b className="text-foreground">{eq.mtbf.toLocaleString()}h</b></span>
                    <span>MTTR: <b className="text-foreground">{eq.mttr}h</b></span>
                    <span>Próx. manutenção: <b className="text-foreground">{new Date(eq.nextMaintenanceDue).toLocaleDateString("pt-BR")}</b></span>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-start gap-1.5 text-xs text-foreground bg-muted/30 rounded p-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {eq.recommendation}
                  </div>

                  {/* Risk factors */}
                  {eq.riskFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {eq.riskFactors.map(r => (
                        <Badge key={r} variant="outline" className="text-[9px] border-destructive/20 text-destructive/80">{r}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </TabsContent>

          {/* MTBF / MTTR Chart */}
          <TabsContent value="mtbf" className="mt-0">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 text-center">
                <p className="text-[10px] text-muted-foreground">MTBF Médio</p>
                <p className="text-xl font-bold text-foreground">{stats.avgMTBF.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">h</span></p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 text-center">
                <p className="text-[10px] text-muted-foreground">MTTR Médio</p>
                <p className="text-xl font-bold text-foreground">{stats.avgMTTR}<span className="text-xs font-normal text-muted-foreground">h</span></p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 text-center">
                <p className="text-[10px] text-muted-foreground">Confiabilidade</p>
                <p className="text-xl font-bold text-chart-2">{stats.avgReliability}<span className="text-xs font-normal text-muted-foreground">%</span></p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mtbfData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip 
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number, name: string) => [name === "MTTR" ? `${value / 10}h` : `${value}h`, name]}
                />
                <Bar dataKey="MTBF" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MTTR" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Health Trends */}
          <TabsContent value="trends" className="mt-0">
            <p className="text-xs text-muted-foreground mb-3">Evolução do índice de saúde dos equipamentos críticos nos últimos 6 meses.</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip 
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                />
                {equipment.slice(0, 4).map((e, i) => {
                  const key = e.name.split(" ")[0] + e.name.split(" ").pop();
                  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
                  return <Line key={key} type="monotone" dataKey={key} stroke={colors[i]} strokeWidth={2} dot={{ r: 3 }} name={e.name} />;
                })}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PredictiveMaintenanceEngine;
