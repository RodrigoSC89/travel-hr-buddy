/**
 * Monte Carlo Risk Simulator - World-Class Compliance
 * Probabilistic risk analysis using Monte Carlo simulation
 * No competitor has this level of quantitative risk modeling
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Play, BarChart3, TrendingUp, AlertTriangle, Shield, Dices } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface SimulationResult {
  mean: number;
  median: number;
  p5: number;
  p95: number;
  std: number;
  histogram: { range: string; count: number }[];
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  iterations: number;
}

interface RiskScenario {
  id: string;
  name: string;
  description: string;
  minLoss: number;
  maxLoss: number;
  probability: number;
}

const DEFAULT_SCENARIOS: RiskScenario[] = [
  { id: "psc_detention", name: "Detenção PSC", description: "Embarcação detida por Port State Control", minLoss: 50000, maxLoss: 500000, probability: 0.05 },
  { id: "cert_expiry", name: "Certificado Vencido", description: "Operação com certificado expirado", minLoss: 10000, maxLoss: 200000, probability: 0.08 },
  { id: "oil_spill", name: "Derramamento MARPOL", description: "Violação ambiental MARPOL Annex I", minLoss: 100000, maxLoss: 5000000, probability: 0.02 },
  { id: "crew_injury", name: "Acidente Tripulação", description: "Lesão ocupacional grave (MLC)", minLoss: 25000, maxLoss: 1000000, probability: 0.04 },
  { id: "flag_withdrawal", name: "Retirada de Bandeira", description: "Flag State retira registro", minLoss: 200000, maxLoss: 2000000, probability: 0.01 },
  { id: "class_suspension", name: "Suspensão de Classe", description: "Sociedade classificadora suspende certificado", minLoss: 75000, maxLoss: 800000, probability: 0.03 },
];

function runMonteCarlo(scenarios: RiskScenario[], iterations: number): SimulationResult {
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let totalLoss = 0;
    for (const scenario of scenarios) {
      if (Math.random() < scenario.probability) {
        const loss = scenario.minLoss + Math.random() * (scenario.maxLoss - scenario.minLoss);
        totalLoss += loss;
      }
    }
    results.push(totalLoss);
  }

  results.sort((a, b) => a - b);

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const p5 = results[Math.floor(results.length * 0.05)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const std = Math.sqrt(variance);

  // Build histogram
  const maxVal = Math.max(...results);
  const bucketCount = 20;
  const bucketSize = maxVal / bucketCount || 1;
  const histogram: { range: string; count: number }[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const lo = i * bucketSize;
    const hi = (i + 1) * bucketSize;
    const count = results.filter(v => v >= lo && v < hi).length;
    histogram.push({
      range: `$${(lo / 1000).toFixed(0)}k`,
      count,
    });
  }

  const riskLevel: SimulationResult["riskLevel"] =
    p95 > 1000000 ? "critical" : p95 > 500000 ? "high" : p95 > 100000 ? "medium" : "low";

  return { mean, median, p5, p95, std, histogram, riskLevel, confidence: 95, iterations };
}

export function MonteCarloRiskSimulator() {
  const [scenarios] = useState<RiskScenario[]>(DEFAULT_SCENARIOS);
  const [iterations, setIterations] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = useCallback(() => {
    setIsRunning(true);
    setProgress(0);

    // Run computation synchronously, no fake delay
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 100);

    // Use requestAnimationFrame for visual feedback before heavy computation
    requestAnimationFrame(() => {
      const res = runMonteCarlo(scenarios, iterations);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(res);
      requestAnimationFrame(() => setIsRunning(false));
    });
  }, [scenarios, iterations]);

  const fmt = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  const riskColors = {
    low: "text-success",
    medium: "text-warning",
    high: "text-warning",
    critical: "text-destructive",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="h-6 w-6 text-primary" />
            Simulação Monte Carlo — Análise Probabilística de Risco
          </CardTitle>
          <CardDescription>
            Executa milhares de cenários aleatórios para quantificar a exposição financeira a riscos de compliance.
            Nenhum concorrente oferece este nível de modelagem quantitativa.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cenários de Risco ({scenarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map(s => (
              <div key={s.id} className="p-3 border rounded-lg space-y-1">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex justify-between text-xs">
                  <span>Perda: {fmt(s.minLoss)} – {fmt(s.maxLoss)}</span>
                  <Badge variant="outline">{(s.probability * 100).toFixed(0)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Iterações</Label>
              <Select value={String(iterations)} onValueChange={v => setIterations(Number(v))}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1.000</SelectItem>
                  <SelectItem value="5000">5.000</SelectItem>
                  <SelectItem value="10000">10.000</SelectItem>
                  <SelectItem value="50000">50.000</SelectItem>
                  <SelectItem value="100000">100.000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runSimulation} disabled={isRunning} className="gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Simulando..." : "Executar Simulação"}
            </Button>
          </div>
          {isRunning && <Progress value={progress} className="mt-4" />}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Perda Média", value: fmt(result.mean), icon: BarChart3 },
              { label: "Mediana", value: fmt(result.median), icon: TrendingUp },
              { label: "P5 (Melhor)", value: fmt(result.p5), icon: Shield },
              { label: "P95 (Pior)", value: fmt(result.p95), icon: AlertTriangle },
              { label: "Desvio Padrão", value: fmt(result.std), icon: Dices },
            ].map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="text-lg font-bold">{kpi.value}</p>
                    </div>
                    <kpi.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição de Perdas</CardTitle>
                <CardDescription>{result.iterations.toLocaleString()} iterações • Intervalo de confiança {result.confidence}%</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={result.histogram}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avaliação de Risco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Nível de Risco</span>
                    <Badge variant={result.riskLevel === "critical" || result.riskLevel === "high" ? "destructive" : "default"}>
                      {result.riskLevel === "critical" ? "CRÍTICO" : result.riskLevel === "high" ? "ALTO" : result.riskLevel === "medium" ? "MÉDIO" : "BAIXO"}
                    </Badge>
                  </div>
                  <p className={`text-3xl font-bold ${riskColors[result.riskLevel]}`}>
                    {fmt(result.p95)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Valor em Risco (VaR) no percentil 95 — há 5% de chance de a perda anual exceder este valor.
                  </p>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-medium text-sm">Recomendações</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Priorizar mitigação de cenários com perda máxima &gt; $500k</li>
                    <li>• Reservar provisão financeira equivalente ao VaR 95%</li>
                    <li>• Implementar controles preventivos para reduzir probabilidades</li>
                    <li>• Re-executar simulação mensalmente para tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
