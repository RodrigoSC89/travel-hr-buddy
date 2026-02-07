/**
 * Predictive Maintenance AI - Lovable AI Gateway
 * Analyzes equipment data and predicts maintenance needs
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipmentId, vesselId, analysisType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch equipment maintenance history
    let historyQuery = supabase
      .from("ai_maintenance_predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (equipmentId) historyQuery = historyQuery.eq("equipment_id", equipmentId);
    if (vesselId) historyQuery = historyQuery.eq("vessel_id", vesselId);

    const { data: history } = await historyQuery;

    // Fetch vessel info if available
    let vesselInfo = null;
    if (vesselId) {
      const { data } = await supabase
        .from("vessels")
        .select("name, type, imo_number, flag_state")
        .eq("id", vesselId)
        .single();
      vesselInfo = data;
    }

    const systemPrompt = `Você é um engenheiro naval AI especialista em manutenção preditiva marítima.
Analise os dados fornecidos e forneça:
1. Probabilidade de falha (0-100%)
2. Dias estimados até falha
3. Ação recomendada (imediata/programada/monitorar)
4. Fatores de risco identificados
5. Impacto operacional estimado
6. Custo estimado de manutenção preventiva vs corretiva

Use dados reais fornecidos. Seja preciso e técnico. Responda em JSON válido.`;

    const userPrompt = `Análise de manutenção preditiva:
${vesselInfo ? `Embarcação: ${vesselInfo.name} (${vesselInfo.type}, IMO: ${vesselInfo.imo_number})` : ""}
${equipmentId ? `Equipamento ID: ${equipmentId}` : "Análise geral da frota"}
Tipo de análise: ${analysisType || "comprehensive"}
Histórico recente (${history?.length || 0} registros): ${JSON.stringify(history?.slice(0, 10) || [])}

Retorne um JSON com: { predictions: [{ equipment_name, failure_probability, estimated_days_to_failure, recommended_action, risk_factors: [], impact: string, preventive_cost_usd, corrective_cost_usd }], summary: string, overall_risk: "low"|"medium"|"high"|"critical" }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "maintenance_prediction",
            description: "Return structured maintenance predictions",
            parameters: {
              type: "object",
              properties: {
                predictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      equipment_name: { type: "string" },
                      failure_probability: { type: "number" },
                      estimated_days_to_failure: { type: "number" },
                      recommended_action: { type: "string", enum: ["immediate", "scheduled", "monitor"] },
                      risk_factors: { type: "array", items: { type: "string" } },
                      impact: { type: "string" },
                      preventive_cost_usd: { type: "number" },
                      corrective_cost_usd: { type: "number" }
                    },
                    required: ["equipment_name", "failure_probability", "recommended_action"]
                  }
                },
                summary: { type: "string" },
                overall_risk: { type: "string", enum: ["low", "medium", "high", "critical"] }
              },
              required: ["predictions", "summary", "overall_risk"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "maintenance_prediction" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = {
        predictions: [],
        summary: "Unable to generate predictions with available data",
        overall_risk: "low"
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predictive-maintenance-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
