/**
 * PEO-DP KPI Dashboard - IPCLV, Drift-Off, Drive-Off, Large Excursion monitoring
 * Petrobras PEO-DP 2021 indicator tracking
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Activity, Shield, Anchor } from "lucide-react";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const IPCLV_DATA = MONTHS.map((m, i) => ({
  month: m,
  target: 95,
  actual: Math.min(100, Math.max(85, 92 + Math.random() * 8)),
  previous: Math.min(100, Math.max(80, 88 + Math.random() * 10)),
}));

const EVENT_DATA = MONTHS.map((m) => ({
  month: m,
  drift_off: Math.floor(Math.random() * 3),
  drive_off: Math.floor(Math.random() * 2),
  large_excursion: Math.floor(Math.random() * 2),
}));

const SECTION_SCORES = [
  { section: "3.1 Gerenciamento", score: 92, target: 90, items: 8 },
  { section: "3.2 Recursos", score: 88, target: 85, items: 7 },
  { section: "3.3 Treinamento", score: 95, target: 90, items: 9 },
  { section: "3.4 Operação", score: 84, target: 90, items: 12 },
  { section: "3.5 Manutenção", score: 91, target: 85, items: 10 },
  { section: "3.6 Emergências", score: 78, target: 85, items: 5 },
  { section: "3.7 Melhorias", score: 87, target: 80, items: 3 },
];

const RADAR_DATA = SECTION_SCORES.map(s => ({
  subject: s.section.replace(/\d\.\d /, ""),
  score: s.score,
  target: s.target,
}));

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--success))"];

export function PeoDPKPIDashboard() {
  const [period, setPeriod] = useState("2025");
  const totalDriftOff = EVENT_DATA.reduce((a, e) => a + e.drift_off, 0);
  const totalDriveOff = EVENT_DATA.reduce((a, e) => a + e.drive_off, 0);
  const totalExcursion = EVENT_DATA.reduce((a, e) => a + e.large_excursion, 0);
  const avgIPCLV = Math.round(IPCLV_DATA.reduce((a, d) => a + d.actual, 0) / IPCLV_DATA.length * 10) / 10;
  const overallConformity = Math.round(SECTION_SCORES.reduce((a, s) => a + s.score, 0) / SECTION_SCORES.length * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dashboard KPI — PEO-DP Petrobras</h3>
          <p className="text-sm text-muted-foreground">Indicadores IPCLV, eventos DP e conformidade por seção</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">IPCLV Médio</p>
            <p className="text-3xl font-bold text-primary">{avgIPCLV}%</p>
            <Badge variant={avgIPCLV >= 95 ? "outline" : "destructive"} className="text-xs mt-1">
              Meta: 95%
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Conformidade Geral</p>
            <p className="text-3xl font-bold">{overallConformity}%</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {overallConformity >= 85 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className="text-xs text-muted-foreground">7 seções</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Drift-Off</p>
            <p className="text-2xl font-bold text-destructive">{totalDriftOff}</p>
            <p className="text-xs text-muted-foreground">eventos no período</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Drive-Off</p>
            <p className="text-2xl font-bold text-warning">{totalDriveOff}</p>
            <p className="text-xs text-muted-foreground">eventos no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Large Excursion</p>
            <p className="text-2xl font-bold">{totalExcursion}</p>
            <p className="text-xs text-muted-foreground">eventos no período</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ipclv">
        <TabsList>
          <TabsTrigger value="ipclv">IPCLV Trend</TabsTrigger>
          <TabsTrigger value="events">Eventos DP</TabsTrigger>
          <TabsTrigger value="sections">Conformidade Seções</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
        </TabsList>

        <TabsContent value="ipclv">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">IPCLV — Índice de Performance de Classe Limitada por Variação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={IPCLV_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="IPCLV Atual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" name="Meta" stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="previous" name="Ano Anterior" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Eventos DP por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={EVENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="drift_off" name="Drift-Off" fill="hsl(var(--destructive))" />
                  <Bar dataKey="drive_off" name="Drive-Off" fill="hsl(var(--warning))" />
                  <Bar dataKey="large_excursion" name="Large Excursion" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardContent className="pt-4 space-y-3">
              {SECTION_SCORES.map(s => (
                <div key={s.section} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-40 truncate">{s.section}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div className={`h-3 rounded-full ${s.score >= s.target ? "bg-success" : "bg-warning"}`} style={{ width: `${s.score}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${s.score >= s.target ? "text-success" : "text-warning"}`}>{s.score}%</span>
                      <span className="text-xs text-muted-foreground">Meta: {s.target}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{s.items} itens</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Meta" dataKey="target" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
