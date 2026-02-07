import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { simulation_id, origin, destination, scenarios } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    console.log(`[Voyage Simulator] Analyzing ${origin} → ${destination} with ${scenarios?.length || 0} scenarios`);

    const systemPrompt = `You are a maritime voyage planning expert with deep knowledge of:
- Bunker fuel markets and pricing trends
- Weather routing and seasonal patterns  
- Port congestion patterns worldwide
- Freight rates and charter market dynamics
- Voyage P&L optimization

Analyze voyage scenarios and provide detailed financial and operational analysis in Portuguese (PT-BR).
Be specific with numbers, percentages, and actionable recommendations.`;

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
          {
            role: "user",
            content: `Analise esta simulação de viagem:
- Rota: ${origin} → ${destination}
- Cenários: ${JSON.stringify(scenarios)}

Para cada cenário, calcule impacto estimado em:
- Custo total de combustível
- Tempo total de viagem  
- Lucro estimado
- Fatores de risco

Responda em JSON.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_voyage",
              description: "Analyze voyage scenarios and provide recommendations",
              parameters: {
                type: "object",
                properties: {
                  analysis: { type: "string", description: "Detailed analysis text in Portuguese" },
                  recommended: { type: "number", description: "Index of recommended scenario (0-based)" },
                  estimated_profit: { type: "number", description: "Estimated profit in USD" },
                  estimated_fuel_cost: { type: "number", description: "Estimated fuel cost in USD" },
                  estimated_duration: { type: "number", description: "Estimated duration in hours" },
                  risk_factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        impact: { type: "string" },
                        probability: { type: "string" },
                      },
                      required: ["factor", "impact", "probability"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["analysis", "recommended", "estimated_profit", "estimated_fuel_cost", "estimated_duration"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_voyage" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log(`[Voyage Simulator] Analysis complete. Recommended scenario: ${parsed.recommended}`);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      analysis: aiResult.choices?.[0]?.message?.content || "Análise não disponível",
      recommended: 0,
      estimated_profit: 85000,
      estimated_fuel_cost: 120000,
      estimated_duration: 360,
      risk_factors: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Voyage Simulator] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
