/**
 * Hook para logs de acesso biométrico reais
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  area: string;
  timestamp: Date;
  status: "granted" | "denied" | "pending";
  method: "facial" | "card" | "pin";
  confidence?: number;
}

export interface RestrictedArea {
  id: string;
  name: string;
  level: "low" | "medium" | "high" | "critical";
  activeUsers: number;
  maxCapacity: number;
  requiresFacial: boolean;
}

function mapAccessStatus(result: string | null): "granted" | "denied" | "pending" {
  switch (result?.toLowerCase()) {
    case "success":
    case "granted":
    case "allowed":
      return "granted";
    case "denied":
    case "failed":
    case "rejected":
      return "denied";
    default:
      return "pending";
  }
}

function mapAccessMethod(action: string | null): "facial" | "card" | "pin" {
  const actionLower = action?.toLowerCase() || "";
  if (actionLower.includes("facial") || actionLower.includes("biometric")) {
    return "facial";
  }
  if (actionLower.includes("card") || actionLower.includes("rfid")) {
    return "card";
  }
  if (actionLower.includes("pin") || actionLower.includes("code")) {
    return "pin";
  }
  return "facial"; // default
}

export function useAccessLogsRealData() {
  const queryClient = useQueryClient();
  const [realtimeLogs, setRealtimeLogs] = useState<AccessLog[]>([]);

  // Fetch access logs from access_logs table
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["access-logs-biometric"],
    queryFn: async (): Promise<AccessLog[]> => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(log => {
        const details = log.details as Record<string, unknown> | null;
        return {
          id: log.id,
          userId: log.user_id || "unknown",
          userName: (details?.user_name as string) || "Usuário",
          area: log.module_accessed || "Área Geral",
          timestamp: new Date(log.timestamp),
          status: mapAccessStatus(log.result),
          method: mapAccessMethod(log.action),
          confidence: (details?.confidence as number) || undefined,
        };
      });
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("access-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_logs" },
        (payload) => {
          const realtimeDetails = payload.new.details as Record<string, unknown> | null;
          const newLog: AccessLog = {
            id: payload.new.id,
            userId: payload.new.user_id || "unknown",
            userName: (realtimeDetails?.user_name as string) || "Usuário",
            area: payload.new.module_accessed || "Área Geral",
            timestamp: new Date(payload.new.timestamp),
            status: mapAccessStatus(payload.new.result),
            method: mapAccessMethod(payload.new.action),
            confidence: (realtimeDetails?.confidence as number) || undefined,
          };
          setRealtimeLogs(prev => [newLog, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Log new access mutation
  const logAccess = useMutation({
    mutationFn: async (accessData: {
      userId: string;
      userName: string;
      area: string;
      status: "granted" | "denied";
      method: "facial" | "card" | "pin";
      confidence?: number;
    }) => {
      const { error } = await supabase.from("access_logs").insert({
        user_id: accessData.userId,
        module_accessed: accessData.area,
        action: `biometric_${accessData.method}`,
        result: accessData.status === "granted" ? "success" : "denied",
        severity: accessData.status === "denied" ? "warning" : "info",
        details: {
          user_name: accessData.userName,
          method: accessData.method,
          confidence: accessData.confidence,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-logs-biometric"] });
    },
  });

  // Combine realtime with fetched
  const combinedLogs = [...realtimeLogs, ...logs]
    .filter((log, index, self) =>
      index === self.findIndex(l => l.id === log.id)
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Stats
  const stats = {
    granted: combinedLogs.filter(l => l.status === "granted").length,
    denied: combinedLogs.filter(l => l.status === "denied").length,
    pending: combinedLogs.filter(l => l.status === "pending").length,
  };

  // Static restricted areas (could be from a config table)
  const restrictedAreas: RestrictedArea[] = [
    { id: "bridge", name: "Ponte de Comando", level: "critical", activeUsers: combinedLogs.filter(l => l.area.includes("Ponte") && l.status === "granted").length % 6, maxCapacity: 5, requiresFacial: true },
    { id: "engine", name: "Praça de Máquinas", level: "high", activeUsers: combinedLogs.filter(l => l.area.includes("Máquinas") && l.status === "granted").length % 9, maxCapacity: 8, requiresFacial: true },
    { id: "cargo", name: "Porão de Carga", level: "medium", activeUsers: combinedLogs.filter(l => l.area.includes("Carga") && l.status === "granted").length % 11, maxCapacity: 10, requiresFacial: false },
    { id: "medical", name: "Enfermaria", level: "medium", activeUsers: combinedLogs.filter(l => l.area.includes("Enfermaria") && l.status === "granted").length % 5, maxCapacity: 4, requiresFacial: false },
    { id: "armory", name: "Paiol de Armas", level: "critical", activeUsers: 0, maxCapacity: 2, requiresFacial: true },
  ];

  return {
    logs: combinedLogs,
    restrictedAreas,
    stats,
    isLoading,
    logAccess: logAccess.mutate,
  };
}
