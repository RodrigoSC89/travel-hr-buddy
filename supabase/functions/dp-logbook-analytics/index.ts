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

    const { vessel_id, days = 30 } = await req.json().catch(() => ({ vessel_id: null, days: 30 }));

    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Fetch logbook entries
    let query = supabase
      .from("peodp_logbook_entries")
      .select("*")
      .gte("timestamp", since)
      .order("timestamp", { ascending: false });

    if (vessel_id) query = query.eq("vessel_id", vessel_id);

    const { data: entries } = await query;

    // Fetch CV inspections
    let cvQuery = supabase
      .from("peodp_cv_inspections")
      .select("*, peodp_cv_findings(*)")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (vessel_id) cvQuery = cvQuery.eq("vessel_id", vessel_id);

    const { data: inspections } = await cvQuery;

    // Analytics
    const totalEntries = entries?.length || 0;
    const incidents = entries?.filter((e: Record<string, unknown>) => e.event_type === "incident").length || 0;
    const criticalIncidents = entries?.filter((e: Record<string, unknown>) => e.severity === "critical").length || 0;
    const handovers = entries?.filter((e: Record<string, unknown>) => e.event_type === "handover").length || 0;
    const drills = entries?.filter((e: Record<string, unknown>) => e.event_type === "drill").length || 0;

    const totalInspections = inspections?.length || 0;
    const failedInspections = inspections?.filter((i: Record<string, unknown>) => i.status === "failed").length || 0;
    const avgConfidence = totalInspections > 0
      ? Math.round(inspections!.reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.confidence) || 0), 0) / totalInspections)
      : 0;

    // Event type breakdown
    const eventBreakdown: Record<string, number> = {};
    entries?.forEach((e: Record<string, unknown>) => {
      const t = e.event_type as string;
      eventBreakdown[t] = (eventBreakdown[t] || 0) + 1;
    });

    // Severity breakdown for CV findings
    let totalFindings = 0;
    const severityBreakdown: Record<string, number> = {};
    inspections?.forEach((i: Record<string, unknown>) => {
      const findings = (i as Record<string, unknown>).peodp_cv_findings as Record<string, unknown>[] | undefined;
      if (Array.isArray(findings)) {
        totalFindings += findings.length;
        findings.forEach((f) => {
          const s = f.severity as string;
          severityBreakdown[s] = (severityBreakdown[s] || 0) + 1;
        });
      }
    });

    // Operational readiness score
    const incidentPenalty = incidents * 5 + criticalIncidents * 15;
    const inspectionPenalty = failedInspections * 10;
    const drillBonus = Math.min(drills * 3, 15);
    const operationalScore = Math.max(0, Math.min(100, 100 - incidentPenalty - inspectionPenalty + drillBonus));

    return new Response(JSON.stringify({
      period_days: days,
      logbook: {
        total_entries: totalEntries,
        incidents,
        critical_incidents: criticalIncidents,
        handovers,
        drills,
        event_breakdown: eventBreakdown,
      },
      computer_vision: {
        total_inspections: totalInspections,
        failed_inspections: failedInspections,
        avg_confidence: avgConfidence,
        total_findings: totalFindings,
        severity_breakdown: severityBreakdown,
      },
      operational_readiness_score: operationalScore,
      calculated_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
