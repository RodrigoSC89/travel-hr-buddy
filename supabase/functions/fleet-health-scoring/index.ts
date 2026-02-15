/**
 * Fleet Health Scoring Engine
 * Real-time aggregated fleet health score from maintenance, compliance, crew, inspections
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all vessels
    const { data: vessels } = await supabase
      .from('vessels')
      .select('id, name, status, vessel_type, flag, imo_number')
      .order('name');

    if (!vessels || vessels.length === 0) {
      return new Response(JSON.stringify({ vessels: [], fleetScore: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parallel data fetch
    const [maintenanceRes, crewRes, incidentsRes, inspectionsRes, drillsRes] = await Promise.all([
      supabase.from('maintenance_jobs').select('vessel_id, status, priority').limit(500),
      supabase.from('crew_members').select('vessel_id, status').limit(500),
      supabase.from('safety_incidents').select('vessel_id, severity, status').limit(200),
      supabase.from('psc_inspections').select('vessel_id, status, detention_risk_score').limit(100),
      (supabase.from as Function)('drill_records').select('vessel_id, score, status').limit(200),
    ]);

    const maintenance = maintenanceRes.data || [];
    const crew = crewRes.data || [];
    const incidents = incidentsRes.data || [];
    const inspections = inspectionsRes.data || [];
    const drills = (drillsRes as any).data || [];

    // Calculate per-vessel health scores
    const vesselScores = vessels.map((vessel: any) => {
      const vid = vessel.id;

      // Maintenance score (100 - penalty for critical/overdue)
      const vMaint = maintenance.filter((m: any) => m.vessel_id === vid);
      const criticalMaint = vMaint.filter((m: any) => m.priority === 'critical' && m.status !== 'completed').length;
      const pendingMaint = vMaint.filter((m: any) => m.status === 'pending' || m.status === 'overdue').length;
      const maintScore = Math.max(0, 100 - (criticalMaint * 15) - (pendingMaint * 5));

      // Crew score (based on staffing)
      const vCrew = crew.filter((c: any) => c.vessel_id === vid);
      const activeCrew = vCrew.filter((c: any) => c.status === 'active').length;
      const crewScore = vCrew.length > 0 ? Math.min(100, (activeCrew / Math.max(vCrew.length, 1)) * 100) : 50;

      // Safety score (based on incidents)
      const vIncidents = incidents.filter((i: any) => i.vessel_id === vid);
      const openHigh = vIncidents.filter((i: any) => i.severity === 'high' && i.status !== 'closed').length;
      const openMed = vIncidents.filter((i: any) => i.severity === 'medium' && i.status !== 'closed').length;
      const safetyScore = Math.max(0, 100 - (openHigh * 20) - (openMed * 8));

      // Compliance score (PSC inspections)
      const vInsp = inspections.filter((i: any) => i.vessel_id === vid);
      const avgDetention = vInsp.length > 0
        ? vInsp.reduce((s: number, i: any) => s + (Number(i.detention_risk_score) || 0), 0) / vInsp.length
        : 0;
      const complianceScore = Math.max(0, 100 - avgDetention);

      // Drill readiness
      const vDrills = drills.filter((d: any) => d.vessel_id === vid && d.status === 'completed');
      const drillScore = vDrills.length > 0
        ? Math.round(vDrills.reduce((s: number, d: any) => s + (Number(d.score) || 0), 0) / vDrills.length)
        : 50;

      // Weighted composite
      const healthScore = Math.round(
        maintScore * 0.30 +
        crewScore * 0.20 +
        safetyScore * 0.25 +
        complianceScore * 0.15 +
        drillScore * 0.10
      );

      const rating = healthScore >= 90 ? 'A' : healthScore >= 75 ? 'B' : healthScore >= 60 ? 'C' : healthScore >= 40 ? 'D' : 'E';

      return {
        vesselId: vessel.id,
        vesselName: vessel.name,
        vesselType: vessel.vessel_type,
        status: vessel.status,
        flag: vessel.flag,
        healthScore,
        rating,
        breakdown: { maintenance: maintScore, crew: crewScore, safety: safetyScore, compliance: complianceScore, drills: drillScore },
        crewCount: vCrew.length,
        openIncidents: vIncidents.filter((i: any) => i.status !== 'closed').length,
        pendingMaintenance: pendingMaint + criticalMaint,
      };
    });

    const fleetScore = vesselScores.length > 0
      ? Math.round(vesselScores.reduce((s: number, v: any) => s + v.healthScore, 0) / vesselScores.length)
      : 0;

    return new Response(JSON.stringify({
      fleetScore,
      fleetRating: fleetScore >= 90 ? 'A' : fleetScore >= 75 ? 'B' : fleetScore >= 60 ? 'C' : fleetScore >= 40 ? 'D' : 'E',
      vessels: vesselScores.sort((a: any, b: any) => b.healthScore - a.healthScore),
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FLEET-HEALTH] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
