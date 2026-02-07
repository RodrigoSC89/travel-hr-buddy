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
      const wasteCategories: WasteCategory[] = tanks.map((t: any) => {
        const pct = t.capacity > 0 ? (Number(t.current_level) / Number(t.capacity)) * 100 : 0;
        const status: "ok" | "warning" | "critical" = pct >= 90 ? "critical" : pct >= 75 ? "warning" : "ok";
        return {
          id: t.id,
          name: t.tank_name || t.tank_type || "Tank",
          code: `MARPOL-${(t.tank_type || "A").charAt(0).toUpperCase()}`,
          currentVolume: Number(t.current_level) || 0,
          capacity: Number(t.capacity) || 100,
          unit: t.unit || "kg",
          lastDischarge: t.last_discharge_date || "",
          method: t.last_discharge_location || "Porto",
          status,
        };
      });

      // Map discharge records
      const dischargeRecords: DischargeRecord[] = records.map((r: any) => {
        const method = (r.disposal_method || "shore").toLowerCase();
        return {
          id: r.id,
          date: r.disposal_date?.split("T")[0] || "",
          vessel: r.vessels?.name || "Vessel",
          category: r.waste_type || "General",
          volume: Number(r.quantity) || 0,
          unit: r.unit || "kg",
          method: method.includes("sea") ? "sea" : method.includes("incin") ? "incinerated" : "shore" as any,
          location: r.port_code || "Porto",
          verified: !!r.certificate_number,
          signature: r.certificate_number || "",
        };
      });

      return { wasteCategories, dischargeRecords };
    },
    staleTime: 1000 * 60 * 5,
  });
}
