/**
 * Predictive Maintenance Panel
 * Manutenção preditiva com IA e ML
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wrench,
  Ship,
  Cpu,
  Thermometer,
  Gauge,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  RefreshCcw,
  Target,
  Brain,
  LineChart,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, LineChart as RechartsLineChart, Line, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const predictions = [
  { 
    id: "1", 
    equipment: "Motor Principal #1", 
    vessel: "MV Atlântico Sul",
    type: "engine",
    failureProbability: 78, 
    predictedDate: "2026-02-25",
    daysUntil: 21,
    issue: "Degradação de rolamento detectada",
    recommendation: "Substituir rolamento do eixo principal",
    confidence: 92,
    severity: "high",
    estimatedCost: 15000,
    downtimeHours: 48,
  },
  { 
    id: "2", 
    equipment: "Gerador #2", 
    vessel: "MV Horizonte",
    type: "generator",
    failureProbability: 45, 
    predictedDate: "2026-03-15",
    daysUntil: 39,
    issue: "Vibração anormal detectada",
    recommendation: "Verificar alinhamento e balanceamento",
    confidence: 88,
    severity: "medium",
    estimatedCost: 5000,
    downtimeHours: 12,
  },
  { 
    id: "3", 
    equipment: "Sistema Hidráulico", 
    vessel: "MV Atlântico Sul",
    type: "hydraulic",
    failureProbability: 92, 
    predictedDate: "2026-02-12",
    daysUntil: 8,
    issue: "Vazamento iminente detectado via análise de pressão",
    recommendation: "Substituir vedações e verificar integridade",
    confidence: 95,
    severity: "critical",
    estimatedCost: 8000,
    downtimeHours: 24,
  },
  { 
    id: "4", 
    equipment: "Compressor de Ar", 
    vessel: "MV Oceano",
    type: "compressor",
    failureProbability: 35, 
    predictedDate: "2026-04-01",
    daysUntil: 56,
    issue: "Aumento gradual de temperatura",
    recommendation: "Limpeza de filtros e verificação de válvulas",
    confidence: 82,
    severity: "low",
    estimatedCost: 2500,
    downtimeHours: 8,
  },
  { 
    id: "5", 
    equipment: "Bomba de Água Salgada", 
    vessel: "MV Pacífico",
    type: "pump",
    failureProbability: 65, 
    predictedDate: "2026-03-05",
    daysUntil: 29,
    issue: "Corrosão acelerada detectada",
    recommendation: "Inspeção e tratamento anticorrosivo",
    confidence: 85,
    severity: "medium",
    estimatedCost: 4500,
    downtimeHours: 16,
  },
];

const sensorData = [
  { time: "00:00", temp: 78, vibration: 2.1, pressure: 145 },
  { time: "04:00", temp: 79, vibration: 2.2, pressure: 146 },
  { time: "08:00", temp: 82, vibration: 2.8, pressure: 148 },
  { time: "12:00", temp: 85, vibration: 3.1, pressure: 152 },
  { time: "16:00", temp: 83, vibration: 2.9, pressure: 149 },
  { time: "20:00", temp: 81, vibration: 2.5, pressure: 147 },
  { time: "24:00", temp: 80, vibration: 2.3, pressure: 146 },
];

const healthScores = [
  { name: "Motor", score: 72 },
  { name: "Gerador", score: 88 },
  { name: "Hidráulico", score: 45 },
  { name: "Elétrico", score: 92 },
  { name: "Navegação", score: 95 },
  { name: "Comunicação", score: 89 },
];

const maintenanceHistory = [
  { month: "Set", preventive: 12, corrective: 3, predictive: 5 },
  { month: "Out", preventive: 14, corrective: 2, predictive: 7 },
  { month: "Nov", preventive: 11, corrective: 4, predictive: 8 },
  { month: "Dez", preventive: 15, corrective: 1, predictive: 10 },
  { month: "Jan", preventive: 13, corrective: 2, predictive: 12 },
  { month: "Fev", preventive: 10, corrective: 1, predictive: 15 },
];

const radarData = [
  { subject: "Precisão", A: 92, fullMark: 100 },
  { subject: "Antecipação", A: 85, fullMark: 100 },
  { subject: "Cobertura", A: 78, fullMark: 100 },
  { subject: "Economia", A: 88, fullMark: 100 },
  { subject: "Confiança", A: 90, fullMark: 100 },
];

function getSeverityConfig(severity: string) {
  const configs = {
    critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Crítico" },
    high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Alto" },
    medium: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", label: "Médio" },
    low: { color: "text-success", bg: "bg-success/10", border: "border-success/30", label: "Baixo" },
  };
  return configs[severity as keyof typeof configs] || configs.medium;
}

export default function PredictiveMaintenancePanel() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState(predictions[0]);

  const filteredPredictions = useMemo(() => {
    if (selectedVessel === "all") return predictions;
    return predictions.filter(p => p.vessel === selectedVessel);
  }, [selectedVessel]);

  const stats = useMemo(() => {
    const critical = predictions.filter(p => p.severity === "critical").length;
    const high = predictions.filter(p => p.severity === "high").length;
    const avgConfidence = Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length);
    const totalSavings = predictions.reduce((acc, p) => acc + (p.estimatedCost * 0.4), 0); // 40% savings estimate
    return { critical, high, avgConfidence, totalSavings };
  }, []);

  const vessels = [...new Set(predictions.map(p => p.vessel))];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Previsões Ativas</p>
                <p className="text-2xl font-bold text-primary">{predictions.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Prioridade Alta</p>
                <p className="text-2xl font-bold text-warning">{stats.high}</p>
              </div>
              <Zap className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confiança IA</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgConfidence}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Economia Est.</p>
                <p className="text-2xl font-bold text-success">R$ {(stats.totalSavings / 1000).toFixed(0)}k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Previsões de Manutenção
                </CardTitle>
                <CardDescription>Análise preditiva baseada em ML</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Embarcações</SelectItem>
                    {vessels.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredPredictions
                  .sort((a, b) => b.failureProbability - a.failureProbability)
                  .map((pred, idx) => {
                    const severityConfig = getSeverityConfig(pred.severity);
                    return (
                      <motion.div
                        key={pred.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                          selectedEquipment.id === pred.id ? "ring-2 ring-primary" : "",
                          severityConfig.border
                        )}
                        onClick={() => setSelectedEquipment(pred)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg", severityConfig.bg)}>
                              <Activity className={cn("h-5 w-5", severityConfig.color)} />
                            </div>
                            <div>
                              <p className="font-semibold">{pred.equipment}</p>
                              <p className="text-sm text-muted-foreground">{pred.vessel}</p>
                              <p className="text-sm mt-1">{pred.issue}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={severityConfig.color}>
                                {severityConfig.label}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold">{pred.failureProbability}%</p>
                            <p className="text-xs text-muted-foreground">prob. de falha</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {pred.daysUntil} dias
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {pred.downtimeHours}h parada
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {pred.confidence}% conf.
                            </span>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Wrench className="h-3 w-3" />
                            Agendar
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Performance do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precisão geral</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Modelo treinado com 2.5M+ registros de manutenção
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Detail */}
      {selectedEquipment && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  {selectedEquipment.equipment}
                </CardTitle>
                <CardDescription>{selectedEquipment.vessel}</CardDescription>
              </div>
              <Button className="gap-2">
                <Wrench className="h-4 w-4" />
                Criar Ordem de Serviço
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sensor Data */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Dados de Sensores (Últimas 24h)
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" name="Temp (°C)" strokeWidth={2} />
                    <Line type="monotone" dataKey="vibration" stroke="hsl(var(--warning))" name="Vibração (mm/s)" strokeWidth={2} />
                    <Line type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" name="Pressão (bar)" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendation */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recomendação da IA
                  </h4>
                  <p className="text-sm">{selectedEquipment.recommendation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Custo Estimado</p>
                    <p className="font-bold text-lg">R$ {selectedEquipment.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Tempo de Parada</p>
                    <p className="font-bold text-lg">{selectedEquipment.downtimeHours}h</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Data Prevista</p>
                    <p className="font-bold text-lg">{new Date(selectedEquipment.predictedDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Confiança</p>
                    <p className="font-bold text-lg">{selectedEquipment.confidence}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Scores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Saúde dos Sistemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthScores.map((system) => (
                <div key={system.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{system.name}</span>
                    <span className={cn(
                      "font-bold",
                      system.score >= 80 ? "text-success" :
                      system.score >= 60 ? "text-warning" : "text-destructive"
                    )}>
                      {system.score}%
                    </span>
                  </div>
                  <Progress 
                    value={system.score} 
                    className={cn(
                      "h-2",
                      system.score >= 80 ? "[&>div]:bg-success" :
                      system.score >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Type Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Evolução por Tipo de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={maintenanceHistory}>
                <defs>
                  <linearGradient id="predictiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="preventive" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" name="Preventiva" />
                <Area type="monotone" dataKey="corrective" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.3)" name="Corretiva" />
                <Area type="monotone" dataKey="predictive" stackId="1" stroke="hsl(var(--primary))" fill="url(#predictiveGradient)" name="Preditiva" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
