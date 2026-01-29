/**
 * DGNSS Tracking Data Hooks
 * Hooks for fetching and managing GNSS tracking data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GnssDevice, GnssLog, GnssWaypoint, GnssAlert, GnssAIRecommendation, CorrectionStation } from "../types";

// Helper to cast Supabase results
type SupabaseResult<T> = { data: T[] | null; error: unknown };

export function useGnssDevices() {
  return useQuery({
    queryKey: ["gnss-devices"],
    queryFn: async () => {
      const result = await supabase
        .from("gnss_devices")
        .select("*")
        .order("created_at", { ascending: false }) as unknown as SupabaseResult<GnssDevice>;
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useGnssLogs(deviceId?: string, limit = 100) {
  return useQuery({
    queryKey: ["gnss-logs", deviceId, limit],
    queryFn: async () => {
      let query = supabase
        .from("tracking_gnss_logs")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(limit);
      
      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }
      
      const result = await query as unknown as SupabaseResult<GnssLog>;
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useGnssWaypoints(vesselId?: string) {
  return useQuery({
    queryKey: ["gnss-waypoints", vesselId],
    queryFn: async () => {
      let query = supabase
        .from("gnss_waypoints")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }
      
      const result = await query as unknown as SupabaseResult<GnssWaypoint>;
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useGnssAlerts(resolved = false) {
  return useQuery({
    queryKey: ["gnss-alerts", resolved],
    queryFn: async () => {
      const result = await supabase
        .from("gnss_alerts")
        .select("*")
        .eq("is_resolved", resolved)
        .order("created_at", { ascending: false }) as unknown as SupabaseResult<GnssAlert>;
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useGnssAIRecommendations() {
  return useQuery({
    queryKey: ["gnss-ai-recommendations"],
    queryFn: async () => {
      const result = await supabase
        .from("gnss_ai_recommendations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50) as unknown as SupabaseResult<GnssAIRecommendation>;
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useCorrectionStations() {
  return useQuery({
    queryKey: ["correction-stations"],
    queryFn: async () => {
      const result = await supabase
        .from("gnss_correction_stations")
        .select("*")
        .eq("is_active", true)
        .order("station_name") as unknown as SupabaseResult<CorrectionStation>;
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });
}

export function useCreateWaypoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (waypoint: { name: string; latitude: number; longitude: number; radius_meters?: number; waypoint_type?: string }) => {
      const { data, error } = await supabase
        .from("gnss_waypoints")
        .insert([waypoint])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gnss-waypoints"] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from("gnss_alerts")
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gnss-alerts"] });
    },
  });
}

export function useTrackingStats() {
  return useQuery({
    queryKey: ["tracking-stats"],
    queryFn: async () => {
      const [devicesResult, alertsResult, logsResult] = await Promise.all([
        supabase.from("gnss_devices").select("id, is_online"),
        supabase.from("gnss_alerts").select("id").eq("is_resolved", false),
        supabase.from("tracking_gnss_logs").select("accuracy, recorded_at").order("recorded_at", { ascending: false }).limit(100),
      ]);
      
      const devices = (devicesResult.data || []) as Array<{ id: string; is_online: boolean }>;
      const alerts = (alertsResult.data || []) as Array<{ id: string }>;
      const logs = (logsResult.data || []) as Array<{ accuracy: number; recorded_at: string }>;
      
      const avgAccuracy = logs.length > 0 
        ? logs.reduce((sum, l) => sum + (l.accuracy || 0), 0) / logs.length 
        : 0;
      
      return {
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.is_online).length,
        activeAlerts: alerts.length,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        lastUpdate: logs[0]?.recorded_at || new Date().toISOString(),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
