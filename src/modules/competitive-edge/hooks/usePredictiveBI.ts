/**
 * 📊 usePredictiveBI Hook
 * AI-powered business intelligence with predictions
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Metric {
  name: string;
  value: string;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface Prediction {
  category: string;
  prediction: string;
  probability: number;
  timeframe: string;
  impact: "low" | "medium" | "high";
}

export interface Anomaly {
  id: string;
  type: "outlier" | "pattern" | "quality" | "warning";
  source: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string;
  recommendation: string;
  confidence: number;
}

export interface Recommendation {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  priority: "critical" | "high" | "medium" | "low";
  category?: string;
  effort: "low" | "medium" | "high";
  impact: string;
  timeline?: string;
  estimatedSavings?: string;
}

export interface PredictiveInsights {
  summary: string;
  metrics: Metric[];
  predictions: Prediction[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  opportunities: Array<{ title: string; potentialSavings: string; implementation: string }>;
  confidence: number;
}

export interface TrendPrediction {
  metric: string;
  currentTrend: "increasing" | "decreasing" | "stable" | "volatile";
  trendStrength: number;
  predictions: Array<{ date: string; value: number; lower: number; upper: number }>;
  factors: string[];
  risks: string[];
  seasonality: string;
  confidence: number;
  insight: string;
}

export interface AnomalyReport {
  anomalies: Anomaly[];
  overallHealthScore: number;
  areasOfConcern: string[];
  timestamp: string;
}

export interface DashboardConfig {
  title: string;
  widgets: Array<{
    id: string;
    type: "metric" | "chart" | "table" | "alert" | "map" | "list";
    title: string;
    dataSource: string;
    position: { x: number; y: number; w: number; h: number };
    config: any;
    refreshInterval: number;
  }>;
  alerts: Array<{ condition: string; threshold: string; action: string }>;
  quickActions: Array<{ label: string; action: string; icon: string }>;
}

export interface ExecutiveSummary {
  headline: string;
  summary: string;
  keyMetrics: Array<{ name: string; value: string; change: string; status: "positive" | "neutral" | "negative" }>;
  highlights: string[];
  concerns: string[];
  outlook: string;
  generatedAt: string;
}

// Hooks
export function useGenerateInsights() {
  return useMutation({
    mutationFn: async (params: { context?: string; period?: string; userId?: string }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "generate-insights", ...params },
      });
      if (error) throw error;
      return data as PredictiveInsights;
    },
    onSuccess: (data) => {
      toast.success("🔮 Insights preditivos gerados", {
        description: `${data.predictions.length} predições | Confiança: ${data.confidence}%`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao gerar insights", { description: error.message });
    },
  });
}

export function usePredictTrends() {
  return useMutation({
    mutationFn: async ({ metric, horizon }: { metric: string; horizon?: number }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "predict-trends", metric, horizon },
      });
      if (error) throw error;
      return data as TrendPrediction;
    },
    onSuccess: (data) => {
      toast.success(`📈 Tendência de ${data.metric}`, {
        description: `${data.currentTrend} | Confiança: ${data.confidence}%`,
      });
    },
  });
}

export function useDetectAnomalies() {
  return useMutation({
    mutationFn: async (params: { dataSource?: string }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "detect-anomalies", ...params },
      });
      if (error) throw error;
      return data as AnomalyReport;
    },
    onSuccess: (data) => {
      if (data.anomalies.length > 0) {
        toast.warning(`🔍 ${data.anomalies.length} anomalias detectadas`, {
          description: `Health Score: ${data.overallHealthScore}%`,
        });
      } else {
        toast.success("✅ Nenhuma anomalia detectada", {
          description: `Health Score: ${data.overallHealthScore}%`,
        });
      }
    },
  });
}

export function useRecommendActions() {
  return useMutation({
    mutationFn: async ({ insights, context }: { insights?: any; context?: string }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "recommend-actions", insights, context },
      });
      if (error) throw error;
      return data as { recommendations: Recommendation[]; quickWins: string[]; longTermInitiatives: string[] };
    },
    onSuccess: (data) => {
      toast.success("💡 Recomendações geradas", {
        description: `${data.recommendations.length} ações | ${data.quickWins.length} quick wins`,
      });
    },
  });
}

export function usePersonalizedDashboard() {
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role?: string }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "personalized-dashboard", userId, role },
      });
      if (error) throw error;
      return data as DashboardConfig;
    },
    onSuccess: (data) => {
      toast.success("📊 Dashboard personalizado criado", {
        description: `${data.widgets.length} widgets configurados`,
      });
    },
  });
}

export function useExecutiveSummary() {
  return useMutation({
    mutationFn: async (params: { period?: string }) => {
      const { data, error } = await supabase.functions.invoke("predictive-bi", {
        body: { action: "executive-summary", ...params },
      });
      if (error) throw error;
      return data as ExecutiveSummary;
    },
    onSuccess: (data) => {
      toast.success("📋 Sumário executivo gerado", {
        description: data.headline,
      });
    },
  });
}

// Query for stored insights
export function useStoredInsights() {
  return useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });
}
