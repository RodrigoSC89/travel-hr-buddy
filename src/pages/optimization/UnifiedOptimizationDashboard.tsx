/**
 * Dashboard Unificado de Otimização
 * Integra Monte Carlo + Quantum Router + Energy Optimizer
 * Visualização comparativa de resultados
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Cpu,
  Fuel,
  TrendingUp,
  TrendingDown,
  Play,
  BarChart3,
  Atom,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Compass,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart
} from "recharts";

// Types
interface ModuleResult {
  id: string;
  name: string;
  status: "idle" | "running" | "complete" | "error";
  lastRun?: Date;
  metrics: {
    fuelSavings: number;
    costSavings: number;
    timeSavings: number;
    riskScore: number;
    confidence: number;
  };
  recommendation?: string;
}

interface ComparisonData {
  metric: string;
  monteCarlo: number;
  quantumRouter: number;
  energyOptimizer: number;
  best: string;
}

// Mock data for comparison
const generateComparisonData = (): ComparisonData[] => [
  { metric: "Economia Combustível (%)", monteCarlo: 8.5, quantumRouter: 12.3, energyOptimizer: 9.8, best: "quantumRouter" },
  { metric: "Redução Custo (%)", monteCarlo: 11.2, quantumRouter: 15.6, energyOptimizer: 10.4, best: "quantumRouter" },
  { metric: "Redução Tempo (%)", monteCarlo: 5.1, quantumRouter: 8.7, energyOptimizer: 3.2, best: "quantumRouter" },
  { metric: "Score Risco (0-100)", monteCarlo: 82, quantumRouter: 88, energyOptimizer: 75, best: "quantumRouter" },
  { metric: "Confiança (%)", monteCarlo: 94, quantumRouter: 89, energyOptimizer: 92, best: "monteCarlo" },
];

const radarData = [
  { subject: "Combustível", mc: 85, qr: 95, eo: 88, fullMark: 100 },
  { subject: "Custo", mc: 88, qr: 92, eo: 82, fullMark: 100 },
  { subject: "Tempo", mc: 75, qr: 90, eo: 72, fullMark: 100 },
  { subject: "Risco", mc: 82, qr: 88, eo: 75, fullMark: 100 },
  { subject: "Emissões", mc: 80, qr: 85, eo: 95, fullMark: 100 },
  { subject: "Confiança", mc: 94, qr: 89, eo: 92, fullMark: 100 },
];

const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  monteCarlo: 85 + Math.random() * 10 - 5,
  quantumRouter: 90 + Math.random() * 8 - 4,
  energyOptimizer: 82 + Math.random() * 12 - 6,
}));

const scenarioResults = [
  { scenario: "Normal", mc: 125000, qr: 118500, eo: 128200 },
  { scenario: "Tempestade", mc: 142000, qr: 130800, eo: 145600 },
  { scenario: "Alta Demanda", mc: 138500, qr: 125400, eo: 140100 },
  { scenario: "Rota Alternativa", mc: 132000, qr: 119200, eo: 135800 },
];

export default function UnifiedOptimizationDashboard() {
  const [modules, setModules] = useState<ModuleResult[]>([
    {
      id: "monte-carlo",
      name: "Monte Carlo Simulator",
      status: "complete",
      lastRun: new Date(Date.now() - 3600000),
      metrics: { fuelSavings: 8.5, costSavings: 45200, timeSavings: 4.2, riskScore: 82, confidence: 94 },
      recommendation: "Cenário B apresenta melhor relação custo-benefício com 94% de confiança"
    },
    {
      id: "quantum-router",
      name: "Quantum Router",
      status: "complete",
      lastRun: new Date(Date.now() - 1800000),
      metrics: { fuelSavings: 12.3, costSavings: 62800, timeSavings: 6.8, riskScore: 88, confidence: 89 },
      recommendation: "Rota otimizada via QAOA reduz 12.3% combustível evitando zona de risco"
    },
    {
      id: "energy-optimizer",
      name: "Energy Optimizer (OPEC)",
      status: "complete",
      lastRun: new Date(Date.now() - 7200000),
      metrics: { fuelSavings: 9.8, costSavings: 52100, timeSavings: 2.1, riskScore: 75, confidence: 92 },
      recommendation: "Redução de 50 RPM gera economia de $1,350/dia mantendo ETA"
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const comparisonData = useMemo(() => generateComparisonData(), []);

  const runAllModules = async () => {
    setIsRunning(true);
    setModules(prev => prev.map(m => ({ ...m, status: "running" as const })));

    // Simulate sequential module execution
    for (let i = 0; i < modules.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setModules(prev => prev.map((m, idx) => 
        idx === i ? { ...m, status: "complete" as const, lastRun: new Date() } : m
      ));
    }

    setIsRunning(false);
  };

  const getBestModule = () => {
    const sorted = [...modules].sort((a, b) => b.metrics.costSavings - a.metrics.costSavings);
    return sorted[0];
  };

  const bestModule = getBestModule();
  const totalPotentialSavings = modules.reduce((sum, m) => sum + m.metrics.costSavings, 0) / 3;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Atom className="h-8 w-8 text-primary" />
            Centro de Otimização Unificado
          </h1>
          <p className="text-muted-foreground mt-1">
            Monte Carlo + Quantum Router + Energy Optimizer • Análise Comparativa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Última execução: {new Date().toLocaleTimeString("pt-BR")}
          </Badge>
          <Button onClick={runAllModules} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Todos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Module Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className={`${module.id === bestModule.id ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {module.id === "monte-carlo" && <Calculator className="h-5 w-5 text-blue-500" />}
                  {module.id === "quantum-router" && <Cpu className="h-5 w-5 text-purple-500" />}
                  {module.id === "energy-optimizer" && <Fuel className="h-5 w-5 text-green-500" />}
                  {module.name}
                </CardTitle>
                <Badge variant={module.status === "complete" ? "default" : module.status === "running" ? "secondary" : "outline"}>
                  {module.status === "complete" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {module.status === "running" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  {module.status}
                </Badge>
              </div>
              {module.id === bestModule.id && (
                <Badge variant="default" className="w-fit bg-primary/20 text-primary mt-1">
                  🏆 Melhor Resultado
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Economia Combustível</p>
                  <p className="font-bold text-green-600">{module.metrics.fuelSavings.toFixed(1)}%</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Economia Custo</p>
                  <p className="font-bold text-green-600">${module.metrics.costSavings.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Economia Tempo</p>
                  <p className="font-bold">{module.metrics.timeSavings.toFixed(1)}h</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Confiança</p>
                  <p className="font-bold">{module.metrics.confidence}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Risco:</span>
                <Progress value={module.metrics.riskScore} className="flex-1 h-2" />
                <span className="text-xs font-medium">{module.metrics.riskScore}</span>
              </div>
              {module.recommendation && (
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  💡 {module.recommendation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Economia Média Potencial</p>
              <p className="text-2xl font-bold text-green-600">${totalPotentialSavings.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Melhor Módulo</p>
              <p className="text-lg font-bold text-primary">{bestModule.name}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Economia Combustível Max</p>
              <p className="text-2xl font-bold text-blue-600">{Math.max(...modules.map(m => m.metrics.fuelSavings)).toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Score de Risco Médio</p>
              <p className="text-2xl font-bold">{Math.round(modules.reduce((s, m) => s + m.metrics.riskScore, 0) / 3)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">
            <BarChart3 className="h-4 w-4 mr-2" />
            Comparativo
          </TabsTrigger>
          <TabsTrigger value="radar">
            <Target className="h-4 w-4 mr-2" />
            Análise Radar
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <Compass className="h-4 w-4 mr-2" />
            Cenários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Métricas por Módulo</CardTitle>
              <CardDescription>Análise lado a lado dos resultados de cada otimizador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="metric" type="category" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="monteCarlo" fill="hsl(217, 91%, 60%)" name="Monte Carlo" barSize={12} />
                    <Bar dataKey="quantumRouter" fill="hsl(271, 91%, 65%)" name="Quantum Router" barSize={12} />
                    <Bar dataKey="energyOptimizer" fill="hsl(142, 76%, 36%)" name="Energy Optimizer" barSize={12} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela Comparativa Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Métrica</th>
                      <th className="text-center py-3 px-4 bg-blue-50 dark:bg-blue-950/20">Monte Carlo</th>
                      <th className="text-center py-3 px-4 bg-purple-50 dark:bg-purple-950/20">Quantum Router</th>
                      <th className="text-center py-3 px-4 bg-green-50 dark:bg-green-950/20">Energy Optimizer</th>
                      <th className="text-center py-3 px-4">Melhor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{row.metric}</td>
                        <td className={`text-center py-3 px-4 ${row.best === "monteCarlo" ? "font-bold text-blue-600" : ""}`}>
                          {row.monteCarlo}
                        </td>
                        <td className={`text-center py-3 px-4 ${row.best === "quantumRouter" ? "font-bold text-purple-600" : ""}`}>
                          {row.quantumRouter}
                        </td>
                        <td className={`text-center py-3 px-4 ${row.best === "energyOptimizer" ? "font-bold text-green-600" : ""}`}>
                          {row.energyOptimizer}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {row.best === "monteCarlo" && "MC"}
                            {row.best === "quantumRouter" && "QR"}
                            {row.best === "energyOptimizer" && "EO"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle>Análise Radar Multidimensional</CardTitle>
              <CardDescription>Comparação visual das capacidades de cada módulo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Monte Carlo" dataKey="mc" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.3} />
                    <Radar name="Quantum Router" dataKey="qr" stroke="hsl(271, 91%, 65%)" fill="hsl(271, 91%, 65%)" fillOpacity={0.3} />
                    <Radar name="Energy Optimizer" dataKey="eo" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Performance (24h)</CardTitle>
              <CardDescription>Evolução do score de eficiência ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="monteCarlo" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} name="Monte Carlo" />
                    <Area type="monotone" dataKey="quantumRouter" stroke="hsl(271, 91%, 65%)" fill="hsl(271, 91%, 65%)" fillOpacity={0.2} name="Quantum Router" />
                    <Area type="monotone" dataKey="energyOptimizer" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.2} name="Energy Optimizer" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Cenário</CardTitle>
              <CardDescription>Custo estimado (USD) por cenário operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="mc" fill="hsl(217, 91%, 60%)" name="Monte Carlo" />
                    <Bar dataKey="qr" fill="hsl(271, 91%, 65%)" name="Quantum Router" />
                    <Bar dataKey="eo" fill="hsl(142, 76%, 36%)" name="Energy Optimizer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Recomendação Consolidada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-lg font-medium mb-2">
                🎯 Estratégia Recomendada: <span className="text-primary">{bestModule.name}</span>
              </p>
              <p className="text-muted-foreground">
                Com base na análise comparativa, o <strong>{bestModule.name}</strong> apresenta o melhor resultado 
                com economia potencial de <strong>${bestModule.metrics.costSavings.toLocaleString()}</strong> e 
                redução de <strong>{bestModule.metrics.fuelSavings}%</strong> no consumo de combustível.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modules.map((m) => (
                <div key={m.id} className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium text-sm mb-1">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
