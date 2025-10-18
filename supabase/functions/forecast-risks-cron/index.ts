import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VesselData {
  id: string;
  name: string;
  vessel_type: string;
  status: string;
}

interface OperationalLog {
  system: string;
  incidents: number;
  last_incident_date: string;
  avg_severity: number;
}

interface RiskPrediction {
  system: string;
  predicted_risk: string;
  risk_score: number;
  suggested_action: string;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting daily risk forecast for all active vessels");

    // Get all active vessels
    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("status", "active");

    if (vesselError) {
      throw new Error(`Error fetching vessels: ${vesselError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active vessels found",
          processed_vessels: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = [];

    for (const vessel of vessels) {
      console.log(`Processing vessel: ${vessel.name}`);

      // Collect operational data
      const operationalData = await collectOperationalData(supabase, vessel.id);

      // Generate AI predictions
      const predictions = await generateRiskPredictions(
        OPENAI_API_KEY,
        vessel,
        operationalData
      );

      // Mark old predictions as outdated
      await supabase
        .from("tactical_risks")
        .update({ status: "resolved" })
        .eq("vessel_id", vessel.id)
        .eq("status", "active");

      // Store new predictions
      for (const prediction of predictions) {
        const { error: insertError } = await supabase
          .from("tactical_risks")
          .insert({
            vessel_id: vessel.id,
            system: prediction.system,
            predicted_risk: prediction.predicted_risk,
            risk_score: prediction.risk_score,
            suggested_action: prediction.suggested_action,
            analysis_details: {
              reasoning: prediction.reasoning,
              based_on_data: operationalData,
            },
            valid_until: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "active",
          });

        if (insertError) {
          console.error("Error inserting tactical risk:", insertError);
        }
      }

      results.push({
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        risks_generated: predictions.length,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_vessels: results.length,
        results: results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
  vesselId: string
): Promise<any> {
  const [dpIncidents, safetyIncidents, sgsoData] = await Promise.all([
    supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("safety_incidents")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("sgso_practices")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  const systemData: { [key: string]: OperationalLog } = {
    DP: {
      system: "DP",
      incidents: dpIncidents.data?.length || 0,
      last_incident_date: dpIncidents.data?.[0]?.created_at || "N/A",
      avg_severity:
        dpIncidents.data?.reduce(
          (acc: number, inc: any) =>
            acc +
            (inc.severity === "critical"
              ? 5
              : inc.severity === "high"
                ? 4
                : 3),
          0
        ) /
          (dpIncidents.data?.length || 1) || 0,
    },
    Energia: {
      system: "Energia",
      incidents: 0,
      last_incident_date: "N/A",
      avg_severity: 0,
    },
    SGSO: {
      system: "SGSO",
      incidents:
        sgsoData.data?.filter((p: any) => p.status === "non_compliant")
          .length || 0,
      last_incident_date: sgsoData.data?.[0]?.updated_at || "N/A",
      avg_severity:
        sgsoData.data?.reduce(
          (acc: number, p: any) => acc + (100 - (p.compliance_level || 0)) / 20,
          0
        ) /
          (sgsoData.data?.length || 1) || 0,
    },
    Comunicações: {
      system: "Comunicações",
      incidents: 0,
      last_incident_date: "N/A",
      avg_severity: 0,
    },
  };

  return systemData;
}

async function generateRiskPredictions(
  apiKey: string,
  vessel: VesselData,
  operationalData: any
): Promise<RiskPrediction[]> {
  const prompt = `
Você é um sistema de previsão de riscos técnicos para embarcações offshore.

Analise os dados operacionais da embarcação "${vessel.name}" e informe:

1. Quais sistemas apresentam risco elevado de falha nos próximos 15 dias
2. Tipo de risco: Falha (total), Intermitência, Atraso, Degradação, ou Normal
3. Score de risco (0-100, onde 100 é crítico)
4. Ação recomendada para evitar ou mitigar a falha

Dados operacionais:
${JSON.stringify(operationalData, null, 2)}

Responda APENAS com um array JSON válido no seguinte formato:
[
  {
    "system": "DP",
    "predicted_risk": "Intermitência",
    "risk_score": 65,
    "suggested_action": "Realizar manutenção preventiva no sistema de posicionamento",
    "reasoning": "Histórico recente mostra 3 incidentes nos últimos 60 dias"
  }
]

Considere TODOS os sistemas: DP, Energia, SGSO, Comunicações, mesmo que o risco seja baixo.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em análise de riscos operacionais para embarcações offshore. Responda sempre com JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;

    const predictions: RiskPrediction[] = JSON.parse(jsonContent);

    return predictions.filter(
      (p) =>
        p.system &&
        p.predicted_risk &&
        p.risk_score >= 0 &&
        p.risk_score <= 100 &&
        p.suggested_action
    );
  } catch (error) {
    console.error("Error generating AI predictions:", error);

    // Fallback predictions
    return Object.values(operationalData).map((data: any) => ({
      system: data.system,
      predicted_risk: data.incidents > 3 ? "Intermitência" : "Normal",
      risk_score: Math.min(data.incidents * 15 + data.avg_severity * 10, 100),
      suggested_action:
        data.incidents > 3
          ? `Verificar e realizar manutenção preventiva no sistema ${data.system}`
          : `Continuar monitoramento regular do sistema ${data.system}`,
      reasoning: `Baseado em ${data.incidents} incidentes recentes`,
    }));
  }
}
