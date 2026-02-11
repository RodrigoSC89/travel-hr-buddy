/**
 * Predictive Maintenance 30/60/90 Days Forecast
 * AI-powered predictions for equipment failures and maintenance planning
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Wrench,
  Target,
  BarChart3,
  Sparkles,
  RefreshCw,
  Download,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

interface PredictionItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  componentCode: string;
  failureProbability: number;
  predictedDate: Date;
  daysUntilFailure: number;
  severity: "low" | "medium" | "high" | "critical";
  category: "30days" | "60days" | "90days";
  maintenanceType: "preventive" | "corrective" | "condition-based";
  estimatedCost: number;
  estimatedDowntime: number; // hours
  confidence: number;
  aiRecommendation: string;
  riskFactors: string[];
}

interface PredictionSummary {
  total30Days: number;
  total60Days: number;
  total90Days: number;
  criticalCount: number;
  estimatedTotalCost: number;
  preventedDowntime: number;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

export function Predictive30_60_90() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState<"30days" | "60days" | "90days">("30days");
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionItem | null>(null);

  useEffect(() => {
    runPredictiveAnalysis();
  }, []);

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-predictive-maintenance", {
        body: { horizonDays: [30, 60, 90] },
      });

      if (error) throw error;

      const normalized = Array.isArray(data?.predictions) ? data.predictions : [];
      const mappedPredictions = normalized.map((item: Record<string, unknown>, index: number) => normalizePrediction(item, index));

      setPredictions(mappedPredictions);
      setSummary({
        total30Days: mappedPredictions.filter((p: PredictionItem) => p.category === "30days").length,
        total60Days: mappedPredictions.filter((p: PredictionItem) => p.category === "60days").length,
        total90Days: mappedPredictions.filter((p: PredictionItem) => p.category === "90days").length,
        criticalCount: mappedPredictions.filter((p: PredictionItem) => p.severity === "critical" || p.severity === "high").length,
        estimatedTotalCost: mappedPredictions.reduce((sum: number, p: PredictionItem) => sum + p.estimatedCost, 0),
        preventedDowntime: mappedPredictions.reduce((sum: number, p: PredictionItem) => sum + p.estimatedDowntime, 0)
      });

      toast.success("Análise preditiva concluída", {
        description: `${mappedPredictions.length} previsões geradas para 90 dias`
      });
    } catch (error) {
      setPredictions([]);
      setSummary(null);
      toast.error("Não foi possível obter previsões reais. Verifique a integração.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateWorkOrder = async (prediction: PredictionItem) => {
    toast.success("Ordem de Serviço Gerada", {
      description: `OS preventiva criada para ${prediction.equipmentName}`
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-warning/80 text-foreground";
      default: return "bg-success text-success-foreground";
    }
  };

  const filteredPredictions = predictions.filter(p => p.category === activeView);

  // Chart data
  const severityData = [
    { name: "Crítico", value: predictions.filter(p => p.severity === "critical").length },
    { name: "Alto", value: predictions.filter(p => p.severity === "high").length },
    { name: "Médio", value: predictions.filter(p => p.severity === "medium").length },
    { name: "Baixo", value: predictions.filter(p => p.severity === "low").length }
  ].filter(d => d.value > 0);

  const timelineData = [
    { name: "30 dias", predictions: predictions.filter(p => p.category === "30days").length, cost: predictions.filter(p => p.category === "30days").reduce((s, p) => s + p.estimatedCost, 0) / 1000 },
    { name: "60 dias", predictions: predictions.filter(p => p.category === "60days").length, cost: predictions.filter(p => p.category === "60days").reduce((s, p) => s + p.estimatedCost, 0) / 1000 },
    { name: "90 dias", predictions: predictions.filter(p => p.category === "90days").length, cost: predictions.filter(p => p.category === "90days").reduce((s, p) => s + p.estimatedCost, 0) / 1000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl">
            <Brain className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Previsão 30/60/90 Dias
              <Badge className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Preditiva 2.0
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Antecipe falhas • Otimize manutenção • Reduza custos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={runPredictiveAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? "Analisando..." : "Atualizar Previsões"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{summary.total30Days}</p>
                  <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.total60Days}</p>
                  <p className="text-xs text-muted-foreground">Próximos 60 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.total90Days}</p>
                  <p className="text-xs text-muted-foreground">Próximos 90 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{summary.criticalCount}</p>
                  <p className="text-xs text-muted-foreground">Alta prioridade</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">R$ {(summary.estimatedTotalCost / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Custo estimado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição por Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline de Previsões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="predictions" name="Previsões" fill="#8b5cf6" />
                  <Bar yAxisId="right" dataKey="cost" name="Custo (R$ mil)" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Previsões Detalhadas</CardTitle>
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList>
                <TabsTrigger value="30days" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  30 dias
                </TabsTrigger>
                <TabsTrigger value="60days" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  60 dias
                </TabsTrigger>
                <TabsTrigger value="90days" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  90 dias
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredPredictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(prediction.severity)}>
                          {prediction.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{prediction.equipmentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {prediction.componentCode}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {prediction.failureProbability}% probabilidade
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {prediction.daysUntilFailure} dias
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {prediction.estimatedDowntime}h downtime
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          R$ {prediction.estimatedCost.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg mt-2">
                        <p className="text-sm flex items-start gap-2">
                          <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                          <span>{prediction.aiRecommendation}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {prediction.riskFactors.map((factor, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Confiança:</span>
                        <Progress value={prediction.confidence} className="h-2 flex-1 max-w-32" />
                        <span className="text-xs font-medium">{prediction.confidence}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => generateWorkOrder(prediction)}>
                        <Wrench className="h-3 w-3 mr-1" />
                        Gerar OS
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPredictions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p>Nenhuma previsão de falha para este período</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function normalizePrediction(item: Record<string, unknown>, index: number): PredictionItem {
  const predictedDateValue = (item?.predictedDate ?? item?.predicted_date ?? new Date().toISOString()) as string;
  const predictedDate = new Date(predictedDateValue);
  const daysUntilFailure = Math.max(0, Math.ceil((predictedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return {
    id: String(item?.id ?? `prediction-${index}`),
    equipmentId: String(item?.equipmentId ?? item?.equipment_id ?? "unknown"),
    equipmentName: String(item?.equipmentName ?? item?.equipment_name ?? "Equipamento"),
    componentCode: String(item?.componentCode ?? item?.component_code ?? "N/A"),
    failureProbability: Number(item?.failureProbability ?? item?.failure_probability ?? 0),
    predictedDate,
    daysUntilFailure,
    severity: (item?.severity ?? "low") as PredictionItem["severity"],
    category: (item?.category ?? "30days") as PredictionItem["category"],
    maintenanceType: (item?.maintenanceType ?? item?.maintenance_type ?? "preventive") as PredictionItem["maintenanceType"],
    estimatedCost: Number(item?.estimatedCost ?? item?.estimated_cost ?? 0),
    estimatedDowntime: Number(item?.estimatedDowntime ?? item?.estimated_downtime ?? 0),
    confidence: Number(item?.confidence ?? 0),
    aiRecommendation: String(item?.aiRecommendation ?? item?.ai_recommendation ?? "Revisar equipamento conforme plano."),
    riskFactors: Array.isArray(item?.riskFactors) ? item.riskFactors as string[] : [],
  };
}

export default Predictive30_60_90;
