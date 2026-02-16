import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, AlertTriangle, Wrench, Calendar, BarChart3, 
  Target, Clock, CheckCircle, XCircle, Plus, RefreshCw, Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenancePrediction {
  id: string;
  component: string;
  vesselId: string;
  vesselName: string;
  probability: number;
  timeframe: string;
  priority: "low" | "medium" | "high" | "critical";
  recommendation: string;
  estimatedCost: number;
  lastMaintenance: Date;
  nextScheduled: Date;
  riskFactors: string[];
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  trend: "up" | "down" | "stable";
  unit: string;
}

export const PredictiveMaintenanceSystem = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const queryClient = useQueryClient();

  // Fetch predictions from ai_maintenance_predictions
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ["predictive-maintenance", selectedTimeframe],
    queryFn: async () => {
      const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[selectedTimeframe];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);

      const { data: preds, error } = await supabase
        .from("ai_maintenance_predictions")
        .select("*, vessels(name)")
        .order("failure_probability", { ascending: false });
      if (error) throw error;

      return (preds || []).map((p: any): MaintenancePrediction => ({
        id: p.id,
        component: p.equipment_name || "Equipamento",
        vesselId: p.vessel_id || "",
        vesselName: p.vessels?.name || "N/A",
        probability: Math.round((p.failure_probability || 0) * 100),
        timeframe: p.predicted_failure_date
          ? `${Math.max(1, Math.round((new Date(p.predicted_failure_date).getTime() - Date.now()) / 86400000))} dias`
          : "N/A",
        priority: p.failure_probability >= 0.8 ? "critical"
          : p.failure_probability >= 0.6 ? "high"
          : p.failure_probability >= 0.4 ? "medium" : "low",
        recommendation: p.recommended_action || "Monitorar",
        estimatedCost: 0,
        lastMaintenance: new Date(),
        nextScheduled: p.predicted_failure_date ? new Date(p.predicted_failure_date) : new Date(),
        riskFactors: Array.isArray(p.risk_factors) ? p.risk_factors.map(String) : [],
      }));
    },
  });

  // Fetch performance metrics from maintenance_tasks
  const { data: metrics = [] } = useQuery({
    queryKey: ["maintenance-performance-metrics"],
    queryFn: async () => {
      const { count: totalTasks } = await supabase
        .from("maintenance_tasks")
        .select("*", { count: "exact", head: true });
      const { count: completedTasks } = await supabase
        .from("maintenance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");
      const { count: overdueTasks } = await supabase
        .from("maintenance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue");

      const availability = totalTasks && totalTasks > 0
        ? Math.round(((totalTasks - (overdueTasks || 0)) / totalTasks) * 100)
        : 95;

      return [
        { metric: "Disponibilidade", current: availability, target: 95, trend: "up" as const, unit: "%" },
        { metric: "Tarefas Completadas", current: completedTasks || 0, target: totalTasks || 0, trend: "stable" as const, unit: "" },
        { metric: "Tarefas Pendentes", current: (totalTasks || 0) - (completedTasks || 0), target: 0, trend: "down" as const, unit: "" },
        { metric: "Tarefas Vencidas", current: overdueTasks || 0, target: 0, trend: "down" as const, unit: "" },
      ];
    },
  });

  // Create prediction mutation
  const createPrediction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ai_maintenance_predictions").insert({
        equipment_id: crypto.randomUUID(),
        equipment_name: "Novo Equipamento",
        failure_probability: 0.5,
        recommended_action: "Inspeção recomendada",
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictive-maintenance"] });
      toast.success("Predição criada com sucesso");
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "medium": return "bg-warning/10 text-warning border-warning/30";
    case "low": return "bg-success/10 text-success border-success/30";
    default: return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-destructive";
    if (probability >= 60) return "text-warning";
    return "text-success";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-success" />;
    case "down": return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    case "stable": return <BarChart3 className="h-4 w-4 text-primary" />;
    default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMetricStatus = (current: number, target: number, metric: string) => {
    const isGood = metric.includes("Custos") || metric.includes("Consumo") || metric.includes("Emissões") || metric.includes("Vencidas") || metric.includes("Pendentes")
      ? current <= target
      : current >= target;
    return isGood;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manutenção Preditiva</h2>
          <p className="text-muted-foreground">
            Sistema inteligente de previsão e otimização de manutenção
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["predictive-maintenance"] })}>
            <RefreshCw className="h-4 w-4 mr-1" />Atualizar
          </Button>
          {(["7d", "30d", "90d"] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === "7d" ? "7 Dias" : timeframe === "30d" ? "30 Dias" : "90 Dias"}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions" className="gap-2">
            <Brain className="h-4 w-4" />Predições ({predictions.length})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="h-4 w-4" />Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Total Predições</p>
              <p className="text-2xl font-bold">{predictions.length}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Críticas</p>
              <p className="text-2xl font-bold text-destructive">
                {predictions.filter(p => p.priority === "critical").length}
              </p>
            </CardContent></Card>
            <Card><CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Alta Prioridade</p>
              <p className="text-2xl font-bold text-warning">
                {predictions.filter(p => p.priority === "high").length}
              </p>
            </CardContent></Card>
            <Card><CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Prob. Média</p>
              <p className="text-2xl font-bold">
                {predictions.length > 0 ? Math.round(predictions.reduce((a, p) => a + p.probability, 0) / predictions.length) : 0}%
              </p>
            </CardContent></Card>
          </div>

          {predictions.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma predição de manutenção disponível.</p>
              <Button className="mt-3" onClick={() => createPrediction.mutate()}>
                <Plus className="h-4 w-4 mr-1" />Criar Predição
              </Button>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{prediction.component}</CardTitle>
                        <CardDescription>{prediction.vesselName}</CardDescription>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(prediction.priority)}>
                        {prediction.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Probabilidade de Falha</span>
                      <span className={`text-lg font-bold ${getProbabilityColor(prediction.probability)}`}>
                        {prediction.probability}%
                      </span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" />Prazo: {prediction.timeframe}</div>
                      <div className="flex items-center gap-1"><Wrench className="h-3 w-3" />Ação: {prediction.recommendation}</div>
                    </div>
                    {prediction.riskFactors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prediction.riskFactors.map((factor) => (
                          <Badge key={factor} variant="outline" className="text-xs">{factor}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const isGood = getMetricStatus(metric.current, metric.target, metric.metric);
              return (
                <Card key={metric.metric}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{metric.current}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Meta: {metric.target}{metric.unit}</span>
                      {isGood
                        ? <CheckCircle className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />
                      }
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
