import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RiskPrediction {
  vessel_id: string;
  system: string;
  predicted_risk: string;
  risk_score: number;
  suggested_action: string;
  ai_confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[CRON] Starting daily risk forecast generation");

    // Get all active vessels
    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name, vessel_type")
      .eq("status", "active");

    if (vesselError) {
      throw new Error(`Failed to fetch vessels: ${vesselError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      console.log("[CRON] No active vessels found");
      return new Response(
        JSON.stringify({ success: true, message: "No active vessels to process" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`[CRON] Processing ${vessels.length} vessels`);

    const results = [];

    for (const vessel of vessels) {
      try {
        // Mark old predictions as resolved
        const { error: updateError } = await supabase
          .from("tactical_risks")
          .update({ status: "resolved", resolved_at: new Date().toISOString() })
          .eq("vessel_id", vessel.id)
          .eq("status", "pending")
          .lt("valid_until", new Date().toISOString());

        if (updateError) {
          console.error(`[CRON] Error updating old risks for ${vessel.name}:`, updateError);
        }

        // Collect operational data
        const operationalData = await collectOperationalData(supabase, vessel.id);

        // Generate new predictions
        const predictions = await generateRiskPredictions(
          vessel,
          operationalData,
          openaiApiKey
        );

        // Insert new predictions
        for (const prediction of predictions) {
          const { error: insertError } = await supabase
            .from("tactical_risks")
            .insert({
              vessel_id: vessel.id,
              system: prediction.system,
              predicted_risk: prediction.predicted_risk,
              risk_score: prediction.risk_score,
              suggested_action: prediction.suggested_action,
              ai_confidence: prediction.ai_confidence,
              status: "pending",
            });

          if (insertError) {
            console.error(`[CRON] Error inserting risk for ${vessel.name}:`, insertError);
          }
        }

        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          predictions_count: predictions.length,
          success: true,
        });

        console.log(`[CRON] Processed ${vessel.name}: ${predictions.length} predictions`);
      } catch (error) {
        console.error(`[CRON] Error processing vessel ${vessel.name}:`, error);
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`[CRON] Completed. Processed ${results.length} vessels`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily risk forecast completed",
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CRON] Fatal error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate daily risk forecasts",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function collectOperationalData(supabase: any, vessel_id: string) {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: dpIncidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: sgsoPractices } = await supabase
    .from("sgso_practices")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    dp_incidents: dpIncidents || [],
    sgso_practices: sgsoPractices || [],
  };
}

async function generateRiskPredictions(
  vessel: any,
  operationalData: any,
  openaiApiKey?: string
): Promise<RiskPrediction[]> {
  // Use fallback for now - AI integration can be added later
  return generateFallbackRiskPredictions(vessel, operationalData);
}

function generateFallbackRiskPredictions(
  vessel: any,
  operationalData: any
): RiskPrediction[] {
  const predictions: RiskPrediction[] = [];

  const dpIncidentCount = operationalData.dp_incidents.length;
  const sgsoCount = operationalData.sgso_practices.length;

  // DP System risk
  if (dpIncidentCount > 5) {
    predictions.push({
      vessel_id: vessel.id,
      system: "DP",
      predicted_risk: "Intermittency",
      risk_score: Math.min(40 + dpIncidentCount * 5, 85),
      suggested_action: "Revisar logs do sistema DP e agendar manutenção preventiva",
      ai_confidence: 0.6,
    });
  }

  // SGSO risk
  if (sgsoCount < 10) {
    predictions.push({
      vessel_id: vessel.id,
      system: "SGSO",
      predicted_risk: "Delay",
      risk_score: Math.max(30, 70 - sgsoCount * 3),
      suggested_action: "Intensificar práticas SGSO e treinamento da tripulação",
      ai_confidence: 0.65,
    });
  }

  // Energy system based on overall health
  if (dpIncidentCount > 3) {
    predictions.push({
      vessel_id: vessel.id,
      system: "Energia",
      predicted_risk: "Degradation",
      risk_score: Math.min(35 + dpIncidentCount * 8, 75),
      suggested_action: "Verificar sistemas de energia e realizar inspeção preventiva",
      ai_confidence: 0.55,
    });
  }

  return predictions;
}
