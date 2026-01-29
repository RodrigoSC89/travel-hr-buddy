/**
 * Hook for real-time fleet data from database
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface FleetRealtimeData {
  id: string;
  vessel_id: string;
  position_lat?: number;
  position_lon?: number;
  speed_knots?: number;
  heading_degrees?: number;
  fuel_level_percent?: number;
  engine_hours?: number;
  crew_count?: number;
  status: string;
  last_communication_at?: string;
  recorded_at: string;
  vessel?: {
    id: string;
    name: string;
    imo_number?: string;
    status?: string;
  };
}

export interface VesselWithMetrics {
  id: string;
  name: string;
  status: string;
  location: { lat: number; lon: number };
  speed: number;
  heading: number;
  fuelLevel: number;
  engineHours: number;
  crewCount: number;
  lastCommunication: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

// Fetch fleet real-time data
export function useFleetRealtimeData() {
  return useQuery({
    queryKey: ["fleet-realtime"],
    queryFn: async () => {
      // First get vessels
      const { data: vessels, error: vesselError } = await supabase
        .from("vessels")
        .select("id, name, imo_number, status, current_location")
        .limit(50);

      if (vesselError) throw vesselError;
      if (!vessels?.length) return [];

      // Then get latest realtime data for each vessel
      const vesselIds = vessels.map((v) => v.id);
      const { data: realtimeData, error: rtError } = await supabase
        .from("fleet_realtime_data")
        .select("*")
        .in("vessel_id", vesselIds)
        .order("recorded_at", { ascending: false });

      if (rtError) throw rtError;

      // Get latest record per vessel
      const latestByVessel = new Map<string, FleetRealtimeData>();
      realtimeData?.forEach((record) => {
        const existing = latestByVessel.get(record.vessel_id);
        const recordedAt = record.recorded_at || "";
        const existingRecordedAt = existing?.recorded_at || "";
        if (!existing || new Date(recordedAt) > new Date(existingRecordedAt)) {
          latestByVessel.set(record.vessel_id, record as FleetRealtimeData);
        }
      });

      // Merge vessel data with realtime metrics
      const result: VesselWithMetrics[] = vessels.map((vessel) => {
        const rtData = latestByVessel.get(vessel.id);
        const currentLoc = vessel.current_location as { lat?: number; lon?: number } | null;
        const location = {
          lat: currentLoc?.lat ?? rtData?.position_lat ?? -23.5505,
          lon: currentLoc?.lon ?? rtData?.position_lon ?? -46.6333,
        };

        return {
          id: vessel.id,
          name: vessel.name,
          status: rtData?.status ?? vessel.status ?? "operational",
          location,
          speed: rtData?.speed_knots ?? 0,
          heading: rtData?.heading_degrees ?? 0,
          fuelLevel: rtData?.fuel_level_percent ?? 100,
          engineHours: rtData?.engine_hours ?? 0,
          crewCount: rtData?.crew_count ?? 0,
          lastCommunication: rtData?.last_communication_at
            ? new Date(rtData.last_communication_at)
            : new Date(),
        };
      });

      return result;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Subscribe to real-time fleet updates
export function useFleetRealTimeSubscription(onUpdate?: (data: FleetRealtimeData) => void) {
  useEffect(() => {
    const channel = supabase
      .channel("fleet-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fleet_realtime_data",
        },
        (payload) => {
          if (onUpdate && payload.new) {
            onUpdate(payload.new as FleetRealtimeData);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vessels",
        },
        (payload) => {
          // Handle vessel status updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

// Record fleet telemetry
export function useRecordFleetTelemetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<FleetRealtimeData, "id" | "recorded_at" | "vessel">
    ) => {
      const { data: result, error } = await supabase
        .from("fleet_realtime_data")
        .insert({
          vessel_id: data.vessel_id,
          position_lat: data.position_lat,
          position_lon: data.position_lon,
          speed_knots: data.speed_knots,
          heading_degrees: data.heading_degrees,
          fuel_level_percent: data.fuel_level_percent,
          engine_hours: data.engine_hours,
          crew_count: data.crew_count,
          status: data.status,
          last_communication_at: data.last_communication_at,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-realtime"] });
    },
  });
}

// Combined hook with vessel alerts
export function useFleetDashboard() {
  const { data: vessels, isLoading, refetch } = useFleetRealtimeData();

  // Compute fleet stats
  const stats = {
    total: vessels?.length ?? 0,
    operational: vessels?.filter((v) => v.status === "operational").length ?? 0,
    maintenance: vessels?.filter((v) => v.status === "maintenance").length ?? 0,
    docked: vessels?.filter((v) => v.status === "docked").length ?? 0,
    lowFuel: vessels?.filter((v) => v.fuelLevel < 25).length ?? 0,
    avgSpeed:
      vessels && vessels.length > 0
        ? vessels.reduce((sum, v) => sum + v.speed, 0) / vessels.length
        : 0,
  };

  // Generate alerts for fleet issues
  const alerts: Array<{
    id: string;
    vesselId: string;
    vesselName: string;
    type: "fuel" | "communication" | "speed";
    severity: "warning" | "critical";
    message: string;
  }> = [];

  vessels?.forEach((vessel) => {
    if (vessel.fuelLevel < 15) {
      alerts.push({
        id: `fuel-critical-${vessel.id}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        type: "fuel",
        severity: "critical",
        message: `Combustível crítico: ${vessel.fuelLevel.toFixed(0)}%`,
      });
    } else if (vessel.fuelLevel < 25) {
      alerts.push({
        id: `fuel-warning-${vessel.id}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        type: "fuel",
        severity: "warning",
        message: `Combustível baixo: ${vessel.fuelLevel.toFixed(0)}%`,
      });
    }

    const hoursSinceComm =
      (Date.now() - vessel.lastCommunication.getTime()) / (1000 * 60 * 60);
    if (hoursSinceComm > 4) {
      alerts.push({
        id: `comm-${vessel.id}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        type: "communication",
        severity: hoursSinceComm > 12 ? "critical" : "warning",
        message: `Sem comunicação há ${hoursSinceComm.toFixed(0)}h`,
      });
    }
  });

  return {
    vessels,
    stats,
    alerts,
    isLoading,
    refetch,
  };
}
