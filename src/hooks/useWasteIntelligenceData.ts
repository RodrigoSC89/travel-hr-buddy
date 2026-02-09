/**
 * Hook: useWasteIntelligenceData
 * Fetches waste tanks and waste records from Supabase (MARPOL Annex V)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WasteCategory {
  id: string;
  name: string;
  code: string;
  currentVolume: number;
  capacity: number;
  unit: string;
  lastDischarge: string;
  method: string;
  status: "ok" | "warning" | "critical";
}

export interface DischargeRecord {
  id: string;
  date: string;
  vessel: string;
  category: string;
  volume: number;
  unit: string;
  method: "sea" | "shore" | "incinerated";
  location: string;
  verified: boolean;
  signature: string;
}

export function useWasteIntelligenceData() {
  return useQuery({
    queryKey: ["waste-intelligence"],
    queryFn: async () => {
      const [tanksRes, recordsRes] = await Promise.all([
        supabase.from("waste_tanks").select("*").order("tank_name").limit(50),
        supabase.from("waste_records").select("*, vessels(name)").order("disposal_date", { ascending: false }).limit(100),
      ]);

      const tanks = tanksRes.data || [];
      const records = recordsRes.data || [];

      // Map waste tanks to categories
      type TankRow = Record<string, unknown>;
      const wasteCategories: WasteCategory[] = tanks.map((t: TankRow) => {
        const capacity = Number(t.capacity) || 100;
        const currentLevel = Number(t.current_level) || 0;
        const pct = capacity > 0 ? (currentLevel / capacity) * 100 : 0;
        const status: "ok" | "warning" | "critical" = pct >= 90 ? "critical" : pct >= 75 ? "warning" : "ok";
        return {
          id: String(t.id),
          name: String(t.tank_name || t.tank_type || "Tank"),
          code: `MARPOL-${String(t.tank_type || "A").charAt(0).toUpperCase()}`,
          currentVolume: currentLevel,
          capacity,
          unit: String(t.unit || "kg"),
          lastDischarge: String(t.last_discharge_date || ""),
          method: String(t.last_discharge_location || "Porto"),
          status,
        };
      });

      // Map discharge records
      type RecordRow = Record<string, unknown> & { vessels?: { name?: string } | null };
      const dischargeRecords: DischargeRecord[] = records.map((r: RecordRow) => {
        const methodStr = String(r.disposal_method || "shore").toLowerCase();
        const dischargeMethod: DischargeRecord["method"] = methodStr.includes("sea") ? "sea" : methodStr.includes("incin") ? "incinerated" : "shore";
        const dateStr = typeof r.disposal_date === "string" ? r.disposal_date.split("T")[0] : "";
        return {
          id: String(r.id),
          date: dateStr,
          vessel: r.vessels?.name || "Vessel",
          category: String(r.waste_type || "General"),
          volume: Number(r.quantity) || 0,
          unit: String(r.unit || "kg"),
          method: dischargeMethod,
          location: String(r.port_code || "Porto"),
          verified: !!r.certificate_number,
          signature: String(r.certificate_number || ""),
        };
      });

      return { wasteCategories, dischargeRecords };
    },
    staleTime: 1000 * 60 * 5,
  });
}
