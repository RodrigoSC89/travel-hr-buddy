/**
 * Hook para conexões de portos real
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface PortConnection {
  id: string;
  portName: string;
  country: string;
  apiType: "REST" | "SOAP" | "EDI" | "MQTT";
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync: Date;
  dataTypes: string[];
  messagesProcessed: number;
}

export interface APILog {
  id: string;
  timestamp: Date;
  port: string;
  action: string;
  status: "success" | "error" | "pending";
  responseTime: number;
  details: string;
}

function mapConnectionStatus(status: string | null): PortConnection["status"] {
  switch (status?.toLowerCase()) {
    case "active":
    case "connected":
    case "online":
      return "connected";
    case "error":
    case "failed":
      return "error";
    case "syncing":
    case "processing":
      return "syncing";
    default:
      return "disconnected";
  }
}

function mapApiType(type: string | null): PortConnection["apiType"] {
  const typeLower = type?.toLowerCase() || "";
  if (typeLower.includes("soap")) return "SOAP";
  if (typeLower.includes("edi")) return "EDI";
  if (typeLower.includes("mqtt")) return "MQTT";
  return "REST";
}

export function usePortConnectionsRealData() {
  const queryClient = useQueryClient();
  const [realtimeLogs, setRealtimeLogs] = useState<APILog[]>([]);

  // Fetch port connections from api_configurations or external_integrations
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery({
    queryKey: ["port-connections"],
    queryFn: async (): Promise<PortConnection[]> => {
      const { data, error } = await supabase
        .from("api_configurations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(config => ({
        id: config.id,
        portName: config.display_name || config.api_name || "Porto",
        country: "Brasil", // default
        apiType: "REST" as const,
        status: config.is_active ? "connected" : "disconnected" as const,
        lastSync: new Date(config.updated_at || config.created_at || Date.now()),
        dataTypes: ["General"],
        messagesProcessed: config.current_usage_today || 0,
      }));
    },
    staleTime: 30000,
  });

  // Fetch API logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["port-api-logs"],
    queryFn: async (): Promise<APILog[]> => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("module", "port-api")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        timestamp: new Date(log.created_at),
        port: (log.metadata as any)?.port || "Sistema",
        action: log.message || "API_CALL",
        status: log.level === "error" ? "error" : log.level === "warning" ? "pending" : "success",
        responseTime: (log.metadata as any)?.response_time || 0,
        details: (log.metadata as any)?.details || log.message || "",
      }));
    },
    staleTime: 10000,
  });

  // Real-time subscription for logs
  useEffect(() => {
    const channel = supabase
      .channel("port-api-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "logs" },
        (payload) => {
          if ((payload.new as any).module === "port-api") {
            const newLog: APILog = {
              id: payload.new.id,
              timestamp: new Date(payload.new.created_at),
              port: (payload.new.details as any)?.port || "Sistema",
              action: payload.new.message || "API_CALL",
              status: payload.new.level === "error" ? "error" : "success",
              responseTime: (payload.new.details as any)?.response_time || 0,
              details: (payload.new.details as any)?.details || "",
            };
            setRealtimeLogs(prev => [newLog, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Toggle connection mutation
  const toggleConnection = useMutation({
    mutationFn: async ({ connectionId, newStatus }: { connectionId: string; newStatus: "connected" | "disconnected" }) => {
      const { error } = await supabase
        .from("api_configurations")
        .update({ 
          is_active: newStatus === "connected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["port-connections"] });
    },
  });

  // Sync all mutation
  const syncAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("api_configurations")
        .update({ 
          updated_at: new Date().toISOString(),
        })
        .neq("status", "error");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["port-connections"] });
    },
  });

  // Combine logs
  const combinedLogs = [...realtimeLogs, ...logs]
    .filter((log, index, self) =>
      index === self.findIndex(l => l.id === log.id)
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Stats
  const stats = {
    connected: connections.filter(c => c.status === "connected").length,
    disconnected: connections.filter(c => c.status === "disconnected").length,
    error: connections.filter(c => c.status === "error").length,
    totalMessages: connections.reduce((acc, c) => acc + c.messagesProcessed, 0),
  };

  return {
    connections,
    logs: combinedLogs,
    stats,
    isLoading: isLoadingConnections || isLoadingLogs,
    toggleConnection: toggleConnection.mutate,
    syncAll: syncAll.mutate,
    isSyncing: syncAll.isPending,
  };
}
