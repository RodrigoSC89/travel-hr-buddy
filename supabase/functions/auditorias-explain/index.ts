import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

interface ExplainRequest {
  navio: string;
  item: string;
  norma: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { navio, item, norma }: ExplainRequest = await req.json();

    console.log(`Generating AI explanation for audit: Ship ${navio}, Item ${item}, Norm ${norma}`);

    const prompt = `
Você é um especialista em auditorias técnicas marítimas e normas IMCA (International Marine Contractors Association).

CONTEXTO DA NÃO CONFORMIDADE:
- Navio: ${navio}
- Norma: ${norma}
- Item Auditado: ${item}
- Resultado: Não Conforme

TAREFA:
Analise esta não conformidade e forneça uma explicação técnica detalhada sobre:

1. O que a norma ${norma} exige especificamente para o item "${item}"
2. Quais são as implicações operacionais desta não conformidade
3. Riscos potenciais associados (segurança, operacional, ambiental, regulatório)
4. Impacto na operação do navio ${navio}
5. Referências técnicas relevantes da norma aplicada

Seja específico, técnico e objetivo. Foque em aspectos práticos e operacionais.
Responda em português brasileiro em um parágrafo conciso de 150-200 palavras.
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
            content: "Você é um auditor técnico marítimo sênior especializado em normas IMCA com 15 anos de experiência em auditoria de embarcações offshore."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const resultado = data.choices[0].message.content;

    console.log("AI explanation generated successfully");

    return new Response(JSON.stringify({
      success: true,
      resultado,
      message: "Explicação gerada com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating AI explanation:", error);
    return new Response(JSON.stringify({ 
      error: "Erro ao gerar explicação IA",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
