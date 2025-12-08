import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GapAnalysisRequest {
  organization_id: string;
  vessel_id?: string;
  crew_member_id?: string;
  function_area?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: GapAnalysisRequest = await req.json();

    // Fetch STCW competencies
    const { data: competencies, error: compError } = await supabase
      .from("stcw_competencies")
      .select("*")
      .order("code");

    if (compError) throw compError;

    // Fetch crew members
    let crewQuery = supabase
      .from("crew_members")
      .select("id, full_name, rank, status")
      .eq("organization_id", requestData.organization_id)
      .eq("status", "active");

    if (requestData.crew_member_id) {
      crewQuery = crewQuery.eq("id", requestData.crew_member_id);
    }

    const { data: crewMembers, error: crewError } = await crewQuery;
    if (crewError) throw crewError;

    // Fetch existing assessments
    const { data: assessments, error: assessError } = await supabase
      .from("crew_competency_assessments")
      .select("*")
      .eq("organization_id", requestData.organization_id);

    if (assessError) throw assessError;

    // Analyze gaps
    const gapAnalysis: any[] = [];
    const crewGaps: Record<string, any> = {};
    const competencyGaps: Record<string, number> = {};

    for (const crew of crewMembers || []) {
      const crewAssessments = assessments?.filter((a: any) => a.crew_member_id === crew.id) || [];
      const gaps: any[] = [];

      for (const comp of competencies || []) {
        // Check if competency applies to this rank
        const applicableRanks = comp.applicable_ranks || [];
        if (applicableRanks.includes("all") || applicableRanks.some((r: string) => 
          crew.rank?.toLowerCase().includes(r.toLowerCase())
        )) {
          const assessment = crewAssessments.find((a: any) => a.competency_id === comp.id);
          
          if (!assessment || assessment.status !== "competent") {
            gaps.push({
              competency_id: comp.id,
              competency_code: comp.code,
              competency_name: comp.name,
              function_area: comp.function_area,
              level: comp.level,
              current_status: assessment?.status || "not_assessed",
              priority: comp.level === "management" ? "high" : 
                       comp.level === "operational" ? "medium" : "low",
            });

            // Track competency-level gaps
            competencyGaps[comp.id] = (competencyGaps[comp.id] || 0) + 1;
          }
        }
      }

      if (gaps.length > 0) {
        crewGaps[crew.id] = {
          crew_member_id: crew.id,
          full_name: crew.full_name,
          rank: crew.rank,
          total_gaps: gaps.length,
          high_priority: gaps.filter(g => g.priority === "high").length,
          medium_priority: gaps.filter(g => g.priority === "medium").length,
          low_priority: gaps.filter(g => g.priority === "low").length,
          gaps,
        };
      }
    }

    // Generate training recommendations
    const trainingRecommendations: any[] = [];
    const sortedCompetencyGaps = Object.entries(competencyGaps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [compId, gapCount] of sortedCompetencyGaps) {
      const comp = competencies?.find(c => c.id === compId);
      if (comp) {
        trainingRecommendations.push({
          competency_code: comp.code,
          competency_name: comp.name,
          affected_crew_count: gapCount as number,
          recommended_action: gapCount >= 3 
            ? "Schedule group training session"
            : "Individual training or assessment",
          estimated_duration: comp.level === "management" ? "40 hours" :
                            comp.level === "operational" ? "24 hours" : "16 hours",
          stcw_reference: comp.stcw_table,
        });
      }
    }

    // Calculate overall statistics
    const totalAssessments = (crewMembers?.length || 0) * (competencies?.length || 0);
    const completedAssessments = assessments?.filter((a: any) => a.status === "competent").length || 0;
    const complianceRate = totalAssessments > 0 
      ? ((completedAssessments / totalAssessments) * 100).toFixed(1)
      : 0;

    const response = {
      analysis_date: new Date().toISOString(),
      organization_id: requestData.organization_id,
      summary: {
        total_crew_analyzed: crewMembers?.length || 0,
        total_competencies: competencies?.length || 0,
        compliance_rate: Number(complianceRate),
        total_gaps_found: Object.values(crewGaps).reduce((sum, c) => sum + c.total_gaps, 0),
        high_priority_gaps: Object.values(crewGaps).reduce((sum, c) => sum + c.high_priority, 0),
      },
      crew_analysis: Object.values(crewGaps),
      training_recommendations: trainingRecommendations,
      by_function_area: {
        navigation: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "navigation").length,
        marine_engineering: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "marine_engineering").length,
        safety: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "safety").length,
        cargo_handling: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "cargo_handling").length,
        electrical: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "electrical").length,
        radio_communications: Object.values(crewGaps).flatMap(c => c.gaps).filter(g => g.function_area === "radio_communications").length,
      },
      action_items: [
        {
          priority: "critical",
          action: "Address all management-level competency gaps",
          deadline: "30 days",
          affected: Object.values(crewGaps).reduce((sum, c) => sum + c.high_priority, 0),
        },
        {
          priority: "high",
          action: "Schedule operational-level training",
          deadline: "60 days",
          affected: Object.values(crewGaps).reduce((sum, c) => sum + c.medium_priority, 0),
        },
        {
          priority: "medium",
          action: "Complete support-level assessments",
          deadline: "90 days",
          affected: Object.values(crewGaps).reduce((sum, c) => sum + c.low_priority, 0),
        },
      ],
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const err = error as Error;
    console.error("Competency gap analysis error:", err);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
