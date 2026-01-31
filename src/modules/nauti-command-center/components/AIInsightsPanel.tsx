/**
 * PATCH 854 - AI Insights Panel
 * Real-time AI-generated insights and recommendations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle,
  RefreshCw,
  Zap,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface AIInsight {
  id: string;
  type: "prediction" | "anomaly" | "recommendation" | "optimization";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  timestamp: Date;
  status: "new" | "viewed" | "actioned" | "dismissed";
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInsights();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadInsights, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedInsights: AIInsight[] = (data || []).map((item) => ({
        id: item.id,
        type: getInsightType(item.category),
        title: item.title,
        description: item.description,
        confidence: item.confidence * 100,
        priority: item.priority as AIInsight["priority"],
        actionable: item.actionable,
        timestamp: new Date(item.created_at),
        status: item.status as AIInsight["status"],
      }));

      setInsights(formattedInsights);
    } catch (error) {
      logger.error("Error loading insights:", error);
      // Use mock data if database fails
      setInsights(getMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const getInsightType = (category: string): AIInsight["type"] => {
    const typeMap: Record<string, AIInsight["type"]> = {
      prediction: "prediction",
      anomaly: "anomaly",
      recommendation: "recommendation",
      optimization: "optimization",
    };
    return typeMap[category] || "recommendation";
  };

  const getMockInsights = (): AIInsight[] => [
    {
      id: "1",
      type: "prediction",
      title: "Pico de Manutenção Previsto",
      description: "IA detectou padrão que indica necessidade de manutenção preventiva em 3 embarcações nos próximos 7 dias.",
      confidence: 94,
      priority: "high",
      actionable: true,
      timestamp: new Date(),
      status: "new",
    },
    {
      id: "2",
      type: "anomaly",
      title: "Consumo de Combustível Anormal",
      description: "Embarcação MV-Neptune apresenta consumo 23% acima do esperado para a rota atual.",
      confidence: 87,
      priority: "medium",
      actionable: true,
      timestamp: new Date(Date.now() - 3600000),
      status: "new",
    },
    {
      id: "3",
      type: "optimization",
      title: "Otimização de Rota Disponível",
      description: "Rota alternativa identificada pode reduzir tempo de viagem em 12% e economizar combustível.",
      confidence: 91,
      priority: "medium",
      actionable: true,
      timestamp: new Date(Date.now() - 7200000),
      status: "viewed",
    },
    {
      id: "4",
      type: "recommendation",
      title: "Rotação de Tripulação",
      description: "3 membros da tripulação atingirão limite de horas em 5 dias. Recomendado iniciar processo de substituição.",
      confidence: 99,
      priority: "high",
      actionable: true,
      timestamp: new Date(Date.now() - 10800000),
      status: "new",
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
    toast.success("Insights atualizados");
  };

  const handleAction = async (insight: AIInsight) => {
    try {
      await supabase
        .from("ai_insights")
        .update({ status: "actioned" })
        .eq("id", insight.id);

      setInsights((prev) =>
        prev.map((i) => (i.id === insight.id ? { ...i, status: "actioned" } : i))
      );
      toast.success(`Ação registrada para: ${insight.title}`);
    } catch (error) {
      logger.error("Error updating insight:", error);
    }
  };

  const getTypeIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "prediction":
        return <TrendingUp className="h-4 w-4" />;
      case "anomaly":
        return <AlertTriangle className="h-4 w-4" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />;
      case "optimization":
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "prediction":
        return "bg-primary/20 text-primary border-primary/30";
      case "anomaly":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "recommendation":
        return "bg-warning/20 text-warning border-warning/30";
      case "optimization":
        return "bg-success/20 text-success border-success/30";
    }
  };

  const getPriorityColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const newInsights = insights.filter((i) => i.status === "new").length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Insights da IA
            {newInsights > 0 && (
              <Badge variant="destructive" className="ml-2">
                {newInsights} novo{newInsights > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <AnimatePresence mode="popLayout">
            {insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Nenhum insight disponível</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-3 border ${
                        insight.status === "new"
                          ? "border-primary/50 bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getTypeColor(
                            insight.type
                          )}`}
                        >
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {insight.title}
                            </h4>
                            <div
                              className={`h-2 w-2 rounded-full ${getPriorityColor(
                                insight.priority
                              )}`}
                              title={`Prioridade: ${insight.priority}`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence.toFixed(0)}% confiança
                              </Badge>
                              {insight.status === "actioned" && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Resolvido
                                </Badge>
                              )}
                            </div>
                            {insight.actionable &&
                              insight.status !== "actioned" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => handleAction(insight)}
                                >
                                  Agir
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AIInsightsPanel;
