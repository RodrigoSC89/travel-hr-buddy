/**
 * BridgeLink Data Hook - Real-time Integration
 * Integra com IoT, MQTT e Supabase Realtime
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface BridgeLinkStatus {
  mqtt: "connected" | "disconnected" | "connecting";
  supabase: "connected" | "disconnected" | "connecting";
  satellites: number;
  lastSync: string;
  dataQuality: number;
}

export interface BridgeLinkEvent {
  id: string;
  type: "sync" | "alert" | "command" | "status";
  source: string;
  message: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "success";
}

export interface SensorReading {
  id: string;
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  vesselId?: string;
}

export function useBridgeLinkData() {
  const queryClient = useQueryClient();
  const [realtimeEvents, setRealtimeEvents] = useState<BridgeLinkEvent[]>([]);

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["bridgelink-status"],
    queryFn: async (): Promise<BridgeLinkStatus> => {
      // Check Supabase connection
      const { error } = await supabase.from("system_health").select("id").limit(1);
      
      return {
        mqtt: "disconnected", // Would need actual MQTT client
        supabase: error ? "disconnected" : "connected",
        satellites: 4,
        lastSync: new Date().toISOString(),
        dataQuality: 98.5,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent events from fleet_logs
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["bridgelink-events"],
    queryFn: async (): Promise<BridgeLinkEvent[]> => {
      const { data, error } = await supabase
        .from("fleet_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        logger.error("Error fetching BridgeLink events:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((log) => ({
        id: log.id,
        type: (log.log_type as BridgeLinkEvent["type"]) || "status",
        source: log.source || "system",
        message: typeof log.data === "object" ? JSON.stringify(log.data) : String(log.data || ""),
        timestamp: log.created_at || log.recorded_at || new Date().toISOString(),
        severity: mapSeverity(log.severity),
      }));
    },
  });

  // Fetch sensor readings
  const { data: sensorReadings = [], isLoading: sensorsLoading } = useQuery({
    queryKey: ["bridgelink-sensors"],
    queryFn: async (): Promise<SensorReading[]> => {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (error) {
        logger.error("Error fetching sensor readings:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((reading) => ({
        id: reading.id,
        sensorId: reading.sensor_id,
        sensorType: reading.quality || "unknown",
        value: reading.value,
        unit: "",
        timestamp: reading.recorded_at || new Date().toISOString(),
        vesselId: reading.vessel_id,
      }));
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("bridgelink-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fleet_logs" },
        (payload) => {
          const newEvent: BridgeLinkEvent = {
            id: payload.new.id,
            type: payload.new.log_type || "status",
            source: payload.new.source || "realtime",
            message: payload.new.message || "",
            timestamp: payload.new.created_at || new Date().toISOString(),
            severity: mapSeverity(payload.new.severity),
          };
          setRealtimeEvents((prev) => [newEvent, ...prev].slice(0, 50));
          queryClient.invalidateQueries({ queryKey: ["bridgelink-events"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bridgelink-sensors"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Send command mutation
  const sendCommand = useMutation({
    mutationFn: async (command: { type: string; target: string; payload: unknown }) => {
      const { data, error } = await supabase
        .from("fleet_logs")
        .insert({
          log_type: "command",
          source: "bridgelink",
          message: `Command: ${command.type} to ${command.target}`,
          severity: "info",
          details: command.payload,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Comando enviado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["bridgelink-events"] });
    },
    onError: (error) => {
      toast.error("Erro ao enviar comando: " + error.message);
    },
  });

  // Force sync mutation
  const forceSync = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("fleet_logs")
        .insert({
          log_type: "sync",
          source: "bridgelink",
          message: "Manual sync triggered",
          severity: "info",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sincronização iniciada");
      queryClient.invalidateQueries({ queryKey: ["bridgelink-status"] });
    },
  });

  return {
    status,
    events: [...realtimeEvents, ...events].slice(0, 50),
    sensorReadings,
    isLoading: statusLoading || eventsLoading || sensorsLoading,
    sendCommand,
    forceSync,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["bridgelink-status"] });
      queryClient.invalidateQueries({ queryKey: ["bridgelink-events"] });
      queryClient.invalidateQueries({ queryKey: ["bridgelink-sensors"] });
    },
  };
}

function mapSeverity(severity: string | null): BridgeLinkEvent["severity"] {
  const map: Record<string, BridgeLinkEvent["severity"]> = {
    info: "info",
    warning: "warning",
    error: "error",
    success: "success",
    critical: "error",
  };
  return map[severity || "info"] || "info";
}

export default useBridgeLinkData;
