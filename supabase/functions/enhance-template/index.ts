import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, context } = await req.json();
    
    if (!content) {
      throw new Error("Content is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing template enhancement request");

    const systemPrompt = `Você é um especialista em melhorar e aprimorar templates de documentos técnicos e corporativos.

    Suas habilidades incluem:
    - Melhorar clareza e precisão do texto
    - Adicionar campos variáveis relevantes quando apropriado
    - Sugerir melhorias na estrutura e organização
    - Manter o tom profissional e técnico
    - Preservar a formatação e campos existentes

    Ao melhorar um template:
    - Mantenha todos os campos variáveis existentes [CAMPO]
    - Melhore a clareza e profissionalismo do texto
    - Adicione seções ou campos se necessário
    - Preserve a estrutura geral
    - Use linguagem técnica apropriada`;

    const contextInfo = context ? `\nContexto adicional: ${context}` : "";
    const userPrompt = `Melhore o seguinte template, tornando-o mais claro, completo e profissional:${contextInfo}

${content}

Retorne o template melhorado mantendo todos os campos variáveis existentes e a estrutura geral.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log("Template enhanced successfully");

    return new Response(
      JSON.stringify({ content: enhancedContent }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in enhance-template function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
