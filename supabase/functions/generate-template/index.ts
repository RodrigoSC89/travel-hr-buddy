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
    const { title } = await req.json();
    
    if (!title) {
      throw new Error("Title is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing template generation request:", title);

    const systemPrompt = `Você é um assistente especializado em criar templates profissionais para documentos corporativos.

    Suas habilidades incluem:
    - Criar templates estruturados para diferentes tipos de documentos
    - Incluir placeholders úteis como {{nome}}, {{data}}, {{empresa}}, etc.
    - Estruturar o template de forma profissional e reutilizável
    - Adaptar o formato ao tipo de documento solicitado
    
    Características dos seus templates:
    - Linguagem profissional e clara
    - Bem estruturados com seções e placeholders
    - Formatação adequada em HTML simples ou Markdown
    - Em português brasileiro
    - Incluir placeholders entre {{}} para campos variáveis
    
    Ao gerar um template, crie um documento base com:
    - Estrutura clara com seções
    - Placeholders apropriados para personalização
    - Formatação profissional
    - Conteúdo padrão que pode ser adaptado`;

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
          { role: "user", content: `Crie um template profissional para: ${title}` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("Generated template content:", content.substring(0, 100) + "...");

    return new Response(JSON.stringify({ 
      content,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating template:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
