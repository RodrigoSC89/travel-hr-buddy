/**
 * MARPOL Data Hook - Extracted from MARPOLTrackerPage
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MARPOL_ANNEXES } from "./types";
import type { ComplianceScores, WasteLog, EmissionsData, TankData, MARPOLAlert, MARPOLVessel } from "./types";

export function useMARPOLData() {
  const complianceQuery = useQuery({
    queryKey: ["marpol-compliance-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .or("regulation.ilike.%MARPOL%,title.ilike.%MARPOL%,item_type.ilike.%environment%,description.ilike.%MARPOL%")
        .limit(100);

      if (!error && data && data.length > 0) {
        const annexMap: Record<string, { total: number; compliant: number; items: typeof data }> = {};
        MARPOL_ANNEXES.forEach((a) => {
          annexMap[`annex${a.number}`] = { total: 0, compliant: 0, items: [] };
        });

        data.forEach((item) => {
          const desc = ((item.description || "") + " " + (item.title || "") + " " + (item.item_type || "")).toLowerCase();
          let annex = "annexI";
          if (desc.includes("nls") || desc.includes("químic") || desc.includes("annex ii")) annex = "annexII";
          else if (desc.includes("substânc") || desc.includes("packag") || desc.includes("annex iii") || desc.includes("imdg")) annex = "annexIII";
          else if (desc.includes("esgoto") || desc.includes("sewage") || desc.includes("annex iv")) annex = "annexIV";
          else if (desc.includes("lixo") || desc.includes("garbage") || desc.includes("annex v") || desc.includes("grb")) annex = "annexV";
          else if (desc.includes("emiss") || desc.includes("sox") || desc.includes("nox") || desc.includes("annex vi") || desc.includes("iapp") || desc.includes("cii")) annex = "annexVI";

          annexMap[annex].total++;
          annexMap[annex].items.push(item);
          if (item.status === "compliant" || item.status === "completed" || item.status === "ok" || item.status === "active") {
            annexMap[annex].compliant++;
          }
        });

        const scores: Record<string, number> = {};
        let totalCompliant = 0, totalItems = 0;
        for (const [key, val] of Object.entries(annexMap)) {
          scores[key] = val.total > 0 ? Math.round((val.compliant / val.total) * 100) : 100;
          totalCompliant += val.compliant;
          totalItems += val.total;
        }
        scores.overall = totalItems > 0 ? Math.round((totalCompliant / totalItems) * 100) : 100;
        return { scores, annexMap };
      }
      return { scores: { overall: 100, annexI: 100, annexII: 100, annexIII: 100, annexIV: 100, annexV: 100, annexVI: 100 }, annexMap: {} };
    },
    staleTime: 1000 * 60 * 5,
  });

  const wasteQuery = useQuery({
    queryKey: ["marpol-waste-logs-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .or("module.eq.waste,module.eq.discharge,module.ilike.%marpol%,module.ilike.%grb%,module.ilike.%orb%")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        return data.map((log): WasteLog => {
          const meta = (log.metadata as Record<string, unknown>) || {};
          return {
            id: log.id,
            type: (meta.type as string) || log.message || "Descarte",
            category: (meta.category as string) || "B",
            quantity: (meta.quantity as number) || 0,
            unit: (meta.unit as string) || "kg",
            location: (meta.location as string) || "Porto",
            date: log.created_at?.split("T")[0] || "",
            method: (meta.method as string) || "Port Reception Facility",
            certificate: (meta.certificate as string) || `CERT-${new Date().getFullYear()}-${log.id.slice(0, 4).toUpperCase()}`,
            recordBook: (meta.recordBook as string) || "GRB",
            coordinates: (meta.coordinates as string) || "",
            distanceFromShore: (meta.distanceNm as number) || 0,
          };
        });
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const emissionsQuery = useQuery({
    queryKey: ["marpol-emissions-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_sensors")
        .select("*")
        .or("sensor_type.ilike.%sox%,sensor_type.ilike.%nox%,sensor_type.ilike.%co2%,sensor_type.ilike.%emission%,sensor_type.ilike.%fuel%,sensor_type.ilike.%sulphur%")
        .limit(20);

      if (!error && data && data.length > 0) {
        const result: EmissionsData = { sox: 0, nox: 0, co2: 0, pm: 0, fuelType: "VLSFO", sulphurContent: 0.5 };
        data.forEach((s) => {
          const type = (s.sensor_type || "").toLowerCase();
          if (type.includes("sox") || type.includes("sulphur")) result.sox = s.value || 0;
          else if (type.includes("nox")) result.nox = s.value || 0;
          else if (type.includes("co2")) result.co2 = s.value || 0;
          else if (type.includes("pm") || type.includes("particul")) result.pm = s.value || 0;
        });
        return result;
      }
      return { sox: 0.35, nox: 9.8, co2: 45.2, pm: 0.8, fuelType: "VLSFO", sulphurContent: 0.50 } as EmissionsData;
    },
    staleTime: 1000 * 60 * 5,
  });

  const tanksQuery = useQuery({
    queryKey: ["marpol-waste-tanks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_sensors")
        .select("*")
        .or("sensor_type.ilike.%tank%,sensor_type.ilike.%waste%,sensor_type.ilike.%oil%,sensor_type.ilike.%bilge%,sensor_type.ilike.%sludge%,sensor_type.ilike.%sewage%")
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((s): TankData => ({
          id: s.id,
          name: s.sensor_type || "Tanque",
          capacity: (s.max_threshold as number) || 5000,
          currentLevel: (s.value as number) || 0,
          unit: s.unit || "L",
          percentage: Math.round(((s.value || 0) / ((s.max_threshold as number) || 5000)) * 100),
          status: ((s.value || 0) / ((s.max_threshold as number) || 5000)) >= 0.9 ? "critical" : ((s.value || 0) / ((s.max_threshold as number) || 5000)) >= 0.7 ? "warning" : "ok",
          lastUpdated: s.recorded_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        }));
      }
      return [
        { id: "t1", name: "Sludge Tank", capacity: 5000, currentLevel: 3200, unit: "L", percentage: 64, status: "ok" as const, lastUpdated: new Date().toISOString().split("T")[0] },
        { id: "t2", name: "Bilge Water Tank", capacity: 8000, currentLevel: 6100, unit: "L", percentage: 76, status: "warning" as const, lastUpdated: new Date().toISOString().split("T")[0] },
        { id: "t3", name: "Sewage Holding Tank", capacity: 3000, currentLevel: 2800, unit: "L", percentage: 93, status: "critical" as const, lastUpdated: new Date().toISOString().split("T")[0] },
        { id: "t4", name: "Oily Water Tank", capacity: 4000, currentLevel: 1200, unit: "L", percentage: 30, status: "ok" as const, lastUpdated: new Date().toISOString().split("T")[0] },
        { id: "t5", name: "Garbage Compactor", capacity: 2000, currentLevel: 1400, unit: "kg", percentage: 70, status: "warning" as const, lastUpdated: new Date().toISOString().split("T")[0] },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });

  const alertsQuery = useQuery({
    queryKey: ["marpol-alerts-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        return data.map((a): MARPOLAlert => ({
          id: a.id,
          severity: a.severity as "critical" | "warning" | "info",
          message: a.description || a.alert_type || "Alerta MARPOL",
          time: a.created_at ? new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
          type: a.alert_type || "geofencing",
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const vesselsQuery = useQuery({
    queryKey: ["marpol-vessels"],
    queryFn: async () => {
      const [vesselRes, certRes] = await Promise.all([
        supabase.from("vessels").select("id, name, vessel_type, status, imo_number").limit(20),
        supabase.from("certificates").select("id, certificate_type, status, expiry_date, vessel_id").limit(200),
      ]);
      const vessels = vesselRes.data || [];
      const certs = certRes.data || [];
      return vessels.map((v): MARPOLVessel => {
        const vesselStatus = v.status || "unknown";
        const vCerts = certs.filter((c) => c.vessel_id === v.id);
        const expiring = vCerts.filter((c) => {
          if (!c.expiry_date) return false;
          const diff = (new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return diff > 0 && diff <= 90;
        });
        return {
          ...v,
          status: vesselStatus,
          certificates: vCerts.length,
          expiringSoon: expiring.length,
          overallStatus: expiring.length > 2 ? "at_risk" : expiring.length > 0 ? "pending" : "compliant",
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    compliance: complianceQuery.data,
    wasteLogs: wasteQuery.data || [],
    emissions: emissionsQuery.data,
    tanks: tanksQuery.data || [],
    alerts: alertsQuery.data || [],
    vessels: vesselsQuery.data || [],
    isLoading: complianceQuery.isLoading || wasteQuery.isLoading,
    refetch: () => {
      complianceQuery.refetch();
      wasteQuery.refetch();
      emissionsQuery.refetch();
      tanksQuery.refetch();
      alertsQuery.refetch();
      vesselsQuery.refetch();
    },
  };
}
