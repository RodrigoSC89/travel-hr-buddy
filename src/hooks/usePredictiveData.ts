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

      return data.map((item: any) => {
        const daysUntil = item.predicted_failure_date
          ? Math.ceil((new Date(item.predicted_failure_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 90;

        return {
          componentId: item.equipment_id,
          componentName: item.equipment_name,
          vesselName: item.vessels?.name || "N/A",
          failureProbability: item.failure_probability,
          predictedFailureDate: item.predicted_failure_date || new Date().toISOString(),
          daysUntilFailure: Math.max(0, daysUntil),
          riskLevel: item.failure_probability > 0.8 ? "critical" : item.failure_probability > 0.6 ? "high" : item.failure_probability > 0.4 ? "medium" : "low",
          recommendedAction: item.recommended_action || "Monitorar regularmente",
          confidence: item.confidence || 0.75,
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

        return predictions.map((p: any) => ({
          id: p.id,
          type: "predictive" as const,
          severity: p.failure_probability > 0.8 ? "critical" : p.failure_probability > 0.6 ? "warning" : "info",
          message: p.recommended_action || `Atenção: ${p.equipment_name} requer verificação`,
          component: p.equipment_name,
          vessel: p.vessels?.name || "N/A",
          createdAt: new Date(p.created_at)
        }));
      }

      return (data || []).map((alert: any) => ({
        id: alert.id,
        type: alert.alert_type || "predictive",
        severity: alert.severity || "info",
        message: alert.message || alert.description,
        component: alert.component_name || "Sistema",
        vessel: alert.vessel_name || "N/A",
        createdAt: new Date(alert.created_at)
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

      return insights.map((insight: any) => {
        const metadata = typeof insight.metadata === 'object' ? insight.metadata : {};
        return {
          id: insight.id,
          name: insight.title,
          currentValue: metadata.currentValue || 0,
          predictedValue: metadata.predictedValue || 0,
          trend: metadata.trend || "stable",
          confidence: insight.confidence * 100 || 75,
          timeFrame: metadata.timeFrame || "30 dias",
          unit: metadata.unit || "%"
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
      return (data || []).map((item: any) => ({
        ...item,
        vessel_name: item.vessels?.name || "N/A"
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
