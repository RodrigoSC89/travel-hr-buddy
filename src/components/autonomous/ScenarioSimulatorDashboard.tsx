/**
 * Scenario Simulator Dashboard (SCP)
 * Monte Carlo simulation for risk analysis and cost prediction
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, TrendingUp, BarChart3, Target,
  Play, RefreshCw, CheckCircle,
  DollarSign, Percent, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScenarioSimulator } from '@/hooks/useScenarioSimulator';
import { type ScenarioOutput } from '@/lib/ai/scenario-simulator';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function ScenarioSimulatorDashboard() {
  const { isSimulating, result, history, simulate, clearHistory, createVariable } = useScenarioSimulator();

  const [scenarioName, setScenarioName] = useState('Cenário de Teste');
  const [scenarioType, setScenarioType] = useState<'fuel_cost' | 'crew_optimization' | 'maintenance'>('fuel_cost');
  const [fuelPrice, setFuelPrice] = useState({ current: 850, proposed: 920 });

  const handleSimulate = async () => {
    const variables = [
      createVariable({
        name: 'Preço do Combustível',
        currentValue: fuelPrice.current,
        proposedValue: fuelPrice.proposed,
        unit: 'USD/MT',
        distribution: 'normal',
        stdDev: 50
      })
    ];

    await simulate({
      name: scenarioName,
      description: `Simulação de ${scenarioType}`,
      durationMonths: 12,
      variables
    });
  };

  const generateDistributionData = (simResult?: ScenarioOutput) => {
    if (!simResult) return [];
    const mean = simResult.fuelCost.mean;
    const std = simResult.fuelCost.stdDev;
    const data = [];
    for (let i = -3; i <= 3; i += 0.3) {
      const x = mean + i * std;
      const y = Math.exp(-0.5 * Math.pow(i, 2)) / (std * Math.sqrt(2 * Math.PI));
      data.push({ value: x, probability: y * 100, label: x.toFixed(0) });
    }
    return data;
  };

  const generateComparisonData = (simResult?: ScenarioOutput) => {
    if (!simResult) return [];
    return [
      { name: 'Combustível', baseline: simResult.comparison.baseline.fuelCost, scenario: simResult.comparison.scenario.fuelCost },
      { name: 'Operacional', baseline: simResult.comparison.baseline.operationalCost, scenario: simResult.comparison.scenario.operationalCost },
      { name: 'Receita', baseline: simResult.comparison.baseline.revenue, scenario: simResult.comparison.scenario.revenue }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Simulador de Cenários Preditivo (SCP)
          </h2>
          <p className="text-muted-foreground">Simulação Monte Carlo para análise de risco</p>
        </div>
        <Button variant="outline" onClick={clearHistory} disabled={history.length === 0}>
          <RefreshCw className="h-4 w-4 mr-2" />Limpar
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Cenário</Label>
              <Input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Análise</Label>
              <Select value={scenarioType} onValueChange={(v: any) => setScenarioType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel_cost">Custo de Combustível</SelectItem>
                  <SelectItem value="crew_optimization">Otimização de Tripulação</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              <div>
                <Label className="text-xs">Preço Atual (USD/MT)</Label>
                <Input type="number" value={fuelPrice.current} onChange={(e) => setFuelPrice({ ...fuelPrice, current: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">Preço Proposto</Label>
                <Input type="number" value={fuelPrice.proposed} onChange={(e) => setFuelPrice({ ...fuelPrice, proposed: Number(e.target.value) })} />
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleSimulate} disabled={isSimulating}>
              {isSimulating ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Simulando...</> : <><Play className="h-4 w-4 mr-2" />Executar</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Resultados</CardTitle>
            {result && <CardDescription>{result.simulationCount.toLocaleString()} iterações • Confiança: {(result.confidence * 100).toFixed(0)}%</CardDescription>}
          </CardHeader>
          <CardContent>
            {result ? (
              <Tabs defaultValue="distribution">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                  <TabsTrigger value="comparison">Comparação</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                </TabsList>
                <TabsContent value="distribution" className="pt-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateDistributionData(result)}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="probability" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">P10</p>
                      <p className="text-lg font-bold text-red-500">${result.fuelCost.percentiles.p10.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">P50 (Mediana)</p>
                      <p className="text-lg font-bold">${result.fuelCost.percentiles.p50.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">P90</p>
                      <p className="text-lg font-bold text-green-500">${result.fuelCost.percentiles.p90.toLocaleString()}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="comparison" className="pt-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateComparisonData(result)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="baseline" name="Baseline" fill="hsl(var(--muted-foreground))" />
                        <Bar dataKey="scenario" name="Cenário" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="metrics" className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="h-4 w-4" /><span className="text-sm">Custo Combustível</span></div>
                      <p className="text-2xl font-bold">${result.fuelCost.mean.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2"><Percent className="h-4 w-4" /><span className="text-sm">Desvio</span></div>
                      <p className="text-2xl font-bold">±${result.fuelCost.stdDev.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2"><TrendingUp className="h-4 w-4" /><span className="text-sm">Variação %</span></div>
                      <p className="text-2xl font-bold text-primary">{result.comparison.deltaPercent.fuelCost.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2"><Target className="h-4 w-4" /><span className="text-sm">Confiança</span></div>
                      <p className="text-2xl font-bold">{(result.confidence * 100).toFixed(0)}%</p>
                      <Progress value={result.confidence * 100} className="mt-2" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recomendações</h4>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-sm">{rec.action}</span>
                          <Badge variant="outline" className="ml-auto">{rec.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Calculator className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhuma simulação executada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Histórico</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {history.map((sim, i) => (
                  <motion.div key={sim.scenarioId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg border">
                    <div><p className="font-medium">{sim.scenarioName}</p><p className="text-sm text-muted-foreground">{sim.simulationCount.toLocaleString()} iterações</p></div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">${sim.fuelCost.mean.toLocaleString()}</p>
                      <Badge>{(sim.confidence * 100).toFixed(0)}%</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
