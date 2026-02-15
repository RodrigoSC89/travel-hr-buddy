/**
 * PEO-DP KPI Dashboard — PEO-DP 2026 (Revisão 5)
 * Indicadores IEODP, PCLVC, AREP e Eventos DP com fórmulas oficiais Petrobras
 * Fórmula IEODP = (%EPP×1 + %EPA×1 + %EPPA×5 + %EBP×4 + %EBT×5 + %AREP×4 + %PCLVC×3) / 23
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Activity, Shield, Anchor, Calculator, Download, Info } from "lucide-react";
import { toast } from "sonner";

// Pesos oficiais PEO-DP 2026 (Anexo B-4)
const PESOS = { EPP: 1, EPA: 1, EPPA: 5, EBP: 4, EBT: 5, AREP: 4, PCLVC: 3 };
const SOMA_PESOS = Object.values(PESOS).reduce((a, b) => a + b, 0); // 23

// Tabela de erros PCLVC (Anexo D-4 / E-4)
const PCLVC_ERROR_TABLE: Record<number, number> = { 0: 100, 1: 85, 2: 75, 3: 55, 4: 35 };
const getPCLVCScore = (errors: number) => errors >= 5 ? 0 : PCLVC_ERROR_TABLE[errors] ?? 0;

// Tabela de eventos DP (Anexo B-4)
const getEventScore = (type: string, count: number) => {
  if (count === 0) return 100;
  switch (type) {
    case "EPP": return 20;
    case "EPA": return 30;
    case "EPPA": return 15;
    case "EBP": return 10;
    case "EBT": return 0;
    default: return 0;
  }
};

// Tabela AREP saldo de dias (Anexo F-1)
const AREP_DELAY_TABLE: Record<number, number> = { 0: 100, 1: 80, 2: 70, 3: 60, 4: 50, 5: 40 };
const getAREPDelayScore = (daysLate: number) => daysLate >= 5 ? 0 : AREP_DELAY_TABLE[daysLate] ?? 0;

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PERIODS_2026 = MONTHS.map((m, i) => ({
  label: m,
  start: `26/${String(i === 0 ? 12 : i).padStart(2, "0")}/${i === 0 ? "2025" : "2026"}`,
  end: `25/${String(i + 1).padStart(2, "0")}/2026`,
}));

// Pilares PEO-DP 2026 (Anexo A-6)
const PILARES = [
  { id: "gestao", name: "1. Gestão", requisitos: 9, peso: "Gestão", items: ["IEODP", "PCLVC", "AREP", "Eventos DP", "Documentos técnicos", "GAP FMEA/CAMO/ASOG", "FMECA", "GAP Manual DP", "Avaliação de desempenho"] },
  { id: "competencias", name: "2. Competências", requisitos: 9, peso: "Competências", items: ["STCW atualizado", "Certificado DPO", "DPO Júnior supervisão", "DP Técnico Máquinas", "Conhecimento sistemas DP", "CDPA designado", "Familiarização", "Instrutor qualificado", "Eletricista qualificado"] },
  { id: "procedimentos", name: "3. Procedimentos", requisitos: 38, peso: "Procedimentos", items: ["Manual Operação DP", "CAMO", "ASOG", "LV Passadiço", "LV Máquinas", "FMEA/FMECA", "DP Trials", "Ordens permanentes", "Configuração DP"] },
  { id: "treinamentos", name: "4. Treinamentos", requisitos: 28, peso: "Treinamentos", items: ["Treinamento contínuo", "Exercícios emergência", "Cenários DP1", "Cenários DP2", "Formulários exercício", "Familiarização", "Reciclagem", "Registros exercícios"] },
  { id: "manutencao", name: "5. Manutenção", requisitos: 20, peso: "Manutenção", items: ["Plano manutenção", "Itens críticos DP", "Sobressalentes", "Calibração thrusters", "Relés proteção", "Hardware/firmware", "Impressoras", "Manutenção preditiva"] },
];

// Simulated monthly data following actual formulas
const generateMonthlyData = () => MONTHS.map((m, i) => {
  const epp = Math.random() > 0.85 ? 1 : 0;
  const epa = Math.random() > 0.9 ? 1 : 0;
  const eppa = Math.random() > 0.95 ? 1 : 0;
  const ebp = Math.random() > 0.8 ? 1 : 0;
  const ebt = Math.random() > 0.95 ? 1 : 0;
  const pclvcErrors = Math.floor(Math.random() * 3);
  const arepDelay = Math.floor(Math.random() * 2);

  const pEPP = getEventScore("EPP", epp);
  const pEPA = getEventScore("EPA", epa);
  const pEPPA = getEventScore("EPPA", eppa);
  const pEBP = getEventScore("EBP", ebp);
  const pEBT = getEventScore("EBT", ebt);
  const pPCLVC = getPCLVCScore(pclvcErrors);
  const pAREP = getAREPDelayScore(arepDelay);

  const ieodp = Math.round(
    (pEPP * PESOS.EPP + pEPA * PESOS.EPA + pEPPA * PESOS.EPPA +
      pEBP * PESOS.EBP + pEBT * PESOS.EBT + pAREP * PESOS.AREP + pPCLVC * PESOS.PCLVC)
    / SOMA_PESOS * 100
  ) / 100;

  return {
    month: m, period: PERIODS_2026[i],
    epp, epa, eppa, ebp, ebt,
    pEPP, pEPA, pEPPA, pEBP, pEBT,
    pclvcErrors, pPCLVC,
    arepDelay, pAREP,
    ieodp,
  };
});

export function PeoDPKPIDashboard() {
  const [period, setPeriod] = useState("2026");
  const [data] = useState(generateMonthlyData);

  const avgIEODP = Math.round(data.reduce((a, d) => a + d.ieodp, 0) / data.length * 100) / 100;
  const totalEvents = data.reduce((a, d) => a + d.epp + d.epa + d.eppa + d.ebp + d.ebt, 0);
  const avgPCLVC = Math.round(data.reduce((a, d) => a + d.pPCLVC, 0) / data.length);
  const avgAREP = Math.round(data.reduce((a, d) => a + d.pAREP, 0) / data.length);
  const pilarScores = PILARES.map(p => ({
    ...p,
    score: Math.round(70 + Math.random() * 28),
    approved: Math.floor(p.requisitos * (0.7 + Math.random() * 0.3)),
  }));

  const radarData = pilarScores.map(p => ({
    subject: p.name.replace(/^\d\. /, ""),
    score: p.score,
    target: 100,
    approved: Math.round((p.approved / p.requisitos) * 100),
  }));

  const chartData = data.map(d => ({
    month: d.month,
    IEODP: d.ieodp,
    PCLVC: d.pPCLVC,
    AREP: d.pAREP,
  }));

  const eventChartData = data.map(d => ({
    month: d.month,
    EPP: d.epp, EPA: d.epa, EPPA: d.eppa, EBP: d.ebp, EBT: d.ebt,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Dashboard IEODP — PEO-DP {period}
          </h3>
          <p className="text-sm text-muted-foreground">
            Índice de Excelência em Operações DP • Fórmula oficial Petrobras (Anexo B-4)
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(KPI_ITEMS || [], "PEO-DP IEODP KPIs")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* Formula Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-3">
          <div className="flex items-start gap-2">
            <Calculator className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-primary">Fórmula IEODP (Anexo B-4)</p>
              <p className="text-xs text-muted-foreground font-mono">
                IEODP = (%EPP×1 + %EPA×1 + %EPPA×5 + %EBP×4 + %EBT×5 + %AREP×4 + %PCLVC×3) / 23
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 col-span-2 md:col-span-1">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">IEODP Médio</p>
            <p className="text-3xl font-bold text-primary">{avgIEODP}%</p>
            <Badge variant="outline" className="text-xs mt-1">Meta: 100%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">PCLVC</p>
            <p className={`text-2xl font-bold ${avgPCLVC >= 85 ? "text-success" : "text-warning"}`}>{avgPCLVC}%</p>
            <p className="text-xs text-muted-foreground">Peso: ×3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">AREP</p>
            <p className={`text-2xl font-bold ${avgAREP >= 80 ? "text-success" : "text-warning"}`}>{avgAREP}%</p>
            <p className="text-xs text-muted-foreground">Peso: ×4</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Eventos DP Total</p>
            <p className="text-2xl font-bold text-destructive">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">Peso: ×1~5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">5 Pilares</p>
            <p className="text-2xl font-bold">{PILARES.reduce((a, p) => a + p.requisitos, 0)}</p>
            <p className="text-xs text-muted-foreground">requisitos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Períodos</p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">26→25 cada mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ieodp">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ieodp">IEODP Trend</TabsTrigger>
          <TabsTrigger value="events">Eventos DP</TabsTrigger>
          <TabsTrigger value="pclvc">PCLVC Detalhado</TabsTrigger>
          <TabsTrigger value="pilares">5 Pilares</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="tabelas">Tabelas Oficiais</TabsTrigger>
        </TabsList>

        <TabsContent value="ieodp">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">IEODP — Índice de Excelência em Operações DP (mensal)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="IEODP" name="IEODP" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="PCLVC" name="PCLVC" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={1} />
                  <Area type="monotone" dataKey="AREP" name="AREP" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Eventos DP por Período (26→25 de cada mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="EPP" name="Perda Posição" fill="hsl(var(--destructive))" />
                  <Bar dataKey="EPA" name="Perda Aproamento" fill="hsl(var(--warning))" />
                  <Bar dataKey="EPPA" name="Perda Pos+Apr (×5)" fill="hsl(var(--chart-5))" />
                  <Bar dataKey="EBP" name="Blackout Parcial (×4)" fill="hsl(var(--chart-4))" />
                  <Bar dataKey="EBT" name="Blackout Total (×5)" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
                {[
                  { label: "EPP", desc: "Perda de Posição", peso: 1, pct: "20%" },
                  { label: "EPA", desc: "Perda de Aproamento", peso: 1, pct: "30%" },
                  { label: "EPPA", desc: "Perda Pos+Apr", peso: 5, pct: "15%" },
                  { label: "EBP", desc: "Blackout Parcial", peso: 4, pct: "10%" },
                  { label: "EBT", desc: "Blackout Total", peso: 5, pct: "0%" },
                ].map(e => (
                  <div key={e.label} className="p-2 rounded bg-muted/50 text-center">
                    <p className="font-bold">{e.label}</p>
                    <p className="text-muted-foreground">{e.desc}</p>
                    <p>Peso: <strong>×{e.peso}</strong></p>
                    <p>≥1 evento: <strong>{e.pct}</strong></p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pclvc">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">PCLVC — Preenchimento Correto das Listas de Verificação de Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tabela de Erros por Lista (Anexo D-4)</h4>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left">Quantidade de Erros</th>
                        <th className="border p-2 text-right">% PPC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4].map(e => (
                        <tr key={e}>
                          <td className="border p-2">{e}</td>
                          <td className="border p-2 text-right font-bold">{getPCLVCScore(e)}%</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="border p-2">≥ 5 erros</td>
                        <td className="border p-2 text-right font-bold text-destructive">0%</td>
                      </tr>
                      <tr>
                        <td className="border p-2 text-destructive">Não entrega de documentos</td>
                        <td className="border p-2 text-right font-bold text-destructive">0% + exclusão</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">PCLVC por Período</h4>
                  <div className="space-y-2">
                    {data.map(d => (
                      <div key={d.month} className="flex items-center gap-2">
                        <span className="text-xs w-8">{d.month}</span>
                        <div className="flex-1 bg-muted rounded-full h-4">
                          <div className={`h-4 rounded-full ${d.pPCLVC >= 85 ? "bg-success" : d.pPCLVC >= 55 ? "bg-warning" : "bg-destructive"}`}
                            style={{ width: `${d.pPCLVC}%` }} />
                        </div>
                        <span className="text-xs font-bold w-10 text-right">{d.pPCLVC}%</span>
                        <Badge variant="outline" className="text-xs">{d.pclvcErrors} erros</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pilares">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">5 Pilares do PEO-DP 2026 (Anexo A-6)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pilarScores.map(p => (
                <div key={p.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.requisitos} requisitos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.score >= 90 ? "outline" : p.score >= 70 ? "secondary" : "destructive"}>
                        {p.score}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">{p.approved}/{p.requisitos} aprovados</span>
                    </div>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${p.score >= 90 ? "bg-success" : p.score >= 70 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${p.score}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.items.slice(0, 6).map(item => (
                      <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                    {p.items.length > 6 && <Badge variant="outline" className="text-xs">+{p.items.length - 6}</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Score (%)" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Aprovados (%)" dataKey="approved" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabelas">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tabela de Pesos IEODP</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-2 text-left">Indicador/Evento</th>
                      <th className="border p-2 text-center">Peso</th>
                      <th className="border p-2 text-center">0 eventos</th>
                      <th className="border p-2 text-center">≥1 evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2">EPP (Perda Posição)</td><td className="border p-2 text-center font-bold">1</td><td className="border p-2 text-center">100%</td><td className="border p-2 text-center">20%</td></tr>
                    <tr><td className="border p-2">EPA (Perda Aproamento)</td><td className="border p-2 text-center font-bold">1</td><td className="border p-2 text-center">100%</td><td className="border p-2 text-center">30%</td></tr>
                    <tr><td className="border p-2">EPPA (Perda Pos+Apr)</td><td className="border p-2 text-center font-bold">5</td><td className="border p-2 text-center">100%</td><td className="border p-2 text-center">15%</td></tr>
                    <tr><td className="border p-2">EBP (Blackout Parcial)</td><td className="border p-2 text-center font-bold">4</td><td className="border p-2 text-center">100%</td><td className="border p-2 text-center">10%</td></tr>
                    <tr><td className="border p-2">EBT (Blackout Total)</td><td className="border p-2 text-center font-bold">5</td><td className="border p-2 text-center">100%</td><td className="border p-2 text-center text-destructive font-bold">0%</td></tr>
                    <tr><td className="border p-2">AREP</td><td className="border p-2 text-center font-bold">4</td><td className="border p-2 text-center" colSpan={2}>Conforme tabela saldo dias</td></tr>
                    <tr><td className="border p-2">PCLVC</td><td className="border p-2 text-center font-bold">3</td><td className="border p-2 text-center" colSpan={2}>Conforme tabela erros</td></tr>
                    <tr className="bg-muted/50 font-bold"><td className="border p-2">TOTAL</td><td className="border p-2 text-center">23</td><td className="border p-2 text-center" colSpan={2}>Melhor resultado: 100%</td></tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tabela AREP — Saldo de Dias</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-2 text-left">Saldo de Dias de Atraso</th>
                      <th className="border p-2 text-right">% Entrega</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0, -1, -2, -3, -4, -5].map(d => (
                      <tr key={d}>
                        <td className="border p-2">{d === 0 ? "No prazo (0)" : `${d} dias`}</td>
                        <td className="border p-2 text-right font-bold">{getAREPDelayScore(Math.abs(d))}%</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border p-2 text-destructive">≥ 5 dias de atraso</td>
                      <td className="border p-2 text-right font-bold text-destructive">0%</td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-destructive">Não entregou Plano de Ação</td>
                      <td className="border p-2 text-right font-bold text-destructive">0%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  Somar os dias de atraso das 3 entregas e comparar com a tabela. Ex: 1ª entrega 3 dias + 2ª 1 dia + 3ª 0 dias = 4 dias → 50%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
