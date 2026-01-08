import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WellnessCheckIn {
  crew_member_id: string;
  mood_score: number;       // 1-5
  fatigue_score: number;    // 1-10
  stress_score: number;     // 1-10
  sleep_hours: number;
  sleep_quality: number;    // 1-5
  physical_symptoms?: string[];
  notes?: string;
}

interface BurnoutAnalysis {
  burnout_risk: number;       // 0-100
  intervention_needed: boolean;
  recommendation: string;
  risk_factors: string[];
  suggested_actions: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...data } = await req.json();

    // Get user and organization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: "User has no organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "check_in":
        return await handleCheckIn(supabase, profile.organization_id, data as WellnessCheckIn);
      
      case "analyze_burnout":
        return await analyzeBurnout(supabase, profile.organization_id, data.crew_member_id);
      
      case "get_crew_wellness":
        return await getCrewWellness(supabase, profile.organization_id);
      
      case "get_at_risk_crew":
        return await getAtRiskCrew(supabase, profile.organization_id);
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("Wellness AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCheckIn(
  supabase: any,
  organizationId: string,
  checkIn: WellnessCheckIn
): Promise<Response> {
  // Calculate initial burnout risk based on metrics
  const burnoutRisk = calculateBurnoutRisk(checkIn);
  const interventionNeeded = burnoutRisk > 70;

  // Get AI recommendation if risk is moderate or high
  let aiRecommendation = "";
  if (burnoutRisk > 50) {
    aiRecommendation = await getAIRecommendation(checkIn, burnoutRisk);
  }

  // Store check-in
  const { data: wellness, error } = await supabase
    .from("crew_wellness_extended")
    .insert({
      organization_id: organizationId,
      crew_member_id: checkIn.crew_member_id,
      check_in_date: new Date().toISOString().split("T")[0],
      mood_score: checkIn.mood_score,
      fatigue_score: checkIn.fatigue_score,
      stress_score: checkIn.stress_score,
      sleep_hours: checkIn.sleep_hours,
      sleep_quality: checkIn.sleep_quality,
      physical_symptoms: checkIn.physical_symptoms || [],
      ai_burnout_risk: burnoutRisk,
      ai_intervention_needed: interventionNeeded,
      ai_recommendation: aiRecommendation,
      hr_notified: interventionNeeded,
      hr_notified_at: interventionNeeded ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to store check-in: ${error.message}`);
  }

  // If intervention needed, also store in crew_health_checkins for visibility
  if (interventionNeeded) {
    await supabase.from("crew_health_checkins").insert({
      crew_member_id: checkIn.crew_member_id,
      mood: checkIn.mood_score <= 2 ? "poor" : checkIn.mood_score <= 3 ? "fair" : "good",
      sleep_quality: checkIn.sleep_quality <= 2 ? "poor" : checkIn.sleep_quality <= 3 ? "fair" : "good",
      stress_level: checkIn.stress_score >= 7 ? "high" : checkIn.stress_score >= 4 ? "moderate" : "low",
      notes: `[AUTO] Burnout risk: ${burnoutRisk}%. ${aiRecommendation}`
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      wellness_id: wellness.id,
      burnout_risk: burnoutRisk,
      intervention_needed: interventionNeeded,
      recommendation: aiRecommendation || "Keep up the good work! Your wellness metrics look healthy."
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function calculateBurnoutRisk(checkIn: WellnessCheckIn): number {
  // Weighted scoring based on STCW fatigue research
  let risk = 0;

  // Mood (1-5): Low mood = high risk
  risk += (5 - checkIn.mood_score) * 8;  // 0-32 points

  // Fatigue (1-10): High fatigue = high risk
  risk += checkIn.fatigue_score * 6;      // 0-60 points

  // Stress (1-10): High stress = high risk
  risk += checkIn.stress_score * 5;       // 0-50 points

  // Sleep hours: <6 or >9 = risk
  if (checkIn.sleep_hours < 5) risk += 20;
  else if (checkIn.sleep_hours < 6) risk += 10;
  else if (checkIn.sleep_hours < 7) risk += 5;

  // Sleep quality (1-5): Poor quality = risk
  risk += (5 - checkIn.sleep_quality) * 6;  // 0-24 points

  // Physical symptoms add risk
  if (checkIn.physical_symptoms && checkIn.physical_symptoms.length > 0) {
    risk += checkIn.physical_symptoms.length * 5;
  }

  // Normalize to 0-100
  return Math.min(100, Math.max(0, risk / 1.5));
}

async function getAIRecommendation(checkIn: WellnessCheckIn, burnoutRisk: number): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return "Consider speaking with your supervisor about workload adjustment.";
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a maritime crew wellness advisor following STCW and MLC 2006 regulations.
Provide a brief, actionable recommendation (2-3 sentences) for a crew member showing signs of fatigue/burnout.
Focus on practical maritime-specific advice considering ship operations.`
          },
          {
            role: "user",
            content: `Crew member wellness check-in:
- Mood: ${checkIn.mood_score}/5
- Fatigue: ${checkIn.fatigue_score}/10
- Stress: ${checkIn.stress_score}/10
- Sleep: ${checkIn.sleep_hours} hours, quality ${checkIn.sleep_quality}/5
- Physical symptoms: ${checkIn.physical_symptoms?.join(", ") || "none reported"}
- Calculated burnout risk: ${burnoutRisk}%

Provide a supportive recommendation.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      return "We recommend discussing workload with your supervisor and ensuring adequate rest periods per MLC requirements.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Please consult with the ship's medical officer.";
  } catch {
    return "Consider speaking with your supervisor about workload adjustment.";
  }
}

async function analyzeBurnout(
  supabase: any,
  organizationId: string,
  crewMemberId: string
): Promise<Response> {
  // Get last 7 days of check-ins
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: checkIns } = await supabase
    .from("crew_wellness_extended")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("crew_member_id", crewMemberId)
    .gte("check_in_date", sevenDaysAgo.toISOString().split("T")[0])
    .order("check_in_date", { ascending: false });

  if (!checkIns || checkIns.length === 0) {
    return new Response(
      JSON.stringify({
        burnout_risk: 0,
        intervention_needed: false,
        recommendation: "No recent check-ins. Please complete daily wellness check-ins.",
        risk_factors: [],
        suggested_actions: ["Complete daily wellness check-ins"],
        trend: "unknown"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Analyze trend
  const avgBurnoutRisk = checkIns.reduce((sum: number, c: any) => sum + (c.ai_burnout_risk || 0), 0) / checkIns.length;
  const latestRisk = checkIns[0].ai_burnout_risk || 0;
  const oldestRisk = checkIns[checkIns.length - 1].ai_burnout_risk || 0;
  const trend = latestRisk > oldestRisk + 10 ? "worsening" : latestRisk < oldestRisk - 10 ? "improving" : "stable";

  // Identify risk factors
  const riskFactors: string[] = [];
  const avgMood = checkIns.reduce((sum: number, c: any) => sum + (c.mood_score || 3), 0) / checkIns.length;
  const avgFatigue = checkIns.reduce((sum: number, c: any) => sum + (c.fatigue_score || 5), 0) / checkIns.length;
  const avgStress = checkIns.reduce((sum: number, c: any) => sum + (c.stress_score || 5), 0) / checkIns.length;
  const avgSleep = checkIns.reduce((sum: number, c: any) => sum + (c.sleep_hours || 7), 0) / checkIns.length;

  if (avgMood < 2.5) riskFactors.push("Consistently low mood");
  if (avgFatigue > 7) riskFactors.push("High fatigue levels");
  if (avgStress > 7) riskFactors.push("Elevated stress");
  if (avgSleep < 6) riskFactors.push("Insufficient sleep (< 6 hours average)");

  const suggestedActions: string[] = [];
  if (avgSleep < 6) suggestedActions.push("Adjust watch schedule to ensure minimum 10 hours rest per STCW");
  if (avgStress > 7) suggestedActions.push("Schedule conversation with senior officer about workload");
  if (avgFatigue > 7) suggestedActions.push("Review work-rest hours compliance");
  if (avgMood < 2.5) suggestedActions.push("Consider welfare activities and shore leave if available");

  return new Response(
    JSON.stringify({
      burnout_risk: Math.round(avgBurnoutRisk),
      intervention_needed: avgBurnoutRisk > 70,
      recommendation: checkIns[0].ai_recommendation || "Continue monitoring wellness metrics.",
      risk_factors: riskFactors,
      suggested_actions: suggestedActions,
      trend,
      check_ins_count: checkIns.length,
      metrics: {
        avg_mood: Math.round(avgMood * 10) / 10,
        avg_fatigue: Math.round(avgFatigue * 10) / 10,
        avg_stress: Math.round(avgStress * 10) / 10,
        avg_sleep: Math.round(avgSleep * 10) / 10
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getCrewWellness(supabase: any, organizationId: string): Promise<Response> {
  const today = new Date().toISOString().split("T")[0];

  // Get latest check-in for each crew member
  const { data: wellness } = await supabase
    .from("crew_wellness_extended")
    .select(`
      *,
      crew_members (id, full_name, rank, position)
    `)
    .eq("organization_id", organizationId)
    .gte("check_in_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("check_in_date", { ascending: false });

  // Group by crew member, take latest
  const crewMap = new Map();
  wellness?.forEach((w: any) => {
    if (!crewMap.has(w.crew_member_id)) {
      crewMap.set(w.crew_member_id, w);
    }
  });

  return new Response(
    JSON.stringify({
      wellness_data: Array.from(crewMap.values()),
      total_crew: crewMap.size,
      at_risk_count: Array.from(crewMap.values()).filter((w: any) => w.ai_burnout_risk > 70).length
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getAtRiskCrew(supabase: any, organizationId: string): Promise<Response> {
  const { data: atRisk } = await supabase
    .from("crew_wellness_extended")
    .select(`
      *,
      crew_members (id, full_name, rank, position, vessel_id)
    `)
    .eq("organization_id", organizationId)
    .gt("ai_burnout_risk", 70)
    .order("ai_burnout_risk", { ascending: false })
    .limit(20);

  return new Response(
    JSON.stringify({
      at_risk_crew: atRisk || [],
      count: atRisk?.length || 0
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}