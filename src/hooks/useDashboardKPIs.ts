/**
 * useDashboardKPIs - Unified hook for cross-module KPI consumption
 * Single RPC call + real-time invalidation + offline fallback
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeInvalidation } from "./useRealtimeQuery";
import { logger } from "@/lib/logger";

export interface DashboardKPIs {
  // Fleet
  total_vessels: number;
  active_vessels: number;
  vessels_in_port: number;
  vessels_in_drydock: number;

  // Crew
  total_crew: number;
  active_crew: number;
  crew_on_leave: number;

  // Maintenance
  pending_maintenance: number;
  overdue_maintenance: number;
  maintenance_completion_rate: number;

  // Compliance
  expiring_certificates_30d: number;
  expiring_certificates_90d: number;
  compliance_score: number;

  // Safety
  open_incidents: number;
  open_non_conformities: number;
  safety_score: number;

  // Financial (derived)
  fleet_utilization: number;
  operational_readiness: number;
}

const DEFAULT_KPIS: DashboardKPIs = {
  total_vessels: 0,
  active_vessels: 0,
  vessels_in_port: 0,
  vessels_in_drydock: 0,
  total_crew: 0,
  active_crew: 0,
  crew_on_leave: 0,
  pending_maintenance: 0,
  overdue_maintenance: 0,
  maintenance_completion_rate: 0,
  expiring_certificates_30d: 0,
  expiring_certificates_90d: 0,
  compliance_score: 0,
  open_incidents: 0,
  open_non_conformities: 0,
  safety_score: 0,
  fleet_utilization: 0,
  operational_readiness: 0,
};

function normalizeKPIs(raw: Record<string, unknown>): DashboardKPIs {
  const num = (key: string, fallback = 0) => Number(raw[key]) || fallback;

  const total = num("total_vessels");
  const active = num("active_vessels");
  const totalCerts = num("expiring_certificates_90d") + num("expiring_certificates_30d");

  return {
    total_vessels: total,
    active_vessels: active,
    vessels_in_port: num("vessels_in_port"),
    vessels_in_drydock: num("vessels_in_drydock"),
    total_crew: num("total_crew"),
    active_crew: num("active_crew"),
    crew_on_leave: num("crew_on_leave"),
    pending_maintenance: num("pending_maintenance"),
    overdue_maintenance: num("overdue_maintenance"),
    maintenance_completion_rate: num("maintenance_completion_rate"),
    expiring_certificates_30d: num("expiring_certificates_30d"),
    expiring_certificates_90d: num("expiring_certificates_90d"),
    compliance_score: num("compliance_score"),
    open_incidents: num("open_incidents"),
    open_non_conformities: num("open_non_conformities"),
    safety_score: num("safety_score", 100),
    fleet_utilization: total > 0 ? Math.round((active / total) * 100) : 0,
    operational_readiness: Math.round(
      (num("compliance_score") * 0.4 +
        num("safety_score", 100) * 0.3 +
        num("maintenance_completion_rate") * 0.3)
    ),
  };
}

export function useDashboardKPIs(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  // Real-time invalidation on critical tables
  useRealtimeInvalidation({
    table: "vessels",
    queryKeys: [["dashboard-kpis"]],
    enabled,
  });
  useRealtimeInvalidation({
    table: "maintenance_tasks",
    queryKeys: [["dashboard-kpis"]],
    enabled,
  });
  useRealtimeInvalidation({
    table: "crew_certifications",
    queryKeys: [["dashboard-kpis"]],
    enabled,
  });

  const query = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async (): Promise<DashboardKPIs> => {
      try {
        const { data, error } = await supabase.rpc("get_dashboard_kpis");
        if (error) throw error;
        if (!data) return DEFAULT_KPIS;
        return normalizeKPIs(data as Record<string, unknown>);
      } catch (err) {
        logger.warn("[useDashboardKPIs] RPC failed, falling back to direct queries", { error: String(err) });
        return await fallbackDirectQueries();
      }
    },
    staleTime: 1000 * 60 * 3, // 3 min
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    kpis: query.data ?? DEFAULT_KPIS,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Fallback: direct queries if RPC not available */
async function fallbackDirectQueries(): Promise<DashboardKPIs> {
  const [vessels, crew, maintenance, certs, incidents, ncs] = await Promise.all([
    supabase.from("vessels").select("id, status", { count: "exact" }),
    supabase.from("crew_members").select("id, status", { count: "exact" }),
    supabase.from("maintenance_tasks").select("id, status, due_date").in("status", ["pending", "in_progress", "overdue"]),
    supabase.from("crew_certifications").select("id, expiry_date").gte("expiry_date", new Date().toISOString()).lte("expiry_date", new Date(Date.now() + 90 * 86400000).toISOString()),
    supabase.from("incidents").select("id", { count: "exact" }).is("resolved_at", null),
    supabase.from("non_conformities").select("id", { count: "exact" }).neq("status", "closed"),
  ]);

  const vesselData = vessels.data || [];
  const crewData = crew.data || [];
  const maintData = maintenance.data || [];
  const certData = certs.data || [];
  const thirtyDays = Date.now() + 30 * 86400000;

  const active = vesselData.filter(v => ["active", "underway", "navigating"].includes((v.status || "").toLowerCase())).length;
  const inPort = vesselData.filter(v => ["in_port", "moored"].includes((v.status || "").toLowerCase())).length;
  const drydock = vesselData.filter(v => ["drydock", "maintenance"].includes((v.status || "").toLowerCase())).length;
  const overdue = maintData.filter(m => m.status === "overdue" || (m.due_date && new Date(m.due_date) < new Date())).length;
  const cert30 = certData.filter(c => c.expiry_date && new Date(c.expiry_date).getTime() <= thirtyDays).length;

  return {
    total_vessels: vesselData.length,
    active_vessels: active,
    vessels_in_port: inPort,
    vessels_in_drydock: drydock,
    total_crew: crewData.length,
    active_crew: crewData.filter(c => (c.status || "").toLowerCase() === "active").length,
    crew_on_leave: crewData.filter(c => (c.status || "").toLowerCase() === "on_leave").length,
    pending_maintenance: maintData.length,
    overdue_maintenance: overdue,
    maintenance_completion_rate: 0,
    expiring_certificates_30d: cert30,
    expiring_certificates_90d: certData.length,
    compliance_score: 0,
    open_incidents: incidents.count || 0,
    open_non_conformities: ncs.count || 0,
    safety_score: 100,
    fleet_utilization: vesselData.length > 0 ? Math.round((active / vesselData.length) * 100) : 0,
    operational_readiness: 0,
  };
}
