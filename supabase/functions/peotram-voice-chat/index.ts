import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PEOTRAM_ELEMENTS = {
  1: { name: "Pessoal e Organização", critical: false, description: "Estrutura organizacional, responsabilidades e competências" },
  2: { name: "Documentação", critical: false, description: "Sistema de gestão documental, controle de versões, procedimentos" },
  3: { name: "Planejamento e Rotina", critical: false, description: "Planejamento operacional, programação de atividades, rotinas" },
  4: { name: "Execução Operacional", critical: true, description: "Execução de atividades operacionais, controle de processos, qualidade" },
  5: { name: "Continuidade", critical: false, description: "Planos de continuidade, backup, recuperação de desastres" },
  6: { name: "Gestão de Risco", critical: true, description: "Identificação, análise e tratamento de riscos operacionais" },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, element_number, context, language = "pt" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const element = element_number ? PEOTRAM_ELEMENTS[element_number as keyof typeof PEOTRAM_ELEMENTS] : null;

    const systemPrompt = `Você é um especialista em auditoria PEOTRAM (Programa Específico de Operação Técnica em Risco Aceitável de Manutenção) da Petrobras.

ELEMENTOS DO PEOTRAM:
${Object.entries(PEOTRAM_ELEMENTS).map(([num, el]) => 
  `Elemento ${num}: ${el.name} ${el.critical ? '⭐ CRÍTICO' : ''}\n  ${el.description}`
).join('\n')}

IMPORTANTE: Os elementos 4 (Execução Operacional) e 6 (Gestão de Risco) são CRÍTICOS e têm maior peso na auditoria.

Responda de forma clara, técnica e didática. Use exemplos práticos quando possível.
${language === 'en' ? 'Respond in English.' : language === 'es' ? 'Responde en español.' : 'Responda em português brasileiro.'}`;

    let userPrompt = question;
    
    if (element) {
      userPrompt = `[Contexto: Elemento ${element_number} - ${element.name}${element.critical ? ' (CRÍTICO)' : ''}]

${context ? `Contexto adicional: ${context}\n\n` : ''}Pergunta: ${question}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    const result = {
      question,
      answer,
      element: element ? {
        number: element_number,
        name: element.name,
        is_critical: element.critical
      } : null,
      language,
      timestamp: new Date().toISOString()
    };

    console.log("PEOTRAM voice chat response generated for element:", element_number || "general");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in peotram-voice-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
