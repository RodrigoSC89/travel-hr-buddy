/**
 * PATCH 855 - AI Predictive Analytics Panel
 * Real-time predictive analytics and trend forecasting
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Gauge,
  Calendar,
  Ship,
  Users,
  Fuel,
  Wrench,
  RefreshCw,
  Brain,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Prediction {
  id: string;
  category: "maintenance" | "crew" | "fuel" | "route" | "risk";
  title: string;
  prediction: string;
  probability: number;
  timeframe: string;
  trend: "up" | "down" | "stable";
  impact: "positive" | "negative" | "neutral";
  actionRecommended: string;
}

interface TrendData {
  label: string;
  current: number;
  predicted: number;
  change: number;
}

export function AIPredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  // PATCH v44: Iniciar com loading=false para NUNCA bloquear renderização
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadPredictions();
    loadTrends();
  }, []);

  const loadPredictions = async () => {
    // Simulated predictions - in production, this would call AI service
    const mockPredictions: Prediction[] = [
      {
        id: "1",
        category: "maintenance",
        title: "Manutenção Preventiva Necessária",
        prediction: "Motor principal do MV-Atlas requer inspeção em 15 dias",
        probability: 87,
        timeframe: "2 semanas",
        trend: "up",
        impact: "negative",
        actionRecommended: "Agendar inspeção preventiva imediata",
      },
      {
        id: "2",
        category: "fuel",
        title: "Otimização de Combustível",
        prediction: "Economia de 12% possível com ajuste de velocidade",
        probability: 92,
        timeframe: "Próxima viagem",
        trend: "down",
        impact: "positive",
        actionRecommended: "Aplicar perfil de velocidade econômico",
      },
      {
        id: "3",
        category: "crew",
        title: "Rotação de Tripulação",
        prediction: "3 certificados expiram nos próximos 30 dias",
        probability: 100,
        timeframe: "1 mês",
        trend: "up",
        impact: "negative",
        actionRecommended: "Iniciar processo de renovação",
      },
      {
        id: "4",
        category: "route",
        title: "Condições Meteorológicas",
        prediction: "Tempestade prevista na rota Santos-Rotterdam",
        probability: 78,
        timeframe: "5 dias",
        trend: "up",
        impact: "negative",
        actionRecommended: "Considerar rota alternativa",
      },
      {
        id: "5",
        category: "risk",
        title: "Risco Operacional Baixo",
        prediction: "Operações dentro dos parâmetros seguros",
        probability: 95,
        timeframe: "7 dias",
        trend: "stable",
        impact: "positive",
        actionRecommended: "Manter monitoramento regular",
      },
    ];

    setPredictions(mockPredictions);
    setLoading(false);
  };

  const loadTrends = () => {
    const mockTrends: TrendData[] = [
      { label: "Eficiência Operacional", current: 94, predicted: 96, change: 2.1 },
      { label: "Consumo de Combustível", current: 85, predicted: 78, change: -8.2 },
      { label: "Índice de Segurança", current: 98, predicted: 99, change: 1.0 },
      { label: "Custo por Milha", current: 72, predicted: 68, change: -5.5 },
    ];
    setTrends(mockTrends);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "crew":
        return <Users className="h-4 w-4" />;
      case "fuel":
        return <Fuel className="h-4 w-4" />;
      case "route":
        return <Ship className="h-4 w-4" />;
      case "risk":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance":
        return "bg-orange-500/20 text-orange-400";
      case "crew":
        return "bg-blue-500/20 text-blue-400";
      case "fuel":
        return "bg-green-500/20 text-green-400";
      case "route":
        return "bg-purple-500/20 text-purple-400";
      case "risk":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredPredictions = activeCategory === "all"
    ? predictions
    : predictions.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Análise Preditiva IA</h2>
            <p className="text-sm text-muted-foreground">
              Previsões e tendências baseadas em machine learning
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadPredictions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-4 gap-4">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                  {trend.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : trend.change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  ) : (
                    <Gauge className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{trend.current}%</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-lg font-semibold text-primary">{trend.predicted}%</span>
                </div>
                <div className={cn(
                  "text-xs mt-1",
                  trend.change > 0 ? "text-green-400" : trend.change < 0 ? "text-red-400" : "text-yellow-400"
                )}>
                  {trend.change > 0 ? "+" : ""}{trend.change}% previsto
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="route">Rotas</TabsTrigger>
          <TabsTrigger value="risk">Riscos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Predictions List */}
      <div className="grid gap-4">
        {filteredPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg", getCategoryColor(prediction.category))}>
                    {getCategoryIcon(prediction.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{prediction.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          prediction.impact === "positive"
                            ? "border-green-500/30 text-green-400"
                            : prediction.impact === "negative"
                            ? "border-red-500/30 text-red-400"
                            : "border-yellow-500/30 text-yellow-400"
                        )}
                      >
                        {prediction.impact === "positive" ? "Positivo" : prediction.impact === "negative" ? "Atenção" : "Neutro"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prediction.prediction}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {prediction.timeframe}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {prediction.probability}% probabilidade
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-2">
                      <Progress value={prediction.probability} className="w-20 h-2" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver Ação
                    </Button>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium">Ação Recomendada:</span>
                    <span className="text-muted-foreground">{prediction.actionRecommended}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AIPredictiveAnalytics;
