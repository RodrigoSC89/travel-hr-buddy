/**
 * Hook for fetching intelligent alerts from Supabase
 * PATCH 903 - Mock Zero compliance
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export interface IntelligentAlert {
  id: string;
  type: "safety" | "maintenance" | "operational" | "weather" | "fuel" | "crew" | "cargo";
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  description: string;
  vessel_name: string;
  vessel_id: string;
  location?: string;
  predicted_impact: string;
  ai_confidence: number;
  recommendations: string[];
  created_at: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolution_notes?: string;
  status: "open" | "acknowledged" | "resolved" | "false_positive";
  auto_generated: boolean;
  related_data: {
    current_value?: number;
    threshold_value?: number;
    trend?: "increasing" | "decreasing" | "stable";
    prediction_horizon?: string;
  };
}

function parseMetadata(metadata: Json | null): Partial<IntelligentAlert> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  
  const meta = metadata as Record<string, unknown>;
  
  return {
    vessel_name: typeof meta.vessel_name === "string" ? meta.vessel_name : "N/A",
    vessel_id: typeof meta.vessel_id === "string" ? meta.vessel_id : "",
    location: typeof meta.location === "string" ? meta.location : undefined,
    predicted_impact: typeof meta.predicted_impact === "string" ? meta.predicted_impact : "Impacto a ser avaliado",
    ai_confidence: typeof meta.ai_confidence === "number" ? meta.ai_confidence : 0,
    recommendations: Array.isArray(meta.recommendations) ? meta.recommendations.filter((r): r is string => typeof r === "string") : [],
    acknowledged_by: typeof meta.acknowledged_by === "string" ? meta.acknowledged_by : undefined,
    acknowledged_at: typeof meta.acknowledged_at === "string" ? meta.acknowledged_at : undefined,
    resolution_notes: typeof meta.resolution_notes === "string" ? meta.resolution_notes : undefined,
    auto_generated: typeof meta.auto_generated === "boolean" ? meta.auto_generated : true,
    related_data: typeof meta.related_data === "object" && meta.related_data !== null
      ? meta.related_data as IntelligentAlert["related_data"]
      : {},
  };
}

function mapNotificationToAlert(notification: {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  metadata: Json | null;
}): IntelligentAlert {
  const meta = parseMetadata(notification.metadata);
  
  // Map priority to severity
  const severityMap: Record<string, IntelligentAlert["severity"]> = {
    low: "info",
    normal: "info",
    medium: "warning",
    high: "critical",
    urgent: "emergency",
    critical: "emergency",
  };
  
  // Map type
  const typeMap: Record<string, IntelligentAlert["type"]> = {
    maintenance: "maintenance",
    safety: "safety",
    weather: "weather",
    fuel: "fuel",
    crew: "crew",
    cargo: "cargo",
    alert: "operational",
    warning: "operational",
    info: "operational",
    success: "operational",
  };

  // Determine status based on is_read and metadata
  let status: IntelligentAlert["status"] = "open";
  if (meta.resolution_notes) {
    status = "resolved";
  } else if (notification.is_read || meta.acknowledged_by) {
    status = "acknowledged";
  }

  return {
    id: notification.id,
    type: typeMap[notification.type.toLowerCase()] || "operational",
    severity: severityMap[notification.priority.toLowerCase()] || "info",
    title: notification.title,
    description: notification.message,
    vessel_name: meta.vessel_name || "Sistema",
    vessel_id: meta.vessel_id || "",
    location: meta.location,
    predicted_impact: meta.predicted_impact || "Impacto não especificado",
    ai_confidence: meta.ai_confidence || 0,
    recommendations: meta.recommendations || [],
    created_at: notification.created_at,
    is_acknowledged: notification.is_read || !!meta.acknowledged_by,
    acknowledged_by: meta.acknowledged_by,
    acknowledged_at: meta.acknowledged_at,
    resolution_notes: meta.resolution_notes,
    status,
    auto_generated: meta.auto_generated ?? true,
    related_data: meta.related_data || {},
  };
}

export function useIntelligentAlertsData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: alerts = [], isLoading, error, refetch } = useQuery({
    queryKey: ["intelligent-alerts", user?.id],
    queryFn: async (): Promise<IntelligentAlert[]> => {
      // Fetch from intelligent_notifications
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(mapNotificationToAlert);
    },
    enabled: !!user,
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy: string }) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({
          is_read: true,
          metadata: {
            acknowledged_by: acknowledgedBy,
            acknowledged_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligent-alerts"] });
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes: string }) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({
          is_read: true,
          metadata: {
            resolution_notes: notes,
            resolved_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligent-alerts"] });
    },
  });

  return {
    alerts,
    isLoading,
    error: error?.message || null,
    refetch,
    acknowledgeAlert: acknowledgeAlert.mutate,
    resolveAlert: resolveAlert.mutate,
    isAcknowledging: acknowledgeAlert.isPending,
    isResolving: resolveAlert.isPending,
  };
}

// Simplified version for telemetry alerts
export interface TelemetryAlertData {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "sensor" | "vessel" | "system" | "weather" | "maintenance";
  source: string;
  vesselName?: string;
  status: "active" | "acknowledged" | "resolved" | "escalated";
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  aiSuggestion?: string;
}

export function useTelemetryAlertsData() {
  const { user } = useAuth();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["telemetry-alerts", user?.id],
    queryFn: async (): Promise<TelemetryAlertData[]> => {
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((n): TelemetryAlertData => {
        const meta = n.metadata as Record<string, unknown> | null;
        
        const severityMap: Record<string, TelemetryAlertData["severity"]> = {
          low: "low",
          normal: "medium",
          medium: "medium",
          high: "high",
          urgent: "critical",
          critical: "critical",
        };

        const categoryMap: Record<string, TelemetryAlertData["category"]> = {
          maintenance: "maintenance",
          weather: "weather",
          sensor: "sensor",
          vessel: "vessel",
          system: "system",
        };

        let status: TelemetryAlertData["status"] = "active";
        if (meta?.resolved_at) status = "resolved";
        else if (n.is_read || meta?.acknowledged_by) status = "acknowledged";

        return {
          id: n.id,
          title: n.title,
          description: n.message,
          severity: severityMap[n.priority?.toLowerCase()] || "medium",
          category: categoryMap[n.type?.toLowerCase()] || "system",
          source: typeof meta?.source === "string" ? meta.source : "Sistema",
          vesselName: typeof meta?.vessel_name === "string" ? meta.vessel_name : undefined,
          status,
          timestamp: n.created_at,
          acknowledgedBy: typeof meta?.acknowledged_by === "string" ? meta.acknowledged_by : undefined,
          acknowledgedAt: typeof meta?.acknowledged_at === "string" ? meta.acknowledged_at : undefined,
          resolvedAt: typeof meta?.resolved_at === "string" ? meta.resolved_at : undefined,
          aiSuggestion: typeof meta?.ai_suggestion === "string" ? meta.ai_suggestion : undefined,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  return { alerts, isLoading, refetch };
}

// Operations Command Center alerts
export interface OperationalAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function useOperationalAlertsData() {
  const { user } = useAuth();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["operational-alerts", user?.id],
    queryFn: async (): Promise<OperationalAlert[]> => {
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((n): OperationalAlert => {
        const meta = n.metadata as Record<string, unknown> | null;
        
        const severityMap: Record<string, OperationalAlert["severity"]> = {
          low: "low",
          normal: "medium",
          medium: "medium",
          high: "high",
          urgent: "critical",
          critical: "critical",
        };

        return {
          id: n.id,
          title: n.title,
          description: n.message,
          severity: severityMap[n.priority?.toLowerCase()] || "medium",
          module: typeof meta?.module === "string" ? meta.module : n.type || "Sistema",
          timestamp: new Date(n.created_at),
          acknowledged: n.is_read || !!meta?.acknowledged_by,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  return { alerts, isLoading, refetch };
}
