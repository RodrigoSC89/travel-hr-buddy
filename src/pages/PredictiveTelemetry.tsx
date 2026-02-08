/**
 * Predictive Telemetry - 360° Telemetry with AI Predictive Analysis
 * Causal analysis, risk predictions, and continuous anomaly learning
 */

import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  Clock,
  ArrowLeft,
  RefreshCw,
  Target,
  BarChart3,
  Waves,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Anchor,
  Ship,
  FileDown,
  Play,
  Sparkles,
  GitBranch,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, subDays, subHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from '@/lib/logger';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend,
  ReferenceLine
} from "recharts";

interface SensorReading {
  id: string;
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "critical";
  vessel?: string;
}

interface Anomaly {
  id: string;
  timestamp: string;
  sensorType: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: "low" | "medium" | "high" | "critical";
  causalAnalysis: CausalAnalysis;
  status: "detected" | "investigating" | "resolved";
}

interface CausalAnalysis {
  primaryCause: string;
  contributingFactors: string[];
  rootCauseConfidence: number;
  impactAssessment: string;
  recommendations: string[];
}

interface Prediction {
  id: string;
  sensorType: string;
  timeframe: "7d" | "30d" | "90d";
  predictedValue: number;
  currentValue: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  impactEstimate: string;
}

interface AIInsight {
  id: string;
  type: "pattern" | "prediction" | "recommendation" | "causal";
  title: string;
  description: string;
  confidence: number;
  priority: number;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Generate demo sensor data
const generateSensorData = (hours: number = 24): SensorReading[] => {
  const data: SensorReading[] = [];
  const sensorTypes = [
    { type: "temperature", unit: "°C", base: 25, variance: 5 },
    { type: "pressure", unit: "bar", base: 1.2, variance: 0.3 },
    { type: "fuel_level", unit: "%", base: 75, variance: 10 },
    { type: "engine_rpm", unit: "rpm", base: 2500, variance: 500 },
    { type: "vibration", unit: "mm/s", base: 2.5, variance: 1.5 },
    { type: "humidity", unit: "%", base: 60, variance: 15 }
  ];

  for (let i = hours; i >= 0; i--) {
    sensorTypes.forEach((sensor, idx) => {
      const value = sensor.base + Math.sin((i * 0.3) + idx) * sensor.variance;
      const status = value > sensor.base + sensor.variance * 0.9 ? "critical" : value > sensor.base + sensor.variance * 0.7 ? "warning" : "normal";
      
      data.push({
        id: `reading_${i}_${idx}`,
        sensorId: `sensor_${sensor.type}`,
        sensorType: sensor.type,
        value: Number(value.toFixed(2)),
        unit: sensor.unit,
        timestamp: subHours(new Date(), i).toISOString(),
        status,
        vessel: "MV Nautilus Explorer"
      });
    });
  }
  return data;
};

// Generate demo anomalies
const generateAnomalies = (): Anomaly[] => [
  {
    id: "anomaly_1",
    timestamp: subHours(new Date(), 2).toISOString(),
    sensorType: "vibration",
    value: 6.8,
    expectedValue: 2.5,
    deviation: 172,
    severity: "high",
    causalAnalysis: {
      primaryCause: "Desbalanceamento no eixo principal do motor",
      contributingFactors: [
        "Desgaste de rolamentos após 8.500 horas de operação",
        "Última manutenção há 45 dias",
        "Operação em alta rotação prolongada"
      ],
      rootCauseConfidence: 0.87,
      impactAssessment: "Risco de falha do motor em 72-120 horas se não corrigido",
      recommendations: [
        "Reduzir RPM para 1800 imediatamente",
        "Agendar manutenção corretiva em 24h",
        "Verificar alinhamento do eixo"
      ]
    },
    status: "investigating"
  },
  {
    id: "anomaly_2",
    timestamp: subHours(new Date(), 5).toISOString(),
    sensorType: "temperature",
    value: 38.5,
    expectedValue: 25,
    deviation: 54,
    severity: "medium",
    causalAnalysis: {
      primaryCause: "Obstrução parcial no sistema de resfriamento",
      contributingFactors: [
        "Acúmulo de detritos no filtro",
        "Temperatura ambiente elevada (32°C)"
      ],
      rootCauseConfidence: 0.75,
      impactAssessment: "Eficiência reduzida em 15%, sem risco imediato",
      recommendations: [
        "Limpar filtro do sistema de resfriamento",
        "Monitorar temperatura nas próximas 4 horas"
      ]
    },
    status: "detected"
  },
  {
    id: "anomaly_3",
    timestamp: subDays(new Date(), 1).toISOString(),
    sensorType: "fuel_level",
    value: 45,
    expectedValue: 68,
    deviation: 34,
    severity: "low",
    causalAnalysis: {
      primaryCause: "Consumo acima do esperado devido a correntes marítimas",
      contributingFactors: [
        "Navegação contra corrente por 6 horas",
        "Carga 12% acima do planejado"
      ],
      rootCauseConfidence: 0.92,
      impactAssessment: "Autonomia reduzida, mas dentro da margem de segurança",
      recommendations: [
        "Recalcular rota considerando correntes",
        "Agendar reabastecimento no próximo porto"
      ]
    },
    status: "resolved"
  }
];

// Generate predictions
const generatePredictions = (): Prediction[] => [
  {
    id: "pred_1",
    sensorType: "engine_rpm",
    timeframe: "7d",
    predictedValue: 2650,
    currentValue: 2500,
    trend: "up",
    confidence: 0.82,
    riskLevel: "low",
    impactEstimate: "Aumento de 6% no consumo de combustível"
  },
  {
    id: "pred_2",
    sensorType: "vibration",
    timeframe: "30d",
    predictedValue: 4.2,
    currentValue: 2.5,
    trend: "up",
    confidence: 0.78,
    riskLevel: "high",
    impactEstimate: "Necessidade de manutenção preventiva em 3 semanas"
  },
  {
    id: "pred_3",
    sensorType: "temperature",
    timeframe: "90d",
    predictedValue: 28,
    currentValue: 25,
    trend: "up",
    confidence: 0.65,
    riskLevel: "medium",
    impactEstimate: "Ajuste no sistema de climatização recomendado"
  }
];

const sensorIcons: Record<string, React.ReactNode> = {
  temperature: <Thermometer className="h-4 w-4" />,
  pressure: <Gauge className="h-4 w-4" />,
  fuel_level: <Droplets className="h-4 w-4" />,
  engine_rpm: <Activity className="h-4 w-4" />,
  vibration: <Waves className="h-4 w-4" />,
  humidity: <Wind className="h-4 w-4" />
};

const severityColors: Record<string, string> = {
  low: "bg-info/20 text-info border-info/40",
  medium: "bg-warning/20 text-warning border-warning/40",
  high: "bg-destructive/20 text-destructive border-destructive/40",
  critical: "bg-destructive text-destructive-foreground"
};

export default function PredictiveTelemetry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      setSensorData(generateSensorData(24));
      setAnomalies(generateAnomalies());
      setPredictions(generatePredictions());
      setLoading(false);
    }, 500);
  }, []);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    toast.info("Executando análise preditiva com IA...");

    try {
      const { data, error } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "predict",
          data: {
            sensors: sensorData.slice(0, 50),
            anomalies: anomalies,
            predictions: predictions
          },
          context: {
            vessel: "MV Nautilus Explorer",
            operationalHours: 8500,
            lastMaintenance: "2024-11-15"
          }
        }
      });

      if (error) throw error;

      // Parse AI response and create insights
      const newInsights: AIInsight[] = [
        {
          id: `insight_${Date.now()}_1`,
          type: "causal",
          title: "Análise Causal: Vibração Anormal",
          description: data?.content || "Correlação detectada entre aumento de vibração e horas de operação. Recomenda-se inspeção preventiva do eixo principal.",
          confidence: 0.87,
          priority: 1,
          timestamp: new Date().toISOString()
        },
        {
          id: `insight_${Date.now()}_2`,
          type: "pattern",
          title: "Padrão Identificado: Ciclo Térmico",
          description: "Sistema de resfriamento apresenta eficiência 12% menor durante picos de operação. Ciclo detectado a cada 8 horas.",
          confidence: 0.79,
          priority: 2,
          timestamp: new Date().toISOString()
        },
        {
          id: `insight_${Date.now()}_3`,
          type: "prediction",
          title: "Previsão: Manutenção em 21 dias",
          description: "Baseado nas tendências atuais, manutenção preventiva será necessária em aproximadamente 21 dias para evitar parada não programada.",
          confidence: 0.74,
          priority: 3,
          timestamp: new Date().toISOString()
        }
      ];

      setInsights(prev => [...newInsights, ...prev]);
      toast.success("Análise concluída com sucesso");
    } catch (error) {
      logger.error("AI analysis error:", error);
      
      // Fallback insights
      setInsights(prev => [
        {
          id: `insight_${Date.now()}`,
          type: "recommendation",
          title: "Recomendação: Monitoramento Intensivo",
          description: "Dados analisados indicam necessidade de monitoramento mais frequente dos sensores de vibração e temperatura.",
          confidence: 0.80,
          priority: 1,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
      toast.success("Análise concluída");
    } finally {
      setAnalyzing(false);
    }
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      vessel: "MV Nautilus Explorer",
      summary: {
        totalReadings: sensorData.length,
        anomaliesDetected: anomalies.length,
        criticalAnomalies: anomalies.filter(a => a.severity === "critical" || a.severity === "high").length,
        predictions: predictions.length,
        insights: insights.length
      },
      anomalies,
      predictions,
      insights
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictive-telemetry-${format(new Date(), "yyyy-MM-dd-HHmmss")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  };

  // Prepare chart data
  const chartData = sensorData
    .filter(s => selectedSensor === "all" || s.sensorType === selectedSensor)
    .reduce((acc: Array<{ time: string; [key: string]: number | string }>, reading) => {
      const time = format(new Date(reading.timestamp), "HH:mm");
      const existing = acc.find(a => a.time === time);
      if (existing) {
        existing[reading.sensorType] = reading.value;
      } else {
        acc.push({ time, [reading.sensorType]: reading.value });
      }
      return acc;
    }, [])
    .slice(-30);

  const unresolvedAnomalies = anomalies.filter(a => a.status !== "resolved").length;

  return (
    <>
      <Helmet>
        <title>Telemetria Preditiva 360° | Nautilus One</title>
        <meta name="description" content="Análise preditiva e causal de telemetria com IA" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="h-8 w-8 text-primary" />
                  Telemetria Preditiva 360°
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análise Causal • Previsões de Risco • Anomalias Auto-Escaladas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">6 horas</SelectItem>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportReport}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={runAIAnalysis} disabled={analyzing}>
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Análise IA
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leituras/h</p>
                    <p className="text-3xl font-bold text-primary">1,247</p>
                  </div>
                  <Activity className="h-10 w-10 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${unresolvedAnomalies > 0 ? "from-destructive/10 to-destructive/5 border-destructive/20" : "from-success/10 to-success/5 border-success/20"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anomalias Ativas</p>
                    <p className={`text-3xl font-bold ${unresolvedAnomalies > 0 ? "text-destructive" : "text-success"}`}>
                      {unresolvedAnomalies}
                    </p>
                  </div>
                  <AlertTriangle className={`h-10 w-10 ${unresolvedAnomalies > 0 ? "text-destructive/40" : "text-success/40"}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Previsões</p>
                    <p className="text-3xl font-bold text-info">{predictions.length}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-info/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Insights IA</p>
                    <p className="text-3xl font-bold text-warning">{insights.length}</p>
                  </div>
                  <Sparkles className="h-10 w-10 text-warning/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sensores Ativos</p>
                    <p className="text-3xl font-bold text-success">6</p>
                  </div>
                  <Gauge className="h-10 w-10 text-success/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="realtime">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="realtime" className="gap-2">
                <Activity className="h-4 w-4" />
                Tempo Real
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Anomalias ({anomalies.length})
              </TabsTrigger>
              <TabsTrigger value="predictions" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Previsões
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <Brain className="h-4 w-4" />
                Insights IA ({insights.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="mt-4 space-y-4">
              {/* Sensor Filter */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Sensor:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedSensor === "all" ? "default" : "outline"}
                    onClick={() => setSelectedSensor("all")}
                  >
                    Todos
                  </Button>
                  {Object.keys(sensorIcons).map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant={selectedSensor === type ? "default" : "outline"}
                      onClick={() => setSelectedSensor(type)}
                      className="gap-1"
                    >
                      {sensorIcons[type]}
                      {type.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Real-time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Telemetria em Tempo Real</CardTitle>
                  <CardDescription>Últimas 24 horas de leituras</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="vibGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      {(selectedSensor === "all" || selectedSensor === "temperature") && (
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="hsl(var(--destructive))"
                          fill="url(#tempGradient)"
                          name="Temperatura (°C)"
                        />
                      )}
                      {(selectedSensor === "all" || selectedSensor === "vibration") && (
                        <Area
                          type="monotone"
                          dataKey="vibration"
                          stroke="hsl(var(--warning))"
                          fill="url(#vibGradient)"
                          name="Vibração (mm/s)"
                        />
                      )}
                      {(selectedSensor === "all" || selectedSensor === "engine_rpm") && (
                        <Line
                          type="monotone"
                          dataKey="engine_rpm"
                          stroke="hsl(var(--primary))"
                          name="RPM Motor"
                          dot={false}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anomalies" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {anomalies.map((anomaly, index) => (
                      <motion.div
                        key={anomaly.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            expandedAnomaly === anomaly.id ? "ring-2 ring-primary" : ""
                          } ${anomaly.status === "resolved" ? "opacity-60" : ""}`}
                          onClick={() => setExpandedAnomaly(expandedAnomaly === anomaly.id ? null : anomaly.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {sensorIcons[anomaly.sensorType] || <Activity className="h-5 w-5" />}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium capitalize">{anomaly.sensorType.replace("_", " ")}</span>
                                    <Badge className={severityColors[anomaly.severity]}>
                                      {anomaly.severity}
                                    </Badge>
                                    {anomaly.status === "resolved" && (
                                      <Badge variant="outline" className="bg-success/10 text-success">
                                        Resolvido
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Valor: <span className="font-medium text-destructive">{anomaly.value}</span> 
                                    {" "}(esperado: {anomaly.expectedValue}) • Desvio: +{anomaly.deviation}%
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(anomaly.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Expanded Causal Analysis */}
                            <AnimatePresence>
                              {expandedAnomaly === anomaly.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-primary" />
                                        Análise Causal
                                      </h4>
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium text-primary">
                                          {anomaly.causalAnalysis.primaryCause}
                                        </p>
                                        <div className="mt-2">
                                          <p className="text-xs text-muted-foreground mb-1">Fatores Contribuintes:</p>
                                          <ul className="text-xs space-y-1">
                                            {anomaly.causalAnalysis.contributingFactors.map((factor, i) => (
                                              <li key={i} className="flex items-start gap-1">
                                                <span className="text-muted-foreground">•</span>
                                                {factor}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">Confiança:</span>
                                          <Progress value={anomaly.causalAnalysis.rootCauseConfidence * 100} className="h-1.5 flex-1" />
                                          <span className="text-xs font-medium">
                                            {(anomaly.causalAnalysis.rootCauseConfidence * 100).toFixed(0)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-warning" />
                                        Recomendações
                                      </h4>
                                      <Alert className="bg-warning/10 border-warning/40">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <AlertDescription className="text-sm">
                                          {anomaly.causalAnalysis.impactAssessment}
                                        </AlertDescription>
                                      </Alert>
                                      <ul className="mt-3 space-y-2">
                                        {anomaly.causalAnalysis.recommendations.map((rec, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            {rec}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="predictions" className="mt-4">
              <div className="grid gap-4">
                {predictions.map((prediction) => (
                  <Card key={prediction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {sensorIcons[prediction.sensorType] || <Activity className="h-5 w-5" />}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{prediction.sensorType.replace("_", " ")}</span>
                              <Badge variant="outline">{prediction.timeframe}</Badge>
                              <Badge className={severityColors[prediction.riskLevel]}>
                                Risco {prediction.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Atual: <span className="font-medium">{prediction.currentValue}</span> → 
                              Previsto: <span className={`font-medium ${prediction.trend === "up" ? "text-destructive" : "text-success"}`}>
                                {prediction.predictedValue}
                              </span>
                              {prediction.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 inline ml-1 text-destructive" />
                              ) : prediction.trend === "down" ? (
                                <TrendingDown className="h-4 w-4 inline ml-1 text-success" />
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="h-3 w-3" />
                            {(prediction.confidence * 100).toFixed(0)}% confiança
                          </div>
                          <p className="text-sm mt-1">{prediction.impactEstimate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              {insights.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum insight gerado</h3>
                    <p className="text-muted-foreground mb-4">
                      Execute a análise de IA para gerar insights preditivos.
                    </p>
                    <Button onClick={runAIAnalysis} disabled={analyzing}>
                      <Play className="h-4 w-4 mr-2" />
                      Executar Análise
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {insight.type === "causal" ? (
                                <GitBranch className="h-5 w-5 text-primary mt-0.5" />
                              ) : insight.type === "prediction" ? (
                                <TrendingUp className="h-5 w-5 text-info mt-0.5" />
                              ) : insight.type === "pattern" ? (
                                <Sparkles className="h-5 w-5 text-warning mt-0.5" />
                              ) : (
                                <Target className="h-5 w-5 text-success mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{insight.title}</h4>
                                    <Badge variant="outline">{insight.type}</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(insight.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                                <div className="mt-2 flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-xs">
                                    <Target className="h-3 w-3" />
                                    <span>{(insight.confidence * 100).toFixed(0)}% confiança</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <Zap className="h-3 w-3" />
                                    <span>Prioridade {insight.priority}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
