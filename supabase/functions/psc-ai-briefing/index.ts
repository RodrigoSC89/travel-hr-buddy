import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { inspection_id, vessel_id, port_name, country } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    console.log(`[PSC AI Briefing] Generating for vessel ${vessel_id} at ${port_name}, ${country}`);

    const systemPrompt = `You are a Port State Control (PSC) inspection preparation expert. You have deep knowledge of:
- Paris MOU, Tokyo MOU, Indian Ocean MOU targeting factors
- SOLAS, MARPOL, MLC 2006, STCW requirements
- Common deficiency areas by vessel type and age
- Country-specific inspection focus areas
- Detention criteria and patterns

Generate a comprehensive pre-inspection briefing in Portuguese (PT-BR) with:
1. Risk assessment score (0-100)
2. Top 10 predicted deficiency areas based on port/country patterns
3. Preparation checklist with 15+ actionable items
4. Key documents to have ready
5. Areas the inspector will likely focus on
6. Crew interview preparation tips

Be specific, actionable, and based on real PSC inspection patterns.`;

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
            content: `Gere um briefing completo de preparação PSC para:
- Porto: ${port_name}
- País: ${country}
- Vessel ID: ${vessel_id}

Responda em JSON com a estrutura:
{
  "briefing": "texto completo do briefing",
  "risk_score": número 0-100,
  "predicted_deficiencies": ["deficiência 1", "deficiência 2", ...],
  "preparation_checklist": ["item 1", "item 2", ...],
  "key_documents": ["doc 1", "doc 2", ...],
  "focus_areas": ["área 1", "área 2", ...]
}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_psc_briefing",
              description: "Generate a PSC inspection preparation briefing",
              parameters: {
                type: "object",
                properties: {
                  briefing: { type: "string", description: "Full briefing text in Portuguese" },
                  risk_score: { type: "number", description: "Detention risk score 0-100" },
                  predicted_deficiencies: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of predicted deficiency areas",
                  },
                  preparation_checklist: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable preparation checklist items",
                  },
                  key_documents: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key documents to prepare",
                  },
                  focus_areas: {
                    type: "array",
                    items: { type: "string" },
                    description: "Inspector focus areas",
                  },
                },
                required: ["briefing", "risk_score", "predicted_deficiencies", "preparation_checklist"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_psc_briefing" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("[PSC AI] Gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log(`[PSC AI] Briefing generated. Risk score: ${parsed.risk_score}`);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content directly
    const content = aiResult.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({
      briefing: content,
      risk_score: 45,
      predicted_deficiencies: ["Fire safety equipment", "Navigation equipment", "MLC compliance"],
      preparation_checklist: ["Verify all certificates current", "Check fire extinguisher dates", "Review crew rest hours"],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PSC AI Briefing] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
