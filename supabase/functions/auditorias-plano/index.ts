import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlanoRequest {
  navio: string;
  item: string;
  norma: string;
}

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { navio, item, norma }: PlanoRequest = await req.json();

    console.log("Generating AI action plan for:", { navio, item, norma });

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = `Como especialista em auditorias técnicas marítimas e normas IMCA, crie um plano de ação prático e detalhado para resolver a seguinte não conformidade:

Navio: ${navio}
Norma: ${norma}
Item Auditado: ${item}
Status: Não Conforme

Por favor, forneça um plano de ação estruturado contendo:
1. Ações imediatas (próximos 7 dias)
2. Ações de curto prazo (1 mês)
3. Responsáveis sugeridos
4. Recursos necessários
5. KPIs para validação da conformidade

Seja específico e prático. Formato: lista numerada concisa.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em auditorias técnicas marítimas e normas IMCA, com experiência em planos de ação corretivos e gestão de conformidade."
          },
          {
            role: "user",
            content: prompt
          }
        ] as OpenAIMessage[],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as OpenAIResponse;
    const plano = data.choices[0]?.message?.content || "Não foi possível gerar plano de ação no momento.";

    console.log("AI action plan generated successfully");

    return new Response(
      JSON.stringify({ plano }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in plano endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        plano: "Erro ao gerar plano de ação. Por favor, tente novamente."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
