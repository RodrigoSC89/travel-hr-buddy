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
      // Simulate AI analysis - in production, this calls the AI edge function
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPredictions: PredictionItem[] = [
        // 30 Days
        {
          id: "pred-1",
          equipmentId: "603.0004.02",
          equipmentName: "Bomba Hidráulica Popa",
          componentCode: "SEAL-HYD-001",
          failureProbability: 78,
          predictedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 12,
          severity: "high",
          category: "30days",
          maintenanceType: "preventive",
          estimatedCost: 4500,
          estimatedDowntime: 8,
          confidence: 89,
          aiRecommendation: "Substituir selos e rolamentos. Histórico indica desgaste acelerado devido a operação contínua.",
          riskFactors: ["Alta vibração detectada", "Temperatura elevada", "15.000h sem overhaul"]
        },
        {
          id: "pred-2",
          equipmentId: "605.0001.03",
          equipmentName: "Sistema Sprinkler",
          componentCode: "VALVE-SPK-003",
          failureProbability: 65,
          predictedDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 22,
          severity: "medium",
          category: "30days",
          maintenanceType: "condition-based",
          estimatedCost: 1200,
          estimatedDowntime: 4,
          confidence: 82,
          aiRecommendation: "Inspeção e teste de válvulas. Possível corrosão interna detectada por análise de vibração.",
          riskFactors: ["Corrosão potencial", "Última inspeção há 8 meses"]
        },
        // 60 Days
        {
          id: "pred-3",
          equipmentId: "601.0001.02",
          equipmentName: "Motor Principal STBD",
          componentCode: "TURBO-ME-002",
          failureProbability: 55,
          predictedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 45,
          severity: "high",
          category: "60days",
          maintenanceType: "preventive",
          estimatedCost: 18000,
          estimatedDowntime: 24,
          confidence: 76,
          aiRecommendation: "Overhaul do turbocompressor recomendado. Padrão de degradação similar ao histórico de falhas anteriores.",
          riskFactors: ["Perda de eficiência 8%", "Temperatura de escape elevada", "12.000h desde último overhaul"]
        },
        {
          id: "pred-4",
          equipmentId: "604.0002.01",
          equipmentName: "Gerador Diesel 1",
          componentCode: "INJ-GEN-001",
          failureProbability: 48,
          predictedDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 52,
          severity: "medium",
          category: "60days",
          maintenanceType: "condition-based",
          estimatedCost: 3200,
          estimatedDowntime: 6,
          confidence: 71,
          aiRecommendation: "Verificar e recalibrar injetores. Análise de combustão indica possível desbalanceamento.",
          riskFactors: ["Consumo de combustível +5%", "Emissões acima do normal"]
        },
        // 90 Days
        {
          id: "pred-5",
          equipmentId: "601.0001.01",
          equipmentName: "Motor Principal BB",
          componentCode: "COOL-SYS-001",
          failureProbability: 42,
          predictedDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 75,
          severity: "medium",
          category: "90days",
          maintenanceType: "preventive",
          estimatedCost: 5800,
          estimatedDowntime: 12,
          confidence: 68,
          aiRecommendation: "Manutenção do sistema de arrefecimento. Tendência de aumento de temperatura detectada.",
          riskFactors: ["Temperatura +3°C vs baseline", "Fluido com contaminação leve"]
        },
        {
          id: "pred-6",
          equipmentId: "602.0003.01",
          equipmentName: "Thruster de Proa",
          componentCode: "MOTOR-THR-001",
          failureProbability: 35,
          predictedDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
          daysUntilFailure: 85,
          severity: "low",
          category: "90days",
          maintenanceType: "condition-based",
          estimatedCost: 8500,
          estimatedDowntime: 16,
          confidence: 64,
          aiRecommendation: "Monitorar vibração do motor elétrico. Tendência de aumento gradual identificada.",
          riskFactors: ["Vibração +15% vs baseline", "6.500h de operação"]
        }
      ];

      setPredictions(mockPredictions);
      setSummary({
        total30Days: mockPredictions.filter(p => p.category === "30days").length,
        total60Days: mockPredictions.filter(p => p.category === "60days").length,
        total90Days: mockPredictions.filter(p => p.category === "90days").length,
        criticalCount: mockPredictions.filter(p => p.severity === "critical" || p.severity === "high").length,
        estimatedTotalCost: mockPredictions.reduce((sum, p) => sum + p.estimatedCost, 0),
        preventedDowntime: mockPredictions.reduce((sum, p) => sum + p.estimatedDowntime, 0)
      });

      toast.success("Análise preditiva concluída", {
        description: `${mockPredictions.length} previsões geradas para 90 dias`
      });
    } catch (error) {
      toast.error("Erro na análise preditiva");
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
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      default: return "bg-green-500 text-white";
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
                <Calendar className="h-5 w-5 text-red-500" />
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
                <AlertTriangle className="h-5 w-5 text-red-500" />
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
                <Target className="h-5 w-5 text-green-500" />
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
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
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

export default Predictive30_60_90;
