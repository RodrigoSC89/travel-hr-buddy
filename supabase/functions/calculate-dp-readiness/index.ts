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

    // Fetch equipment status
    let equipQuery = supabase.from("peodp_equipment").select("*");
    if (vessel_id) equipQuery = equipQuery.eq("vessel_id", vessel_id);
    const { data: equipment } = await equipQuery;

    // Fetch incidents
    let incQuery = supabase.from("peodp_incidents").select("*").eq("status", "open");
    if (vessel_id) incQuery = incQuery.eq("vessel_id", vessel_id);
    const { data: incidents } = await incQuery;

    // Fetch audits from peotram_audits (reuse)
    const { data: audits } = await supabase
      .from("peotram_audits")
      .select("*")
      .eq("audit_type", "peodp")
      .order("created_at", { ascending: false })
      .limit(5);

    // Calculate equipment score
    const totalEquip = equipment?.length || 0;
    const operationalEquip = equipment?.filter((e: any) => e.status === "operational").length || 0;
    const equipmentScore = totalEquip > 0 ? Math.round((operationalEquip / totalEquip) * 100) : 100;

    // Calculate calibration score
    const now = new Date();
    const overdueCalibrations = equipment?.filter((e: any) => 
      e.next_calibration && new Date(e.next_calibration) < now
    ).length || 0;
    const calibrationScore = totalEquip > 0 
      ? Math.round(((totalEquip - overdueCalibrations) / totalEquip) * 100) 
      : 100;

    // Incidents impact
    const openIncidents = incidents?.length || 0;
    const criticalIncidents = incidents?.filter((i: any) => i.severity === "critical").length || 0;
    const incidentsScore = Math.max(0, 100 - (openIncidents * 5) - (criticalIncidents * 15));

    // Documentation score (based on audit history)
    const recentAudit = audits?.[0];
    const documentationScore = recentAudit?.overall_score || 70;

    // Training score (placeholder based on DPO certs)
    const trainingScore = 85;

    // Drills score
    const drillsScore = 80;

    // Certificate score
    const certificatesScore = calibrationScore;

    // Overall
    const weights = { equipment: 0.25, documentation: 0.2, training: 0.15, incidents: 0.15, certificates: 0.15, drills: 0.1 };
    const overall = Math.round(
      equipmentScore * weights.equipment +
      documentationScore * weights.documentation +
      trainingScore * weights.training +
      incidentsScore * weights.incidents +
      certificatesScore * weights.certificates +
      drillsScore * weights.drills
    );

    // Critical gaps
    const criticalGaps: string[] = [];
    if (equipmentScore < 70) criticalGaps.push(`${totalEquip - operationalEquip} equipamentos DP não operacionais`);
    if (overdueCalibrations > 0) criticalGaps.push(`${overdueCalibrations} calibrações vencidas`);
    if (criticalIncidents > 0) criticalGaps.push(`${criticalIncidents} incidentes críticos em aberto`);
    if (documentationScore < 70) criticalGaps.push("Documentação DP abaixo do padrão IMCA");

    const estimatedDaysToReady = criticalGaps.length === 0 ? 0 : Math.max(7, criticalGaps.length * 14);

    return new Response(JSON.stringify({
      overall,
      breakdown: {
        equipment: equipmentScore,
        documentation: documentationScore,
        training: trainingScore,
        incidents: incidentsScore,
        certificates: certificatesScore,
        drills: drillsScore,
      },
      criticalGaps,
      estimatedDaysToReady,
      totalEquipment: totalEquip,
      openIncidents,
      calculatedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
