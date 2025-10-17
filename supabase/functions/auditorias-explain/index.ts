// @ts-ignore - Deno deploy handles this
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { navio, item, norma } = await req.json();

    if (!navio || !item || !norma) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: navio, item, norma" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Você é um especialista em segurança marítima e normas IMCA.

Analise a seguinte não conformidade em uma auditoria técnica:

Embarcação: ${navio}
Norma: ${norma}
Item auditado: ${item}

Forneça uma explicação técnica detalhada que inclua:

1. **Significado da Não Conformidade**: O que significa estar não conforme com este item específico segundo a norma ${norma}
2. **Riscos Associados**: Quais são os principais riscos de segurança e operacionais desta não conformidade
3. **Nível de Criticidade**: Classificação da criticidade (Crítica, Alta, Média, Baixa) com justificativa
4. **Referências Técnicas**: Citar seções específicas da norma ${norma} relacionadas a este item

A resposta deve ser clara, objetiva e orientada à segurança marítima.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em segurança marítima e normas IMCA com profundo conhecimento técnico e regulatório."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate AI analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const resultado = data.choices[0]?.message?.content || "Não foi possível gerar análise";

    return new Response(
      JSON.stringify({ success: true, resultado }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auditorias-explain:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
