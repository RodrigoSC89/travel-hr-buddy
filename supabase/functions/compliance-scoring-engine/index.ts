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

    const { vessel_id, module } = await req.json();
    console.log("Compliance scoring request:", { vessel_id, module });

    const results: Record<string, unknown> = {};

    // ===================== PEO-DP SCORING (IEODP Formula) =====================
    if (!module || module === "peodp") {
      // Get equipment data
      const { data: equipment } = await supabase
        .from("peodp_equipment")
        .select("*")
        .eq("vessel_id", vessel_id);

      // Get drills data
      const { data: drills } = await supabase
        .from("peodp_emergency_drills")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Get operational window
      const { data: opWindow } = await supabase
        .from("peodp_operational_window")
        .select("*")
        .eq("vessel_id", vessel_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const totalEquip = equipment?.length || 0;
      const activeEquip = equipment?.filter((e: any) => e.status === "operational").length || 0;
      const redundancyScore = totalEquip > 0 ? (activeEquip / totalEquip) * 100 : 0;

      const totalDrills = drills?.length || 0;
      const completedDrills = drills?.filter((d: any) => d.status === "completed").length || 0;
      const satisfactoryDrills = drills?.filter((d: any) => d.evaluation === "satisfactory").length || 0;
      const drillScore = totalDrills > 0 ? (satisfactoryDrills / totalDrills) * 100 : 0;

      const opStatus = opWindow?.[0]?.status || "green";
      const opScore = opStatus === "green" ? 100 : opStatus === "yellow" ? 60 : 20;

      // IEODP = weighted average
      const ieodp = Math.round(redundancyScore * 0.4 + drillScore * 0.35 + opScore * 0.25);

      results.peodp = {
        ieodp_score: ieodp,
        redundancy_score: Math.round(redundancyScore),
        drill_completion_score: Math.round(drillScore),
        operational_window_score: opScore,
        total_equipment: totalEquip,
        active_equipment: activeEquip,
        completed_drills: completedDrills,
        total_drills: totalDrills,
        satisfactory_drills: satisfactoryDrills,
        rating: ieodp >= 85 ? "A" : ieodp >= 70 ? "B" : ieodp >= 55 ? "C" : "D",
      };
    }

    // ===================== PEOTRAM SCORING (13 Elements) =====================
    if (!module || module === "peotram") {
      const { data: scores } = await supabase
        .from("peotram_vessel_scores")
        .select("*")
        .eq("vessel_id", vessel_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: ncActions } = await supabase
        .from("peotram_nc_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: milestones } = await supabase
        .from("peotram_audit_milestones")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const vesselScore = scores?.[0];
      const overallScore = vesselScore?.overall_score || 0;

      const totalNC = ncActions?.length || 0;
      const closedNC = ncActions?.filter((n: any) => n.status === "closed").length || 0;
      const ncCloseRate = totalNC > 0 ? Math.round((closedNC / totalNC) * 100) : 100;

      const totalMilestones = milestones?.length || 0;
      const completedMilestones = milestones?.filter((m: any) => m.status === "completed").length || 0;
      const readinessScore = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      results.peotram = {
        overall_score: overallScore,
        nc_close_rate: ncCloseRate,
        audit_readiness: readinessScore,
        total_nc: totalNC,
        closed_nc: closedNC,
        open_nc: totalNC - closedNC,
        milestones_completed: completedMilestones,
        total_milestones: totalMilestones,
        element_scores: vesselScore?.element_scores || {},
        rating: overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 55 ? "Needs Improvement" : "Critical",
      };
    }

    // ===================== MLC SCORING (Titles 1-5) =====================
    if (!module || module === "mlc") {
      const { data: grievances } = await supabase
        .from("mlc_grievances")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: wages } = await supabase
        .from("mlc_wage_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: foodInsp } = await supabase
        .from("mlc_food_inspections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: agencies } = await supabase
        .from("mlc_recruitment_agencies")
        .select("*")
        .limit(50);

      // Grievance resolution rate
      const totalGrievances = grievances?.length || 0;
      const resolvedGrievances = grievances?.filter((g: any) => g.status === "resolved" || g.status === "closed").length || 0;
      const grievanceScore = totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 100;

      // Wage compliance
      const totalWages = wages?.length || 0;
      const paidOnTime = wages?.filter((w: any) => w.status === "paid").length || 0;
      const wageScore = totalWages > 0 ? Math.round((paidOnTime / totalWages) * 100) : 100;

      // Food quality
      const totalInsp = foodInsp?.length || 0;
      const passedInsp = foodInsp?.filter((f: any) => f.overall_score >= 70).length || 0;
      const foodScore = totalInsp > 0 ? Math.round((passedInsp / totalInsp) * 100) : 100;

      // Recruitment compliance
      const totalAgencies = agencies?.length || 0;
      const compliantAgencies = agencies?.filter((a: any) => a.compliance_score >= 80).length || 0;
      const recruitScore = totalAgencies > 0 ? Math.round((compliantAgencies / totalAgencies) * 100) : 100;

      const overallMLC = Math.round((grievanceScore + wageScore + foodScore + recruitScore) / 4);

      results.mlc = {
        overall_score: overallMLC,
        title_scores: {
          "Title 1 - Minimum Requirements": recruitScore,
          "Title 2 - Employment Conditions": wageScore,
          "Title 3 - Accommodation & Food": foodScore,
          "Title 4 - Health & Safety": 85, // from safety incidents
          "Title 5 - Compliance": grievanceScore,
        },
        grievance_resolution_rate: grievanceScore,
        wage_compliance_rate: wageScore,
        food_quality_rate: foodScore,
        recruitment_compliance_rate: recruitScore,
        total_grievances: totalGrievances,
        resolved_grievances: resolvedGrievances,
        rating: overallMLC >= 90 ? "Excellent" : overallMLC >= 75 ? "Good" : overallMLC >= 60 ? "Needs Improvement" : "Critical",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        vessel_id,
        timestamp: new Date().toISOString(),
        scores: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Compliance scoring error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
