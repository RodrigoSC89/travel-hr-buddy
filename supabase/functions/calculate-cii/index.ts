import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// CO2 emission factors per fuel type (tons CO2 per ton fuel) - IMO 2023
const CO2_FACTORS: Record<string, number> = {
  hfo: 3.114, vlsfo: 3.151, mgo: 3.206, mdo: 3.206,
  lfo: 3.151, lng: 2.750, methanol: 1.375, default: 3.114,
};

// IMO CII reference lines (2023) - gCO2/(DWT·nm)
// These vary by ship type and size; simplified for bulk/tanker
function getReferenceLine(dwt: number): number {
  // Simplified: CII_ref = a × DWT^(-c) for bulk carriers
  const a = 4745;
  const c = 0.622;
  return a * Math.pow(dwt, -c);
}

function getCIIRating(attained: number, required: number): "A" | "B" | "C" | "D" | "E" {
  const ratio = attained / required;
  if (ratio <= 0.86) return "A";
  if (ratio <= 0.94) return "B";
  if (ratio <= 1.06) return "C";
  if (ratio <= 1.18) return "D";
  return "E";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { vesselId, year } = await req.json();
    if (!vesselId) {
      return new Response(JSON.stringify({ error: "vesselId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get vessel info
    const { data: vessel } = await sb
      .from("vessels")
      .select("id, name, imo_number, deadweight, vessel_type, gross_tonnage")
      .eq("id", vesselId)
      .single();

    if (!vessel) {
      return new Response(JSON.stringify({ error: "Vessel not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetYear = year || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    // Get bunker consumption for the year
    const { data: bunkerOps } = await sb
      .from("bunker_operations")
      .select("quantity_mt, fuel_type")
      .eq("vessel_id", vesselId)
      .gte("operation_date", startDate)
      .lte("operation_date", endDate);

    // Get voyage distances for the year
    const { data: voyages } = await sb
      .from("voyage_plans")
      .select("distance_nm, status")
      .eq("vessel_id", vesselId)
      .gte("departure_date", startDate)
      .lte("departure_date", endDate);

    // Calculate total CO2 emissions
    let totalCO2 = 0;
    const fuelBreakdown: Record<string, { mt: number; co2: number }> = {};

    for (const op of bunkerOps || []) {
      const fuelType = (op.fuel_type || "hfo").toLowerCase();
      const factor = CO2_FACTORS[fuelType] || CO2_FACTORS.default;
      const qty = op.quantity_mt || 0;
      const co2 = qty * factor;
      totalCO2 += co2;

      if (!fuelBreakdown[fuelType]) {
        fuelBreakdown[fuelType] = { mt: 0, co2: 0 };
      }
      fuelBreakdown[fuelType].mt += qty;
      fuelBreakdown[fuelType].co2 += co2;
    }

    // Calculate total distance
    const totalDistance = voyages?.reduce(
      (sum: number, v: { distance_nm?: number }) => sum + (v.distance_nm || 0), 0
    ) || 1; // Avoid division by zero

    const dwt = vessel.deadweight || 10000;

    // Attained CII = (Total CO2 emissions in grams) / (DWT × Distance)
    const attainedCII = (totalCO2 * 1_000_000) / (dwt * totalDistance);

    // Required CII (with annual reduction factor)
    // 2023: 5%, 2024: 7%, 2025: 9%, 2026: 11%
    const reductionFactors: Record<number, number> = {
      2023: 0.95, 2024: 0.93, 2025: 0.91, 2026: 0.89,
    };
    const reductionFactor = reductionFactors[targetYear] || 0.89;
    const referenceCII = getReferenceLine(dwt);
    const requiredCII = referenceCII * reductionFactor;

    const rating = getCIIRating(attainedCII, requiredCII);

    // Calculate CO2 budget
    const co2Budget = (requiredCII * dwt * totalDistance) / 1_000_000;
    const reductionNeeded = attainedCII > requiredCII
      ? ((attainedCII - requiredCII) / attainedCII) * 100
      : 0;

    // Generate recommendations based on rating
    const recommendations: string[] = [];
    if (rating === "D" || rating === "E") {
      recommendations.push("Implementar slow steaming (-10% velocidade)");
      recommendations.push("Otimizar rotas para menor consumo de combustível");
      recommendations.push("Considerar weather routing para evitar condições adversas");
      recommendations.push("Avaliar limpeza de casco e polimento de hélice");
      if (rating === "E") {
        recommendations.push("URGENTE: Plano de ação corretivo obrigatório (SEEMP Part III)");
      }
    } else if (rating === "C") {
      recommendations.push("Manter monitoramento mensal de performance");
      recommendations.push("Considerar otimizações operacionais incrementais");
    } else {
      recommendations.push("Performance excelente — manter práticas atuais");
      recommendations.push("Documentar best practices para replicar na frota");
    }

    // EU ETS exposure estimate (€90/ton CO2 in 2026)
    const euEtsRate = 90;
    const euEtsExposure = Math.round(totalCO2 * euEtsRate);

    return new Response(
      JSON.stringify({
        vessel_id: vesselId,
        vessel_name: vessel.name,
        imo_number: vessel.imo_number,
        year: targetYear,
        dwt,
        // CII metrics
        current_cii: Math.round(attainedCII * 10000) / 10000,
        required_cii: Math.round(requiredCII * 10000) / 10000,
        reference_cii: Math.round(referenceCII * 10000) / 10000,
        rating,
        // Emissions
        co2_emitted_mt: Math.round(totalCO2 * 100) / 100,
        co2_budget_mt: Math.round(co2Budget * 100) / 100,
        total_distance_nm: Math.round(totalDistance),
        total_fuel_mt: Math.round(
          (bunkerOps || []).reduce((s: number, b: { quantity_mt?: number }) => s + (b.quantity_mt || 0), 0) * 100
        ) / 100,
        // Analysis
        reduction_needed_percent: Math.round(reductionNeeded * 10) / 10,
        fuel_breakdown: fuelBreakdown,
        recommendations,
        // Financial
        eu_ets_exposure_eur: euEtsExposure,
        eu_ets_rate_eur_per_ton: euEtsRate,
        // Voyages analyzed
        voyages_count: voyages?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
