import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VesselHealthResult {
  vessel_id: string;
  vessel_name: string;
  health_score: number;
  maintenance_score: number;
  compliance_score: number;
  safety_score: number;
  operational_score: number;
  status: "healthy" | "degraded" | "critical";
  risk_factors: string[];
  cii_rating?: string;
  crew_wellbeing?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { vessel_id } = await req.json().catch(() => ({ vessel_id: null }));

    // Fetch vessels
    let vesselQuery = supabase.from("vessels").select("id, name, status, vessel_type, dwt");
    if (vessel_id) vesselQuery = vesselQuery.eq("id", vessel_id);
    const { data: vessels, error: vErr } = await vesselQuery;
    if (vErr) throw vErr;
    if (!vessels || vessels.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vesselIds = vessels.map(v => v.id);

    // Parallel data fetch
    const [maintRes, certRes, ncRes, incidentRes] = await Promise.all([
      supabase.from("maintenance_tasks")
        .select("vessel_id, status, priority, due_date")
        .in("vessel_id", vesselIds)
        .in("status", ["pending", "in_progress", "overdue"]),
      supabase.from("crew_certifications")
        .select("crew_member_id, expiry_date, certification_name")
        .lte("expiry_date", new Date(Date.now() + 90 * 86400000).toISOString())
        .gte("expiry_date", new Date().toISOString()),
      supabase.from("non_conformities")
        .select("vessel_id, severity, status")
        .in("vessel_id", vesselIds)
        .neq("status", "closed"),
      supabase.from("incidents")
        .select("vessel_id, severity, status")
        .in("vessel_id", vesselIds)
        .neq("status", "closed"),
    ]);

    const results: VesselHealthResult[] = vessels.map(vessel => {
      const vMaint = (maintRes.data || []).filter(m => m.vessel_id === vessel.id);
      const vNCs = (ncRes.data || []).filter(n => n.vessel_id === vessel.id);
      const vIncidents = (incidentRes.data || []).filter(i => i.vessel_id === vessel.id);

      // Business rule: Vessel Health Score = 100 - (critical_failures * 15)
      const overdue = vMaint.filter(m =>
        m.status === "overdue" || (m.due_date && new Date(m.due_date) < new Date())
      );
      const criticalFailures = overdue.filter(m => m.priority === "critical").length;
      const maintenanceScore = Math.max(0, 100 - (criticalFailures * 15) - (overdue.length * 8) - (vMaint.length * 2));

      const critNCs = vNCs.filter(n => n.severity === "critical").length;
      const majorNCs = vNCs.filter(n => n.severity === "major").length;
      const complianceScore = Math.max(0, 100 - (critNCs * 20) - (majorNCs * 10) - ((vNCs.length - critNCs - majorNCs) * 5));

      const critIncidents = vIncidents.filter(i => i.severity === "critical").length;
      const safetyScore = Math.max(0, 100 - (critIncidents * 25) - (vIncidents.length * 10));

      const statusScores: Record<string, number> = {
        active: 95, underway: 95, navigating: 95,
        in_port: 85, moored: 85, anchored: 75,
        maintenance: 50, drydock: 40, laid_up: 20,
      };
      const operationalScore = statusScores[(vessel.status || "").toLowerCase()] ?? 60;

      // Weighted composite
      const healthScore = Math.round(
        maintenanceScore * 0.30 +
        complianceScore * 0.30 +
        safetyScore * 0.25 +
        operationalScore * 0.15
      );

      const riskFactors: string[] = [];
      if (overdue.length > 0) riskFactors.push(`${overdue.length} manutenção(ões) atrasada(s)`);
      if (critNCs > 0) riskFactors.push(`${critNCs} NC(s) crítica(s) aberta(s)`);
      if (critIncidents > 0) riskFactors.push(`${critIncidents} incidente(s) crítico(s)`);
      if (vMaint.length >= 5) riskFactors.push(`Acúmulo de ${vMaint.length} tarefas`);

      const status: VesselHealthResult["status"] =
        healthScore >= 75 ? "healthy" : healthScore >= 50 ? "degraded" : "critical";

      return {
        vessel_id: vessel.id,
        vessel_name: vessel.name || "—",
        health_score: healthScore,
        maintenance_score: maintenanceScore,
        compliance_score: complianceScore,
        safety_score: safetyScore,
        operational_score: operationalScore,
        status,
        risk_factors: riskFactors,
      };
    });

    // Persist scores
    const upsertRows = results.flatMap(r => [
      { vessel_id: r.vessel_id, risk_category: "maintenance", risk_score: r.maintenance_score, risk_factors: { risks: r.risk_factors }, calculated_at: new Date().toISOString() },
      { vessel_id: r.vessel_id, risk_category: "compliance", risk_score: r.compliance_score, risk_factors: {}, calculated_at: new Date().toISOString() },
      { vessel_id: r.vessel_id, risk_category: "safety", risk_score: r.safety_score, risk_factors: {}, calculated_at: new Date().toISOString() },
      { vessel_id: r.vessel_id, risk_category: "operational", risk_score: r.operational_score, risk_factors: {}, calculated_at: new Date().toISOString() },
    ]);

    await supabase.from("vessel_risk_scores").upsert(upsertRows, {
      onConflict: "vessel_id,risk_category",
    });

    return new Response(JSON.stringify({
      results,
      fleet_avg: results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.health_score, 0) / results.length)
        : 0,
      critical_count: results.filter(r => r.status === "critical").length,
      calculated_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
