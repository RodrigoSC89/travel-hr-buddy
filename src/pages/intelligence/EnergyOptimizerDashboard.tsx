/**
 * OPEC - Otimizador de Performance Energética Contínua
 * Dashboard de otimização de combustível em tempo real
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Fuel, 
  Zap, 
  TrendingDown, 
  Settings, 
  Play,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Gauge,
  Thermometer,
  Wind
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
  Bar
} from "recharts";

// Mock data para cenários de otimização
const optimizationScenarios = [
  {
    id: "scenario-a",
    name: "Cenário A - Conservador",
    rpmChange: -50,
    currentRpm: 2000,
    targetRpm: 1950,
    fuelSaving: 2.0,
    dailySaving: 900,
    etaImpact: "+2h",
    emissionsOk: true,
    safetyScore: 98,
    recommended: true
  },
  {
    id: "scenario-b",
    name: "Cenário B - Moderado",
    rpmChange: -100,
    currentRpm: 2000,
    targetRpm: 1900,
    fuelSaving: 3.0,
    dailySaving: 1350,
    etaImpact: "+6h",
    emissionsOk: true,
    safetyScore: 95,
    recommended: false
  },
  {
    id: "scenario-c",
    name: "Cenário C - Agressivo",
    rpmChange: -150,
    currentRpm: 2000,
    targetRpm: 1850,
    fuelSaving: 4.5,
    dailySaving: 2025,
    etaImpact: "+12h",
    emissionsOk: true,
    safetyScore: 92,
    recommended: false
  }
];

const engineMetrics = [
  { time: "00:00", rpm: 2000, fuel: 48, efficiency: 85, temp: 82 },
  { time: "04:00", rpm: 1980, fuel: 47.2, efficiency: 86, temp: 81 },
  { time: "08:00", rpm: 1950, fuel: 46.1, efficiency: 88, temp: 80 },
  { time: "12:00", rpm: 1960, fuel: 46.5, efficiency: 87, temp: 81 },
  { time: "16:00", rpm: 1940, fuel: 45.8, efficiency: 89, temp: 79 },
  { time: "20:00", rpm: 1950, fuel: 46.0, efficiency: 88, temp: 80 }
];

const savingsHistory = [
  { month: "Jan", savings: 28500, target: 25000 },
  { month: "Fev", savings: 31200, target: 25000 },
  { month: "Mar", savings: 27800, target: 25000 },
  { month: "Abr", savings: 33400, target: 25000 },
  { month: "Mai", savings: 35100, target: 25000 },
  { month: "Jun", savings: 38200, target: 25000 }
];

export default function EnergyOptimizerDashboard() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleApplyScenario = async (scenarioId: string) => {
    setIsOptimizing(true);
    setSelectedScenario(scenarioId);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- upsert requires single object
      await (supabase.from('ai_configurations').upsert as Function)({
        config_key: `energy_scenario_${scenarioId}`,
        config_value: { active: true, appliedAt: new Date().toISOString() },
        description: `Energy optimization scenario ${scenarioId}`,
      }, { onConflict: 'config_key' });
    } catch { /* scenario apply error */ }
    setIsOptimizing(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Fuel className="h-8 w-8 text-success" />
            OPEC - Otimizador Energético
          </h1>
          <p className="text-muted-foreground mt-1">
            Otimização contínua de performance energética em tempo real
          </p>
        </div>
        <Badge variant="outline" className="text-success border-success">
          <Zap className="h-3 w-3 mr-1" />
          Sistema Ativo
        </Badge>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Hoje</p>
                <p className="text-2xl font-bold text-success">$1,890</p>
                <p className="text-xs text-success/80">+12% vs ontem</p>
              </div>
              <TrendingDown className="h-10 w-10 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-2xl font-bold text-primary">46.1 t/dia</p>
                <p className="text-xs text-primary/80">-4% vs baseline</p>
              </div>
              <Fuel className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold text-warning">88.5%</p>
                <p className="text-xs text-warning/80">+3.5% este mês</p>
              </div>
              <Gauge className="h-10 w-10 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Anual</p>
                <p className="text-2xl font-bold text-accent-foreground">$324k</p>
                <p className="text-xs text-accent-foreground/80">Meta: $280k</p>
              </div>
              <BarChart3 className="h-10 w-10 text-accent-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Cenários de Otimização</TabsTrigger>
          <TabsTrigger value="realtime">Métricas em Tempo Real</TabsTrigger>
          <TabsTrigger value="history">Histórico de Economia</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {optimizationScenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  scenario.recommended 
                    ? "border-success/50 bg-success/5" 
                    : "hover:border-primary/50"
                } ${selectedScenario === scenario.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    {scenario.recommended && (
                      <Badge className="bg-success text-success-foreground">Recomendado</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">RPM Atual → Alvo</p>
                      <p className="font-medium">{scenario.currentRpm} → {scenario.targetRpm}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Economia Diária</p>
                      <p className="font-medium text-success">${scenario.dailySaving}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Economia Combustível</p>
                      <p className="font-medium">{scenario.fuelSaving} t/dia</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impacto ETA</p>
                      <p className="font-medium text-warning">{scenario.etaImpact}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Segurança</span>
                      <span>{scenario.safetyScore}%</span>
                    </div>
                    <Progress value={scenario.safetyScore} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    {scenario.emissionsOk ? (
                      <Badge variant="outline" className="text-success border-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Emissões OK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-warning border-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Verificar
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={scenario.recommended ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyScenario(scenario.id);
                    }}
                    disabled={isOptimizing}
                  >
                    {isOptimizing && selectedScenario === scenario.id ? (
                      <>Aplicando...</>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Aplicar Cenário
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  RPM e Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engineMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} name="RPM" />
                    <Line yAxisId="right" type="monotone" dataKey="fuel" stroke="#10b981" strokeWidth={2} name="Combustível (t/dia)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Eficiência e Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engineMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Area type="monotone" dataKey="efficiency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Eficiência %" />
                    <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Temp °C" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Engine Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Parâmetros do Motor em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "RPM", value: "1,950", unit: "rpm", icon: Gauge },
                  { label: "Pressão Combustível", value: "320", unit: "bar", icon: Fuel },
                  { label: "Temp. Combustível", value: "62", unit: "°C", icon: Thermometer },
                  { label: "Temp. Coolant", value: "80", unit: "°C", icon: Thermometer },
                  { label: "Ar Scavenger", value: "3.2", unit: "bar", icon: Wind },
                  { label: "Carga Turbo", value: "78", unit: "%", icon: Zap }
                ].map((param) => (
                  <div key={param.label} className="p-4 rounded-lg bg-muted/50 text-center">
                    <param.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{param.label}</p>
                    <p className="text-xl font-bold">{param.value}</p>
                    <p className="text-xs text-muted-foreground">{param.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Histórico de Economia vs Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={savingsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="savings" fill="#10b981" name="Economia Real" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#6b7280" name="Meta" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
