/**
 * Hook for Churn Prediction & Customer Health
 * Proactive customer success with ML-based risk scoring
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { customerHealthService } from "@/lib/churn-prediction/customer-health";

export interface CustomerHealthMetrics {
  id: string;
  organization_id: string;
  health_score: number;
  churn_risk: number;
  churn_signals: Record<string, boolean>;
  last_calculated_at: string;
  logins_last_30d: number;
  features_used: number;
  api_calls_last_30d: number;
  support_tickets_open: number;
  arr: number;
}

export interface CustomerHealthSummary {
  totalCustomers: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  averageHealthScore: number;
  averageChurnRisk: number;
}

export function useChurnPrediction() {
  const queryClient = useQueryClient();

  // Fetch customer health metrics
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customer-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_health_metrics")
        .select("*")
        .order("churn_risk", { ascending: false });

      if (error) throw error;
      
      // Map database fields to our interface
      return (data || []).map(row => ({
        id: row.id,
        organization_id: row.organization_id || "",
        health_score: row.health_score || 0,
        churn_risk: row.churn_risk || 0,
        churn_signals: (row.risk_factors as Record<string, boolean>) || {},
        last_calculated_at: row.last_calculated_at || "",
        logins_last_30d: row.logins_last_30d || 0,
        features_used: row.features_used_count || 0,
        api_calls_last_30d: row.api_calls_last_30d || 0,
        support_tickets_open: row.support_tickets_last_30d || 0,
        arr: row.arr || 0
      })) as CustomerHealthMetrics[];
    }
  });

  // Calculate summary
  const summary: CustomerHealthSummary = {
    totalCustomers: customers.length,
    healthyCount: customers.filter(c => c.health_score >= 70).length,
    atRiskCount: customers.filter(c => c.health_score >= 40 && c.health_score < 70).length,
    criticalCount: customers.filter(c => c.health_score < 40).length,
    averageHealthScore: customers.length > 0 
      ? Math.round(customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length)
      : 0,
    averageChurnRisk: customers.length > 0
      ? Math.round(customers.reduce((sum, c) => sum + c.churn_risk, 0) / customers.length * 100) / 100
      : 0
  };

  // Get high-risk customers
  const highRiskCustomers = customers.filter(c => c.churn_risk >= 0.6);

  // Recalculate health for organization
  const recalculateHealth = useMutation({
    mutationFn: async (organizationId: string) => {
      // Use the service to calculate health score
      const healthMetrics = await customerHealthService.calculateHealthScore(organizationId);
      return healthMetrics;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-health"] });
    }
  });

  // Send proactive outreach
  const sendOutreach = useMutation({
    mutationFn: async ({ 
      organizationId, 
      message 
    }: { 
      organizationId: string; 
      message: string;
    }) => {
      // Log outreach event
      const { error } = await supabase
        .from("analytics_events")
        .insert({
          organization_id: organizationId,
          event_name: "proactive_outreach",
          event_category: "customer_success",
          properties: { message }
        });

      if (error) throw error;
      // Outreach logged to analytics table successfully
    }
  });

  return {
    customers,
    summary,
    highRiskCustomers,
    isLoading,
    recalculateHealth,
    sendOutreach
  };
}
