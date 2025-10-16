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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { navio, item, norma }: ExplainRequest = await req.json();

    console.log("Generating AI explanation for:", { navio, item, norma });

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Create prompt for GPT-4
    const prompt = `Como especialista em normas IMCA (International Marine Contractors Association), explique de forma técnica:

Navio: ${navio}
Norma: ${norma}
Item não conforme: ${item}

Forneça:
1. Explicação detalhada sobre o que a norma ${norma} exige para este item
2. Possíveis causas da não conformidade
3. Riscos associados a esta não conformidade
4. Recomendações específicas para correção e conformidade

Responda de forma técnica mas clara, em português brasileiro.`;

    // Call OpenAI API
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
            content: "Você é um especialista em normas IMCA e auditorias técnicas marítimas. Forneça explicações técnicas precisas e recomendações práticas."
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
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultado = data.choices[0]?.message?.content || "Não foi possível gerar explicação";

    console.log("AI explanation generated successfully");

    return new Response(
      JSON.stringify({ resultado }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in auditorias-explain function:", error);
    return new Response(
      JSON.stringify({ 
        resultado: "Erro ao gerar explicação. Por favor, tente novamente.",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
