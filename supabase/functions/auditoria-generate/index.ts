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
    const { nomeNavio, contexto } = await req.json();

    if (!nomeNavio || !contexto) {
      return new Response(
        JSON.stringify({ error: "Nome do navio e contexto são obrigatórios" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association) para sistemas de posicionamento dinâmico (DP) e operações offshore.

Navio: ${nomeNavio}
Contexto da Operação: ${contexto}

Gere um relatório de auditoria técnica IMCA completo e detalhado que inclua:

1. RESUMO EXECUTIVO
   - Classificação de risco da operação
   - Principais achados críticos

2. ANÁLISE TÉCNICA
   - Avaliação do sistema DP
   - Análise de sensores e redundâncias
   - Avaliação de falhas reportadas

3. CONFORMIDADE IMCA
   - Verificação de conformidade com normas IMCA M 103, M 140, M 182
   - Gaps identificados
   - Recomendações de adequação

4. ANÁLISE DE RISCO
   - Eventos críticos identificados
   - Análise de causa raiz
   - Matriz de risco (probabilidade x severidade)

5. RECOMENDAÇÕES
   - Ações corretivas imediatas
   - Melhorias de médio prazo
   - Plano de ação sugerido

6. CONCLUSÃO
   - Status geral da operação
   - Certificação recomendada (se aplicável)

Formate o relatório de forma profissional, técnica e detalhada.`;

    console.log("Generating IMCA audit for ship:", nomeNavio);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um auditor técnico especializado em normas IMCA para sistemas de posicionamento dinâmico e operações offshore marítimas.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ output }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating IMCA audit:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao gerar relatório de auditoria",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
