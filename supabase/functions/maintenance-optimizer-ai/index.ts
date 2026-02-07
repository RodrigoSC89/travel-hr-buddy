/**
 * Maintenance Optimizer AI - M048/M049
 * Spare parts intelligence + Cost optimization via Lovable AI Gateway
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
    const { analysisType, vesselId, equipmentId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch maintenance history
    const { data: maintenanceTasks } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch inventory data
    const { data: inventoryItems } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name")
      .limit(100);

    // Fetch predictions
    const { data: predictions } = await supabase
      .from("ai_maintenance_predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    // Fetch vessel info
    let vesselInfo = null;
    if (vesselId) {
      const { data } = await supabase
        .from("vessels")
        .select("name, type, imo_number")
        .eq("id", vesselId)
        .single();
      vesselInfo = data;
    }

    const systemPrompt = `Você é um engenheiro de manutenção naval AI especializado em otimização de custos e gestão de peças sobressalentes para a indústria marítima.

Analise os dados fornecidos e retorne resultados estruturados baseados no tipo de análise solicitado.

Tipos de análise:
- "spare_parts": Otimização de estoque de peças, previsão de demanda, pontos de reabastecimento
- "cost_optimization": Análise preventiva vs corretiva, orçamento, ROI de manutenção
- "condition_monitoring": Análise baseada em condição de sensores, tendências de degradação
- "drydock_planning": Planejamento de doca seca, escopo de trabalho, estimativa de custos

Seja técnico, preciso e forneça recomendações acionáveis.`;

    const userPrompt = `Tipo de análise: ${analysisType || "spare_parts"}
${vesselInfo ? `Embarcação: ${vesselInfo.name} (${vesselInfo.type}, IMO: ${vesselInfo.imo_number})` : "Análise geral da frota"}
${equipmentId ? `Equipamento ID: ${equipmentId}` : ""}

Tarefas de manutenção (${maintenanceTasks?.length || 0}): ${JSON.stringify(maintenanceTasks?.slice(0, 15) || [])}
Inventário (${inventoryItems?.length || 0} itens): ${JSON.stringify(inventoryItems?.slice(0, 20) || [])}
Predições AI (${predictions?.length || 0}): ${JSON.stringify(predictions?.slice(0, 10) || [])}

Retorne análise completa em JSON via tool call.`;

    const toolSchema = {
      type: "function" as const,
      function: {
        name: "maintenance_optimization",
        description: "Return structured maintenance optimization analysis",
        parameters: {
          type: "object",
          properties: {
            spare_parts_analysis: {
              type: "object",
              properties: {
                critical_parts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      part_name: { type: "string" },
                      current_stock: { type: "number" },
                      recommended_stock: { type: "number" },
                      lead_time_days: { type: "number" },
                      criticality: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      estimated_cost_usd: { type: "number" },
                      recommendation: { type: "string" },
                    },
                    required: ["part_name", "criticality", "recommendation"],
                  },
                },
                total_inventory_value_usd: { type: "number" },
                optimization_savings_usd: { type: "number" },
              },
            },
            cost_analysis: {
              type: "object",
              properties: {
                preventive_budget_usd: { type: "number" },
                corrective_budget_usd: { type: "number" },
                potential_savings_usd: { type: "number" },
                roi_percentage: { type: "number" },
                cost_breakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      amount_usd: { type: "number" },
                      percentage: { type: "number" },
                      trend: { type: "string", enum: ["up", "down", "stable"] },
                    },
                    required: ["category", "amount_usd"],
                  },
                },
              },
            },
            condition_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  equipment: { type: "string" },
                  parameter: { type: "string" },
                  current_value: { type: "number" },
                  threshold: { type: "number" },
                  severity: { type: "string", enum: ["critical", "warning", "info"] },
                  action: { type: "string" },
                  estimated_days: { type: "number" },
                },
                required: ["equipment", "severity", "action"],
              },
            },
            drydock_plan: {
              type: "object",
              properties: {
                recommended_date: { type: "string" },
                estimated_duration_days: { type: "number" },
                estimated_cost_usd: { type: "number" },
                scope_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      work_item: { type: "string" },
                      priority: { type: "string" },
                      estimated_hours: { type: "number" },
                      cost_usd: { type: "number" },
                    },
                    required: ["work_item", "priority"],
                  },
                },
                yard_recommendations: { type: "array", items: { type: "string" } },
              },
            },
            summary: { type: "string" },
            overall_health: { type: "string", enum: ["excellent", "good", "fair", "poor", "critical"] },
          },
          required: ["summary", "overall_health"],
        },
      },
    };

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
        tools: [toolSchema],
        tool_choice: { type: "function", function: { name: "maintenance_optimization" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;

    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = {
        summary: "Análise indisponível com dados atuais",
        overall_health: "fair",
        spare_parts_analysis: { critical_parts: [], total_inventory_value_usd: 0, optimization_savings_usd: 0 },
        cost_analysis: { preventive_budget_usd: 0, corrective_budget_usd: 0, potential_savings_usd: 0, roi_percentage: 0, cost_breakdown: [] },
        condition_alerts: [],
        drydock_plan: { recommended_date: "", estimated_duration_days: 0, estimated_cost_usd: 0, scope_items: [], yard_recommendations: [] },
      };
    }

    console.log(`maintenance-optimizer-ai: ${analysisType} analysis completed, health=${result.overall_health}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("maintenance-optimizer-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
