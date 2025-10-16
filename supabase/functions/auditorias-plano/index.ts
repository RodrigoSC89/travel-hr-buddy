import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

interface PlanoRequest {
  navio: string;
  item: string;
  norma: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { navio, item, norma }: PlanoRequest = await req.json();

    console.log(`Generating action plan for audit: Ship ${navio}, Item ${item}, Norm ${norma}`);

    const prompt = `
Você é um especialista em gestão de conformidade e planos de ação corretiva para auditorias técnicas marítimas IMCA.

CONTEXTO DA NÃO CONFORMIDADE:
- Navio: ${navio}
- Norma: ${norma}
- Item Auditado: ${item}
- Resultado: Não Conforme

TAREFA:
Desenvolva um plano de ação corretiva estruturado e prático para resolver esta não conformidade.

O plano deve incluir:
1. Ações Imediatas (0-7 dias): Medidas temporárias/paliativas
2. Ações de Curto Prazo (1-4 semanas): Correção principal
3. Ações de Médio Prazo (1-3 meses): Implementação definitiva
4. Responsáveis sugeridos: Funções/cargos (ex: Capitão, Chefe de Máquinas, Operador)
5. Recursos necessários: Equipamentos, treinamentos, documentação
6. Critérios de verificação: Como confirmar que a NC foi resolvida

Seja prático, realista e aplicável ao contexto operacional do navio ${navio}.
Formate a resposta de forma clara e estruturada em tópicos.
Responda em português brasileiro em até 250 palavras.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um gerente de conformidade e qualidade marítima especializado em planos de ação corretiva e gestão de não conformidades conforme normas IMCA."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const plano = data.choices[0].message.content;

    console.log("Action plan generated successfully");

    return new Response(JSON.stringify({
      success: true,
      plano,
      message: "Plano de ação gerado com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating action plan:", error);
    return new Response(JSON.stringify({ 
      error: "Erro ao gerar plano de ação",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
