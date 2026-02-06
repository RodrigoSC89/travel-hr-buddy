/**
 * Hook para dados reais de emissões do Supabase
 * Substitui mock data no CarbonTrackingPanel
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmissionRecord {
  id: string;
  vessel_id: string | null;
  vessel_name: string;
  voyage_ref: string;
  route: string;
  period: string;
  fuel_type: string;
  fuel_consumed: number;
  co2_tons: number;
  ch4_tons: number;
  n2o_tons: number;
  distance_nm: number;
  cargo_tons: number;
  eeoi: number;
  cii_rating: string;
  verified: boolean;
  created_at: string;
}

export interface MonthlyEmission {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export function useEmissionsRealData() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["emissions-records-real"],
    queryFn: async () => {
      // Fetch emissions_records joined with vessels
      const { data: emissions, error: emErr } = await supabase
        .from("emissions_records")
        .select("*, vessels(name)")
        .order("created_at", { ascending: false });

      if (emErr) throw emErr;

      // Fetch fuel_records for monthly aggregation
      const { data: fuelRecords, error: fuelErr } = await supabase
        .from("fuel_records")
        .select("*")
        .order("record_date", { ascending: true });

      if (fuelErr) throw fuelErr;

      // Transform emissions to UI format
      const records: EmissionRecord[] = (emissions || []).map((e: any) => {
        const fuelConsumed = e.fuel_consumed_mt || 0;
        const co2 = e.co2_tonnes || fuelConsumed * 3.114;
        const distance = e.distance_nm || 0;
        const cargo = e.cargo_carried_mt || 5000;
        const eeoi = distance > 0 && cargo > 0 ? (co2 * 1000000) / (cargo * distance) : 0;

        return {
          id: e.id,
          vessel_id: e.vessel_id,
          vessel_name: e.vessels?.name || "Unknown",
          voyage_ref: e.voyage_id || `VOY-${e.id?.slice(0, 8)}`,
          route: `Viagem ${e.voyage_id || ""}`,
          period: e.recorded_date || new Date(e.created_at).toLocaleDateString("pt-BR"),
          fuel_type: e.fuel_type || "LSFO",
          fuel_consumed: fuelConsumed,
          co2_tons: co2,
          ch4_tons: 0,
          n2o_tons: 0,
          distance_nm: distance,
          cargo_tons: cargo,
          eeoi: +eeoi.toFixed(2),
          cii_rating: getCIIRating(eeoi),
          verified: false,
          created_at: e.created_at,
        };
      });

      // Build monthly aggregation from fuel_records
      const monthlyMap = new Map<string, { scope1: number; scope2: number; scope3: number }>();
      for (const fr of fuelRecords || []) {
        const d = new Date(fr.record_date || fr.created_at || new Date());
        const key = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { scope1: 0, scope2: 0, scope3: 0 });
        }
        const entry = monthlyMap.get(key)!;
        const consumption = fr.quantity_mt || 0;
        entry.scope1 += consumption * 3.114; // CO2 factor for HFO
        entry.scope2 += consumption * 0.05; // estimated
        entry.scope3 += consumption * 0.02; // estimated
      }

      const monthly: MonthlyEmission[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        scope1: +data.scope1.toFixed(0),
        scope2: +data.scope2.toFixed(0),
        scope3: +data.scope3.toFixed(0),
      }));

      // Summary stats
      const totalCO2 = records.reduce((s, r) => s + r.co2_tons, 0);
      const totalFuel = records.reduce((s, r) => s + r.fuel_consumed, 0);
      const avgEEOI = records.length > 0 ? records.reduce((s, r) => s + r.eeoi, 0) / records.length : 0;
      const verified = records.filter(r => r.verified).length;

      return {
        records,
        monthly: monthly.length > 0 ? monthly : getDefaultMonthly(),
        stats: {
          totalCO2: +totalCO2.toFixed(1),
          totalFuel: +totalFuel.toFixed(1),
          avgEEOI: +avgEEOI.toFixed(2),
          totalVoyages: records.length,
          verifiedVoyages: verified,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const addRecord = useMutation({
    mutationFn: async (record: Partial<EmissionRecord>) => {
      const { data, error } = await supabase.from("emissions_records").insert({
        vessel_id: record.vessel_id,
        vessel_name: record.vessel_name,
        fuel_type: record.fuel_type,
        fuel_consumed_mt: record.fuel_consumed,
        co2_emissions_mt: record.co2_tons,
        distance_nm: record.distance_nm,
        reporting_period: record.period,
        cii_rating: record.cii_rating,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emissions-records-real"] });
      toast.success("Registro de emissão adicionado com sucesso");
    },
    onError: (err) => {
      toast.error("Erro ao adicionar registro: " + (err as Error).message);
    },
  });

  return { ...query, addRecord };
}

function getCIIRating(eeoi: number): string {
  if (eeoi <= 5) return "A";
  if (eeoi <= 8) return "B";
  if (eeoi <= 12) return "C";
  if (eeoi <= 16) return "D";
  return "E";
}

function getDefaultMonthly(): MonthlyEmission[] {
  return [
    { month: "Jan", scope1: 0, scope2: 0, scope3: 0 },
    { month: "Fev", scope1: 0, scope2: 0, scope3: 0 },
    { month: "Mar", scope1: 0, scope2: 0, scope3: 0 },
  ];
}
