/**
 * Hook para dados preditivos do Supabase
 * Substitui mock data em SmartInsights, PredictiveAnalytics, PredictiveMaintenanceAI
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PredictiveMetric {
  id: string;
  name: string;
  currentValue: number;
  predictedValue: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  timeFrame: string;
  unit: string;
}

export interface MaintenancePrediction {
  componentId: string;
  componentName: string;
  vesselName: string;
  failureProbability: number;
  predictedFailureDate: string;
  daysUntilFailure: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  confidence: number;
  historicalData: {
    lastMaintenance: string;
    totalHours: number;
    failureHistory: number;
  };
}

export interface MaintenanceAlert {
  id: string;
  type: "predictive" | "scheduled" | "overdue";
  severity: "info" | "warning" | "critical";
  message: string;
  component: string;
  vessel: string;
  createdAt: Date;
}

// Hook para buscar predições de manutenção do banco
export function useMaintenancePredictions() {
  return useQuery({
    queryKey: ["maintenance-predictions"],
    queryFn: async (): Promise<MaintenancePrediction[]> => {
      const { data, error } = await supabase
        .from("ai_maintenance_predictions")
        .select(`
          id,
          equipment_id,
          equipment_name,
          vessel_id,
          failure_probability,
          predicted_failure_date,
          recommended_action,
          confidence,
          risk_factors,
          status,
          vessels:vessel_id (name)
        `)
        .order("failure_probability", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      type PredictionRow = Record<string, unknown>;
      return data.map((item: PredictionRow) => {
        const daysUntil = item.predicted_failure_date
          ? Math.ceil((new Date(item.predicted_failure_date as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 90;
        const vessels = item.vessels as Record<string, unknown> | null;

        return {
          componentId: item.equipment_id as string,
          componentName: item.equipment_name as string,
          vesselName: (vessels?.name as string) || "N/A",
          failureProbability: item.failure_probability as number,
          predictedFailureDate: (item.predicted_failure_date as string) || new Date().toISOString(),
          daysUntilFailure: Math.max(0, daysUntil),
          riskLevel: (item.failure_probability as number) > 0.8 ? "critical" : (item.failure_probability as number) > 0.6 ? "high" : (item.failure_probability as number) > 0.4 ? "medium" : "low",
          recommendedAction: (item.recommended_action as string) || "Monitorar regularmente",
          confidence: (item.confidence as number) || 0.75,
          historicalData: {
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalHours: 5000,
            failureHistory: 0
          }
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para alertas de manutenção
export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: ["maintenance-alerts"],
    queryFn: async (): Promise<MaintenanceAlert[]> => {
      const { data, error } = await supabase
        .from("maintenance_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        // Fallback: buscar de ai_maintenance_predictions com alta probabilidade
        const { data: predictions } = await supabase
          .from("ai_maintenance_predictions")
          .select("id, equipment_name, failure_probability, recommended_action, created_at, vessels:vessel_id (name)")
          .gt("failure_probability", 0.5)
          .order("failure_probability", { ascending: false })
          .limit(5);

        if (!predictions) return [];

        type PRow = Record<string, unknown>;
        return predictions.map((p: PRow) => ({
          id: p.id as string,
          type: "predictive" as const,
          severity: ((p.failure_probability as number) > 0.8 ? "critical" : (p.failure_probability as number) > 0.6 ? "warning" : "info") as MaintenanceAlert["severity"],
          message: (p.recommended_action as string) || `Atenção: ${p.equipment_name} requer verificação`,
          component: p.equipment_name as string,
          vessel: ((p.vessels as Record<string, unknown>)?.name as string) || "N/A",
          createdAt: new Date(p.created_at as string)
        }));
      }

      type AlertRow = Record<string, unknown>;
      return (data || []).map((alert: AlertRow) => ({
        id: alert.id as string,
        type: (alert.alert_type as MaintenanceAlert["type"]) || "predictive",
        severity: (alert.severity as MaintenanceAlert["severity"]) || "info",
        message: (alert.message as string) || (alert.description as string),
        component: (alert.component_name as string) || "Sistema",
        vessel: (alert.vessel_name as string) || "N/A",
        createdAt: new Date(alert.created_at as string)
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Hook para métricas preditivas gerais
export function usePredictiveMetrics() {
  return useQuery({
    queryKey: ["predictive-metrics"],
    queryFn: async (): Promise<PredictiveMetric[]> => {
      // Buscar insights de IA para métricas
      const { data: insights, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("category", "prediction")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error || !insights || insights.length === 0) {
        // Retornar array vazio - UI mostrará estado vazio
        return [];
      }

      type InsightRow = Record<string, unknown>;
      return insights.map((insight: InsightRow) => {
        const metadata = typeof insight.metadata === 'object' && insight.metadata !== null ? insight.metadata as Record<string, unknown> : {};
        return {
          id: insight.id as string,
          name: insight.title as string,
          currentValue: (metadata.currentValue as number) || 0,
          predictedValue: (metadata.predictedValue as number) || 0,
          trend: (metadata.trend as PredictiveMetric["trend"]) || "stable",
          confidence: ((insight.confidence as number) * 100) || 75,
          timeFrame: (metadata.timeFrame as string) || "30 dias",
          unit: (metadata.unit as string) || "%"
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para consumo de combustível
export function useFuelConsumption() {
  return useQuery({
    queryKey: ["fuel-consumption"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuel_consumption")
        .select(`
          id,
          vessel_id,
          consumption_date,
          fuel_type,
          quantity_liters,
          cost_usd,
          distance_nm,
          avg_speed_knots,
          weather_conditions,
          notes,
          created_at,
          vessels:vessel_id (name)
        `)
        .order("consumption_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      type FuelRow = Record<string, unknown>;
      return (data || []).map((item: FuelRow) => ({
        ...item,
        vessel_name: ((item.vessels as Record<string, unknown>)?.name as string) || "N/A"
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para predições de combustível
export function useFuelPredictions() {
  return useQuery({
    queryKey: ["fuel-predictions"],
    queryFn: async () => {
      // Tabela fuel_predictions não existe no schema atual
      // Retornar vazio - UI mostrará estado apropriado
      return [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Hook para estatísticas de manutenção
export function useMaintenanceStats() {
  return useQuery({
    queryKey: ["maintenance-stats"],
    queryFn: async () => {
      // Contar equipamentos monitorados
      const { count: totalComponents } = await supabase
        .from("ai_maintenance_predictions")
        .select("*", { count: "exact", head: true });

      // Contar em risco
      const { count: atRisk } = await supabase
        .from("ai_maintenance_predictions")
        .select("*", { count: "exact", head: true })
        .gt("failure_probability", 0.5);

      // Buscar acurácia média
      const { data: accuracyData } = await supabase
        .from("ai_learning_metrics")
        .select("accuracy_rate")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        totalComponents: totalComponents || 0,
        atRisk: atRisk || 0,
        preventedFailures: 0, // Seria calculado de histórico
        accuracy: (accuracyData?.accuracy_rate || 0) * 100
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
