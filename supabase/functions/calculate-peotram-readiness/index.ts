import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { vessel_id } = await req.json().catch(() => ({ vessel_id: null }));

    // Fetch SAT chambers
    let chamberQuery = supabase.from("peotram_sat_chambers").select("*");
    if (vessel_id) chamberQuery = chamberQuery.eq("vessel_id", vessel_id);
    const { data: chambers } = await chamberQuery;

    // Fetch divers
    let diverQuery = supabase.from("peotram_divers").select("*");
    if (vessel_id) diverQuery = diverQuery.eq("vessel_id", vessel_id);
    const { data: divers } = await diverQuery;

    // Fetch gas inventory
    let gasQuery = supabase.from("peotram_gas_inventory").select("*");
    if (vessel_id) gasQuery = gasQuery.eq("vessel_id", vessel_id);
    const { data: gases } = await gasQuery;

    // Fetch checklist responses
    const { data: responses } = await supabase
      .from("peotram_checklist_responses")
      .select("*, item:peotram_checklist_items(is_critical, section)")
      .order("verified_at", { ascending: false });

    // Fetch checklist items count
    const { count: totalItems } = await supabase
      .from("peotram_checklist_items")
      .select("*", { count: "exact", head: true });

    // SAT System Score
    const totalChambers = chambers?.length || 0;
    const operationalChambers = chambers?.filter((c: any) =>
      c.status === "operational" || c.status === "pressurized" || c.status === "standby"
    ).length || 0;
    const satScore = totalChambers > 0 ? Math.round((operationalChambers / totalChambers) * 100) : 70;

    // Equipment Score (based on checklist)
    const totalResponses = responses?.length || 0;
    const okResponses = responses?.filter((r: any) => r.status === "ok").length || 0;
    const equipmentScore = totalResponses > 0 ? Math.round((okResponses / totalResponses) * 100) : 50;

    // Personnel Score
    const totalDivers = divers?.length || 0;
    const certifiedDivers = divers?.filter((d: any) => {
      const certs = d.certifications || [];
      return certs.every((c: any) => c.status === "valid" || c.status === "expiring");
    }).length || 0;
    const fitDivers = divers?.filter((d: any) => d.fitness_status === "fit").length || 0;
    const personnelScore = totalDivers > 0
      ? Math.round(((certifiedDivers / totalDivers) * 60 + (fitDivers / totalDivers) * 40))
      : 50;

    // Documentation Score (based on checklist documentation section)
    const docResponses = responses?.filter((r: any) => r.item?.section === "documentation") || [];
    const docOk = docResponses.filter((r: any) => r.status === "ok").length;
    const documentationScore = docResponses.length > 0 ? Math.round((docOk / docResponses.length) * 100) : 60;

    // Emergency Score
    const emergencyResponses = responses?.filter((r: any) => r.item?.section === "emergency") || [];
    const emergencyOk = emergencyResponses.filter((r: any) => r.status === "ok").length;
    const emergencyScore = emergencyResponses.length > 0 ? Math.round((emergencyOk / emergencyResponses.length) * 100) : 65;

    // Gas Score
    const totalGases = gases?.length || 0;
    const criticalGases = gases?.filter((g: any) => {
      const level = g.total_capacity_m3 > 0 ? (g.current_level_m3 / g.total_capacity_m3) * 100 : 100;
      return level <= (g.critical_level_percent || 20);
    }).length || 0;
    const gasScore = totalGases > 0 ? Math.round(((totalGases - criticalGases) / totalGases) * 100) : 80;

    // Overall weighted
    const weights = { saturation: 0.25, equipment: 0.20, personnel: 0.20, documentation: 0.15, emergency: 0.10, gas: 0.10 };
    const overall = Math.round(
      satScore * weights.saturation +
      equipmentScore * weights.equipment +
      personnelScore * weights.personnel +
      documentationScore * weights.documentation +
      emergencyScore * weights.emergency +
      gasScore * weights.gas
    );

    // Critical items
    const criticalItems: string[] = [];
    const nokCritical = responses?.filter((r: any) => r.item?.is_critical && r.status === "nok") || [];
    if (nokCritical.length > 0) criticalItems.push(`${nokCritical.length} itens críticos não conformes`);
    if (criticalGases > 0) criticalItems.push(`${criticalGases} gases em nível crítico`);
    const unfitDivers = totalDivers - fitDivers;
    if (unfitDivers > 0) criticalItems.push(`${unfitDivers} mergulhadores não aptos`);
    const expiredCerts = divers?.filter((d: any) =>
      (d.certifications || []).some((c: any) => c.status === "expired")
    ).length || 0;
    if (expiredCerts > 0) criticalItems.push(`${expiredCerts} mergulhadores com certificados vencidos`);

    return new Response(JSON.stringify({
      overall,
      saturation: satScore,
      equipment: equipmentScore,
      personnel: personnelScore,
      documentation: documentationScore,
      emergency: emergencyScore,
      gas: gasScore,
      criticalItems,
      totalChecklist: totalItems || 0,
      completedChecklist: totalResponses,
      totalDivers,
      calculatedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
