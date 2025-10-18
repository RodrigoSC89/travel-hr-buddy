// Supabase Edge Function: forecast-risks-cron
// Scheduled daily at 06:00 UTC (03:00 BRT) to generate risk forecasts for all active vessels

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OperationalData {
  dpIncidents: any[];
  safetyIncidents: any[];
  sgsoPractices: any[];
}

interface RiskPrediction {
  vessel_id: string;
  system_name: string;
  risk_type: string;
  risk_score: number;
  predicted_date: string;
  description: string;
  suggested_actions: string;
  ai_confidence: number;
  status: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting forecast-risks-cron execution");

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get all active vessels
    const { data: vessels, error: vesselsError } = await supabase
      .from("vessels")
      .select("id, name");

    if (vesselsError) {
      throw new Error(`Failed to fetch vessels: ${vesselsError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      console.log("No vessels found");
      return new Response(
        JSON.stringify({ message: "No vessels found", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${vessels.length} vessels`);

    const results = [];
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const isoDate = sixtyDaysAgo.toISOString();

    for (const vessel of vessels) {
      try {
        console.log(`Processing vessel: ${vessel.name}`);

        // Collect operational data
        const operationalData = await collectOperationalData(
          supabase,
          vessel.id,
          isoDate
        );

        // Generate risk predictions
        const risks = generateRiskPredictions(vessel, operationalData);

        if (risks.length > 0) {
          // Mark old risks as resolved
          const { error: updateError } = await supabase
            .from("tactical_risks")
            .update({ status: "resolved" })
            .eq("vessel_id", vessel.id)
            .eq("status", "active")
            .lt("valid_until", new Date().toISOString());

          if (updateError) {
            console.error(`Error updating old risks for ${vessel.name}:`, updateError);
          }

          // Insert new predictions
          const { error: insertError } = await supabase
            .from("tactical_risks")
            .insert(risks);

          if (insertError) {
            console.error(`Error inserting risks for ${vessel.name}:`, insertError);
            throw insertError;
          }

          console.log(`Generated ${risks.length} risk predictions for ${vessel.name}`);
        }

        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          risks_generated: risks.length,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing vessel ${vessel.name}:`, error);
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalRisks = results.reduce((sum, r) => sum + (r.risks_generated || 0), 0);

    console.log(`Completed: ${successCount}/${vessels.length} vessels, ${totalRisks} total risks`);

    return new Response(
      JSON.stringify({
        message: "Forecast risks cron completed",
        processed: vessels.length,
        successful: successCount,
        total_risks: totalRisks,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in forecast-risks-cron:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function collectOperationalData(
  supabase: any,
  vesselId: string,
  fromDate: string
): Promise<OperationalData> {
  // Get DP incidents
  const { data: dpIncidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("incident_date", fromDate)
    .order("incident_date", { ascending: false });

  // Get safety incidents
  const { data: safetyIncidents } = await supabase
    .from("sgso_incidents")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("incident_date", fromDate)
    .order("incident_date", { ascending: false });

  // Get SGSO practices
  const { data: sgsoPractices } = await supabase
    .from("sgso_practices")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("created_at", fromDate)
    .order("created_at", { ascending: false });

  return {
    dpIncidents: dpIncidents || [],
    safetyIncidents: safetyIncidents || [],
    sgsoPractices: sgsoPractices || [],
  };
}

function generateRiskPredictions(
  vessel: { id: string; name: string },
  data: OperationalData
): RiskPrediction[] {
  const risks: RiskPrediction[] = [];
  const today = new Date().toISOString().split("T")[0];

  // DP System Risk Analysis
  if (data.dpIncidents.length >= 3) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "DP",
      risk_type: data.dpIncidents.length >= 5 ? "Failure" : "Intermittency",
      risk_score: Math.min(40 + data.dpIncidents.length * 10, 95),
      predicted_date: today,
      description: `Histórico de ${data.dpIncidents.length} incidentes DP nos últimos 60 dias indica risco elevado`,
      suggested_actions: "Revisar sistema DP, verificar redundâncias, treinar equipe",
      ai_confidence: 70,
      status: "active",
    });
  } else if (data.dpIncidents.length > 0) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "DP",
      risk_type: "Normal",
      risk_score: 20 + data.dpIncidents.length * 5,
      predicted_date: today,
      description: `Sistema DP com ${data.dpIncidents.length} incidente(s) recente(s)`,
      suggested_actions: "Monitoramento contínuo do sistema DP",
      ai_confidence: 75,
      status: "active",
    });
  }

  // Safety Management Risk Analysis
  if (data.safetyIncidents.length >= 2) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "SGSO",
      risk_type: data.safetyIncidents.length >= 4 ? "Failure" : "Degradation",
      risk_score: Math.min(35 + data.safetyIncidents.length * 12, 90),
      predicted_date: today,
      description: `${data.safetyIncidents.length} incidentes de segurança detectados`,
      suggested_actions: "Intensificar treinamentos, revisar procedimentos SGSO",
      ai_confidence: 65,
      status: "active",
    });
  } else if (data.sgsoPractices.length < 5) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "SGSO",
      risk_type: "Degradation",
      risk_score: 45,
      predicted_date: today,
      description: "Baixo registro de práticas SGSO pode indicar vulnerabilidade",
      suggested_actions: "Aumentar registro de práticas, realizar auditoria interna",
      ai_confidence: 60,
      status: "active",
    });
  }

  // Energy System Risk (if indicators present)
  if (data.dpIncidents.length + data.safetyIncidents.length >= 5) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "Energia",
      risk_type: "Degradation",
      risk_score: 55,
      predicted_date: today,
      description: "Histórico operacional sugere possível degradação do sistema de energia",
      suggested_actions: "Inspeção preventiva dos geradores, verificar backups",
      ai_confidence: 60,
      status: "active",
    });
  }

  // Communications System (baseline)
  if (risks.length > 0) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "Comunicações",
      risk_type: "Normal",
      risk_score: 25,
      predicted_date: today,
      description: "Sistema de comunicações operando dentro dos parâmetros normais",
      suggested_actions: "Manutenção preventiva conforme cronograma",
      ai_confidence: 80,
      status: "active",
    });
  }

  // If no risks detected, add a baseline entry
  if (risks.length === 0) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "Geral",
      risk_type: "Normal",
      risk_score: 15,
      predicted_date: today,
      description: "Nenhum risco significativo detectado no período",
      suggested_actions: "Manter monitoramento contínuo",
      ai_confidence: 85,
      status: "active",
    });
  }

  return risks;
}
