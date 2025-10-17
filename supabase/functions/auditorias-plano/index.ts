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

    const prompt = `Você é um especialista em segurança marítima e normas IMCA, responsável por criar planos de ação para correção de não conformidades.

Contexto da Não Conformidade:
Embarcação: ${navio}
Norma: ${norma}
Item auditado: ${item}

Crie um plano de ação estruturado para remediar esta não conformidade que inclua:

1. **Ações Imediatas (7 dias)**:
   - Liste 2-3 ações prioritárias que devem ser executadas imediatamente
   - Foco na mitigação de riscos imediatos

2. **Ações de Curto Prazo (1 mês)**:
   - Liste 3-4 ações estruturais para resolver o problema definitivamente
   - Inclua melhorias de processos e documentação

3. **Responsáveis Sugeridos**:
   - Identifique os departamentos/funções que devem estar envolvidos
   - Exemplo: Gerente de Segurança, Capitão, Engenheiro Chefe, etc.

4. **Recursos Necessários**:
   - Liste recursos humanos, materiais e financeiros necessários
   - Treinamentos específicos requeridos

5. **KPIs de Validação**:
   - Defina 2-3 indicadores para medir a eficácia da correção
   - Como verificar que a conformidade foi alcançada

O plano deve ser prático, realista e orientado à conformidade com a norma ${norma}.`;

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
            content: "Você é um especialista em segurança marítima e normas IMCA, focado em criar planos de ação práticos e efetivos."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate action plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const plano = data.choices[0]?.message?.content || "Não foi possível gerar plano de ação";

    return new Response(
      JSON.stringify({ success: true, plano }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auditorias-plano:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
