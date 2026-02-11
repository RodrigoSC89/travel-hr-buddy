/**
 * PATCH 855 - AI Predictive Analytics Panel
 * ✅ P0-002: Migrado para dados reais do Supabase
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
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadPredictions(), loadTrends()]);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      const [maintRes, insightsRes] = await Promise.all([
        supabase.from("ai_maintenance_predictions").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("ai_insights").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      const mapped: Prediction[] = [];

      (maintRes.data || []).forEach((m) => {
        mapped.push({
          id: m.id,
          category: "maintenance",
          title: m.equipment_name || "Manutenção Preditiva",
          prediction: m.recommended_action || `Probabilidade de falha: ${(m.failure_probability * 100).toFixed(0)}%`,
          probability: Math.round((m.failure_probability || 0) * 100),
          timeframe: m.predicted_failure_date ? new Date(m.predicted_failure_date).toLocaleDateString("pt-BR") : "—",
          trend: m.failure_probability > 0.7 ? "up" : "stable",
          impact: m.failure_probability > 0.5 ? "negative" : "neutral",
          actionRecommended: m.recommended_action || "Monitorar equipamento",
        });
      });

      (insightsRes.data || []).forEach((i) => {
        const cat = i.category === "crew" ? "crew" : i.category === "fuel" ? "fuel" : i.category === "route" ? "route" : "risk";
        mapped.push({
          id: i.id,
          category: cat,
          title: i.title,
          prediction: i.description,
          probability: Math.round((i.confidence || 0.5) * 100),
          timeframe: "7 dias",
          trend: i.priority === "high" ? "up" : "stable",
          impact: i.priority === "high" ? "negative" : i.priority === "low" ? "positive" : "neutral",
          actionRecommended: i.impact_value || "Analisar detalhes",
        });
      });

      setPredictions(mapped);
    } catch (err) {
      logger.error("Error loading predictions:", err);
    }
  };

  const loadTrends = async () => {
    try {
      const { data } = await supabase
        .from("ai_behavior_snapshots")
        .select("module_name, accuracy_score, confidence_avg")
        .order("snapshot_date", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const grouped = new Map<string, { scores: number[]; confidences: number[] }>();
        data.forEach((d) => {
          const key = d.module_name || "Geral";
          if (!grouped.has(key)) grouped.set(key, { scores: [], confidences: [] });
          const g = grouped.get(key)!;
          if (d.accuracy_score) g.scores.push(d.accuracy_score);
          if (d.confidence_avg) g.confidences.push(d.confidence_avg);
        });

        const trendData: TrendData[] = [];
        grouped.forEach((v, k) => {
          const current = v.scores.length > 0 ? Math.round(v.scores[0] * 100) : 80;
          const prev = v.scores.length > 1 ? Math.round(v.scores[1] * 100) : current;
          trendData.push({
            label: k,
            current,
            predicted: Math.min(100, current + Math.round((current - prev) * 0.5)),
            change: parseFloat((current - prev).toFixed(1)),
          });
        });

        if (trendData.length > 0) {
          setTrends(trendData.slice(0, 4));
          return;
        }
      }

      // Fallback if no data
      setTrends([
        { label: "Eficiência Operacional", current: 0, predicted: 0, change: 0 },
        { label: "Índice de Segurança", current: 0, predicted: 0, change: 0 },
      ]);
    } catch (err) {
      logger.error("Error loading trends:", err);
    }
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
        return "bg-warning/20 text-warning";
      case "crew":
        return "bg-primary/20 text-primary";
      case "fuel":
        return "bg-success/20 text-success";
      case "route":
        return "bg-accent/20 text-accent-foreground";
      case "risk":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted/20 text-muted-foreground";
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
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : trend.change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Gauge className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{trend.current}%</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-lg font-semibold text-primary">{trend.predicted}%</span>
                </div>
                <div className={cn(
                  "text-xs mt-1",
                  trend.change > 0 ? "text-success" : trend.change < 0 ? "text-destructive" : "text-warning"
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
                            ? "border-success/30 text-success"
                            : prediction.impact === "negative"
                            ? "border-destructive/30 text-destructive"
                            : "border-warning/30 text-warning"
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
