/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating checklist for prompt: "${prompt}"`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em inspeções marítimas (SOLAS, MARPOL, ISM, ISPS, MLC 2006, PSC, OVIQ).
Gere checklists detalhados e profissionais para o setor marítimo.
Cada item deve ter um título claro e objetivo, criticidade (critical, high, medium, low), e categoria.
Gere entre 7 e 15 itens relevantes baseados no prompt do usuário.`,
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_checklist_items",
              description: "Generate structured maritime checklist items",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Título do checklist gerado",
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Descrição do item de verificação" },
                        criticality: {
                          type: "string",
                          enum: ["critical", "high", "medium", "low"],
                          description: "Nível de criticidade",
                        },
                        category: { type: "string", description: "Categoria (Segurança, Navegação, Estrutural, etc.)" },
                      },
                      required: ["title", "criticality"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "items"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_checklist_items" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log(`Generated checklist "${result.title}" with ${result.items?.length || 0} items`);

    return new Response(
      JSON.stringify({
        success: true,
        title: result.title,
        items: (result.items || []).map((item: { title: string; criticality: string; category?: string }, idx: number) => ({
          id: `ai-${idx}`,
          title: item.title,
          criticality: item.criticality || "medium",
          category: item.category || "Geral",
          completed: false,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error generating checklist:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao gerar checklist com IA",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
