/**
 * PredictiveMaintenanceAI - Manutenção Preditiva com IA
 * Análise de falhas, recomendações e otimização
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  Activity, Cpu, Thermometer, Gauge, Zap, Brain, Sparkles,
  BarChart3, Target, ArrowRight, Calendar, Ship, Settings,
  RefreshCw, Download, Eye, Bell
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line
} from "recharts";

interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel: string;
  healthScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  predictedFailure?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  runningHours: number;
  parameters: {
    name: string;
    value: number;
    unit: string;
    status: "normal" | "warning" | "critical";
    trend: "up" | "down" | "stable";
  }[];
}

interface Prediction {
  id: string;
  equipment: string;
  vessel: string;
  failureType: string;
  probability: number;
  predictedDate: string;
  impact: "low" | "medium" | "high";
  recommendation: string;
  estimatedCost: number;
  preventiveCost: number;
}

const equipmentList: Equipment[] = [
  {
    id: "1",
    name: "Motor Principal",
    type: "MAN B&W 6S50ME-C",
    vessel: "MV Atlântico Sul",
    healthScore: 87,
    riskLevel: "low",
    lastMaintenance: "2025-12-15",
    nextMaintenance: "2026-03-15",
    runningHours: 12450,
    parameters: [
      { name: "Temperatura Óleo", value: 68, unit: "°C", status: "normal", trend: "stable" },
      { name: "Pressão Óleo", value: 4.2, unit: "bar", status: "normal", trend: "stable" },
      { name: "Vibração", value: 2.1, unit: "mm/s", status: "normal", trend: "up" },
      { name: "RPM", value: 78, unit: "rpm", status: "normal", trend: "stable" },
    ]
  },
  {
    id: "2",
    name: "Gerador #1",
    type: "Caterpillar C32",
    vessel: "MV Atlântico Sul",
    healthScore: 72,
    riskLevel: "medium",
    predictedFailure: "2026-03-20",
    lastMaintenance: "2025-11-01",
    nextMaintenance: "2026-02-01",
    runningHours: 8920,
    parameters: [
      { name: "Temperatura Exaustão", value: 485, unit: "°C", status: "warning", trend: "up" },
      { name: "Pressão Óleo", value: 3.8, unit: "bar", status: "normal", trend: "down" },
      { name: "Vibração", value: 3.4, unit: "mm/s", status: "warning", trend: "up" },
      { name: "Carga", value: 75, unit: "%", status: "normal", trend: "stable" },
    ]
  },
  {
    id: "3",
    name: "Bomba Ballast #2",
    type: "Alfa Laval S-65",
    vessel: "MV Horizonte",
    healthScore: 45,
    riskLevel: "high",
    predictedFailure: "2026-02-25",
    lastMaintenance: "2025-08-20",
    nextMaintenance: "2026-02-20",
    runningHours: 15680,
    parameters: [
      { name: "Temperatura Rolamentos", value: 78, unit: "°C", status: "critical", trend: "up" },
      { name: "Vibração", value: 5.8, unit: "mm/s", status: "critical", trend: "up" },
      { name: "Corrente Motor", value: 42, unit: "A", status: "warning", trend: "up" },
      { name: "Vazão", value: 82, unit: "%", status: "warning", trend: "down" },
    ]
  },
];

const predictions: Prediction[] = [
  {
    id: "1",
    equipment: "Bomba Ballast #2",
    vessel: "MV Horizonte",
    failureType: "Falha de Rolamento",
    probability: 85,
    predictedDate: "2026-02-25",
    impact: "high",
    recommendation: "Substituir rolamentos antes da próxima operação de lastro",
    estimatedCost: 45000,
    preventiveCost: 8500,
  },
  {
    id: "2",
    equipment: "Gerador #1",
    vessel: "MV Atlântico Sul",
    failureType: "Desgaste Turbo",
    probability: 62,
    predictedDate: "2026-03-20",
    impact: "medium",
    recommendation: "Agendar inspeção de turbo na próxima docagem",
    estimatedCost: 120000,
    preventiveCost: 25000,
  },
  {
    id: "3",
    equipment: "Compressor AC",
    vessel: "MV Oceano",
    failureType: "Vazamento Refrigerante",
    probability: 45,
    predictedDate: "2026-04-10",
    impact: "low",
    recommendation: "Monitorar níveis e incluir na próxima manutenção programada",
    estimatedCost: 15000,
    preventiveCost: 3500,
  },
];

const trendData = [
  { month: "Set", health: 92, failures: 2 },
  { month: "Out", health: 90, failures: 1 },
  { month: "Nov", health: 88, failures: 3 },
  { month: "Dez", health: 85, failures: 2 },
  { month: "Jan", health: 83, failures: 4 },
  { month: "Fev", health: 81, failures: 2 },
];

function RiskBadge({ level }: { level: Equipment["riskLevel"] }) {
  const config = {
    low: { label: "Baixo", className: "bg-success/10 text-success" },
    medium: { label: "Médio", className: "bg-warning/10 text-warning" },
    high: { label: "Alto", className: "bg-destructive/10 text-destructive" },
    critical: { label: "Crítico", className: "bg-destructive text-destructive-foreground animate-pulse" },
  };
  const c = config[level];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function ParameterStatus({ status, trend }: { status: string; trend: string }) {
  const statusColor = status === "critical" ? "text-destructive" : 
                      status === "warning" ? "text-warning" : "text-success";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = status === "critical" ? "text-destructive" : 
                     status === "warning" && trend === "up" ? "text-warning" : "text-muted-foreground";
  
  return <span className={trendColor}>{trendIcon}</span>;
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <RiskBadge level={equipment.riskLevel} />
            <Badge variant="outline">{equipment.type}</Badge>
          </div>
          <h4 className="font-medium mt-2">{equipment.name}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Ship className="h-3 w-3" />
            {equipment.vessel}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: equipment.healthScore > 80 ? 'hsl(var(--success))' : equipment.healthScore > 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>
            {equipment.healthScore}%
          </div>
          <p className="text-xs text-muted-foreground">Health Score</p>
        </div>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {equipment.parameters.map((param) => (
          <div key={param.name} className={`p-2 rounded border text-xs ${
            param.status === "critical" ? "border-destructive/50 bg-destructive/5" :
            param.status === "warning" ? "border-warning/50 bg-warning/5" :
            "border-muted"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{param.name}</span>
              <ParameterStatus status={param.status} trend={param.trend} />
            </div>
            <p className="font-medium mt-1">{param.value} {param.unit}</p>
          </div>
        ))}
      </div>

      {equipment.predictedFailure && (
        <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Falha prevista: {equipment.predictedFailure}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          Detalhes
        </Button>
        <Button size="sm" className="flex-1 gap-1">
          <Calendar className="h-3 w-3" />
          Agendar
        </Button>
      </div>
    </motion.div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const savings = prediction.estimatedCost - prediction.preventiveCost;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={prediction.impact === "high" ? "destructive" : prediction.impact === "medium" ? "secondary" : "outline"}>
              {prediction.impact === "high" ? "Alto Impacto" : prediction.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
            </Badge>
            <Badge variant="outline">{prediction.probability}% prob.</Badge>
          </div>
          <h4 className="font-medium mt-2">{prediction.failureType}</h4>
          <p className="text-sm text-muted-foreground">{prediction.equipment} • {prediction.vessel}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Falha prevista: {prediction.predictedDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Economia potencial</p>
          <p className="text-lg font-bold text-success">
            R$ {(savings / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="mt-3 p-2 rounded bg-muted/50">
        <p className="text-xs text-muted-foreground">Recomendação IA:</p>
        <p className="text-sm mt-1">{prediction.recommendation}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="p-2 rounded border">
          <span className="text-muted-foreground">Custo Falha</span>
          <p className="font-medium text-destructive">R$ {prediction.estimatedCost.toLocaleString()}</p>
        </div>
        <div className="p-2 rounded border">
          <span className="text-muted-foreground">Custo Preventivo</span>
          <p className="font-medium text-success">R$ {prediction.preventiveCost.toLocaleString()}</p>
        </div>
      </div>

      <Button size="sm" className="w-full mt-3 gap-1">
        <Wrench className="h-3 w-3" />
        Criar Ordem de Serviço
      </Button>
    </motion.div>
  );
}

export default function PredictiveMaintenanceAI() {
  const [activeTab, setActiveTab] = useState("equipment");

  const stats = {
    avgHealth: Math.round(equipmentList.reduce((acc, e) => acc + e.healthScore, 0) / equipmentList.length),
    highRisk: equipmentList.filter(e => e.riskLevel === "high" || e.riskLevel === "critical").length,
    predictions: predictions.length,
    potentialSavings: predictions.reduce((acc, p) => acc + (p.estimatedCost - p.preventiveCost), 0),
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Health Score Médio</p>
                <p className="text-2xl font-bold" style={{ color: stats.avgHealth > 80 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
                  {stats.avgHealth}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alto Risco</p>
                <p className="text-2xl font-bold text-destructive">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Previsões IA</p>
                <p className="text-2xl font-bold text-purple-600">{stats.predictions}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Economia Potencial</p>
                <p className="text-lg font-bold text-cyan-600">R$ {(stats.potentialSavings / 1000).toFixed(0)}K</p>
              </div>
              <Target className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendência de Saúde da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="health" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Health Score" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Manutenção Preditiva IA
              </CardTitle>
              <CardDescription>Análise inteligente de equipamentos e previsão de falhas</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar Análise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="equipment">Equipamentos ({equipmentList.length})</TabsTrigger>
              <TabsTrigger value="predictions">
                Previsões ({predictions.length})
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="equipment">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipmentList.map((equipment) => (
                    <EquipmentCard key={equipment.id} equipment={equipment} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="predictions">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {predictions.map((prediction) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Analytics Avançado</p>
                <p className="text-sm">Relatórios e dashboards detalhados em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
