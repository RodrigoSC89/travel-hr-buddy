/**
 * Hook para dados reais do NOC Command Center
 * ✅ R01 CORRIGIDO: Substitui MOCK_SERVICES, MOCK_ALERTS, MOCK_WEBHOOKS
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "muted";

export interface NOCService {
  id: string;
  name: string;
  type: "database" | "api" | "auth" | "storage" | "edge" | "realtime";
  status: ServiceStatus;
  uptime: number;
  latency: number;
  lastCheck: Date;
  incidents: number;
}

export interface NOCAlert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notes: string[];
}

export function useNOCServices() {
  return useQuery({
    queryKey: ["noc-services"],
    queryFn: async (): Promise<NOCService[]> => {
      const { data, error } = await supabase
        .from("system_status")
        .select("*")
        .order("service_name", { ascending: true });

      if (error) throw error;

      return (data || []).map((s): NOCService => ({
        id: s.id,
        name: s.service_name || "Serviço",
        type: mapServiceType(s.service_name),
        status: mapStatus(s.status),
        uptime: s.uptime_percentage || 99.9,
        latency: s.response_time || 0,
        lastCheck: new Date(s.last_check || Date.now()),
        incidents: 0,
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useNOCAlerts() {
  return useQuery({
    queryKey: ["noc-alerts"],
    queryFn: async (): Promise<NOCAlert[]> => {
      const { data, error } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((a): NOCAlert => ({
        id: a.id,
        serviceId: a.source_module || "",
        serviceName: a.source_module || "Sistema",
        severity: mapSeverity(a.severity),
        title: a.title || "Alerta",
        message: a.message || "",
        timestamp: new Date(a.created_at || Date.now()),
        status: a.is_acknowledged ? "acknowledged" : "active",
        acknowledgedBy: a.acknowledged_by || undefined,
        acknowledgedAt: a.acknowledged_at ? new Date(a.acknowledged_at) : undefined,
        notes: [],
      }));
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

function mapServiceType(name: string | null): NOCService["type"] {
  const lower = (name || "").toLowerCase();
  if (lower.includes("database") || lower.includes("db")) return "database";
  if (lower.includes("auth")) return "auth";
  if (lower.includes("edge") || lower.includes("function")) return "edge";
  if (lower.includes("storage")) return "storage";
  if (lower.includes("realtime")) return "realtime";
  return "api";
}

function mapStatus(status: string | null): ServiceStatus {
  switch (status) {
    case "healthy": return "operational";
    case "degraded": return "degraded";
    case "down": return "outage";
    case "maintenance": return "maintenance";
    default: return "operational";
  }
}

function mapSeverity(severity: string | null): AlertSeverity {
  switch (severity) {
    case "critical": return "critical";
    case "warning": return "warning";
    default: return "info";
  }
}
