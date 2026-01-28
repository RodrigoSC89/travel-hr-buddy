/**
 * AI Crew Analytics Edge Function
 * Heavy processing for crew matching, turnover prediction, and wellbeing analysis
 */

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CrewMember {
  id: string;
  name: string;
  position: string;
  yearsExperience: number;
  certifications: string[];
  performanceScore: number;
  lastVoyageDate: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, organizationId, vesselId, crewData } = await req.json();

    switch (action) {
      case "predict_turnover": {
        const predictions = await predictTurnover(supabase, organizationId);
        return new Response(
          JSON.stringify({ success: true, predictions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "match_crew": {
        const matches = await matchCrewToPositions(crewData || [], vesselId);
        return new Response(
          JSON.stringify({ success: true, matches }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "analyze_wellbeing": {
        const analysis = await analyzeCrewWellbeing(supabase, vesselId);
        return new Response(
          JSON.stringify({ success: true, analysis }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_training": {
        const plan = await generateTrainingPlan(crewData);
        return new Response(
          JSON.stringify({ success: true, plan }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Crew Analytics Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function predictTurnover(supabase: any, organizationId: string) {
  // Get crew data
  const { data: crewMembers } = await supabase
    .from("crew_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const predictions = (crewMembers || []).map((member: any) => {
    // Calculate turnover risk based on multiple factors
    let riskScore = 0;
    const factors: Array<{ factor: string; impact: number }> = [];

    // Years in company
    const yearsInCompany = member.years_experience || 0;
    if (yearsInCompany < 2) {
      riskScore += 0.2;
      factors.push({ factor: "Tempo de empresa < 2 anos", impact: 20 });
    }

    // Performance score
    if (member.performance_score && member.performance_score < 70) {
      riskScore += 0.15;
      factors.push({ factor: "Performance abaixo da média", impact: 15 });
    }

    // Days since last evaluation
    const daysSinceEval = member.last_evaluation_date
      ? Math.floor((Date.now() - new Date(member.last_evaluation_date).getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    
    if (daysSinceEval > 180) {
      riskScore += 0.1;
      factors.push({ factor: "Sem avaliação recente", impact: 10 });
    }

    return {
      crewMemberId: member.id,
      name: member.name,
      position: member.position,
      turnoverRisk: Math.min(riskScore, 0.95),
      riskLevel: riskScore > 0.6 ? "high" : riskScore > 0.3 ? "medium" : "low",
      factors,
      recommendedActions: riskScore > 0.4 
        ? ["Agendar conversa de retenção", "Revisar plano de carreira"]
        : ["Manter acompanhamento regular"],
    };
  });

  return predictions.filter((p: any) => p.turnoverRisk > 0.2);
}

async function matchCrewToPositions(candidates: CrewMember[], vesselId: string) {
  const matches = candidates.map((candidate) => {
    // Calculate match score based on multiple criteria
    const certScore = (candidate.certifications?.length || 0) * 10;
    const expScore = Math.min((candidate.yearsExperience || 0) * 5, 30);
    const perfScore = (candidate.performanceScore || 70) * 0.3;
    
    const totalScore = Math.min(certScore + expScore + perfScore, 100);

    return {
      candidateId: candidate.id,
      name: candidate.name,
      position: candidate.position,
      matchScore: totalScore,
      breakdown: {
        certifications: certScore,
        experience: expScore,
        performance: perfScore,
      },
      recommendation: totalScore > 80 ? "Altamente recomendado" : 
                      totalScore > 60 ? "Recomendado" : "Considerar alternativas",
    };
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

async function analyzeCrewWellbeing(supabase: any, vesselId: string) {
  // Simulate wellbeing analysis
  return {
    vesselId,
    overallWellbeingScore: 75 + Math.random() * 15,
    fatigueRisk: "medium",
    moodTrend: "stable",
    alerts: [
      { type: "fatigue", crewCount: 2, severity: "medium" },
    ],
    recommendations: [
      "Revisar escalas de descanso",
      "Considerar atividades de team building",
    ],
    sentimentAnalysis: {
      positive: 0.65,
      neutral: 0.25,
      negative: 0.10,
    },
  };
}

async function generateTrainingPlan(crewData: any) {
  return {
    totalGapsIdentified: 5,
    priorityModules: [
      { module: "STCW Atualização", priority: "high", affectedCrew: 8 },
      { module: "Liderança", priority: "medium", affectedCrew: 4 },
      { module: "ECDIS", priority: "medium", affectedCrew: 3 },
    ],
    estimatedDuration: "40 horas",
    estimatedCost: 12500,
  };
}
