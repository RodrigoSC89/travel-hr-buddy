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
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Create AI prompt for checklist generation
    const systemPrompt = `Você é um assistente especializado em criar checklists operacionais detalhados e práticos. 
Baseado na descrição fornecida pelo usuário, gere uma lista de 5-10 tarefas específicas e acionáveis.
Retorne APENAS um array JSON de strings, onde cada string é uma tarefa do checklist.
Não inclua numeração ou marcadores, apenas o texto das tarefas.
Seja conciso, claro e específico.

Exemplo de formato de resposta:
["Verificar níveis de óleo", "Inspecionar sistema hidráulico", "Testar alarmes de segurança"]`;

    const userPrompt = `Gere um checklist para: ${prompt}`;

    // Call OpenAI API
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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    let items;
    try {
      // Try to parse the response as JSON
      items = JSON.parse(content);
      
      // Ensure it's an array
      if (!Array.isArray(items)) {
        throw new Error("Response is not an array");
      }
    } catch (e) {
      // Fallback: split by lines if JSON parsing fails
      items = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.startsWith("[") && !line.startsWith("]"))
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, "").replace(/^["']|["']$/g, ""));
    }

    // Ensure we have valid items
    if (!items || items.length === 0) {
      items = ["Tarefa gerada: " + prompt];
    }

    return new Response(
      JSON.stringify({
        success: true,
        items
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-checklist:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
