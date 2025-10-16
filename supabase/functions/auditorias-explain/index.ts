import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExplainRequest {
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
    const { navio, item, norma }: ExplainRequest = await req.json();

    console.log("Generating AI explanation for:", { navio, item, norma });

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = `Como especialista em auditorias técnicas marítimas e normas IMCA, explique de forma clara e concisa:

Navio: ${navio}
Norma: ${norma}
Item Auditado: ${item}
Resultado: Não Conforme

Por favor, forneça:
1. O que significa este item estar "Não Conforme" segundo a norma ${norma}
2. Os riscos associados a essa não conformidade
3. A criticidade do problema
4. Referências técnicas relevantes

Mantenha a explicação objetiva e técnica, com no máximo 200 palavras.`;

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
            content: "Você é um especialista em auditorias técnicas marítimas e normas IMCA, com profundo conhecimento em segurança operacional e compliance."
          },
          {
            role: "user",
            content: prompt
          }
        ] as OpenAIMessage[],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as OpenAIResponse;
    const resultado = data.choices[0]?.message?.content || "Não foi possível gerar explicação no momento.";

    console.log("AI explanation generated successfully");

    return new Response(
      JSON.stringify({ resultado }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in explain endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        resultado: "Erro ao gerar explicação. Por favor, tente novamente."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
