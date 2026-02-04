/**
 * ESG Fuel Optimization Panel - Otimização de combustível e emissões
 * Análise preditiva e recomendações para redução de emissões
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
  Fuel, TrendingDown, TrendingUp, Target, Zap, Navigation, Ship,
  Clock, DollarSign, Leaf, AlertTriangle, CheckCircle2, Brain,
  Sparkles, BarChart3, Activity, ArrowRight, Calculator, Settings
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { toast } from "sonner";

interface VesselOptimization {
  id: string;
  name: string;
  currentSpeed: number;
  optimalSpeed: number;
  currentConsumption: number;
  optimalConsumption: number;
  potentialSavings: number;
  co2Reduction: number;
  implementationRisk: "low" | "medium" | "high";
  status: "applied" | "pending" | "analyzing";
}

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  fuelSavings: number;
  co2Reduction: number;
  costSavings: number;
  implementationTime: string;
  confidence: number;
}

// Mock data
const vesselOptimizations: VesselOptimization[] = [
  { id: "1", name: "MV Atlântico Sul", currentSpeed: 14.5, optimalSpeed: 12.8, currentConsumption: 42, optimalConsumption: 32, potentialSavings: 24, co2Reduction: 850, implementationRisk: "low", status: "pending" },
  { id: "2", name: "MV Pacífico Norte", currentSpeed: 13.2, optimalSpeed: 11.5, currentConsumption: 38, optimalConsumption: 28, potentialSavings: 26, co2Reduction: 720, implementationRisk: "low", status: "applied" },
  { id: "3", name: "PSV Oceano Azul", currentSpeed: 11.8, optimalSpeed: 10.5, currentConsumption: 25, optimalConsumption: 20, potentialSavings: 20, co2Reduction: 380, implementationRisk: "medium", status: "analyzing" },
  { id: "4", name: "AHTS Maré Alta", currentSpeed: 12.5, optimalSpeed: 10.8, currentConsumption: 55, optimalConsumption: 42, potentialSavings: 24, co2Reduction: 1100, implementationRisk: "medium", status: "pending" },
];

const optimizationScenarios: OptimizationScenario[] = [
  { id: "1", name: "Slow Steaming Moderado", description: "Redução de 10% na velocidade média da frota", fuelSavings: 15, co2Reduction: 2500, costSavings: 185000, implementationTime: "Imediato", confidence: 95 },
  { id: "2", name: "Otimização de Rota", description: "Ajuste de rotas baseado em condições meteorológicas", fuelSavings: 8, co2Reduction: 1200, costSavings: 95000, implementationTime: "2 semanas", confidence: 88 },
  { id: "3", name: "Limpeza de Casco", description: "Programa de limpeza antecipada de casco", fuelSavings: 12, co2Reduction: 1800, costSavings: 140000, implementationTime: "1 mês", confidence: 92 },
  { id: "4", name: "Trim Optimization", description: "Ajuste dinâmico de trim durante navegação", fuelSavings: 5, co2Reduction: 750, costSavings: 58000, implementationTime: "Imediato", confidence: 85 },
];

const monthlyFuelData = [
  { month: "Jan", atual: 4200, otimizado: 3600, meta: 3800 },
  { month: "Fev", atual: 3900, otimizado: 3400, meta: 3700 },
  { month: "Mar", atual: 4100, otimizado: 3500, meta: 3650 },
  { month: "Abr", atual: 3800, otimizado: 3200, meta: 3600 },
  { month: "Mai", atual: 4000, otimizado: 3350, meta: 3550 },
  { month: "Jun", atual: 3700, otimizado: 3100, meta: 3500 },
];

export function ESGFuelOptimizationPanel() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [speedReduction, setSpeedReduction] = useState([10]);

  const handleApplyOptimization = (vessel: VesselOptimization) => {
    toast.success("Otimização aplicada", {
      description: `Velocidade otimizada para ${vessel.name}: ${vessel.optimalSpeed} nós`
    });
  };

  const totalPotentialSavings = vesselOptimizations.reduce((sum, v) => sum + v.potentialSavings, 0);
  const totalCO2Reduction = vesselOptimizations.reduce((sum, v) => sum + v.co2Reduction, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Economia Potencial</p>
                <p className="text-2xl font-bold text-emerald-600">{totalPotentialSavings}%</p>
                <p className="text-xs text-muted-foreground">combustível/mês</p>
              </div>
              <Fuel className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Redução CO₂</p>
                <p className="text-2xl font-bold text-green-600">{(totalCO2Reduction/1000).toFixed(1)}t</p>
                <p className="text-xs text-muted-foreground">toneladas/mês</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Economia Mensal</p>
                <p className="text-2xl font-bold text-blue-600">R$ 478k</p>
                <p className="text-xs text-muted-foreground">projetado</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Otimizações Ativas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {vesselOptimizations.filter(v => v.status === "applied").length}/{vesselOptimizations.length}
                </p>
                <p className="text-xs text-muted-foreground">embarcações</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel Optimizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Consumo de Combustível - Atual vs Otimizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyFuelData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="atual" name="Consumo Atual" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="otimizado" name="Projeção Otimizada" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="meta" name="Meta" stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Per Vessel Optimization */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Otimização por Embarcação
                </CardTitle>
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Embarcações</SelectItem>
                    {vesselOptimizations.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4 pr-4">
                  {vesselOptimizations.map((vessel, idx) => (
                    <motion.div
                      key={vessel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className={vessel.status === "applied" ? "border-green-500/50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{vessel.name}</span>
                                <Badge className={
                                  vessel.status === "applied" ? "bg-green-500/10 text-green-600" :
                                  vessel.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                                  "bg-blue-500/10 text-blue-600"
                                }>
                                  {vessel.status === "applied" ? "Aplicado" :
                                   vessel.status === "pending" ? "Pendente" : "Analisando"}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={
                              vessel.implementationRisk === "low" ? "bg-green-500/10 text-green-600" :
                              vessel.implementationRisk === "medium" ? "bg-yellow-500/10 text-yellow-600" :
                              "bg-red-500/10 text-red-600"
                            }>
                              Risco {vessel.implementationRisk === "low" ? "Baixo" :
                                     vessel.implementationRisk === "medium" ? "Médio" : "Alto"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Velocidade Atual</p>
                              <p className="font-semibold">{vessel.currentSpeed} nós</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Velocidade Ótima</p>
                              <p className="font-semibold text-green-600">{vessel.optimalSpeed} nós</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Economia</p>
                              <p className="font-semibold text-emerald-600">-{vessel.potentialSavings}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">CO₂ Reduzido</p>
                              <p className="font-semibold text-green-600">-{vessel.co2Reduction}kg</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Fuel className="h-4 w-4" />
                              <span>{vessel.currentConsumption}t/dia</span>
                              <ArrowRight className="h-4 w-4" />
                              <span className="text-green-600">{vessel.optimalConsumption}t/dia</span>
                            </div>
                            {vessel.status !== "applied" && (
                              <Button
                                size="sm"
                                onClick={() => handleApplyOptimization(vessel)}
                              >
                                Aplicar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Scenarios */}
        <div className="space-y-6">
          {/* Speed Reduction Calculator */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-emerald-600" />
                Calculadora de Economia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Redução de Velocidade</span>
                    <span className="font-semibold">{speedReduction[0]}%</span>
                  </div>
                  <Slider
                    value={speedReduction}
                    onValueChange={setSpeedReduction}
                    min={0}
                    max={25}
                    step={1}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Economia de Combustível</span>
                    <span className="font-semibold text-emerald-600">
                      ~{Math.round(speedReduction[0] * 2.5)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Redução CO₂</span>
                    <span className="font-semibold text-green-600">
                      ~{Math.round(speedReduction[0] * 120)}t/mês
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Economia Mensal</span>
                    <span className="font-semibold text-blue-600">
                      R$ {(speedReduction[0] * 45000).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-500" />
                Cenários de Otimização
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3 pr-2">
                  {optimizationScenarios.map((scenario, idx) => (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{scenario.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {scenario.confidence}% confiança
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {scenario.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Fuel className="h-3 w-3 text-emerald-500" />
                          <span>-{scenario.fuelSavings}% combustível</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Leaf className="h-3 w-3 text-green-500" />
                          <span>-{scenario.co2Reduction}t CO₂</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-blue-500" />
                          <span>R$ {(scenario.costSavings/1000).toFixed(0)}k/mês</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{scenario.implementationTime}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
                        Ver Detalhes
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ESGFuelOptimizationPanel;
