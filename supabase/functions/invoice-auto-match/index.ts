import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { invoice_data, po_data, action } = await req.json();

    // === ACTION: auto-match ===
    if (action === "auto-match") {
      const systemPrompt = `Você é um especialista em conciliação financeira marítima (Invoice Matching).
Analise a fatura e a ordem de compra fornecidas e determine:
1. Match Score (0-100%): compatibilidade entre fatura e PO
2. Variações: diferenças de quantidade, preço, impostos
3. Flags: itens suspeitos, duplicações, preços fora do mercado
4. Recomendação: aprovar, revisar ou rejeitar

Responda em JSON com a estrutura:
{
  "match_score": number,
  "status": "matched" | "partial" | "mismatched",
  "variances": [{ "field": string, "expected": string, "actual": string, "severity": "low"|"medium"|"high" }],
  "flags": [{ "type": string, "description": string, "severity": "warning"|"critical" }],
  "recommendation": string,
  "savings_opportunity_usd": number
}`;

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
            { role: "user", content: `FATURA:\n${JSON.stringify(invoice_data, null, 2)}\n\nORDEM DE COMPRA:\n${JSON.stringify(po_data, null, 2)}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "invoice_match_result",
              description: "Return the invoice matching analysis result",
              parameters: {
                type: "object",
                properties: {
                  match_score: { type: "number" },
                  status: { type: "string", enum: ["matched", "partial", "mismatched"] },
                  variances: { type: "array", items: { type: "object", properties: { field: { type: "string" }, expected: { type: "string" }, actual: { type: "string" }, severity: { type: "string" } }, required: ["field", "expected", "actual", "severity"] } },
                  flags: { type: "array", items: { type: "object", properties: { type: { type: "string" }, description: { type: "string" }, severity: { type: "string" } }, required: ["type", "description", "severity"] } },
                  recommendation: { type: "string" },
                  savings_opportunity_usd: { type: "number" },
                },
                required: ["match_score", "status", "variances", "flags", "recommendation"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "invoice_match_result" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", response.status, t);
        throw new Error(`AI error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let result;
      try {
        result = JSON.parse(toolCall?.function?.arguments ?? "{}");
      } catch {
        result = { match_score: 0, status: "mismatched", variances: [], flags: [], recommendation: "Erro na análise AI" };
      }

      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("invoice-auto-match error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
