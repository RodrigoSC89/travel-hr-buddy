/**
 * Hook para logs reais do Mission Control
 * Substitui dados mockados por logs do Supabase
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  module: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

function mapLogLevel(level: string | null): "info" | "warning" | "error" | "success" {
  switch (level?.toLowerCase()) {
    case "error":
    case "critical":
      return "error";
    case "warning":
    case "warn":
      return "warning";
    case "success":
    case "completed":
      return "success";
    default:
      return "info";
  }
}

export function useMissionControlLogs(limit = 50) {
  const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([]);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["mission-control-logs", limit],
    queryFn: async (): Promise<LogEntry[]> => {
      // Fetch from access_logs (system activity)
      const { data: accessLogs, error: accessError } = await supabase
        .from("access_logs")
        .select("id, timestamp, module_accessed, severity, action, result")
        .order("timestamp", { ascending: false })
        .limit(limit);
      
      if (accessError) throw accessError;

      // Fetch from logs table
      const { data: systemLogs, error: systemError } = await supabase
        .from("logs")
        .select("id, created_at, module, level, message")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (systemError) throw systemError;

      // Combine and format logs
      const formattedAccessLogs: LogEntry[] = (accessLogs || []).map(log => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        module: log.module_accessed || "System",
        level: mapLogLevel(log.severity),
        message: `${log.action} - ${log.result}`,
      }));

      const formattedSystemLogs: LogEntry[] = (systemLogs || []).map(log => ({
        id: log.id,
        timestamp: new Date(log.created_at),
        module: log.module || "System",
        level: mapLogLevel(log.level),
        message: log.message || "System event",
      }));

      // Merge and sort by timestamp
      const allLogs = [...formattedAccessLogs, ...formattedSystemLogs]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return allLogs;
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time subscription for new logs
  useEffect(() => {
    const channel = supabase
      .channel("mission-control-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_logs" },
        (payload) => {
          const newLog: LogEntry = {
            id: payload.new.id,
            timestamp: new Date(payload.new.timestamp),
            module: payload.new.module_accessed || "System",
            level: mapLogLevel(payload.new.severity),
            message: `${payload.new.action} - ${payload.new.result}`,
          };
          setRealtimeLogs(prev => [newLog, ...prev].slice(0, 10));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "logs" },
        (payload) => {
          const newLog: LogEntry = {
            id: payload.new.id,
            timestamp: new Date(payload.new.created_at),
            module: payload.new.module || "System",
            level: mapLogLevel(payload.new.level),
            message: payload.new.message || "System event",
          };
          setRealtimeLogs(prev => [newLog, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Combine realtime logs with fetched logs
  const combinedLogs = [...realtimeLogs, ...logs]
    .filter((log, index, self) => 
      index === self.findIndex(l => l.id === log.id)
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  return {
    logs: combinedLogs,
    isLoading,
    refetch,
  };
}
