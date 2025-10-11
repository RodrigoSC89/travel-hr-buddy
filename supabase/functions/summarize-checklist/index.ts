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
    const { title, items, comments = [] } = await req.json();

    if (!title || !items) {
      throw new Error("Title and items are required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Calculate statistics
    const totalItems = items.length;
    const completedItems = items.filter((item: any) => item.completed).length;
    const pendingItems = totalItems - completedItems;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Create AI prompt for checklist summarization
    const systemPrompt = `Você é um assistente especializado em análise de checklists operacionais.
Analise o checklist fornecido e gere um resumo inteligente e conciso em português brasileiro.
O resumo deve incluir:
1. Estado geral da lista (concluído/pendente)
2. Principais pontos de atenção
3. Sugestões de melhoria baseadas no progresso e comentários
4. Próximos passos recomendados

Seja objetivo, prático e use linguagem profissional. Máximo de 150 palavras.`;

    const userPrompt = `Analise o seguinte checklist:

Título: ${title}
Total de itens: ${totalItems}
Itens concluídos: ${completedItems}
Itens pendentes: ${pendingItems}
Taxa de conclusão: ${completionRate}%

Itens do checklist:
${items.map((item: any, idx: number) => `${idx + 1}. ${item.title} - ${item.completed ? "✅ Concluído" : "⏳ Pendente"}`).join("\n")}

${comments.length > 0 ? `\nComentários:\n${comments.map((c: any) => `- ${c.text || c}`).join("\n")}` : ""}

Gere um resumo inteligente com análise e recomendações.`;

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
        temperature: 0.5,
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        stats: {
          totalItems,
          completedItems,
          pendingItems,
          completionRate
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in summarize-checklist:", error);
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
