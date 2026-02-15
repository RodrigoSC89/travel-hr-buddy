import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch crew members
    const { data: crew, error: crewError } = await supabase
      .from("crew_members")
      .select("id, full_name, status, position, rank, nationality, contract_start, contract_end, vessel_id");

    if (crewError) throw crewError;

    const now = new Date();
    const totalCrew = crew?.length || 0;
    const activeCrew = crew?.filter((c: any) => c.status === "active" || c.status === "embarked").length || 0;
    const onLeaveCrew = crew?.filter((c: any) => c.status === "on_leave" || c.status === "standby").length || 0;

    // Turnover risk calculation
    const expiringContracts = crew?.filter((c: any) => {
      if (!c.contract_end) return false;
      const end = new Date(c.contract_end);
      const daysLeft = (end.getTime() - now.getTime()) / 86400000;
      return daysLeft > 0 && daysLeft <= 90;
    }) || [];

    const turnoverRisk = totalCrew > 0 ? ((expiringContracts.length / totalCrew) * 100).toFixed(1) : "0";

    // Fatigue risk (days onboard > 75 days)
    const fatigueRisk = crew?.filter((c: any) => {
      if (!c.contract_start || c.status !== "active") return false;
      const days = (now.getTime() - new Date(c.contract_start).getTime()) / 86400000;
      return days > 75;
    }) || [];

    // Nationality diversity
    const nationalities = new Set(crew?.map((c: any) => c.nationality).filter(Boolean));

    // Rank distribution
    const rankDistribution: Record<string, number> = {};
    crew?.forEach((c: any) => {
      const rank = c.rank || c.position || "Other";
      rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
    });

    // Fetch certifications
    const { data: certs } = await supabase
      .from("crew_certifications")
      .select("id, expiry_date, certification_name, crew_member_id");

    const expiredCerts = certs?.filter((c: any) => c.expiry_date && new Date(c.expiry_date) < now).length || 0;
    const expiringCerts = certs?.filter((c: any) => {
      if (!c.expiry_date) return false;
      const d = new Date(c.expiry_date);
      return d > now && (d.getTime() - now.getTime()) / 86400000 <= 90;
    }).length || 0;

    const analytics = {
      summary: {
        total_crew: totalCrew,
        active_crew: activeCrew,
        on_leave: onLeaveCrew,
        utilization_rate: totalCrew > 0 ? ((activeCrew / totalCrew) * 100).toFixed(1) : "0",
      },
      risks: {
        turnover_risk_percent: turnoverRisk,
        expiring_contracts: expiringContracts.length,
        fatigue_risk_count: fatigueRisk.length,
        expired_certifications: expiredCerts,
        expiring_certifications_90d: expiringCerts,
      },
      diversity: {
        nationalities_count: nationalities.size,
        nationalities: Array.from(nationalities),
      },
      rank_distribution: Object.entries(rankDistribution)
        .map(([rank, count]) => ({ rank, count }))
        .sort((a, b) => b.count - a.count),
      high_risk_crew: expiringContracts.map((c: any) => ({
        id: c.id,
        name: c.full_name,
        contract_end: c.contract_end,
        days_remaining: Math.ceil((new Date(c.contract_end).getTime() - now.getTime()) / 86400000),
      })),
      timestamp: now.toISOString(),
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("crew-analytics error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
